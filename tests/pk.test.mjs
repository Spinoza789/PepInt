import test from 'node:test';
import assert from 'node:assert/strict';
import {ABSORPTION_DAYS,concentrationAt,singleCurve,effectAt,makePKSeries} from '../src/lib/pk.ts';
test('elimination halves after one half-life',()=>{for(const h of [3,6,12]){assert.equal(singleCurve(ABSORPTION_DAYS,h),1);assert.ok(Math.abs(singleCurve(ABSORPTION_DAYS+h,h)-.5)<1e-12);}});
test('no concentration before an input and rise reaches the common reference',()=>{assert.equal(singleCurve(-1,6),0);assert.equal(concentrationAt(0,6,'weekly'),0);assert.equal(singleCurve(.375,6),.5);});
test('repeated inputs superpose without normalizing away accumulation',()=>{const t=7.75;assert.ok(Math.abs(concentrationAt(t,6,'weekly')-(singleCurve(t,6)+1))<1e-12);assert.ok(concentrationAt(35.75,12,'weekly')>2);assert.equal(concentrationAt(5,6,'single'),concentrationAt(5,6,'weekly'));});
test('generated chart contains peaks and monotonic single-dose tail',()=>{const series=makePKSeries(6,'single');assert.equal(series.length,337);assert.equal(series.find(x=>x.day===.75).concentration,1);const tail=series.filter(x=>x.day>=.75);assert.ok(tail.every((x,i)=>!i||x.concentration<=tail[i-1].concentration));});
test('visual response is bounded, not an organ-effect measurement',()=>{assert.equal(effectAt(0),0);assert.ok(effectAt(.5)<effectAt(1));assert.ok(effectAt(100)<1);});
