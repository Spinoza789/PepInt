import { useMemo } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { useExperienceStore } from '../../../state/useExperienceStore';

function Vessel({ points, color, radius }: { points: Vector3[]; color: string; radius: number }) {
  const geometry = useMemo(() => new TubeGeometry(new CatmullRomCurve3(points), 28, radius, 8, false), [points, radius]);
  return <mesh geometry={geometry}><meshPhysicalMaterial color={color} roughness={0.35} transparent opacity={0.68} /></mesh>;
}

export function ProceduralVessels() {
  const visible = useExperienceStore((state) => state.layers.vessels);
  if (!visible) return null;
  return (
    <group name="simplified-vessels" raycast={() => null}>
      <Vessel color="#ae4148" radius={0.09} points={[new Vector3(0.08, 1.6, -0.08), new Vector3(0.04, 0.8, -0.2), new Vector3(0.02, -0.3, -0.28), new Vector3(0.02, -2.3, -0.25)]} />
      <Vessel color="#3569a4" radius={0.1} points={[new Vector3(-0.18, 1.6, -0.1), new Vector3(-0.13, 0.7, -0.24), new Vector3(-0.12, -0.5, -0.3), new Vector3(-0.13, -2.25, -0.25)]} />
      <Vessel color="#ae4148" radius={0.045} points={[new Vector3(0.03, -0.38, -0.24), new Vector3(-0.54, -0.58, -0.16), new Vector3(-0.75, -1.0, -0.23)]} />
      <Vessel color="#ae4148" radius={0.045} points={[new Vector3(0.03, -0.52, -0.24), new Vector3(0.58, -0.68, -0.14), new Vector3(0.83, -1.06, -0.23)]} />
    </group>
  );
}
