/**
 * Shared schema-graph stubs used across pages.
 *
 * OWNER_STUB — minimal Person representation of the business owner referenced
 * by @id from the homepage `businessNode.founder`. The canonical Person node
 * lives on the About page and is built by SPREADING this stub
 * (`{ ...OWNER_STUB, jobTitle, image, ... }`) so the literal @type/@id/name
 * appears exactly ONCE in source (right here).
 *
 * The homepage emits this stub as a node in its @graph so single-page AI
 * consumers (GPTBot, ClaudeBot, PerplexityBot) that don't resolve
 * cross-document @id references still see the founder's identity when they
 * fetch just /.
 *
 * See .claude/skills/schema-audit/SKILL.md → "Accepted exceptions" for the
 * rationale and why this doesn't violate the define-once entity rule.
 */
import { BUSINESS } from "@/lib/constants";

export const OWNER_STUB = {
  "@type": "Person",
  "@id": `${BUSINESS.url}/#owner`,
  name: BUSINESS.ownerFullName,
} as const;
