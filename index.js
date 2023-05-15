
import dat from "https://unpkg.com/dat.gui@0.7.7/build/dat.gui.module.js"

import { STLLoader } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/loaders/STLLoader.js";
import { MTLLoader } from 'https://cdn.skypack.dev/three@0.133.1/examples//jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.133.1/examples//jsm/loaders/OBJLoader.js';

document.getElementById('play-button').addEventListener('click', function() {
  document.getElementById('start-screen').style.display = 'none';
  startGame();
});

document.getElementById('car-texture-select').addEventListener('change', function(e) {
  const selectedTexture = e.target.value;
  const carPreview = document.getElementById('car-preview');

  // 根据选项设置不同的贴图路径
  if (selectedTexture === '../../assets/tex/CarBody01.png') {
    carPreview.src = '../../assets/tex/CarBody01p.png';
  } else if (selectedTexture === '../../assets/tex/CarBody02.png') {
    carPreview.src = '../../assets/tex/CarBody02p.png';
  } else if (selectedTexture === '../../assets/tex/CarBody03.png') {
    carPreview.src = '../../assets/tex/CarBody03p.png';
  }
});


function startGame() {
// 创建场景和相机
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10 ,10);
camera.lookAt(0, 1, 0);


// 创建渲染器
const renderer = new THREE.WebGLRenderer();
// renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

}
//创建环境光
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

// LIGHTS
const ambient = new THREE.AmbientLight( 0x888888 );
scene.add( ambient );

const light = new THREE.DirectionalLight( 0xdddddd );
light.position.set( 3, 10, 4 );
light.target.position.set( 0, 0, 0 );

light.castShadow = true;

const lightSize = 10;
light.shadow.camera.near = 1;
light.shadow.camera.far = 50;
light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
light.shadow.camera.right = light.shadow.camera.top = lightSize;

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

var sun = light;
scene.add(light);    


// 创建物理世界
const world = new CANNON.World();
world.broadphase = new CANNON.NaiveBroadphase();
world.gravity.set(0, -10, 0);
world.defaultContactMaterial.friction = 0;
world.broadphase = new CANNON.SAPBroadphase(world);
world.solver.iterations = 10;
const cannonDefaultMaterial = new CANNON.Material()
// 创建两个默认材质的关联材质
const cannonDefaultCantactMaterial = new CANNON.ContactMaterial(
  cannonDefaultMaterial,
  cannonDefaultMaterial,
  {
    friction: 0.01, // 摩擦力
    restitution: 0.3, // 弹性系数
    
  }
);
// 将两个默认材质添加到物理世界world中
world.addContactMaterial(cannonDefaultCantactMaterial);



// 创建地面cannon

let cannonPlanShape = new CANNON.Plane();
let cannonPlanMaterial = new CANNON.Material();
let cannonPlanMass = 0;
let cannonPlanPosition=new CANNON.Vec3(0,0,0);
let cannonPlanBody = new CANNON.Body({
    mass: cannonPlanMass,
    shape: cannonPlanShape,
    material: cannonPlanMaterial,
    position: cannonPlanPosition,
});
cannonPlanBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
world.addBody(cannonPlanBody);


// 创建地面loader
var textureLoader = new THREE.TextureLoader();
var glassTexture = textureLoader.load('../assets/images/glass.jpg');
// 创建地面three

 let threePlaneGeometry = new THREE.PlaneGeometry(10000,10000);
 const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x999999 });

glassTexture.wrapS = THREE.RepeatWrapping;
glassTexture.wrapT = THREE.RepeatWrapping;
glassTexture.repeat.set(100, 100); 
planeMaterial.map = glassTexture;
 let threePlaneMesh = new THREE.Mesh( threePlaneGeometry,planeMaterial);
 threePlaneMesh.rotation.x = -Math.PI/2;
 threePlaneMesh.receiveShadow = true;
 threePlaneMesh.position.set(0,0,0);

scene.add( threePlaneMesh );
 


const MeshBodyToUpdate = [];
MeshBodyToUpdate.push({mesh:threePlaneMesh,body:cannonPlanBody});

// 创建球体cannon

let cannonSphereShape = new CANNON.Sphere(1);
let cannonSphereMaterial = new CANNON.Material();
let cannonSphereMass = 1;
let cannonSpherePosition=new CANNON.Vec3(0,10,0);
let cannonSphereBody = new CANNON.Body({
    mass:cannonSphereMass,
    shape:cannonSphereShape,
    material:cannonSphereMaterial,
    position:cannonSpherePosition});
world.addBody(cannonSphereBody);
let threeSphereGeometry = new THREE.SphereGeometry(1,20,20);
let threeSphereMaterial = new THREE.MeshLambertMaterial({color:0xff0000});
let threeSphereMesh = new THREE.Mesh(threeSphereGeometry,threeSphereMaterial);
threeSphereMesh.castShadow = true;
scene.add(threeSphereMesh);
MeshBodyToUpdate.push({mesh:threeSphereMesh,body:cannonSphereBody});


// 创车cannon,three
var xSpeed = 1;
var zSpeed = 1;
// 获取选中的贴图
var selectedTexture = document.getElementById('car-texture-select').value;

const loaderFBX = new THREE.FBXLoader();

loaderFBX.load('../assets/car.fbx', function (fbx) {

  
  const material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load(selectedTexture), });
  const mesh = new THREE.Mesh(fbx.children[0].geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
  const body = new CANNON.Body({ 
    mass: 1
   });
  body.addShape(shape);
  body.position.set(0, 1, 1);
  world.addBody(body);
  MeshBodyToUpdate.push({mesh:mesh,body:body});
  document.addEventListener("keydown", onDocumentKeyDown, false);
  function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
		body.position.z += zSpeed;
		
    } else if (keyCode == 83) {
      body.position.z -= zSpeed;
		
    } else if (keyCode == 65) {
      body.position.x -= xSpeed;
		
    } else if (keyCode == 68) {
      body.position.x += xSpeed;
		
    } 
};
});


// animate


function animate() {
  requestAnimationFrame( animate );
	world.step(1/60);
	for(const object of MeshBodyToUpdate){
		object.mesh.position.copy(object.body.position);
		object.mesh.quaternion.copy(object.body.quaternion);
	
	}
    renderer.render( scene, camera );
}
animate();
}
