
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

function getDistance(object1, object2) {
  const dx = object1.position.x - object2.position.x;
  const dy = object1.position.y - object2.position.y;
  const dz = object1.position.z - object2.position.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

const gameOverDistance = 15; // 设置距离，当进入这个距离内时，游戏结束

function startGame() {
let body; // 在这里定义 body

// 创建场景和相机
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10 ,10);



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

// 创建天空盒
var path = "../../assets/images/";
var format = '.png';
var urls = [
  path + 'px' + format, path + 'nx' + format,
  path + 'py' + format, path + 'ny' + format,
  path + 'nz' + format, path + 'pz' + format
];
var reflectionCube = new THREE.CubeTextureLoader().load( urls );
scene.background = reflectionCube;

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
world.defaultContactMaterial.friction = 0.002;
world.broadphase = new CANNON.SAPBroadphase(world);
world.solver.iterations = 10;
const cannonDefaultMaterial = new CANNON.Material()
// 创建两个默认材质的关联材质
const cannonDefaultCantactMaterial = new CANNON.ContactMaterial(
  cannonDefaultMaterial,
  cannonDefaultMaterial,
  {
    friction: 0.002, // 摩擦力
    restitution: 0.002, // 弹性系数
    contactEquationStiffness: 1000
  }
);
// 将两个默认材质添加到物理世界world中
world.addContactMaterial(cannonDefaultCantactMaterial);

// 创建zhon'dian
// const threefinGeometry = new THREE.PlaneGeometry( 1, 1, 1 );
// const threefinMaterial = new THREE.ShaderMaterial({
//   vertexshader: 
//   gl
//   document.getElementById('vertexshader').textContent,

var geom = new THREE.SphereGeometry(3, 5, 3);
var mate = new THREE.ShaderMaterial({
    vertexShader: `
    varying vec3 vNormal;
    void main() {
                //将normal通过varying赋值
        vNormal = normal;
                //projectionMatrix是投影变换矩阵 
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x, position.y , position.z, 1.0 );
    }
    `,
    fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float pr = (vNormal.x+1.7) / 2.0; //pr红色通道值范围为0~1
      float pg = (vNormal.y + 1.7) / 2.0; //pg绿色通道值范围为0~1
      float pb = (vNormal.z + 1.0) / 2.0; //pb蓝色通道值范围为0~1
      gl_FragColor=vec4(pr, pg, pb, 1.0); //最后设置顶点颜色，点与点之间会自动插值
    }
    `
})
var meshfin = new THREE.Mesh(geom, mate);
meshfin.position.set(Math.random() * 100 - 50, 7, Math.random() * 0 - 50);
scene.add(meshfin)


// const threefinMaterial = new THREE.


// 创建地面loader
var textureLoader = new THREE.TextureLoader();
var glassTexture = textureLoader.load('../assets/images/glass.jpg');
// 创建地面three
const threePlaneGeometry = new THREE.PlaneGeometry(1000,1000);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x999999 });
glassTexture.wrapS = THREE.RepeatWrapping;
glassTexture.wrapT = THREE.RepeatWrapping;
glassTexture.repeat.set(100, 100); 
planeMaterial.map = glassTexture;
let threePlaneMesh = new THREE.Mesh( threePlaneGeometry,planeMaterial);
threePlaneMesh.rotation.x = -Math.PI/2;
threePlaneMesh.castShadow = true;
threePlaneMesh.receiveShadow = true;
threePlaneMesh.position.set(0,0,0);
scene.add( threePlaneMesh );

 //地面incannon
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

const MeshBodyToUpdate = [];


let cannonSphereShape = new CANNON.Sphere(1);
let cannonSphereMaterial = new CANNON.Material();
let cannonSphereMass = 3;
let cannonSpherePosition=new CANNON.Vec3(5,1,5);
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

let numWalls = 1000; // 生成的墙的数量
let wallWidth = 1, wallHeight = 3, wallDepth = 10; // 墙的尺寸

for (let i = 0; i < numWalls; i++) {
    // 随机生成墙的位置
    let posX = (Math.random() * 200 - 100)*5; // 随机在-10到10之间生成x坐标
    let posY = wallHeight / 2; //墙应该位于地面上，所以y坐标为墙高的一半
    let posZ = (Math.random() * 200 - 100)*5; // 随机在-10到10之间生成z坐标

    let rotX = Math.random() * 0;
    let rotY = Math.random() * 200 - 100;
    let rotZ = Math.random() * 0;
    // 创建Three.js墙模型
    let wallGeometry = new THREE.BoxGeometry(wallWidth/2, wallHeight, wallDepth);
    let wallTexture = textureLoader.load('../assets/images/imageswall.jpg');
    let wallMaterial = new THREE.MeshBasicMaterial({map:wallTexture});
    let wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wallMesh.position.set(posX, posY, posZ);
    wallMesh.rotation.set(rotX, rotY, rotZ);
    scene.add(wallMesh);

    // 创建Cannon.js墙物理模型
    let wallShape = new CANNON.Box(new CANNON.Vec3(wallWidth*2 , wallHeight/2 , wallDepth*2 ));
    let wallBody = new CANNON.Body({ mass: 0 });
    wallBody.addShape(wallShape);
    wallBody.position.set(posX, posY, posZ);
    world.addBody(wallBody);

    // 如果需要更新墙的位置或者旋转（例如，如果墙不是静态的），将它添加到MeshBodyToUpdate数组中
    // MeshBodyToUpdate.push({mesh: wallMesh, body: wallBody});
}




// 创车cannon,three
var xSpeed = 1;
// 获取选中的贴图
var selectedTexture = document.getElementById('car-texture-select').value;

const loaderFBX = new THREE.FBXLoader();
const wheelLoader = new THREE.FBXLoader();
const wheelPositions = [
  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(1, 0, -1),
  new THREE.Vector3(-1, 0, -1),
];
const wheels = [];

loaderFBX.load('../assets/car.fbx', function (fbx) {

  
  const material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load(selectedTexture), });
  const mesh = new THREE.Mesh(fbx.children[0].geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 0.5));
  body = new CANNON.Body({ 
    mass: 1
   });
  body.addShape(shape);
  body.position.set(0, 0.5, 0);
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI); // 设置初始旋转角度为180度
  world.addBody(body);
  MeshBodyToUpdate.push({mesh:mesh,body:body});
  // 在车辆模型加载完成之后，再加载车轮模型
  wheelLoader.load('../../assets/wheel.fbx', function (wheelModel) {
    wheelPositions.forEach((position, index) => {
      const wheelMesh = wheelModel.clone();
    
      // Load textures
      const hubTexture = new THREE.TextureLoader().load('../../assets/tex/Wheel.png');
      const tyreTexture = new THREE.TextureLoader().load('../../assets/tex/Tyre.png');
    
      // Create materials
      const hubMaterial = new THREE.MeshPhongMaterial({ map: hubTexture });
      const tyreMaterial = new THREE.MeshPhongMaterial({ map: tyreTexture });
    
      // Get the specific part by name
      const hub = wheelMesh.getObjectByName('wheel');
      const tyre = wheelMesh.getObjectByName('Wheel1:tyre');
    
      // Set materials
      if (hub) {
        hub.material = hubMaterial;
      }
      if (tyre) {
        tyre.material = tyreMaterial;
      }
    
      // Add the wheel to the car model
      mesh.add(wheelMesh);
    
      // Store the wheel in the array for later rotation update
      wheels.push(wheelMesh);
    });
    
    // Update the position of the wheel
    wheels[0].position.set(0.8, 0.2, 1.2); // Modify the position of the first wheel
    wheels[1].position.set(-0.8, 0.2, 1.2); // Modify the position of the second wheel
    wheels[2].position.set(0.8, 0.2, -1.1); // Modify the position of the third wheel
    wheels[3].position.set(-0.8, 0.2, -1.1); // Modify the position of the fourth wheel    
  });
// 全局变量
const forceMultiplier = 50;

// 声明一个对象来记录哪些键正在被按下
const keys = {};

// 当按下键盘按键时，将对应的状态设为 true
document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});

// 键盘事件处理器
document.addEventListener('keydown', (event) => {
  const key = event.key;
  const force = new CANNON.Vec3();
  var audioPLayer = document.getElementById('audioPlayer');
  if (key === 'w' || key === 'W') { // W 键
    const forwardVector = new CANNON.Vec3(0, 0, 0.3); // 定义一个向前的向量
    force.copy(body.quaternion.vmult(forwardVector)); // 将向前的向量根据车辆的朝向进行旋转
    force.scale(forceMultiplier, force); // 根据力的大小进行缩放
    body.velocity.copy(force); // 更新速度向量
    // audioPlayer.src = '../../assets/sfx/engine.mp3';
    // audioPlayer.play();
  } else if (key === 's' || key === 'S') { // S 键
    const backwardVector = new CANNON.Vec3(0, 0, -0.3); // 定义一个向后的向量
    force.copy(body.quaternion.vmult(backwardVector)); // 将向后的向量根据车辆的朝向进行旋转
    force.scale(forceMultiplier, force); // 根据力的大小进行缩放
    body.velocity.copy(force); // 更新速度向量
    // audioPlayer.src = '../../assets/sfx/engine.mp3';
    // audioPlayer.play();
  } 
  
  if (key === 'a' || key === 'A') { // A 键
    body.angularVelocity.set(0, 2, 0); // 设置角速度，使车辆向左旋转
    body.velocity.copy(body.quaternion.vmult(new CANNON.Vec3(0, 0, -xSpeed))); // 更新速度向量
    audioPlayer.src = '../../assets/sfx/skid.mp3';
    audioPlayer.play();
  } else if (key === 'd' || key === 'D') { // D 键
    body.angularVelocity.set(0, -2, 0); // 设置角速度，使车辆向右旋转
    body.velocity.copy(body.quaternion.vmult(new CANNON.Vec3(0, 0, -xSpeed))); // 更新速度向量
    audioPlayer.src = '../../assets/sfx/skid.mp3';
    audioPlayer.play();
  }

  // 施加力到 body 对象
  if (!force.isZero()) {
    body.applyForce(force, body.position);
  }
});

// 当释放键盘按键时，将对应的状态设为 false
document.addEventListener('keyup', (event) => {
  const key = event.key;

  if (key === 'w' || key === 'W' || key === 's' || key === 'S') { // 释放W或S键
    body.velocity.set(0, 0, 0); // 停止移动
    audioPlayer.pause();
  } else if (key === 'a' || key === 'A' || key === 'd' || key === 'D') { // 释放A或D键
    body.angularVelocity.set(0, 0, 0); // 停止旋转
    audioPlayer.pause();
  }
});

  

});

// animate


function animate() {
  requestAnimationFrame( animate );
  world.step(1/60);
  meshfin.rotation.y += 0.01;

  for(const object of MeshBodyToUpdate){
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
    camera.position.copy(object.mesh.position);
    camera.position.y += 10;
    camera.position.z += 15;
    camera.lookAt(object.mesh.position);
  }

  if (getDistance(threeSphereMesh, meshfin) < gameOverDistance) {
    // 玩家进入了`meshfin`的周围，游戏结束
    endGame();
  }

  // 如果车辆正在移动，旋转车轮
  if (body && body.velocity.length() > 0) {
    // 旋转车轮，这里假设沿着x轴旋转，你可以根据需要修改
    for (const wheel of wheels) {
      wheel.rotation.x += 0.01;
    }
  }
  renderer.render( scene, camera );

  // 根据按键状态更新速度向量
  const forwardVector = new CANNON.Vec3(0, 0, -1); // 向前的向量
  const backwardVector = new CANNON.Vec3(0, 0, 1); // 向后的向量
  const force = new CANNON.Vec3();

  if (isMovingForward) { // 按下 "W" 键，向前移动
    force.copy(body.quaternion.vmult(forwardVector).scale(xSpeed));
    body.applyForce(force, body.position);
  } else if (isMovingBackward) { // 按下 "S" 键，向后移动
    force.copy(body.quaternion.vmult(backwardVector).scale(xSpeed));
    body.applyForce(force, body.position);
  }
}

function endGame() {
  // 显示"GAME OVER"的消息
  const gameOverScreen = document.getElementById('game-over-screen');
  gameOverScreen.style.display = 'block';
}

animate();
}