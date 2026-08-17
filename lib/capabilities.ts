/**
 * What a person or an agent can actually initiate with Luxe.
 *
 * INTERNAL BUSINESS TRUTH, like `lib/offerings.ts`. This module emits nothing:
 * no JSON-LD `potentialAction`, no MCP tool, no agent card, no OpenAPI. Those
 * are adapters over this contract and each needs its own decision. What is
 * settled here is what the business genuinely does, described narrowly enough
 * that an adapter written later cannot honestly turn it into something else.
 *
 * THE CAPABILITY IS NOT THE ENDPOINT. "Luxe accepts requests for an in-home
 * consultation" is a fact about the business and stays true if the form, the
 * mail provider or the route ever change. `POST /api/consultation` is today's
 * execution surface for it — one way to perform the capability, with its own
 * outcome and its own readiness. They are modelled separately so replacing the
 * transport does not read as replacing the business capability.
 *
 * REQUEST, NEVER BOOKING. This is the single most important thing in the file.
 * The endpoint sends an email. It touches no calendar, checks no availability,
 * returns no time, reserves nothing, and persists nothing. A homeowner who
 * submits it has asked Luxe to get in touch; they do not have an appointment.
 * An adapter that renders this as a confirmed booking sends someone home to
 * wait for a visit nobody scheduled — which is worse than having no capability
 * at all. The types below refuse to express that outcome: there is no
 * `startTime`, no `reservationStatus`, no `confirmed`, and `actionType` admits
 * one value.
 *
 * FIELD NAMES ARE DUPLICATED FROM THE ROUTE, deliberately. `ConsultationPayload`
 * is local to `app/api/consultation/route.ts` and exporting it would mean
 * editing the endpoint, which this phase does not do. The duplication is
 * recorded here rather than hidden: if the route's accepted fields change, this
 * contract has to be re-read against it.
 */

export type CapabilityId = "request-in-home-consultation";

/**
 * One way to perform a capability.
 *
 * Separate from the capability because the two can be true and false
 * independently: Luxe accepts consultation requests today regardless of whether
 * this particular endpoint is fit for unattended machine traffic.
 */
export interface ExecutionSurface {
  readonly endpoint: string;
  readonly method: "POST";

  /**
   * WHAT A 2xx ACTUALLY MEANS — and it is narrower than "Luxe received it".
   *
   * The route returns `{ ok: true }` on two different paths. One sends the
   * email. The other is the honeypot: when the hidden `_hp` field arrives
   * non-empty the request is discarded silently and still answered `{ ok: true }`,
   * so bots do not learn to retry. A caller cannot tell the two apart. On top of
   * that, a 200 means the mail provider accepted the message, not that it
   * reached the inbox.
   *
   * So the honest ceiling is: the endpoint took the submission. Anything
   * stronger — delivered, received by Luxe, actioned — is a claim this
   * transport cannot support.
   */
  readonly successMeans: "submission-acknowledged-by-endpoint";

  /**
   * A literal, not a boolean, and this is deliberate.
   *
   * `machineExecutionReady: false` would flip to `true` with a one-character
   * edit by anyone who thought it looked stale. Typed as the literal
   * `"not-ready"`, the value cannot be changed without widening the type — a
   * conscious act, in a diff, with the reasons below in front of the person
   * doing it. Same discipline as `exclusive?: true` in lib/offerings.ts, which
   * has no `false` because the false was never established.
   *
   * It sits on the surface rather than the capability because it is not the
   * business that is unready. Luxe takes consultation requests every day. It is
   * THIS ENDPOINT that is not built for unattended traffic:
   *
   *   - no rate limiting of any kind; each accepted POST sends an email
   *   - the honeypot is the only bot control, and an honest agent omits `_hp`
   *     and passes straight through, so it filters nothing that matters here
   *   - honeypot success is indistinguishable from real success
   *   - failures `console.error` the full payload — name, phone, email, address
   *   - no authentication and no origin check
   *   - the FROM domain is still unverified (`onboarding@resend.dev`), so a
   *     flood risks the Resend account that carries every genuine lead
   *   - nothing is persisted, so a provider outage loses the request
   *
   * None of that blocks describing the capability. All of it blocks exposing it
   * for autonomous execution.
   */
  readonly autonomousExecution: "not-ready";
}

export interface Capability {
  /** Plain-language statement of what the business does. */
  readonly summary: string;

  /**
   * The only value this type admits. A request asks; it does not schedule,
   * reserve, hold or confirm. Widening this is not a config change — it is a
   * claim that the business does something else.
   */
  readonly actionType: "request";

  /**
   * The business state a successful submission reaches, and the last one this
   * contract models. The homeowner has asked. Luxe has not yet replied, no time
   * exists, and no appointment exists.
   *
   *   consultation-requested  ← this contract stops here
   *         ↓  Luxe follows up
   *      scheduling happens elsewhere (today: /book, a Calendly embed)
   *         ↓
   *      an appointment may exist
   */
  readonly outcome: "consultation-requested";

  /**
   * Named for the step that actually has to happen, rather than "confirmation",
   * which leaves open whose and of what. Nobody confirms the request. Luxe
   * contacts the homeowner and the two of them arrange a visit; until that
   * conversation happens there is nothing on any calendar. Literal `true`: this
   * capability can never describe itself as self-completing.
   */
  readonly requiresHumanFollowUp: true;

  /**
   * The person — or an agent acting only after that person approves — must
   * confirm before this request is sent. Unattended submission is not this
   * capability. Literal `true`: it cannot describe itself as silent.
   *
   * Different from `requiresHumanFollowUp`. Confirmation is the customer's
   * (or their agent's) approval to ask. Follow-up is Luxe arranging a visit
   * afterwards. Both are true; neither is a booking.
   */
  readonly requiresHumanConfirmation: true;

  /**
   * Established false. There is no agent-callable scheduler, no availability
   * API, and no reservation. `/book` embeds Calendly for humans; that widget
   * is not this capability and must not appear on it.
   */
  readonly directBookingAvailable: false;

  /**
   * Established false. Prices are quoted after an in-home measure. Nothing
   * here is a public price list an agent could honestly repeat.
   */
  readonly pricingPublic: false;

  /**
   * The fields the current surface accepts, exactly as the route treats them.
   *
   * `_hp` is excluded on purpose. It is anti-spam plumbing belonging to the
   * transport, not something a customer or an agent supplies on their behalf.
   */
  readonly input: {
    /**
     * The route derives one name from `name`, or from `firstName` and
     * `lastName` joined. At least one of these must arrive non-empty or it
     * answers 400 — `firstName` alone is sufficient.
     */
    readonly identifiesCustomerBy: readonly string[];
    /**
     * Field keys the route rejects as empty. Phone is the only key that must
     * arrive under its own name. A name is also required — see `nameRequired`.
     */
    readonly required: readonly string[];
    /**
     * Literal `true`. The route answers 400 when it cannot derive a name.
     * The key is not always `name`: `firstName` or `lastName` also work.
     * Kept separate from `required` so an adapter cannot list `name` as a
     * mandatory JSON key and then fail a valid `firstName`-only POST.
     */
    readonly nameRequired: true;
    /**
     * Accepted, never required — including `email`, which the notification
     * renders as "(not provided)" when it is absent. `message` and `needs` are
     * two names for the same field.
     */
    readonly optional: readonly string[];
  };

  readonly executionSurfaces: readonly ExecutionSurface[];
}

/**
 * Keyed by id so duplicates are impossible, matching `OFFERINGS`.
 *
 * One capability. `validate-service-area` is NOT folded in: the route never
 * compares `city` against the canonical service areas, it accepts any string,
 * and pretending otherwise would have this contract claim a check that does not
 * run. No geography is referenced here for the same reason.
 */
export const CAPABILITIES: Record<CapabilityId, Capability> = {
  "request-in-home-consultation": {
    summary:
      "Luxe Window Works accepts requests for a free in-home window treatment " +
      "consultation. Luxe follows up to arrange a visit; submitting a request " +
      "does not schedule one.",
    actionType: "request",
    outcome: "consultation-requested",
    requiresHumanFollowUp: true,
    requiresHumanConfirmation: true,
    directBookingAvailable: false,
    pricingPublic: false,
    input: {
      identifiesCustomerBy: ["name", "firstName", "lastName"],
      required: ["phone"],
      nameRequired: true,
      optional: [
        "email",
        "address",
        "city",
        "message",
        "needs",
        "contactMethod",
        "problem",
        "source",
      ],
    },
    executionSurfaces: [
      {
        endpoint: "/api/consultation",
        method: "POST",
        successMeans: "submission-acknowledged-by-endpoint",
        autonomousExecution: "not-ready",
      },
    ],
  },
};
