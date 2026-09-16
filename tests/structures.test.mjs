import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {CIF}=require('molstar/lib/commonjs/mol-io/reader/cif.js');
for(const id of ['8YWF','8YW4','6LMK'])test(`${id}: peptide/receptor mapping matches deposited mmCIF`,async()=>{
 const expected=JSON.parse(fs.readFileSync(`public/structures/${id}.json`));const parsed=await CIF.parseText(fs.readFileSync(`public/structures/${id}.cif`,'utf8')).run();assert.equal(parsed.isError,false);const db=CIF.schema.mmCIF(parsed.result.blocks[0]);
 const findName=entity=>{for(let i=0;i<db.entity._rowCount;i++)if(db.entity.id.value(i)===entity)return db.entity.pdbx_description.value(i).join(' ');};
 assert.match(findName(expected.peptideEntity),id==='6LMK'?/^Glucagon$/i:/^Retatrutide$/i);assert.match(findName(expected.receptorEntity),/receptor/i);
 const a=db.atom_site,observed=[];for(let i=0;i<a._rowCount;i++)if(a.label_entity_id.value(i)===expected.peptideEntity&&a.label_atom_id.value(i)==='CA')observed.push(i);
 assert.equal(observed.length,expected.observedResidues);assert.ok(expected.peptideCA.every(a=>a.position.every(Number.isFinite)));
 assert.ok(observed.every(i=>expected.peptideChains.some(c=>c.label===a.label_asym_id.value(i)&&c.author===a.auth_asym_id.value(i))));
});
