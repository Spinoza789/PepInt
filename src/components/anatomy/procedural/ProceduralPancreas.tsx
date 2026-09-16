import { useMemo } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { OrganGroup, useOrganVisual } from './OrganGroup';

export function ProceduralPancreas() {
  const visual = useOrganVisual('pancreas', '#d4ab91');
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(-0.92, 0.03, 0), new Vector3(-0.48, 0.12, 0.06), new Vector3(0, 0.04, 0.1),
      new Vector3(0.43, -0.02, 0.04), new Vector3(0.82, 0.13, 0),
    ]);
    return new TubeGeometry(curve, 32, 0.16, 14, false);
  }, []);
  return (
    <OrganGroup organId="pancreas" position={[0.05, -0.72, 0.18]} rotation={[0.04, 0.05, -0.08]}>
      <mesh geometry={geometry} scale={visual.scale}><meshPhysicalMaterial {...visual} roughness={0.55} clearcoat={0.08} /></mesh>
      {[-0.5, -0.1, 0.32, 0.65].map((x, index) => (
        <mesh key={x} position={[x, index % 2 ? 0.08 : -0.02, 0.01]} scale={[0.25, 0.19, 0.14]}>
          <icosahedronGeometry args={[1, 2]} /><meshPhysicalMaterial {...visual} roughness={0.58} />
        </mesh>
      ))}
    </OrganGroup>
  );
}
