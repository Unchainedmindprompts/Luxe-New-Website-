#!/usr/bin/env node
/**
 * Local consultation request tests. No real customer email. No live Resend.
 *
 * Loaders registered via --import mock `resend` and resolve `@/` before this
 * file imports the route. A passing run never leaves this process.
 */
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sent, resendBehavior } from "./lib/mock-resend-stub.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

process.env.RESEND_API_KEY = "re_test_mock_not_a_real_key";

const results = [];
let failures = 0;

async function run(name, fn) {
  const problems = [];
  const t = {
    ok: (cond, detail) => {
      if (!cond) problems.push(detail);
    },
    equal: (a, b, detail) => {
      if (a !== b) problems.push(`${detail} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
    },
  };
  try {
    await fn(t);
  } catch (error) {
    problems.push(`threw: ${error?.message ?? error}`);
  }
  if (problems.length) failures++;
  results.push({ name, problems });
}

const { GET, POST } = await import(
  pathToFileURL(join(ROOT, "app/api/consultation/route.ts")).href
);

function jsonRequest(body) {
  return new Request("http://localhost/api/consultation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

await run("GET is 405 and points at discovery", async (t) => {
  const res = GET();
  t.equal(res.status, 405, "status");
  t.equal(res.headers.get("Allow"), "POST", "Allow");
  const body = await res.json();
  t.equal(body.method, "POST", "method");
  t.equal(body.actionType, "request", "actionType");
  t.equal(body.discovery, "/agent.json", "discovery");
});

await run("POST missing phone is 400 and sends no email", async (t) => {
  sent.length = 0;
  const res = await POST(jsonRequest({ name: "Test Agent", source: "actionability-test" }));
  t.equal(res.status, 400, "status");
  t.equal(sent.length, 0, "emails sent");
});

await run("POST missing name is 400 and sends no email", async (t) => {
  sent.length = 0;
  const res = await POST(jsonRequest({ phone: "2085550100", source: "actionability-test" }));
  t.equal(res.status, 400, "status");
  t.equal(sent.length, 0, "emails sent");
});

await run("POST honeypot is 200 and sends no email", async (t) => {
  sent.length = 0;
  const res = await POST(
    jsonRequest({
      name: "Bot",
      phone: "2085550100",
      _hp: "filled",
      source: "actionability-test",
    })
  );
  t.equal(res.status, 200, "status");
  const body = await res.json();
  t.equal(body.ok, true, "ok");
  t.equal(sent.length, 0, "emails sent");
});

await run("POST valid request is 200 and does not claim a booking", async (t) => {
  sent.length = 0;
  resendBehavior.mode = "ok";
  const res = await POST(
    jsonRequest({
      firstName: "Ada",
      lastName: "Test",
      phone: "2085550100",
      email: "ada.test@example.invalid",
      city: "Post Falls",
      source: "actionability-test",
    })
  );
  t.equal(res.status, 200, "status");
  const body = await res.json();
  t.equal(body.ok, true, "ok");
  t.ok(!("appointment" in body), "appointment leaked");
  t.ok(!("startTime" in body), "startTime leaked");
  t.equal(sent.length, 1, "one email");
  t.ok(/Consultation Request/.test(sent[0].subject), "subject is a request");
  t.ok(!/booked|confirmed appointment/i.test(`${sent[0].subject}\n${sent[0].text}`), "booking language in email");
  t.ok(sent[0].text.includes("2085550100"), "phone present in the one real send");
  t.ok(sent[0].replyTo === "ada.test@example.invalid", "replyTo set for a usable address");
});

await run("POST provider error is 502 with a ref and no customer fields echoed", async (t) => {
  sent.length = 0;
  resendBehavior.mode = "provider-error";
  const res = await POST(
    jsonRequest({
      name: "Ada Test",
      phone: "2085550100",
      source: "actionability-test",
    })
  );
  t.equal(res.status, 502, "status");
  const body = await res.json();
  t.ok(body.ref, "ref missing");
  t.ok(!body.phone, "phone echoed");
  t.ok(!body.email, "email echoed");
  resendBehavior.mode = "ok";
});

console.log("Consultation request (mocked Resend)");
console.log(`  scenarios: ${results.length}`);
console.log(`  passing:   ${results.length - failures}/${results.length}\n`);
for (const { name, problems } of results) {
  console.log(`  ${problems.length ? "FAIL" : "pass"}  ${name}`);
  for (const p of problems) console.log(`          - ${p}`);
}
if (failures) {
  console.log(`\nFAIL — ${failures} scenario(s) failed.`);
  process.exit(1);
}
console.log("\nPASS — request surface behaves as a request. No live email was sent.");
