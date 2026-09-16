import { DataTexture, MeshPhysicalMaterial, RepeatWrapping, RGBAFormat, FrontSide } from 'three';

export const tissuePalette: Record<string,string> = {
  skin:'#b18a76', lung:'#a76569', liver:'#713e36', heart:'#9d404b',
  stomach:'#c98a7d', pancreas:'#d4ae86', kidney:'#8d4643', gallbladder:'#65733d',
  intestine:'#c1877a', colon:'#a96866', cartilage:'#c9bab0', artery:'#a94046',
  vein:'#365d8a', muscle:'#974f4b', bone:'#c9bca3', airway:'#c8a58f',
};

export function tissueTexture(fibres: boolean, organStyle:'generic'|'lung'='generic') {
  const size=256,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const noise=Math.sin(x*127.1+y*311.7)*43758.5453;
    const grain=noise-Math.floor(noise);
    const alveoli=organStyle==='lung' ? 5*Math.sin(x*.82+Math.sin(y*.23)*2.1)*Math.sin(y*.71+Math.sin(x*.17)) : 0;
    const v=fibres ? 130+24*Math.sin(x*.6+2*Math.sin(y*.023))+grain*15 : 120+grain*35+10*Math.sin(x*.16)*Math.cos(y*.11)+alveoli;
    const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
  }
  const texture=new DataTexture(data,size,size,RGBAFormat);texture.wrapS=texture.wrapT=RepeatWrapping;
  texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}

export function createTissueMaterial(style:string,texture:DataTexture) {
  const material=new MeshPhysicalMaterial({color:tissuePalette[style]??'#bb9988',metalness:0,
    roughness:style==='skin'?.68:style==='muscle'?.6:style==='lung'?.67:style==='airway'?.58:.49,
    clearcoat:style==='skin'?0:style==='lung'?.04:.09,clearcoatRoughness:.5,side:FrontSide,
    sheen:style==='lung'?.12:0,sheenColor:style==='lung'?'#d79598':'#000000',
    bumpMap:texture,bumpScale:style==='muscle'?.00018:style==='lung'?.00010:.00006});
  // Deterministic low-contrast tissue variation, independent of UV seams.
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vTissuePosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTissuePosition=position;');
    shader.fragmentShader='varying vec3 vTissuePosition;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float mottling=sin(vTissuePosition.x*420.0)*sin(vTissuePosition.y*380.0)*sin(vTissuePosition.z*440.0);
      diffuseColor.rgb *= 0.98 + 0.035*mottling;
      ${style==='lung'?`float alveolar=sin(vTissuePosition.x*210.0+sin(vTissuePosition.y*27.0))*sin(vTissuePosition.z*190.0+vTissuePosition.y*31.0);
      diffuseColor.rgb *= 0.99 + 0.018*alveolar;
      float blush=smoothstep(-0.15,0.7,sin(vTissuePosition.x*33.0+vTissuePosition.z*29.0));
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.06,0.91,0.93),blush*0.22);`:''}`);
  };
  material.customProgramCacheKey=()=> `tissue-v2-${style}`;
  return material;
}
