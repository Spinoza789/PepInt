import type { ComponentType } from 'react';

export type OrganId =
  | 'heart'
  | 'lungs'
  | 'liver'
  | 'gallbladder'
  | 'stomach'
  | 'pancreas'
  | 'smallIntestine'
  | 'largeIntestine'
  | 'kidneys'
  | 'adipose'
  | 'muscle'
  | 'brain';

export type EvidenceLabel =
  | 'Experimental structure'
  | 'Structural proxy'
  | 'Conceptual educational animation'
  | 'Simplified pharmacokinetic model';

export type OrganContent = {
  id: OrganId;
  meshName: string;
  displayName: string;
  relevance: 'primary' | 'secondary' | 'contextual';
  shortDescription: string;
  detailedDescription: string;
  effectSummary: string;
  caveat: string;
  evidenceLabel: EvidenceLabel;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  highlightColour: string;
  cellularSceneId?: string;
};

export type AnatomyAssetProps = {
  organId: OrganId;
  selected: boolean;
  hovered: boolean;
  visible: boolean;
  opacity: number;
  effectLevel: number;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
};

export type AnatomyModelSource = {
  type: 'procedural' | 'gltf';
  assetUrl?: string;
  fallbackComponent: ComponentType<AnatomyAssetProps>;
};

export type ExperienceStage =
  | 'overview'
  | 'peptide'
  | 'receptors'
  | 'body'
  | 'organ'
  | 'cell'
  | 'molecule'
  | 'halfLife'
  | 'sources';

export type LayerMode = 'normal' | 'transparent' | 'cutaway' | 'focus';
export type ReceptorId = 'GLP1R' | 'GIPR' | 'GCGR';
