import * as T from 'three';

/** Metadata shape used by the quantized atlas published with the head project. */
export interface HeadSourcePart {
  key: string;
  fj: string;
  parent: string | null;
  name: string;
  side: string;
  sourceObject: string;
  sourceFile: string;
  source: string;
  system: 'skull' | 'muscle' | 'membrane' | 'brain' | 'nerve' | 'eye' | 'vessel';
  tissue: string;
  region: string;
  lo: [number, number, number];
  span: [number, number, number];
  p: string;
  i: string;
  indexBytes: 2 | 4;
  vertices: number;
  triangles: number;
  clippedTriangles: number;
  windingReversed: boolean;
  connections: string[];
}

export interface HeadManifest {
  source: string;
  license: string;
  transform: { scale: number; origin: number[]; inferiorCropY: number };
  sourceFiles: { file: string; sha256: string; url: string }[];
  meshes: HeadSourcePart[];
}

export interface HeadMeshRecord {
  source: HeadSourcePart;
  mesh: T.Mesh<T.BufferGeometry, T.MeshPhysicalMaterial>;
  center: T.Vector3;
  size: T.Vector3;
  baseColor: T.Color;
}

export interface HeadAtlas {
  records: HeadMeshRecord[];
  bounds: T.Box3;
  brainBounds: T.Box3;
  source: HeadManifest;
  dispose: () => void;
}

// The source atlas is a separate, centimetre-like coordinate frame. These
// constants place its cropped neck at the top of the existing body model.
// Calibrated against the body's meter-scale bounds: adult head height is
// roughly one sixth of the standing reference height, not a quarter.
export const HEAD_SCALE = 0.04;
export const HEAD_OFFSET = new T.Vector3(0, 1.73, -0.019);
const HEAD_SOURCE_CENTER_Z = 0.3166945;

const tissueColours: Record<string, number> = {
  tooth: 0xe6e1d2,
  bone: 0xd5c8aa,
  muscle: 0xb9695f,
  membrane: 0x95bcb5,
  deep: 0xa1c5bf,
  cortex: 0xc8a995,
  white: 0xd0c4b0,
  csf: 0x60b8d2,
  cerebellum: 0xbb9288,
  stem: 0xd4b68d,
  nerve: 0xe0ba62,
  artery: 0xdb6a58,
  vein: 0x628ebf,
  sclera: 0xddd9ca,
  iris: 0x47685e,
  glass: 0xc0dce1,
  eye: 0xc28c7c,
};

function decodeBase64(value: string) {
  const bytes = atob(value);
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) out[i] = bytes.charCodeAt(i);
  return out;
}

function decodeGeometry(source: HeadSourcePart) {
  const packedPositions = decodeBase64(source.p);
  const packedIndices = decodeBase64(source.i);
  const positions = new Float32Array(source.vertices * 3);
  const positionView = new DataView(packedPositions.buffer, packedPositions.byteOffset, packedPositions.byteLength);
  for (let vertex = 0; vertex < source.vertices; vertex += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      const quantized = positionView.getUint16((vertex * 3 + axis) * 2, true) / 65535;
      const value = source.lo[axis] + quantized * source.span[axis];
      positions[vertex * 3 + axis] = value;
    }
  }
  const indexView = new DataView(packedIndices.buffer, packedIndices.byteOffset, packedIndices.byteLength);
  const indexCount = source.indexBytes === 2 ? packedIndices.byteLength / 2 : packedIndices.byteLength / 4;
  const decodedIndices = source.indexBytes === 2 ? new Uint16Array(indexCount) : new Uint32Array(indexCount);
  for (let index = 0; index < indexCount; index += 1) {
    decodedIndices[index] = source.indexBytes === 2
      ? indexView.getUint16(index * 2, true)
      : indexView.getUint32(index * 4, true);
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
  geometry.setIndex(new T.BufferAttribute(decodedIndices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function sourceToBody(point: T.Vector3) {
  return new T.Vector3(
    point.x * HEAD_SCALE,
    point.y * HEAD_SCALE + HEAD_OFFSET.y,
    (point.z - HEAD_SOURCE_CENTER_Z) * HEAD_SCALE + HEAD_OFFSET.z,
  );
}

function materialFor(source: HeadSourcePart) {
  const transparent = ['membrane', 'glass', 'csf'].includes(source.tissue);
  const material = new T.MeshPhysicalMaterial({
    color: tissueColours[source.tissue] ?? 0xb8a49c,
    roughness: ['artery', 'vein', 'glass'].includes(source.tissue) ? 0.3 : 0.52,
    metalness: 0.02,
    clearcoat: source.tissue === 'cortex' ? 0.08 : 0.02,
    transparent,
    opacity: source.tissue === 'membrane' ? 0.2 : source.tissue === 'glass' ? 0.13 : source.tissue === 'csf' ? 0.46 : 1,
    depthWrite: !transparent,
    side: T.DoubleSide,
  });
  return material;
}

/** Load and convert the head project's quantized atlas into body coordinates. */
export async function loadHeadAtlas(signal: AbortSignal): Promise<HeadAtlas> {
  const root = `${import.meta.env.BASE_URL}head/`;
  const compressed = typeof DecompressionStream !== 'undefined';
  const response = await fetch(`${root}atlas.json${compressed ? '.gz' : ''}`, { signal });
  if (!response.ok) throw new Error('The head anatomy could not be loaded.');
  let payload = await response.arrayBuffer();
  if (compressed && new Uint8Array(payload, 0, 2)[0] === 31 && new Uint8Array(payload, 0, 2)[1] === 139) {
    payload = await new Response(new Blob([payload]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  const source = JSON.parse(new TextDecoder().decode(payload)) as HeadManifest;
  signal.throwIfAborted();
  const records: HeadMeshRecord[] = [];
  const bounds = new T.Box3();
  const brainBounds = new T.Box3();
  for (const part of source.meshes) {
    const geometry = decodeGeometry(part);
    const positions = geometry.getAttribute('position') as T.BufferAttribute;
    for (let i = 0; i < positions.count; i += 1) {
      const p = sourceToBody(new T.Vector3().fromBufferAttribute(positions, i));
      positions.setXYZ(i, p.x, p.y, p.z);
    }
    positions.needsUpdate = true;
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const material = materialFor(part);
    const mesh = new T.Mesh(geometry, material);
    mesh.name = `head-${part.key}`;
    mesh.userData.headPart = part;
    const partBounds = geometry.boundingBox ?? new T.Box3();
    bounds.union(partBounds);
    if (part.system === 'brain') brainBounds.union(partBounds);
    records.push({
      source: part,
      mesh,
      center: partBounds.getCenter(new T.Vector3()),
      size: partBounds.getSize(new T.Vector3()),
      baseColor: new T.Color(material.color),
    });
  }
  return {
    records,
    bounds,
    brainBounds,
    source,
    dispose: () => records.forEach(({ mesh }) => { mesh.geometry.dispose(); mesh.material.dispose(); }),
  };
}
