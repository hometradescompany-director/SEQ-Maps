import test from 'node:test';
import assert from 'node:assert/strict';
import { exportTrafficObservations } from '../src/connectors/traffic-export.mjs';

const observation = { id: 'event:1', kind: 'transport.incident.observed', sourceRef: 'source:1', subjectRef: 'road-event:1', validAt: '2026-10-09T01:00:00Z', knownAt: '2026-10-09T01:05:00Z', ingestedAt: '2026-10-09T01:06:00Z', license: { standing: 'declared', id: 'CC-BY-4.0' }, evidenceRef: 'evidence:1', payload: { status: 'active' } };
test('exports a versioned offline batch preserving separate times without inventing edges', () => {
  const original = structuredClone(observation);
  const batch = exportTrafficObservations([observation]);
  assert.equal(batch.contract, 'traffic-observations.v1');
  assert.equal(batch.producer, 'hometradescompany-director/SEQ-Maps');
  assert.deepEqual(batch.observations[0], original);
  assert.deepEqual(observation, original);
  assert.equal(batch.observations[0].edgeId, undefined);
});
test('rejects incomplete timestamps rather than substituting ingestion time', () => {
  assert.throws(() => exportTrafficObservations([{ ...observation, knownAt: undefined }]), /knownAt/);
});
