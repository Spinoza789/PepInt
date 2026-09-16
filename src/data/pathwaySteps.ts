import type {OrganId} from '../lib/types';
export const pathwaySteps:{title:string;text:string;organId:OrganId|null}[]=[
 {title:'A peptide with three receptor targets',text:'Retatrutide is an investigational agonist involving GLP-1, GIP and glucagon receptors. This is an explanatory sequence, not a prediction of when organs respond.',organId:null},
 {title:'Absorption and circulation',text:'A subcutaneously administered peptide can enter systemic circulation after absorption. The cyan path is a simplified circulation illustration; its brightness follows the educational concentration model.',organId:'heart'},
 {title:'Pancreas and hormone regulation',text:'Incretin receptor signalling helps regulate pancreatic hormone release in a glucose-dependent context. The animation does not calculate insulin, glucagon or blood glucose.',organId:'pancreas'},
 {title:'Liver and metabolic signalling',text:'The liver participates in nutrient handling and glucose production. Glucagon-receptor signalling is part of the metabolic context; the combined drug response cannot be inferred from one organ alone.',organId:'liver'},
 {title:'Gastrointestinal context',text:'GLP-1 pathways are involved in gastrointestinal function and gut–brain signalling. This scene locates the stomach and intestine; it does not predict gastric emptying or symptoms.',organId:'stomach'},
 {title:'Muscle and whole-body metabolism',text:'Skeletal muscle uses energy and takes up glucose as part of systemic regulation. Highlighting it does not imply a direct retatrutide receptor effect in every muscle.',organId:'muscle'},
 {title:'Appetite and satiety',text:'Appetite regulation involves brain circuits and peripheral signals. This inset uses a conceptual bilateral brain network; it is not a literal neural pathway or a clinical prediction.',organId:'brain'},
 {title:'Concentration changes over days',text:'Scrub or play the chart to compare elimination and accumulation. The model describes a relative concentration curve, not treatment effectiveness or an individual dosing plan.',organId:null},
];
