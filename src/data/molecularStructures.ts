import type {ReceptorId} from '../lib/types';
export interface MolecularStructureConfig {
 id:string; pdbId:'8YWF'|'8YW4'|'6LMK'; receptor:ReceptorId; localUrl:string;
 peptideName:string;
 evidence:'Experimental structure'; peptideEntity:string; receptorEntity:string;
 peptideChain:string; receptorChain:string; observedResidues:number; chainMappingNote:string;
}
// Verified with scripts/prepare-structures.mjs against _entity, _struct_asym and _atom_site.
// label_asym_id differs from author chain IDs. Never transfer a mapping to another PDB entry.
export const molecularStructures:MolecularStructureConfig[]=[
 {id:'retatrutide-glp1r',pdbId:'8YWF',receptor:'GLP1R',localUrl:'structures/8YWF.cif',peptideName:'Retatrutide',evidence:'Experimental structure',peptideEntity:'5',receptorEntity:'6',peptideChain:'E',receptorChain:'F',observedResidues:33,chainMappingNote:'Peptide: label E / author P. GLP-1R: label F / author R. 33 peptide residues have coordinates. The model is not the complete free peptide.'},
 {id:'retatrutide-gipr',pdbId:'8YW4',receptor:'GIPR',localUrl:'structures/8YW4.cif',peptideName:'Retatrutide',evidence:'Experimental structure',peptideEntity:'6',receptorEntity:'5',peptideChain:'F',receptorChain:'E',observedResidues:27,chainMappingNote:'Peptide: label F / author P. GIPR: label E / author R. 27 peptide residues have coordinates. Unresolved residues are not invented.'},
 {id:'glucagon-gcgr',pdbId:'6LMK',receptor:'GCGR',localUrl:'structures/6LMK.cif',peptideName:'Glucagon',evidence:'Experimental structure',peptideEntity:'6',receptorEntity:'5',peptideChain:'F',receptorChain:'E',observedResidues:29,chainMappingNote:'Glucagon: label F / author E. GCGR: label E / author R. 29 glucagon residues have coordinates. The complex also includes a heterotrimeric G protein and a stabilizing nanobody.'},
];
