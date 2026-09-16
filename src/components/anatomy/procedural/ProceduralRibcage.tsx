import { useMemo } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { useExperienceStore } from '../../../state/useExperienceStore';

function Rib({ y, side }: { y: number; side: 1 | -1 }) {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(0.12 * side, y, 0.74), new Vector3(0.72 * side, y + 0.12, 0.86),
      new Vector3(1.38 * side, y - 0.16, 0.4), new Vector3(1.42 * side, y - 0.58, -0.12),
    ]);
    return new TubeGeometry(curve, 20, 0.033, 8, false);
  }, [side, y]);
  return <mesh geometry={geometry}><meshStandardMaterial color="#d5c9ab" transparent opacity={0.42} roughness={0.55} /></mesh>;
}

export function ProceduralRibcage() {
  const visible = useExperienceStore((state) => state.layers.ribs);
  if (!visible) return null;
  return (
    <group name="ribcage" raycast={() => null}>
      {[-0.02, 0.38, 0.77, 1.16, 1.54, 1.91].flatMap((y) => [
        <Rib key={`${y}-l`} y={y} side={-1} />, <Rib key={`${y}-r`} y={y} side={1} />,
      ])}
      <mesh position={[0, 1.12, 0.76]} scale={[0.1, 1.45, 0.08]}>
        <capsuleGeometry args={[1, 8, 12, 20]} />
        <meshStandardMaterial color="#d5c9ab" transparent opacity={0.36} roughness={0.6} />
      </mesh>
    </group>
  );
}
