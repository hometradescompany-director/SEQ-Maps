import { projectSegmentContext } from "../core/segment-context.mjs";
import { contextTimestamp } from "../core/context-timestamp.mjs";

// Public/synthetic read surface only. Authentication for private ledgers belongs
// in a separately authorised server adapter, never inferred from discovery.
export function createSegmentContextHandler({ readLedger } = {}) {
  if (typeof readLedger !== "function") throw new TypeError("readLedger must be a function");
  return async (request, response) => {
    const send = (status, body, headers = {}) => {
      const serialized = JSON.stringify(body);
      response.writeHead(status, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store", "x-content-type-options": "nosniff", ...headers,
      });
      response.end(serialized);
    };
    if (request.method !== "GET") {
      return send(405, { state: "unknown", error: "method_not_allowed" }, { allow: "GET" });
    }
    let segmentRef, asOf;
    try {
      const url = new URL(request.url, "http://localhost");
      const match = /^\/v1\/segments\/([^/]+)\/context$/.exec(url.pathname);
      if (!match) return send(404, { state: "searched_no_match", error: "route_not_found" });
      segmentRef = decodeURIComponent(match[1]);
      asOf = url.searchParams.get("asOf");
      if (!segmentRef.trim() || url.searchParams.getAll("asOf").length !== 1
          || [...url.searchParams.keys()].some(key => key !== "asOf")) {
        return send(400, { state: "unknown", error: "invalid_context_query" });
      }
      contextTimestamp(asOf, "asOf");
    } catch {
      return send(400, { state: "unknown", error: "invalid_context_query" });
    }
    try {
      const ledger = await readLedger();
      const context = projectSegmentContext({ ...ledger, segmentRef, asOf });
      return send(200, context);
    } catch {
      return send(503, { state: "inaccessible", error: "context_unavailable" });
    }
  };
}
