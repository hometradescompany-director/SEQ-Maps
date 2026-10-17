import test from 'node:test';import assert from 'node:assert/strict';import {assessObservationFreshness as assess} from '../src/observation-freshness.mjs';
const good={source:'council',licence:'CC-BY',observedAt:'2026-10-16T10:00:00Z'};const now=Date.parse(good.observedAt);
test('accepts fresh attributed observation',()=>assert.equal(assess(good,now,60000).usable,true));
test('rejects stale and future',()=>{assert.equal(assess(good,now+60001,60000).reason,'stale_observation');assert.equal(assess(good,now-1,60000).reason,'future_observation')});
test('fails closed on provenance',()=>{assert.equal(assess({...good,licence:''},now,100).usable,false);assert.equal(assess({...good,source:''},now,100).usable,false)});
test('rejects malformed and impossible timestamps',()=>{for(const observedAt of ['not-a-date','2026-02-30T10:00:00Z','2026-10-16T25:00:00Z'])assert.equal(assess({...good,observedAt},now,60000).reason,'invalid_time')});
