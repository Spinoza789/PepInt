import { useMemo } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { OrganGroup, useOrganVisual } from './OrganGroup';

function tube(points: [number, number][], radius: number, tubularSegments: number) {
  const curve = new CatmullRomCurve3(points.map(([x, y]) => new Vector3(x, y, 0)));
  return new TubeGeometry(curve, tubularSegments, radius, 12, false);
}

const smallIntestinePaths: [number, number][][] = [
  [[-0.72, 0.48], [-0.2, 0.69], [0.56, 0.52], [0.69, 0.18], [0.35, -0.08], [-0.37, 0.01], [-0.62, -0.33], [-0.32, -0.61], [0.37, -0.51], [0.66, -0.79]],
  [[-0.72, 0.16], [-0.42, -0.12], [0.2, -0.19], [0.66, -0.44], [0.31, -0.78], [-0.38, -0.74], [-0.7, -1.04], [-0.22, -1.31], [0.48, -1.14]],
  [[0.48, 0.62], [0.68, 0.34], [0.44, 0.03], [-0.22, 0.07], [-0.62, -0.29], [-0.33, -0.55], [0.27, -0.53], [0.62, -0.89], [0.34, -1.23], [-0.28, -1.22]],
];

export function ProceduralSmallIntestine() {
  const visual = useOrganVisual('smallIntestine', '#d7988c');
  const geometries = useMemo(() => smallIntestinePaths.map((path) => tube(path, 0.115, 56)), []);
  return (
    <OrganGroup organId="smallIntestine" position={[0.02, -1.08, 0.04]}>
      {geometries.map((geometry, index) => <mesh key={index} geometry={geometry} scale={visual.scale}><meshPhysicalMaterial {...visual} roughness={0.55} clearcoat={0.08} /></mesh>)}
    </OrganGroup>
  );
}

export function ProceduralLargeIntestine() {
  const visual = useOrganVisual('largeIntestine', '#9f625a');
  const geometry = useMemo(() => tube([
    [-0.79, 0.73], [-0.96, 0.36], [-0.95, -0.54], [-0.73, -1.18], [-0.3, -1.42],
    [0.3, -1.42], [0.76, -1.17], [0.95, -0.48], [0.94, 0.41], [0.7, 0.75], [0.1, 0.82], [-0.53, 0.78],
  ], 0.16, 72), []);
  return (
    <OrganGroup organId="largeIntestine" position={[0.02, -1.1, 0.3]}>
      <mesh geometry={geometry} scale={visual.scale}><meshPhysicalMaterial {...visual} roughness={0.53} clearcoat={0.06} /></mesh>
    </OrganGroup>
  );
}
