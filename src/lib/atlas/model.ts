import { Box3, BufferAttribute, BufferGeometry, Vector3 } from 'three';
import type { OrganId } from '../types';

export type AtlasLayer = 'organs' | 'shell' | 'muscles' | 'ribs' | 'vessels';
export interface RenderPart {
  id: string; layer: AtlasLayer; style: string; organId: OrganId | null;
  source: string; sourceIds: string[]; positions: number; normals: number; indices: number;
  vertexCount: number; indexCount: number; bounds: [number[], number[]];
}
export interface AnatomyBundle { parts: RenderPart[]; bytes: number; note: string }
export interface AnatomyData { manifest: AnatomyBundle; buffer: ArrayBuffer }
let cached: AnatomyData | undefined;

export async function loadAnatomy(signal: AbortSignal, progress: (n: number) => void): Promise<AnatomyData> {
  if (cached) { progress(100); return cached; }
  const root = `${import.meta.env.BASE_URL}anatomy/`;
  const manifestResponse = await fetch(`${root}manifest.json`, {signal});
  if (!manifestResponse.ok) throw new Error('The anatomy catalogue could not be loaded.');
  const manifest = await manifestResponse.json() as AnatomyBundle;
  progress(8);
  const compressed = typeof DecompressionStream !== 'undefined';
  const response = await fetch(`${root}torso.bin${compressed ? '.gz' : ''}`, {signal});
  if (!response.ok || !response.body) throw new Error('The anatomy geometry could not be loaded.');
  const reader = response.body.getReader(); const chunks: Uint8Array<ArrayBuffer>[] = [];
  const total = Number(response.headers.get('content-length')) || manifest.bytes;
  let received = 0;
  while (true) {
    const {done,value} = await reader.read(); if (done) break;
    chunks.push(value as Uint8Array<ArrayBuffer>); received += value.byteLength;
    progress(Math.min(90, 8 + 82 * received / total));
  }
  let buffer = await new Blob(chunks).arrayBuffer();
  const magic = new Uint8Array(buffer,0,2);
  if (compressed && magic[0]===31 && magic[1]===139) {
    buffer = await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  signal.throwIfAborted();
  if (buffer.byteLength !== manifest.bytes) throw new Error('Anatomy download was incomplete. Please retry.');
  cached = {manifest,buffer}; progress(100); return cached;
}

export function geometryFor(part: RenderPart, buffer: ArrayBuffer) {
  const g = new BufferGeometry();
  const positions = new Float32Array(buffer,part.positions,part.vertexCount*3);
  g.setAttribute('position',new BufferAttribute(positions,3));
  g.setAttribute('normal',new BufferAttribute(new Float32Array(buffer,part.normals,part.vertexCount*3),3));
  g.setIndex(new BufferAttribute(new Uint32Array(buffer,part.indices,part.indexCount),1));
  // Object-space cylindrical coordinates for subtle pores/fibres; shape remains source geometry.
  const uv=new Float32Array(part.vertexCount*2);
  const cx=(part.bounds[0][0]+part.bounds[1][0])/2,cz=(part.bounds[0][2]+part.bounds[1][2])/2;
  for(let i=0;i<part.vertexCount;i++){uv[i*2]=Math.atan2(positions[i*3+2]-cz,positions[i*3]-cx)/(Math.PI*2)+.5;uv[i*2+1]=positions[i*3+1]*5;}
  g.setAttribute('uv',new BufferAttribute(uv,2));
  g.boundingBox = new Box3(new Vector3().fromArray(part.bounds[0]), new Vector3().fromArray(part.bounds[1]));
  g.computeBoundingSphere(); return g;
}
