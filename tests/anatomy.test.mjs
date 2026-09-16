import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
const manifest=JSON.parse(fs.readFileSync('public/anatomy/manifest.json'));
const buffer=fs.readFileSync('public/anatomy/torso.bin');
test('prepared geometry has complete binary, valid indices, finite coordinates and source identity',()=>{
 assert.equal(buffer.length,manifest.bytes);assert.deepEqual(zlib.gunzipSync(fs.readFileSync('public/anatomy/torso.bin.gz')),buffer);
 for(const part of manifest.parts){assert.ok(part.sourceIds.length);assert.ok(part.bounds.flat().every(Number.isFinite));
  const pos=new Float32Array(buffer.buffer,buffer.byteOffset+part.positions,part.vertexCount*3);assert.ok(pos.every(Number.isFinite));
  const ix=new Uint32Array(buffer.buffer,buffer.byteOffset+part.indices,part.indexCount);assert.ok(ix.every(i=>i<part.vertexCount));
 }
});
test('all required organs and real outer layers are in the bundle',()=>{
 const ids=new Set(manifest.parts.map(p=>p.organId));for(const id of ['heart','lungs','liver','stomach','pancreas','smallIntestine','largeIntestine','kidneys'])assert.ok(ids.has(id),id);
 for(const layer of ['shell','muscles','ribs','vessels'])assert.ok(manifest.parts.some(p=>p.layer===layer),layer);
 const liver=manifest.parts.find(p=>p.organId==='liver');assert.deepEqual(liver.sourceIds,['VH_F_capsule_of_the_liver']);
 assert.ok(manifest.parts.filter(p=>p.layer==='muscles').every(p=>p.source==='BodyParts3D'));
 const lungs=manifest.parts.find(p=>p.organId==='lungs'),airway=manifest.parts.find(p=>p.id==='airway');
 assert.equal(lungs.sourceIds.length,20);assert.ok(airway.sourceIds.some(id=>id==='FJ2450'||id==='FJ2539'),'bronchial tree retained');
});
