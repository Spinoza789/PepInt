/** Reproducible, local-only extraction from the attributed Human Atlas files. */
import fs from 'node:fs';
import zlib from 'node:zlib';
import { BufferGeometry, BufferAttribute, Matrix4, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const read = name => JSON.parse(fs.readFileSync(`public/models/${name}`));
const hra = read('atlas-female.json');
const bp = read('atlas.json');
const cache = new Map();
const groups = new Map();
// Registration for a COMPOSITE educational reference, not a single-person scan.
// BP3D male torso is shifted/scaled into HRA female torso coordinates.
const registration = new Matrix4().compose(new Vector3(0, -.04, -.04), new Quaternion(), new Vector3(1.04,.995,.97));
function add(atlas, part, id, layer, style, organId = null) {
  const key = `${atlas.source}:${part.chunk}`;
  if (!cache.has(key)) cache.set(key, zlib.gunzipSync(fs.readFileSync(`public${atlas.chunks[part.chunk].gzip}`)));
  const bytes = cache.get(key);
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(bytes.buffer, bytes.byteOffset + part.positions, part.vertexCount * 3).slice(), 3));
  const packed = new Int16Array(bytes.buffer, bytes.byteOffset + part.normals, part.vertexCount * 3);
  g.setAttribute('normal', new BufferAttribute(Float32Array.from(packed, v => Math.max(-1, v / 32767)), 3));
  g.setIndex(new BufferAttribute(new Uint32Array(bytes.buffer, bytes.byteOffset + part.indices, part.indexCount).slice(), 1));
  if (atlas === bp) g.applyMatrix4(registration);
  if (atlas === bp && id === 'airway') {
    // BodyParts3D airway tubes are slightly larger than the HRA lung frame.
    // Fit them around the hilum while retaining their branching topology.
    const fit = new Matrix4().makeTranslation(0,1.32,0)
      .multiply(new Matrix4().makeScale(.76,.86,.76))
      .multiply(new Matrix4().makeTranslation(0,-1.32,0));
    g.applyMatrix4(fit);
  }
  const group = groups.get(id) ?? { id, layer, style, organId, source: atlas.source, sourceIds: [], geometries: [] };
  group.sourceIds.push(part.id); group.geometries.push(g); groups.set(id, group);
}
function select(atlas, predicate, id, layer, style, organId) {
  const selected = atlas.parts.filter(predicate);
  if (!selected.length) throw new Error(`No source meshes for ${id}`);
  selected.forEach(p => add(atlas,p,id,layer,style,organId));
}
select(hra,p=>p.id==='VH_F_skin','skin','shell','skin');
select(hra,p=>p.id.includes('bronchopulmonary'),'lungs','organs','lung','lungs');
// Capsule already covers the liver; rendering segments/impressions over it caused z-fighting.
select(hra,p=>p.id==='VH_F_capsule_of_the_liver','liver','organs','liver','liver');
select(hra,p=>/^VH_F_(left|right)_(ventricle|cardiac_atrium)$/.test(p.id),'heart','organs','heart','heart');
const pancreas = new Set(hra.concepts.find(c=>c.id==='HRA:VH_F_pancreas').elements);
select(hra,p=>pancreas.has(p.id),'pancreas','organs','pancreas','pancreas');
select(hra,p=>p.id==='VH_F_gallbladder','gallbladder','organs','gallbladder','gallbladder');
select(hra,p=>/^VH_F_kidney_capsule_[LR]$/.test(p.id),'kidneys','organs','kidney','kidneys');
select(hra,p=>/^VH_F_(duodenum_(superior|descending|ascending|horizontal)|jejenum|ileum|ileum_terminal)$/.test(p.id),'smallIntestine','organs','intestine','smallIntestine');
select(hra,p=>/^VH_F_(ascending_colon|transverse_colon|descending_colon|sigmoid_colon|rectum|caecum|vermiform_appendix)$/.test(p.id),'largeIntestine','organs','colon','largeIntestine');
select(bp,p=>p.id==='FJ2564','stomach','organs','stomach','stomach');
select(hra,p=>p.id==='VH_F_tracheal_cartilage','airway','organs','airway');
// BodyParts3D contributes the bronchial tree branches that sit inside the HRA lung surfaces.
// They are preserved as a single airway group so the anatomy can reveal real branching
// context without exposing the complete 2,234-mesh source atlas at runtime.
select(bp,p=>/bronchial tree|main bronchus/i.test(p.name),'airway','organs','airway');
select(hra,p=>/aortic_arch|ascending_aorta|descending_aorta|pulmonary_artery|coronary_artery/.test(p.id),'arteries','vessels','artery');
select(hra,p=>/vena_cava|pulmonary_vein|great_cardiac_vein|coronary_sinus/.test(p.id),'veins','vessels','vein');
const musclePattern=/pectoralis major|external oblique|serratus anterior|trapezius|deltoid|iliocostalis lumborum/;
for (const p of bp.parts.filter(p=>p.system==='muscular'&&musclePattern.test(p.name.toLowerCase()))) add(bp,p,p.id,'muscles','muscle','muscle');
select(bp,p=>p.system==='skeletal'&&(/\brib$|costal cartilage|sternum|manubrium|xiphoid|clavicle|scapula/.test(p.name.toLowerCase())),'ribcage','ribs','bone');

let offset=0;const segments=[];const parts=[];
for (const group of groups.values()) {
  const g=mergeGeometries(group.geometries);
  if (!g.attributes.position.array.every(Number.isFinite)) throw new Error(`Non-finite coordinates: ${group.id}`);
  g.computeBoundingBox();g.computeBoundingSphere();
  const pos=g.attributes.position.array, norm=g.attributes.normal.array, idx=Uint32Array.from(g.index.array);
  const entry={id:group.id,layer:group.layer,style:group.style,organId:group.organId,source:group.source,sourceIds:group.sourceIds,vertexCount:pos.length/3,indexCount:idx.length,bounds:[g.boundingBox.min.toArray(),g.boundingBox.max.toArray()]};
  for(const [name,array] of [['positions',pos],['normals',norm],['indices',idx]]){entry[name]=offset;const b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);segments.push(b);offset+=b.byteLength;}
  parts.push(entry);group.geometries.forEach(g=>g.dispose());g.dispose();
}
fs.mkdirSync('public/anatomy',{recursive:true});
const binary=Buffer.concat(segments);
fs.writeFileSync('public/anatomy/torso.bin',binary);
fs.writeFileSync('public/anatomy/torso.bin.gz',zlib.gzipSync(binary));
fs.writeFileSync('public/anatomy/manifest.json',JSON.stringify({version:1,bytes:binary.length,parts,sourceRepository:'https://github.com/ashemag/human-atlas',registration:registration.toArray(),note:'Composite educational anatomy: HRA female skin/organs with registered BP3D male muscles, bones and stomach. Materials and crop are illustrative; not a validated registration.'},null,2));
console.log(`${parts.length} render groups; ${parts.reduce((n,p)=>n+p.indexCount/3,0)} triangles; ${(binary.length/1e6).toFixed(1)} MB raw / ${(zlib.gzipSync(binary).length/1e6).toFixed(1)} MB compressed.`);
