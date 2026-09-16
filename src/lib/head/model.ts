import { Box3, BufferAttribute, BufferGeometry, Vector3 } from 'three';

export type HeadSystem = 'brain' | 'skull' | 'muscle' | 'vessel' | 'nerve' | 'eye' | 'membrane';
export type HeadSystemFilter = 'all' | HeadSystem;

export interface HeadMeshRecord {
  key: string;
  name: string;
  side: 'Left' | 'Right' | 'Midline';
  system: HeadSystem;
  tissue: string;
  region: string;
  parent: string | null;
  lo: number[];
  span: number[];
  p: string;
  i: string;
  indexBytes: 2 | 4;
  vertices: number;
  triangles: number;
  clippedTriangles: number;
}

export interface HeadAtlasData {
  meshes: HeadMeshRecord[];
  transform?: { scale: number; origin: number[]; inferiorCropY: number };
}

let cached: HeadAtlasData | undefined;

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function loadHeadAtlas(signal: AbortSignal, progress: (value: number) => void) {
  if (cached) {
    progress(100);
    return cached;
  }
  const root = `${import.meta.env.BASE_URL}head/`;
  const response = await fetch(`${root}atlas.json${typeof DecompressionStream !== 'undefined' ? '.gz' : ''}`, { signal });
  if (!response.ok) throw new Error('The head atlas could not be loaded.');
  let buffer = await response.arrayBuffer();
  if (typeof DecompressionStream !== 'undefined' && new Uint8Array(buffer, 0, 2)[0] === 31) {
    buffer = await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  signal.throwIfAborted();
  progress(35);
  const data = JSON.parse(new TextDecoder().decode(buffer)) as HeadAtlasData;
  if (!Array.isArray(data.meshes) || data.meshes.length !== 708) throw new Error('The head atlas is incomplete.');
  cached = data;
  progress(100);
  return data;
}

export function geometryForHead(record: HeadMeshRecord) {
  const positionBytes = decodeBase64(record.p);
  const positionView = new DataView(positionBytes.buffer, positionBytes.byteOffset, positionBytes.byteLength);
  const positions = new Float32Array(record.vertices * 3);
  for (let index = 0; index < positions.length; index += 1) {
    positions[index] = record.lo[index % 3] + (positionView.getUint16(index * 2, true) / 65535) * record.span[index % 3];
  }
  const indexBytes = decodeBase64(record.i);
  const indexView = new DataView(indexBytes.buffer, indexBytes.byteOffset, indexBytes.byteLength);
  const indices = record.indexBytes === 2 ? new Uint16Array(indexBytes.byteLength / 2) : new Uint32Array(indexBytes.byteLength / 4);
  for (let index = 0; index < indices.length; index += 1) {
    indices[index] = record.indexBytes === 2 ? indexView.getUint16(index * 2, true) : indexView.getUint32(index * 4, true);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.boundingBox = new Box3(new Vector3().fromArray(record.lo), new Vector3().fromArray(record.lo).add(new Vector3().fromArray(record.span)));
  geometry.computeBoundingSphere();
  return geometry;
}

export const HEAD_SYSTEMS: { id: HeadSystem; label: string; color: string }[] = [
  { id: 'brain', label: 'Brain', color: '#b697c5' },
  { id: 'skull', label: 'Skull & teeth', color: '#d8c8a8' },
  { id: 'muscle', label: 'Head muscles', color: '#ad625d' },
  { id: 'vessel', label: 'Blood vessels', color: '#c56a62' },
  { id: 'nerve', label: 'Cranial nerves', color: '#d4ae63' },
  { id: 'eye', label: 'Eyes & vision', color: '#9bbfc0' },
  { id: 'membrane', label: 'Membranes', color: '#87aca6' },
];

export const headTissueColors: Record<string, string> = {
  tooth: '#e6e1d2', bone: '#d5c8aa', muscle: '#b9695f', membrane: '#95bcb5',
  deep: '#a1c5bf', cortex: '#c8a995', white: '#d0c4b0', csf: '#60b8d2',
  stem: '#d4b68d', cerebellum: '#bb9288', nerve: '#e0ba62', sclera: '#ddd9ca',
  iris: '#47685e', glass: '#c0dce1', eye: '#c28c7c', artery: '#db6a58', vein: '#628ebf',
};
