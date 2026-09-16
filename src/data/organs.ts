import type { OrganContent, OrganId } from '../lib/types';

export const organContent: Record<OrganId, OrganContent> = {
  heart: {
    id: 'heart', meshName: 'heart', displayName: 'Heart', relevance: 'contextual',
    shortDescription: 'Circulation context for this conceptual whole-body pathway.',
    detailedDescription: 'The heart is shown to orient the circulation animation. It distributes blood throughout the body, but this scene does not model organ-level drug concentrations.',
    effectSummary: 'A circulation reference point in the pathway.',
    caveat: 'This is a simplified circulation context, not a cardiovascular treatment claim.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [0.75, 1.25, 4.0], cameraTarget: [0.15, 1.0, 0], highlightColour: '#f0aa57',
  },
  lungs: {
    id: 'lungs', meshName: 'lungs', displayName: 'Lungs', relevance: 'contextual',
    shortDescription: 'Thoracic context around the heart and major vessels.',
    detailedDescription: 'The lungs provide anatomical orientation in the torso. They are included as context rather than as a claimed primary site of retatrutide action.',
    effectSummary: 'Anatomical context for the body-level view.',
    caveat: 'No direct organ-specific effect is depicted here.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [0, 1.45, 4.3], cameraTarget: [0, 1.1, 0], highlightColour: '#f0aa57',
  },
  liver: {
    id: 'liver', meshName: 'liver', displayName: 'Liver', relevance: 'primary',
    shortDescription: 'A major metabolic organ shown for conceptual systemic context.',
    detailedDescription: 'The liver participates in energy and glucose metabolism. Its inclusion helps explain why metabolic signalling is discussed at a whole-body level, without implying a quantified direct response.',
    effectSummary: 'Conceptual metabolic context in the guided pathway.',
    caveat: 'This illustration does not show direct organ concentration, clinical outcomes, or an individual response.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [-2.4, 0.25, 3.5], cameraTarget: [-0.55, -0.05, 0], highlightColour: '#f0aa57', cellularSceneId: 'liver',
  },
  gallbladder: {
    id: 'gallbladder', meshName: 'gallbladder', displayName: 'Gallbladder', relevance: 'contextual',
    shortDescription: 'An adjacent structure included for anatomical orientation.',
    detailedDescription: 'The gallbladder sits beneath the liver and is kept visually subordinate in this educational model.',
    effectSummary: 'Anatomical context.', caveat: 'No specific effect is depicted.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [-1.7, -0.15, 3.0], cameraTarget: [-0.45, -0.4, 0], highlightColour: '#f0aa57',
  },
  stomach: {
    id: 'stomach', meshName: 'stomach', displayName: 'Stomach', relevance: 'primary',
    shortDescription: 'Part of the gastrointestinal context in the pathway.',
    detailedDescription: 'The stomach is included to introduce gastrointestinal signalling concepts in plain language. This model does not simulate gastric emptying or predict an individual experience.',
    effectSummary: 'Conceptual gastrointestinal context.',
    caveat: 'This is a conceptual educational animation, not a physiological measurement.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [2.1, -0.15, 3.35], cameraTarget: [0.55, -0.2, 0], highlightColour: '#f0aa57', cellularSceneId: 'gut',
  },
  pancreas: {
    id: 'pancreas', meshName: 'pancreas', displayName: 'Pancreas', relevance: 'primary',
    shortDescription: 'A primary organ in the metabolic hormone-regulation story.',
    detailedDescription: 'The pancreas connects the reference anatomy to a conceptual endocrine-tissue view. The separate cell and receptor illustrations introduce hormone regulation without claiming a measured response.',
    effectSummary: 'An organ-to-cell entry point for the educational sequence.',
    caveat: 'The model does not depict exact receptor occupancy, secretion levels, or a clinical response.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [1.15, -0.45, 2.85], cameraTarget: [0.15, -0.55, 0], highlightColour: '#f0aa57', cellularSceneId: 'pancreas',
  },
  smallIntestine: {
    id: 'smallIntestine', meshName: 'smallIntestine', displayName: 'Small intestine', relevance: 'secondary',
    shortDescription: 'A simplified lower-abdominal digestive structure.',
    detailedDescription: 'The intestinal meshes come from the reference atlas. The separate gut-tissue view explains context without presenting it as a scale-accurate histological model.',
    effectSummary: 'Conceptual digestive-system context.',
    caveat: 'The anatomy and motion are illustrative and not to scale.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [1.55, -1.55, 3.65], cameraTarget: [0.1, -1.45, 0], highlightColour: '#f0aa57', cellularSceneId: 'gut',
  },
  largeIntestine: {
    id: 'largeIntestine', meshName: 'largeIntestine', displayName: 'Large intestine', relevance: 'secondary',
    shortDescription: 'A framing digestive structure around the small intestine.',
    detailedDescription: 'This organ is placed as a recognisable, simplified anatomical frame around the lower abdomen.',
    effectSummary: 'Conceptual digestive-system context.',
    caveat: 'This is not a clinical anatomical model.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [-1.7, -1.55, 3.7], cameraTarget: [0, -1.45, 0], highlightColour: '#f0aa57',
  },
  kidneys: {
    id: 'kidneys', meshName: 'kidneys', displayName: 'Kidneys', relevance: 'contextual',
    shortDescription: 'Paired posterior abdominal organs included for orientation.',
    detailedDescription: 'The kidney forms are slightly visible behind the digestive organs to establish a plausible torso layout.',
    effectSummary: 'Anatomical context.', caveat: 'No kidney-specific effect is implied.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [2.1, -1.15, 3.85], cameraTarget: [0.75, -1.2, -0.25], highlightColour: '#f0aa57',
  },
  adipose: {
    id: 'adipose', meshName: 'adipose', displayName: 'Adipose tissue', relevance: 'secondary',
    shortDescription: 'A conceptual abdominal adipose-tissue representation.',
    detailedDescription: 'This optional overlay will provide context for systemic energy-balance discussion without attempting to simulate body composition.',
    effectSummary: 'Conceptual systemic context.', caveat: 'Not a body-composition measurement.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [0, -1.2, 4.1], cameraTarget: [0, -1.2, 0], highlightColour: '#f0aa57',
  },
  muscle: {
    id: 'muscle', meshName: 'muscle', displayName: 'Skeletal muscle', relevance: 'contextual',
    shortDescription: 'Reference torso muscles provide anatomical and systemic context.',
    detailedDescription: 'Registered BodyParts3D meshes show torso muscle groups. Combining male muscle and female organ references is illustrative; it is not a validated single-person model.',
    effectSummary: 'Conceptual systemic context.', caveat: 'No muscle-specific outcome is shown.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [0, -1.1, 4.4], cameraTarget: [0, -1.1, 0], highlightColour: '#f0aa57',
  },
  brain: {
    id: 'brain', meshName: 'brain', displayName: 'Brain', relevance: 'secondary',
    shortDescription: 'A separate neural-network illustration introduces appetite and satiety concepts.',
    detailedDescription: 'The neural-network scene is separate from the reference torso and is labelled as a conceptual representation.',
    effectSummary: 'Conceptual appetite and satiety context.', caveat: 'It will not represent a literal neural pathway.',
    evidenceLabel: 'Conceptual educational animation', cameraPosition: [0, 1.5, 4.4], cameraTarget: [0, 1.5, 0], highlightColour: '#a98dda', cellularSceneId: 'brain',
  },
};

export const phaseOneOrganIds: OrganId[] = [
  'heart', 'lungs', 'liver', 'stomach', 'pancreas', 'smallIntestine', 'largeIntestine', 'kidneys',
];
