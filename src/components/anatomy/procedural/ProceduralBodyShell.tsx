import { useMemo } from 'react';
import { LatheGeometry, Vector2 } from 'three';
import { useExperienceStore } from '../../../state/useExperienceStore';

export function ProceduralBodyShell() {
  const visible = useExperienceStore((state) => state.layers.shell);
  const opacity = useExperienceStore((state) => state.shellOpacity);
  const layerMode = useExperienceStore((state) => state.layerMode);
  const geometry = useMemo(() => {
    const profile = [
      new Vector2(0.72, -3.25), new Vector2(1.0, -2.82), new Vector2(1.1, -1.4),
      new Vector2(1.2, 0.15), new Vector2(1.52, 1.6), new Vector2(1.4, 2.35),
      new Vector2(1.02, 3.05), new Vector2(0.75, 3.35),
    ];
    return new LatheGeometry(profile, 64, 0, Math.PI * 2);
  }, []);

  if (!visible) return null;
  return (
    <mesh name="body-shell" geometry={geometry} raycast={() => null} renderOrder={5}>
      <meshPhysicalMaterial
        color="#a8c1ce" transparent opacity={layerMode === 'transparent' ? Math.min(opacity, 0.055) : opacity}
        roughness={0.28} metalness={0.03} transmission={0.08} thickness={0.4}
        side={2} depthWrite={false}
      />
    </mesh>
  );
}
