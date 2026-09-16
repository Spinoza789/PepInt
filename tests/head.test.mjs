import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';

const atlasPath = 'public/head/atlas.json';
const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));

test('vendored head atlas retains all published structures and systems', () => {
  assert.equal(atlas.meshes.length, 708);
  assert.deepEqual(zlib.gunzipSync(fs.readFileSync(`${atlasPath}.gz`)), fs.readFileSync(atlasPath));
  const systems = new Set(atlas.meshes.map((mesh) => mesh.system));
  assert.deepEqual([...systems].sort(), ['brain', 'eye', 'membrane', 'muscle', 'nerve', 'skull', 'vessel']);
  for (const mesh of atlas.meshes) {
    assert.ok(mesh.key && mesh.name && mesh.sourceFile);
    assert.ok(mesh.vertices > 0 && mesh.triangles > 0);
    assert.equal(mesh.p.length, mesh.vertices * 8);
    assert.ok(mesh.i.length > 0);
    assert.ok(mesh.lo.every(Number.isFinite) && mesh.span.every(Number.isFinite));
  }
});
