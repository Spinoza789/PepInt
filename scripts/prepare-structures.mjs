import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {CIF}=require('molstar/lib/commonjs/mol-io/reader/cif.js');
const result=[];
for(const [id,target,peptidePattern] of [['8YWF','GLP1R',/^retatrutide$/i],['8YW4','GIPR',/^retatrutide$/i],['6LMK','GCGR',/^glucagon$/i]]){
 const source=fs.readFileSync(`public/structures/${id}.cif`,'utf8');
 const parsed=await CIF.parseText(source).run();if(parsed.isError)throw Error(parsed.message);
 const db=CIF.schema.mmCIF(parsed.result.blocks[0]);const entities={};
 for(let i=0;i<db.entity._rowCount;i++)entities[db.entity.id.value(i)]=db.entity.pdbx_description.value(i).join(', ');
 const peptideEntity=Object.keys(entities).find(id=>peptidePattern.test(entities[id]));
 const receptorEntity=Object.keys(entities).find(id=>/receptor/i.test(entities[id]));
 if(!peptideEntity||!receptorEntity)throw Error('Unrecognized peptide or receptor');
 const chains=entity=>{const a=db.atom_site,ids=new Map();for(let i=0;i<a._rowCount;i++)if(a.label_entity_id.value(i)===entity)ids.set(a.label_asym_id.value(i),a.auth_asym_id.value(i));return [...ids].map(([label,author])=>({label,author}));};
 const atoms=db.atom_site,peptideCA=[];
 for(let i=0;i<atoms._rowCount;i++)if(atoms.label_entity_id.value(i)===peptideEntity&&atoms.label_atom_id.value(i)==='CA')peptideCA.push({residue:atoms.label_comp_id.value(i),sequenceId:atoms.label_seq_id.value(i),position:[atoms.Cartn_x.value(i),atoms.Cartn_y.value(i),atoms.Cartn_z.value(i)]});
 const entry={id,target,peptideEntity,receptorEntity,peptideChains:chains(peptideEntity),receptorChains:chains(receptorEntity),observedResidues:peptideCA.length,peptideCA,sourceUrl:`https://www.rcsb.org/structure/${id}`};
 fs.writeFileSync(`public/structures/${id}.json`,JSON.stringify(entry));result.push(entry);
}
console.log(result.map(({peptideCA,...entry})=>entry));
