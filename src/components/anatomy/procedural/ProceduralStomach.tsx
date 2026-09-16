import { useMemo } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { OrganGroup, useOrganVisual } from './OrganGroup';

export function ProceduralStomach() {
  const visual = useOrganVisual('stomach', '#c58a78');
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(0.15, 0.62, 0), new Vector3(0.55, 0.45, 0.02), new Vector3(0.64, 0.05, 0.04),
      new Vector3(0.48, -0.34, 0.08), new Vector3(0.14, -0.45, 0.12), new Vector3(-0.07, -0.2, 0.06),
    ]);
    return new TubeGeometry(curve, 44, 0.28, 16, false);
  }, []);
  return (
    <OrganGroup organId="stomach" position={[0.48, -0.32, 0.42]} rotation={[0.05, -0.15, -0.1]}>
      <mesh geometry={geometry} scale={visual.scale}><meshPhysicalMaterial {...visual} roughness={0.46} clearcoat={0.12} /></mesh>
      <mesh position={[0.42, 0.02, 0]} scale={[0.43, 0.64, 0.34]}><sphereGeometry args={[1, 24, 20]} /><meshPhysicalMaterial {...visual} roughness={0.46} clearcoat={0.12} /></mesh>
    </OrganGroup>
  );
}
