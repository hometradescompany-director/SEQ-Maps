import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createObservationEnvelope } from "../src/core/observation-envelope.mjs";
import { createSegmentBinding, createTransportEvent } from "../src/core/segment-context.mjs";

const api = await import("../src/api/segment-context.mjs").catch(() => ({}));
const asOf = "2026-10-09T00:00:00Z";
const segmentRef = "segment:synthetic/one";
const observation = createObservationEnvelope({
  id: "obs:synthetic", sourceRef: "source:synthetic", subjectRef: "condition:synthetic",
  kind: "transport.condition.observed", validAt: asOf, knownAt: asOf, ingestedAt: asOf,
  license: { standing: "unknown" }, payload: { speedKph: 42 },
});
const binding = createSegmentBinding({
  id: "binding:synthetic", observationRef: observation.id, segmentRef,
  actorRef: "actor:fixture", recordedAt: asOf, evidenceRefs: ["evidence:synthetic"],
});
const event = createTransportEvent({ id: "event:synthetic", observation, binding, actorRef: "actor:fixture", recordedAt: asOf });
const ledger = { observations: [observation], bindings: [binding], events: [event] };
const path = "/v1/segments/" + encodeURIComponent(segmentRef) + "/context?asOf=" + encodeURIComponent(asOf);

function requester(readLedger = () => ledger) {
  assert.equal(typeof api.createSegmentContextHandler, "function");
  const handler = api.createSegmentContextHandler({ readLedger });
  return async (url, { method = "GET" } = {}) => {
    let status, headers, body;
    await handler({ url, method }, {
      writeHead(code, values) {
        if (status !== undefined) throw new Error("headers already sent");
        status = code; headers = values;
      },
      end(value) { body = value; },
    });
    return { status, headers: { get: name => headers[name] ?? null },
      json: async () => JSON.parse(body), text: async () => body };
  };
}

test("handler delivers provenance-linked context with encoded opaque identity", async () => {
  const request = requester();
  const response = await request(path);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-type"), /application\/json/);
  const result = await response.json();
  assert.equal(result.segmentRef, segmentRef);
  assert.equal(result.claims[0].payload.speedKph, 42);
  assert.equal(result.claims[0].license.standing, "unknown");
  assert.equal(result.claims[0].evidence.state, "unknown");
  assert.equal(result.enforcementStanding, "not-authorized");
});

test("read-only API rejects writes without invoking the ledger", async () => {
  let reads = 0;
  const request = requester( () => { reads++; return ledger; });
  const response = await request(path, { method: "POST", body: "ignored" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
  assert.equal(reads, 0);
});

test("invalid temporal queries, ambiguous query parameters and malformed references fail safely", async () => {
  let reads = 0;
  const request = requester( () => { reads++; return ledger; });
  for (const suffix of [
    "/v1/segments/one/context", "/v1/segments/one/context?asOf=yesterday",
    "/v1/segments/one/context?asOf=2026-10-09",
    "/v1/segments/one/context?asOf=2026-02-30T00:00:00Z",
    path + "&asOf=" + asOf, path + "&extra=true",
    "/v1/segments/%ZZ/context?asOf=" + asOf,
    "/v1/segments/%20/context?asOf=" + asOf,
  ]) {
    const response = await request(suffix);
    assert.equal(response.status, 400, suffix);
  }
  assert.equal(reads, 0);
  assert.equal((await request("/not-a-route")).status, 404);
});

test("unserializable source payload returns safe unavailable before committing headers", async () => {
  const request = requester(() => ({
    ...ledger, observations: [{ ...observation, payload: { unsupported: 1n } }],
  }));
  const response = await request(path);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { state: "inaccessible", error: "context_unavailable" });
});

test("unknown segments expose searched-no-match rather than claiming a clear road", async () => {
  const request = requester();
  const response = await request("/v1/segments/unknown/context?asOf=" + asOf);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.standing, "searched_no_match");
  assert.deepEqual(result.claims, []);
});

test("ledger errors return typed inaccessible state without leaking internal diagnostics", async () => {
  const request = requester( () => { throw new Error("private-path-credential"); });
  const response = await request(path);
  assert.equal(response.status, 503);
  const text = await response.text();
  assert.equal(text.includes("private-path-credential"), false);
  assert.equal(JSON.parse(text).state, "inaccessible");
});

// Keep the actual socket integration in CI; expose local platform restrictions
// explicitly rather than confusing in-process execution with HTTP delivery.
test("real loopback HTTP serves the complete context path", async t => {
  assert.equal(typeof api.createSegmentContextHandler, "function");
  const server = http.createServer(api.createSegmentContextHandler({ readLedger: () => ledger }));
  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
  } catch (error) {
    if (error.code === "EPERM") {
      t.skip("loopback listen is prohibited by this execution sandbox");
      return;
    }
    throw error;
  }
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await fetch("http://127.0.0.1:" + server.address().port + path);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).claims[0].observationRef, observation.id);
});
