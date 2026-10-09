import fs from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { normalizeQldTrafficEvent } from "../src/adapters/qldtraffic-events.mjs";
import { createSegmentBinding, createTransportEvent, projectSegmentContext } from "../src/core/segment-context.mjs";

// A deterministic synthetic proof, never a live fetch or a real road alignment.
export function buildSyntheticSegmentProof() {
  const feature = JSON.parse(fs.readFileSync(
    new URL("../test/fixtures/qldtraffic-event.synthetic.json", import.meta.url), "utf8",
  ));
  const asOf = "2026-09-24T08:13:00+10:00";
  const observation = normalizeQldTrafficEvent(feature, { ingestedAt: asOf });
  const binding = createSegmentBinding({
    id: "binding:synthetic:example-road", observationRef: observation.id,
    segmentRef: "segment:synthetic:example-road", actorRef: "actor:synthetic-proof",
    recordedAt: asOf, evidenceRefs: ["fixture:qldtraffic-event.synthetic.json"],
  });
  const event = createTransportEvent({
    id: "event:synthetic:example-road:1", observation, binding,
    actorRef: "actor:synthetic-proof", recordedAt: asOf,
  });
  const context = projectSegmentContext({
    observations: [observation], bindings: [binding], events: [event],
    segmentRef: binding.segmentRef, asOf,
  });
  return {
    evidenceStanding: "synthetic",
    sourceArtifact: "test/fixtures/qldtraffic-event.synthetic.json",
    context,
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  console.log(JSON.stringify(buildSyntheticSegmentProof(), null, 2));
}
