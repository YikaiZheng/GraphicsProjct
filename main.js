import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CameraControls } from './CameraControl';
import { ToolsGroup } from './ToolsGroup';
import { cube, connector, emittor, receiver, door } from './InteractiveObjects'
import {Dash, DashesGroup, RaysGroup} from './RaysGroup'
import { PhysicsObject, PlayerObject } from './PhysicsObjects'
import { PlayerControl } from './PlayerControl'

var world = new CANNON.World();
world.gravity.set(0, -10, 0); // m/s²
const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const clock = new THREE.Clock();
console.log(window.innerWidth)
console.log(window.innerHeight)

// Create a sphere
const radius = 1;
const sphere_Shape = new CANNON.Sphere(radius);
const sphere_Body = new CANNON.Body({
	shape: sphere_Shape,
	mass: 1,
});
sphere_Body.position.set(0, 5, 0); // Set the position
const sphere_Geometry = new THREE.SphereGeometry(radius, 32, 32);
const sphere_Material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const sphere = new PhysicsObject(sphere_Geometry, sphere_Material, sphere_Body);
sphere.addTo(world, scene);

const boxSize = { x: 1, y: 2, z: 1 };
const box_Shape = new CANNON.Box(new CANNON.Vec3(boxSize.x / 2, boxSize.y / 2, boxSize.z / 2));
const box_Body = new CANNON.Body({
	shape: box_Shape,
	mass: 1,
})
// console.log(box_Body.index);
box_Body.position.set(0, 10, 0); // Set the position
const box_Geometry = new THREE.BoxGeometry(1, 2, 1);
const box_Material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const box = new PhysicsObject(box_Geometry, box_Material, box_Body)
box.addTo(world, scene);


var groundShape = new CANNON.Plane();
var groundBody = new CANNON.Body({
	shape: groundShape,
    mass: 0 // mass == 0 makes the body static
});
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2); // Rotate 90° around the z-axis
groundBody.position.set(0, 0.1, 0); // Set the position
const planeGeometry = new THREE.PlaneGeometry(200, 200); // Width and height of the plane
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide, // Make it visible from both sides
});
const ground = new PhysicsObject(planeGeometry, planeMaterial, groundBody);
ground.receiveShadow = true; // To cast shadows if needed
ground.addTo(world, scene);

const starting_position = new THREE.Vector3(0, 2, 20);
var player1 = new PlayerObject(starting_position);
var player1_Control = new PlayerControl(player1);
player1.addTo(world, scene);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
});

document.body.appendChild( renderer.domElement );
const gltfLoader = new GLTFLoader();
const url = '/scene1.glb';
gltfLoader.load(url, (gltf) => {
	const root = gltf.scene;
	scene.add(root);
});

// {
// 	// 地面 平铺
// 	const planeSize = 20
// 	const loader = new THREE.TextureLoader()
// 	const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png')
// 	texture.wrapS = THREE.RepeatWrapping
// 	texture.wrapT = THREE.RepeatWrapping
// 	texture.magFilter = THREE.NearestFilter
// 	const repeats = planeSize / 2
// 	texture.repeat.set(repeats, repeats)
// 	const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
// 	const planeMat = new THREE.MeshPhongMaterial({
// 	  map: texture,
// 	  side: THREE.DoubleSide
// 	})
// 	const mesh = new THREE.Mesh(planeGeo, planeMat)
// 	mesh.rotation.x = Math.PI * -0.5
// 	scene.add(mesh)
// }

// {
// 	// 方块
// 	const cubeSize = 4
// 	const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
// 	const cubeMat = new THREE.MeshPhongMaterial({ color: '#8f4b2e' })
// 	const mesh = new THREE.Mesh(cubeGeo, cubeMat)
// 	mesh.position.y = 2
// 	scene.add(mesh)
// }

{
	// 灯光
	const color = 0xffffff
	const intensity = 1
	// 方向光
	const ambientlight = new THREE.AmbientLight(color)
	const light = new THREE.DirectionalLight(color, intensity)
	var skyLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
	skyLight.position.set(0, 100, 0);
	scene.add(skyLight);
	var hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
	hemiLight.position.set(0, 100, 0);
	scene.add(hemiLight);
	light.position.set(0, 10, 0)
	light.target.position.set(-5, 0, 0)
	scene.add(light)
	scene.add(light.target)
}

// camera.position.set(0, 1.8, 20);
// camera.lookAt(0, 0, 0);
// camera.up.set(0, 1, 0);

// scene.add(camera)
	
// const firstPersonControl = new CameraControls(camera, renderer.domElement);
// firstPersonControl.lookSpeed = 0.1;
// firstPersonControl.movementSpeed = 20;
// firstPersonControl.noFly = true;
// firstPersonControl.lookVertical = true;
// firstPersonControl.constraintVertical = true;
// firstPersonControl.verticalMin = 1.0;
// firstPersonControl.verticalMax = 2.0;

const mixers = [];

const dashes = new DashesGroup();
const tools = new ToolsGroup(player1, scene);
const lasers = new RaysGroup();
const cube1 = new cube();
const cube2 = new cube();
const door1 = new door(11, new THREE.Vector3(0, 1, -5), 'x');
const mixer = new THREE.AnimationMixer(door1);
door1.setAnimation(mixer);
mixers.push(mixer);
const connector1 = new connector(gltfLoader);
connector1.body.position.set(0, 0.75, 2);
const connector2 = new connector(gltfLoader, dashes,lasers);
connector2.body.position.set(0, 0.75, 3);
cube1.body.position.set(0, 0.9, 4);
cube2.body.position.set(3, 0.9, 8);
const emittor1 = new emittor(0x3333ff, gltfLoader);
emittor1.body.position.set(2, 1, 1);
var quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);
emittor1.body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
const receiver1 = new receiver(0x3333ff, gltfLoader, door1);
receiver1.body.position.set(2, 1, 0);



cube1.addTo(world, scene);
cube2.addTo(world, scene);
connector1.addTo(world, scene);
connector2.addTo(world, scene);
emittor1.addTo(world, scene);
receiver1.addTo(world, scene);
door1.addTo(world, scene);

tools.add(cube1);
tools.add(cube2);
tools.add(connector1);
tools.add(connector2);
tools.add(emittor1);
tools.add(receiver1);
tools.add(door1);
lasers.addintersectobjects(tools.children);
tools.listenToPointerEvents(renderer, player1.camera);
scene.add(tools);
scene.add(dashes);
scene.add(lasers);


var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;


function animate() {
	// requestAnimationFrame(animate);
	const delta = clock.getDelta();
	world.step(fixedTimeStep, delta, maxSubSteps);
	player1_Control.update();
	player1.sync();
	sphere.sync();
	box.sync();
	ground.sync();
	cube1.sync();
	cube2.sync();
	connector1.sync();
	connector2.sync();
	emittor1.sync();
	receiver1.sync();
	door1.sync();
	dashes.update();
	lasers.update();
	for(var mixer of mixers){
		mixer.update(delta)
	}
	// firstPersonControl.update(delta);
	renderer.render( scene, player1.camera );
}


if ( WebGL.isWebGL2Available() ) {

	// Initiate function or other initializations here
	renderer.setAnimationLoop( animate );

} else {

	const warning = WebGL.getWebGL2ErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}
