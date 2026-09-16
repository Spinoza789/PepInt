import { OrganGroup, useOrganVisual } from './OrganGroup';

function Kidney({ side }: { side: -1 | 1 }) {
  const visual = useOrganVisual('kidneys', '#713a35');
  return (
    <mesh position={[side * 0.9, -1.27, -0.35]} rotation={[0, side * 0.28, side * -0.32]} scale={[0.38, 0.55, 0.25]}>
      <sphereGeometry args={[1, 28, 22]} /><meshPhysicalMaterial {...visual} roughness={0.48} clearcoat={0.12} />
    </mesh>
  );
}

export function ProceduralKidneys() {
  return <OrganGroup organId="kidneys"><Kidney side={-1} /><Kidney side={1} /></OrganGroup>;
}
