// 创建场景和相机
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xa0a0a0 );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10 ,10);
// camera.lookAt(new THREE.Vector3(0, 0, 0));

// camera.lookAt(new THREE.Vector3(0, 0, 0));

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

// 创建地面
let matrix = [];
		let sizeX = 64,
			sizeY = 64;

		for (let i = 0; i < sizeX; i++) {
			matrix.push([]);
			for (var j = 0; j < sizeY; j++) {
				var height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j/sizeY * Math.PI * 5) * 2 + 2;
				if(i===0 || i === sizeX-1 || j===0 || j === sizeY-1)
					height = 3;
				matrix[i].push(height);
			}
		}

let cannonPlanShape =  new CANNON.Heightfield(matrix, {
    elementSize: 100 / sizeX
});

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

let threePlaneGeometry = new THREE.PlaneGeometry(10,10,2,2);
for (let i = 0, l =threePlaneGeometry.vertices.length; i < l; i++) {
  const vertex = threePlaneGeometry.vertices[i];
  vertex.z = Math.random() * 5;
}
threePlaneGeometry.computeFaceNormals();
threePlaneGeometry.computeVertexNormals();

let threePlaneMaterial = new THREE.MeshPhongMaterial( { 
    color: 0x808080,
    wireframe: false,} );
let threePlaneMesh = new THREE.Mesh( threePlaneGeometry, threePlaneMaterial );
threePlaneMesh.rotation.x = -Math.PI/2;
threePlaneMesh.receiveShadow = true;
threePlaneMesh.position.set(0,0,0);
threePlaneMesh.scale.set(2,2,2);
scene.add( threePlaneMesh );
 


const MeshBodyToUpdate = [];
MeshBodyToUpdate.push({mesh:threePlaneMesh,body:cannonPlanBody});
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





function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    world.step(1/60);
for(const object of MeshBodyToUpdate){
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);

}
  }
render();

function animate() {
    requestAnimationFrame( animate );

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    renderer.render( scene, camera );
}
animate();


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

const groundMaterial = new CANNON.Material("groundMaterial");
const wheelMaterial = new CANNON.Material("wheelMaterial");
const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
});
world.addContactMaterial(wheelGroundContactMaterial);
const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
		const chassisBody = new CANNON.Body({ mass: 150, material: groundMaterial });
		chassisBody.addShape(chassisShape);
		chassisBody.position.set(0, 4, 0);
		this.helper.addVisual(chassisBody, 'car');
const followCamera = new THREE.Object3D();
followCamera.position.copy(camera.position);
scene.add(followCamera);
// followCamera.parent=threeSphereMesh;


// const wheelMaterial = new CANNON.Material("wheelMaterial");
// 		const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
// 			friction: 0.3,
// 			restitution: 0,
// 			contactEquationStiffness: 1000
// 		});


// Create the vehicle
const vehicle = new CANNON.RaycastVehicle({
    chassisBody: chassisBody,
    indexRightAxis: 0,
    indexUpAxis: 1,
    indeForwardAxis: 2
});


const options = {
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 5,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence:  0.01,
    axleLocal: new CANNON.Vec3(-1, 0, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
};
options.chassisConnectionPointLocal.set(1, 0, -1);
		vehicle.addWheel(options);

		options.chassisConnectionPointLocal.set(-1, 0, -1);
		vehicle.addWheel(options);

		options.chassisConnectionPointLocal.set(1, 0, 1);
		vehicle.addWheel(options);

		options.chassisConnectionPointLocal.set(-1, 0, 1);
		vehicle.addWheel(options);


vehicle.addToWorld(world);
// 创建地面、车身和车轮的物理形状和刚体
// const groundShape = new CANNON.Plane();
// const groundBody = new CANNON.Body({ mass: 0 });
// groundBody.addShape(groundShape);
// world.add(groundBody);

// const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
// const chassisBody = new CANNON.Body({ mass: 50 });
// chassisBody.addShape(chassisShape);
// chassisBody.position.set(0, 2, 0);
// world.add(chassisBody);

// const wheelShape = new CANNON.Sphere(0.5);
// const wheelBody1 = new CANNON.Body({ mass: 10 });
// wheelBody1.addShape(wheelShape);
// wheelBody1.position.set(-1, 1, -1);
// world.add(wheelBody1);

// const wheelBody2 = new CANNON.Body({ mass: 10 });
// wheelBody2.addShape(wheelShape);
// wheelBody2.position.set(1, 1, -1);
// world.add(wheelBody2);

// const wheelBody3 = new CANNON.Body({ mass: 10 });
// wheelBody3.addShape(wheelShape);
// wheelBody3.position.set(-1, 1, 1);
// world.add(wheelBody3);

// const wheelBody4 = new CANNON.Body({ mass: 10 });
// wheelBody4.addShape(wheelShape);
// wheelBody4.position.set(1, 1, 1);
// world.add(wheelBody4);

// 设置材质
// const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
// const chassisMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
// const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

// 创建车身和车轮的 Three.js 对象
// const groundGeometry = new THREE.PlaneGeometry(100, 100);
// const ground = new THREE.Mesh(groundGeometry, groundMaterial);
// ground.rotation.x = -Math.PI / 2;
// scene.add(ground);

// const chassisGeometry = new THREE.BoxGeometry(2, 1, 4);
// const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
// scene.add(chassis);

// const wheelGeometry = new THREE.SphereGeometry(0.5, 16, 16);
// const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
// const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
// const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
// const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
// scene.add(wheel1);
// scene.add(wheel2);
// scene.add(wheel3);
// scene.add(wheel4);

// function animate() {
//   requestAnimationFrame(animate);

//   // 更新物理世界
//   world.step(1 / 60);
//   chassis.position.copy(chassisBody.position);
//   chassis.quaternion.copy(chassisBody.quaternion);
//   wheel1.position.copy(wheelBody1.position);
//   wheel1.quaternion.copy(wheelBody1.quaternion);
//   wheel2.position.copy(wheelBody2.position);
//   wheel2.quaternion.copy(wheelBody2.quaternion);
//   wheel3.position.copy(wheelBody3.position);
//   wheel3.quaternion.copy(wheelBody3.quaternion);
//   wheel4.position.copy(wheelBody4.position);
//   wheel4.quaternion.copy(wheelBody4.quaternion);

//   // 渲染场景
//   renderer.render(scene, camera);
// }

// animate();

// class JoyStick{
// 	constructor(options){
// 		const circle = document.createElement("div");
// 		circle.style.cssText = "position:absolute; bottom:35px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius:50%; left:50%; transform:translateX(-50%);";
// 		const thumb = document.createElement("div");
// 		thumb.style.cssText = "position: absolute; left: 20px; top: 20px; width: 40px; height: 40px; border-radius: 50%; background: #fff;";
// 		circle.appendChild(thumb);
// 		document.body.appendChild(circle);
// 		this.domElement = thumb;
// 		this.maxRadius = options.maxRadius || 40;
// 		this.maxRadiusSquared = this.maxRadius * this.maxRadius;
// 		this.onMove = options.onMove;
// 		this.game = options.game;
// 		this.origin = { left:this.domElement.offsetLeft, top:this.domElement.offsetTop };
// 		this.rotationDamping = options.rotationDamping || 0.06;
// 		this.moveDamping = options.moveDamping || 0.01;
// 		if (this.domElement!=undefined){
// 			const joystick = this;
// 			if ('ontouchstart' in window){
// 				this.domElement.addEventListener('touchstart', function(evt){ joystick.tap(evt); });
// 			}else{
// 				this.domElement.addEventListener('mousedown', function(evt){ joystick.tap(evt); });
// 			}
// 		}
// 	}
	
// 	getMousePosition(evt){
// 		let clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX;
// 		let clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY;
// 		return { x:clientX, y:clientY };
// 	}
	
// 	tap(evt){
// 		evt = evt || window.event;
// 		// get the mouse cursor position at startup:
// 		this.offset = this.getMousePosition(evt);
// 		const joystick = this;
// 		if ('ontouchstart' in window){
// 			document.ontouchmove = function(evt){ joystick.move(evt); };
// 			document.ontouchend =  function(evt){ joystick.up(evt); };
// 		}else{
// 			document.onmousemove = function(evt){ joystick.move(evt); };
// 			document.onmouseup = function(evt){ joystick.up(evt); };
// 		}
// 	}
	
// 	move(evt){
// 		evt = evt || window.event;
// 		const mouse = this.getMousePosition(evt);
// 		// calculate the new cursor position:
// 		let left = mouse.x - this.offset.x;
// 		let top = mouse.y - this.offset.y;
// 		//this.offset = mouse;
		
// 		const sqMag = left*left + top*top;
// 		if (sqMag>this.maxRadiusSquared){
// 			//Only use sqrt if essential
// 			const magnitude = Math.sqrt(sqMag);
// 			left /= magnitude;
// 			top /= magnitude;
// 			left *= this.maxRadius;
// 			top *= this.maxRadius;
// 		}
// 		// set the element's new position:
// 		this.domElement.style.top = `${top + this.domElement.clientHeight/2}px`;
// 		this.domElement.style.left = `${left + this.domElement.clientWidth/2}px`;
		
// 		const forward = -(top - this.origin.top + this.domElement.clientHeight/2)/this.maxRadius;
// 		const turn = (left - this.origin.left + this.domElement.clientWidth/2)/this.maxRadius;
		
// 		if (this.onMove!=undefined) this.onMove.call(this.game, forward, turn);
// 	}
	
// 	up(evt){
// 		if ('ontouchstart' in window){
// 			document.ontouchmove = null;
// 			document.touchend = null;
// 		}else{
// 			document.onmousemove = null;
// 			document.onmouseup = null;
// 		}
// 		this.domElement.style.top = `${this.origin.top}px`;
// 		this.domElement.style.left = `${this.origin.left}px`;
		
// 		this.onMove.call(this.game, 0, 0);
// 	}
// }
// function joystickCallback( forward, turn ){
//     this.js.forward = forward;
//     this.js.turn = -turn;
// }
// var joystick = new JoyStick({
    class CannonHelper{
    constructor(scene){
        this.scene = scene;
    }
    
    addLights(renderer){
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        // LIGHTS
        const ambient = new THREE.AmbientLight( 0x888888 );
        this.scene.add( ambient );

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

        this.sun = light;
        this.scene.add(light);    
    }
    
    set shadowTarget(obj){
        if (this.sun!==undefined) this.sun.target = obj;    
    }
    
    createCannonTrimesh(geometry){
		if (!geometry.isBufferGeometry) return null;
		
		const posAttr = geometry.attributes.position;
		const vertices = geometry.attributes.position.array;
		let indices = [];
		for(let i=0; i<posAttr.count; i++){
			indices.push(i);
		}
		
		return new CANNON.Trimesh(vertices, indices);
	}
	
	createCannonConvex(geometry){
		if (!geometry.isBufferGeometry) return null;
		
		const posAttr = geometry.attributes.position;
		const floats = geometry.attributes.position.array;
		const vertices = [];
		const faces = [];
		let face = [];
		let index = 0;
		for(let i=0; i<posAttr.count; i+=3){
			vertices.push( new CANNON.Vec3(floats[i], floats[i+1], floats[i+2]) );
			face.push(index++);
			if (face.length==3){
				faces.push(face);
				face = [];
			}
		}
		
		return new CANNON.ConvexPolyhedron(vertices, faces);
	}
    
    addVisual(body, name, castShadow=true, receiveShadow=true){
		body.name = name;
		if (this.currentMaterial===undefined) this.currentMaterial = new THREE.MeshLambertMaterial({color:0x888888});
		if (this.settings===undefined){
			this.settings = {
				stepFrequency: 60,
				quatNormalizeSkip: 2,
				quatNormalizeFast: true,
				gx: 0,
				gy: 0,
				gz: 0,
				iterations: 3,
				tolerance: 0.0001,
				k: 1e6,
				d: 3,
				scene: 0,
				paused: false,
				rendermode: "solid",
				constraints: false,
				contacts: false,  // Contact points
				cm2contact: false, // center of mass to contact points
				normals: false, // contact normals
				axes: false, // "local" frame axes
				particleSize: 0.1,
				shadows: false,
				aabbs: false,
				profiling: false,
				maxSubSteps:3
			}
			this.particleGeo = new THREE.SphereGeometry( 1, 16, 8 );
			this.particleMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
		}
		// What geometry should be used?
		let mesh;
		if(body instanceof CANNON.Body) mesh = this.shape2Mesh(body, castShadow, receiveShadow);

		if(mesh) {
			// Add body
			body.threemesh = mesh;
            mesh.castShadow = castShadow;
            mesh.receiveShadow = receiveShadow;
			this.scene.add(mesh);
		}
	}
	
	shape2Mesh(body, castShadow, receiveShadow){
		const obj = new THREE.Object3D();
		const material = this.currentMaterial;
		const game = this;
		let index = 0;
		
		body.shapes.forEach (function(shape){
			let mesh;
			let geometry;
			let v0, v1, v2;

			switch(shape.type){

			case CANNON.Shape.types.SPHERE:
				const sphere_geometry = new THREE.SphereGeometry( shape.radius, 8, 8);
				mesh = new THREE.Mesh( sphere_geometry, material );
				break;

			case CANNON.Shape.types.PARTICLE:
				mesh = new THREE.Mesh( game.particleGeo, game.particleMaterial );
				const s = this.settings;
				mesh.scale.set(s.particleSize,s.particleSize,s.particleSize);
				break;

			case CANNON.Shape.types.PLANE:
				geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
				mesh = new THREE.Object3D();
				const submesh = new THREE.Object3D();
				const ground = new THREE.Mesh( geometry, material );
				ground.scale.set(100, 100, 100);
				submesh.add(ground);

				mesh.add(submesh);
				break;

			case CANNON.Shape.types.BOX:
				const box_geometry = new THREE.BoxGeometry(  shape.halfExtents.x*2,
															shape.halfExtents.y*2,
															shape.halfExtents.z*2 );
				mesh = new THREE.Mesh( box_geometry, material );
				break;

			case CANNON.Shape.types.CONVEXPOLYHEDRON:
				const geo = new THREE.Geometry();

				// Add vertices
				shape.vertices.forEach(function(v){
					geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
				});

				shape.faces.forEach(function(face){
					// add triangles
					const a = face[0];
					for (let j = 1; j < face.length - 1; j++) {
						const b = face[j];
						const c = face[j + 1];
						geo.faces.push(new THREE.Face3(a, b, c));
					}
				});
				geo.computeBoundingSphere();
				geo.computeFaceNormals();
				mesh = new THREE.Mesh( geo, material );
				break;

			case CANNON.Shape.types.HEIGHTFIELD:
				geometry = new THREE.Geometry();

				v0 = new CANNON.Vec3();
				v1 = new CANNON.Vec3();
				v2 = new CANNON.Vec3();
				for (let xi = 0; xi < shape.data.length - 1; xi++) {
					for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
						for (let k = 0; k < 2; k++) {
							shape.getConvexTrianglePillar(xi, yi, k===0);
							v0.copy(shape.pillarConvex.vertices[0]);
							v1.copy(shape.pillarConvex.vertices[1]);
							v2.copy(shape.pillarConvex.vertices[2]);
							v0.vadd(shape.pillarOffset, v0);
							v1.vadd(shape.pillarOffset, v1);
							v2.vadd(shape.pillarOffset, v2);
							geometry.vertices.push(
								new THREE.Vector3(v0.x, v0.y, v0.z),
								new THREE.Vector3(v1.x, v1.y, v1.z),
								new THREE.Vector3(v2.x, v2.y, v2.z)
							);
							var i = geometry.vertices.length - 3;
							geometry.faces.push(new THREE.Face3(i, i+1, i+2));
						}
					}
				}
				geometry.computeBoundingSphere();
				geometry.computeFaceNormals();
				mesh = new THREE.Mesh(geometry, material);
				break;

			case CANNON.Shape.types.TRIMESH:
				geometry = new THREE.Geometry();

				v0 = new CANNON.Vec3();
				v1 = new CANNON.Vec3();
				v2 = new CANNON.Vec3();
				for (let i = 0; i < shape.indices.length / 3; i++) {
					shape.getTriangleVertices(i, v0, v1, v2);
					geometry.vertices.push(
						new THREE.Vector3(v0.x, v0.y, v0.z),
						new THREE.Vector3(v1.x, v1.y, v1.z),
						new THREE.Vector3(v2.x, v2.y, v2.z)
					);
					var j = geometry.vertices.length - 3;
					geometry.faces.push(new THREE.Face3(j, j+1, j+2));
				}
				geometry.computeBoundingSphere();
				geometry.computeFaceNormals();
				mesh = new THREE.Mesh(geometry, MutationRecordaterial);
				break;

			default:
				throw "Visual type not recognized: "+shape.type;
			}

			mesh.receiveShadow = receiveShadow;
			mesh.castShadow = castShadow;
            
            mesh.traverse( function(child){
                if (child.isMesh){
                    child.castShadow = castShadow;
					child.receiveShadow = receiveShadow;
                }
            });

			var o = body.shapeOffsets[index];
			var q = body.shapeOrientations[index++];
			mesh.position.set(o.x, o.y, o.z);
			mesh.quaternion.set(q.x, q.y, q.z, q.w);

			obj.add(mesh);
		});

		return obj;
	}
    
    updateBodies(world){
        world.bodies.forEach( function(body){
            if ( body.threemesh != undefined){
                body.threemesh.position.copy(body.position);
                body.threemesh.quaternion.copy(body.quaternion);
            }
        });
    }
}