/**
 * Luxe Window Advisor — the fact ledger. (Phase B, step 2)
 *
 * What the advisor knows, and why it thinks it knows it.
 *
 * PROVENANCE LIVES HERE, NOT IN `ProjectFacts`. The engine keeps receiving a
 * plain `ProjectFacts` projection and never learns that basis or evidence
 * exist. That single boundary is what keeps this change entirely inside the
 * server layer — no Phase A rule, condition, or type moves.
 *
 * UNKNOWN IS NOT A VALUE. There is no third basis for "system default" or
 * "not established". A dimension nobody has spoken about simply has no record,
 * so it cannot silently become a customer fact — there is nothing to become
 * one. Absence is the representation.
 *
 * The ledger is also what replaced the `corrects` field. That flag existed
 * because a bare value could not say whether it was a correction or a passing
 * mention. An update that carries its own justification does not need to be
 * told: the evidence check decides whether it exists at all, and basis decides
 * whether it outranks what is already there.
 */
import type { ProjectFacts } from "../types";
import type { FactUpdate, UpdateBasis } from "./extraction";

export interface FactRecord {
  readonly value: string;
  readonly basis: UpdateBasis;
  /** The homeowner's own words that justified it. Capped, never logged. */
  readonly evidence: string;
  /** Which turn established it, for auditing drift. */
  readonly turn: number;
}

/**
 * Scalar fields hold one record; list fields hold one record per member, so
 * every member carries its own justification rather than inheriting the
 * justification of whatever arrived alongside it.
 */
export type FactLedger = Readonly<Record<string, FactRecord | readonly FactRecord[]>>;

export interface LedgerApplication {
  readonly ledger: FactLedger;
  readonly applied: readonly FactUpdate[];
  /** Updates refused by precedence, with the reason. Diagnostics only. */
  readonly suppressed: readonly string[];
}

/**
 * Whether an incoming record outranks an established one.
 *
 * A homeowner's direct statement is the strongest thing we have, so nothing
 * inferred may overwrite it — that is the rule that stops a later guess
 * quietly undoing something they actually said. Everything else yields to the
 * newer record, because the latest statement is the current truth, including
 * when it is a correction.
 */
function outranks(incoming: FactRecord, established: FactRecord): boolean {
  if (incoming.basis === "stated") return true;
  return established.basis !== "stated";
}

function applyScalar(
  current: FactRecord | undefined,
  incoming: FactRecord,
  field: string,
  suppressed: string[]
): FactRecord {
  if (!current) return incoming;
  if (outranks(incoming, current)) return incoming;
  suppressed.push(`${field}: inferred value did not displace a stated one`);
  return current;
}

function applyListMember(
  current: readonly FactRecord[],
  incoming: FactRecord
): readonly FactRecord[] {
  const existing = current.findIndex((record) => record.value === incoming.value);
  // List semantics are additive: a homeowner naming a second condition is
  // adding to what is true of the opening, not replacing it. The only movement
  // within a member is a stronger basis for the same value.
  if (existing === -1) return [...current, incoming];
  if (!outranks(incoming, current[existing])) return current;
  const next = [...current];
  next[existing] = incoming;
  return next;
}

/**
 * Folds one turn's validated updates into the ledger.
 *
 * `isList` is a parameter rather than an import so this stays a pure function
 * of its inputs — the same discipline the rest of the reasoning path follows,
 * and what lets the test harness load it with no build step.
 */
export function applyUpdates(
  ledger: FactLedger,
  updates: readonly FactUpdate[],
  turn: number,
  isList: (field: string) => boolean
): LedgerApplication {
  const next: Record<string, FactRecord | readonly FactRecord[]> = { ...ledger };
  const applied: FactUpdate[] = [];
  const suppressed: string[] = [];

  for (const update of updates) {
    const record: FactRecord = {
      value: update.value,
      basis: update.basis,
      evidence: update.evidence,
      turn,
    };
    const current = next[update.field];

    if (Array.isArray(current) || isList(update.field)) {
      const list = (Array.isArray(current) ? current : []) as readonly FactRecord[];
      const updated = applyListMember(list, record);
      if (updated !== list) applied.push(update);
      next[update.field] = updated;
      continue;
    }

    const before = current as FactRecord | undefined;
    const after = applyScalar(before, record, update.field, suppressed);
    if (after === record) applied.push(update);
    next[update.field] = after;
  }

  return { ledger: next, applied, suppressed };
}

/**
 * Projects the ledger into the plain `ProjectFacts` the Phase A engine expects.
 * Provenance stops here; the engine sees values and nothing else.
 */
export function projectFacts(ledger: FactLedger): ProjectFacts {
  const facts: Record<string, unknown> = {};
  for (const [field, entry] of Object.entries(ledger)) {
    if (Array.isArray(entry)) {
      facts[field] = entry.map((record) => record.value);
    } else if (entry) {
      facts[field] = (entry as FactRecord).value;
    }
  }
  return facts as ProjectFacts;
}

/**
 * Re-validates a ledger arriving from the client.
 *
 * The client holds conversation state, so this is untrusted input and gets the
 * same treatment as a model response: unknown fields, out-of-vocabulary values
 * and unrecognised bases are dropped rather than repaired. Evidence is not
 * re-checked against a message — the message that justified it is long gone —
 * so it is treated as opaque text, capped and never interpreted.
 */
export function validateLedger(
  raw: unknown,
  isField: (field: string) => boolean,
  isAllowedValue: (field: string, value: string) => boolean,
  isList: (field: string) => boolean
): FactLedger {
  const ledger: Record<string, FactRecord | readonly FactRecord[]> = {};
  if (typeof raw !== "object" || raw === null) return ledger;

  const readRecord = (value: unknown, field: string): FactRecord | null => {
    if (typeof value !== "object" || value === null) return null;
    const record = value as Record<string, unknown>;
    if (typeof record.value !== "string" || !isAllowedValue(field, record.value)) return null;
    if (record.basis !== "stated" && record.basis !== "inferred") return null;
    return {
      value: record.value,
      basis: record.basis,
      evidence: typeof record.evidence === "string" ? record.evidence.slice(0, 200) : "",
      turn: typeof record.turn === "number" && Number.isFinite(record.turn) ? Math.trunc(record.turn) : 0,
    };
  };

  for (const [field, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (!isField(field)) continue;
    if (isList(field)) {
      if (!Array.isArray(entry)) continue;
      const members: FactRecord[] = [];
      for (const item of entry.slice(0, 24)) {
        const record = readRecord(item, field);
        if (record && !members.some((m) => m.value === record.value)) members.push(record);
      }
      ledger[field] = members;
    } else {
      const record = readRecord(entry, field);
      if (record) ledger[field] = record;
    }
  }
  return ledger;
}
