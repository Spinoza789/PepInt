import { useMemo } from 'react';
import { ExtrudeGeometry, Shape } from 'three';
import { OrganGroup, useOrganVisual } from './OrganGroup';

export function ProceduralLiver() {
  const visual = useOrganVisual('liver', '#713b31');
  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-1.2, -0.28);
    shape.bezierCurveTo(-1.26, 0.42, -0.72, 0.77, -0.05, 0.65);
    shape.bezierCurveTo(0.57, 0.76, 1.18, 0.48, 1.25, 0.05);
    shape.bezierCurveTo(1.12, -0.45, 0.43, -0.64, -0.2, -0.57);
    shape.bezierCurveTo(-0.72, -0.62, -1.12, -0.53, -1.2, -0.28);
    return new ExtrudeGeometry(shape, { depth: 0.42, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.12, bevelThickness: 0.1, curveSegments: 20 });
  }, []);
  return (
    <OrganGroup organId="liver" position={[-0.47, -0.35, 0.08]} rotation={[-0.05, 0.08, 0.03]}>
      <mesh geometry={geometry} scale={visual.scale}>
        <meshPhysicalMaterial {...visual} roughness={0.52} clearcoat={0.08} />
      </mesh>
    </OrganGroup>
  );
}
