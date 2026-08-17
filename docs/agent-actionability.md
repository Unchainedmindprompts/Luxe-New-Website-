# Agent actionability

Internal truth is the source. Adapters publish it. JSON-LD is not the action surface.

## Truth

`lib/offerings.ts` and `lib/capabilities.ts` record what Luxe actually does. They are not Schema.org and they are not an API. An offering with an empty manufacturer list is unestablished, not empty. The one capability is `request-in-home-consultation`.

## Capability

A request that Luxe follow up to arrange a free in-home consultation.

It is not a booking, not a reservation, not checkout, and not a price. `directBookingAvailable` is false. `pricingPublic` is false. `requiresHumanConfirmation` is true: an agent submits only after the person approves. `requiresHumanFollowUp` is true: after a 2xx, Luxe still has to call and arrange a visit.

## Action

Today's surface is `POST /api/consultation`. Required: a phone number (`input.required`) plus a name (`input.nameRequired: true`, accepted as `name` or `firstName` / `lastName`). Email is optional. `_hp` is honeypot plumbing, not a customer field.

`/book` and `/contact` are human forms that post the same request. `/book` also embeds a human scheduler. That widget is not this capability and does not appear on `agent.json`.

## Confirmation boundary

| Layer | Meaning |
|---|---|
| `requiresHumanConfirmation: true` | The person must approve sending the request |
| `autonomousExecution: "not-ready"` | Do not POST unattended |
| `successMeans: "submission-acknowledged-by-endpoint"` | A 2xx is not delivery, receipt, or an appointment |
| `requiresHumanFollowUp: true` | Luxe still has to arrange the visit |

## JSON-LD vs agent.json

JSON-LD on the pages is the entity graph: who Luxe is, which cities, which Services, which manufacturers. It does not carry `BookAction` or `ReserveAction`. A mailbox is not a reservation.

`/agent.json` is the action card: what an external agent may initiate, the fields, the method, and the success ceiling. It is generated from the registries. If the two disagree, the registry is right and the card is a bug.
