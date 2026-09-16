import { Box3, MathUtils, PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const torsoBounds=new Box3(new Vector3(-.26,.76,-.23),new Vector3(.26,1.48,.16));
// The body view includes the vendored head atlas, attached at the cervical neck.
export const bodyBounds=new Box3(new Vector3(-.5,0,-.24),new Vector3(.5,1.95,.18));

export function fittedCamera(box:Box3,camera:PerspectiveCamera,direction=new Vector3(0,0,1)){
  const target=box.getCenter(new Vector3()),size=box.getSize(new Vector3());
  const distance=Math.max(size.y,size.x/camera.aspect)/(2*Math.tan(MathUtils.degToRad(camera.fov/2)))*1.13+size.z*.5;
  return {target,position:target.clone().addScaledVector(direction.normalize(),distance)};
}
export function moveCamera(camera:PerspectiveCamera,controls:OrbitControls,destination:ReturnType<typeof fittedCamera>,alpha:number){
  camera.position.lerp(destination.position,alpha);controls.target.lerp(destination.target,alpha);controls.update();
}
