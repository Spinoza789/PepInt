import { Html } from '@react-three/drei';
import { phaseOneOrganIds, organContent } from '../../data/organs';
import { useExperienceStore } from '../../state/useExperienceStore';
import type { OrganId } from '../../lib/types';

const labelPositions: Record<OrganId, [number, number, number]> = {
  heart: [0.1, 1.15, 0.85], lungs: [-1.15, 1.9, 0.45], liver: [-1.25, -0.05, 0.5],
  gallbladder: [-0.68, -0.6, 0.5], stomach: [1.1, -0.15, 0.75], pancreas: [0.35, -0.52, 0.62],
  smallIntestine: [0.1, -1.82, 0.42], largeIntestine: [1.15, -1.2, 0.54], kidneys: [1.15, -1.5, -0.15],
  adipose: [0, -1.2, 0.2], muscle: [1.25, 0, 0.2], brain: [0, 3.8, 0],
};

export function OrganLabels() {
  const labelsVisible = useExperienceStore((state) => state.layers.labels && state.showLabels);
  const hovered = useExperienceStore((state) => state.hoveredOrganId);
  if (!labelsVisible) return null;
  return (
    <group name="annotation-layer">
      {phaseOneOrganIds.map((organId) => (
        <Html key={organId} position={labelPositions[organId]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className={`organ-label ${hovered === organId ? 'is-hovered' : ''}`}>{organContent[organId].displayName}</div>
        </Html>
      ))}
    </group>
  );
}
