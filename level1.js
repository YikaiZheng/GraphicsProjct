import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CameraControls } from './CameraControl';
import { ToolsGroup } from './ToolsGroup';
import { cube, connector, emittor, receiver, door, goal } from './InteractiveObjects'
import {Dash, DashesGroup, RaysGroup} from './RaysGroup'
import { PhysicsObject, PlayerObject } from './PhysicsObjects'
import { PlayerControl } from './PlayerControl'
import { Boundary_1 } from './boundaries';


var world = new CANNON.World();
world.gravity.set(0, -10, 0); // m/s²
const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.layers.enable(2)
const clock = new THREE.Clock();
console.log(window.innerWidth)
console.log(window.innerHeight)

const boxSize = { x: 1, y: 1, z: 1 };
const box_Shape = new CANNON.Box(new CANNON.Vec3(boxSize.x / 2, boxSize.y / 2, boxSize.z / 2));
const box_Body = new CANNON.Body({
	shape: box_Shape,
	mass: 1,
})
// console.log(box_Body.index);
box_Body.position.set(0, 2, 0); // Set the position
const box_Geometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
const box_Material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const box = new PhysicsObject(box_Geometry, box_Material, box_Body)
box.addTo(world, scene);

const boundary_1 = new Boundary_1(world, scene);

const starting_position = new THREE.Vector3(-4, 1.5, 0);
var player1 = new PlayerObject(starting_position);
var player1_Control = new PlayerControl(player1);
player1.addTo(world, scene);
player1.camera.layers.enable(2);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
});
document.body.appendChild( renderer.domElement );
const gltfLoader = new GLTFLoader();
const url = '/level1.glb';
gltfLoader.load(url, (gltf) => {
	const root = gltf.scene;
	scene.add(root);
});

const loader = new THREE.TextureLoader();
const texture = loader.load(
  '/dikhololo_night.jpg',
  () => {
	texture.mapping = THREE.EquirectangularReflectionMapping;
	texture.colorSpace = THREE.SRGBColorSpace;
	scene.background = texture;
  });

{
	// 灯光
	const color = 0xffffff
	const intensity = 1
	// 方向光
	const ambientlight = new THREE.AmbientLight(color)
	const light = new THREE.DirectionalLight(color, intensity)
	var skyLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.3);
	skyLight.position.set(0, 50, 0);
	scene.add(skyLight);
	var hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.2);
	hemiLight.position.set(0, 50, 0);
	scene.add(hemiLight);
	light.position.set(5, 10, 0)
	light.target.position.set(0, 0, 0)
	scene.add(light)
	scene.add(ambientlight)
	scene.add(light.target)
}

// camera.position.set(-4, 1.7, 0);
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

const connector1 = new connector(gltfLoader,dashes,lasers);
connector1.position.set(2,0.75,2);
const connector2 = new connector(gltfLoader,dashes,lasers);
connector2.position.set(6,0.75,-2);
const cube1 = new cube();
cube1.position.set(2,0.4,-6);
const goal0 = new goal(gltfLoader);
goal0.position.set(9,1,-0.5);
goal0.setAnimation().then((mixer)=>{const goalmixer = mixer; mixers.push(goalmixer);});
const door1 = new door(new THREE.Vector3(5,1,-0.5),'z',world);
const mixer1 = new THREE.AnimationMixer(door1);
door1.setAnimation(mixer1);
mixers.push(mixer1);
const door2 = new door(new THREE.Vector3(7,1,-0.5),'z',world);
const mixer2 = new THREE.AnimationMixer(door2);
door2.setAnimation(mixer2);
mixers.push(mixer2);
const door3 = new door(new THREE.Vector3(-0.5,1,-5),'x',world);
const mixer3 = new THREE.AnimationMixer(door3);
door3.setAnimation(mixer3);
mixers.push(mixer3);
const emittor1 = new emittor(0xff3333,gltfLoader);
emittor1.position.set(-4.8,1.2,-2);
emittor1.rotation.z = -Math.PI/2;
const emittor2 = new emittor(0x3333ff,gltfLoader);
emittor2.position.set(-4.8,1.2,2);
const receiver1 = new receiver(0x3333ff,gltfLoader,door1);
emittor2.rotation.z = -Math.PI/2;
receiver1.position.set(4.8,1.2,-3);
receiver1.rotation.z = Math.PI/2;
const receiver2 = new receiver(0xff3333,gltfLoader,door2);
receiver2.position.set(6.8,1.2,1.5);
receiver2.rotation.z = Math.PI/2;
const receiver3 = new receiver(0xff3333,gltfLoader,door3);
receiver3.position.set(2,1.2,-4.8);
receiver3.rotation.x = Math.PI/2;

tools.add(connector1);
tools.add(connector2);
tools.add(cube1);
tools.add(goal0);
tools.add(door1);
tools.add(door2);
tools.add(door3);
tools.add(emittor1);
tools.add(emittor2);
tools.add(receiver1);
tools.add(receiver2);
tools.add(receiver3);

lasers.addintersectobjects(tools.children);
tools.listenToPointerEvents(renderer, player1.camera);
scene.add(tools);
scene.add(dashes);
scene.add(lasers);

var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;

function animate() {
	const delta = clock.getDelta();
	world.step(fixedTimeStep, delta, maxSubSteps);
	// firstPersonControl.update(delta);
	player1_Control.update();
	player1.sync();
	box.sync();
	boundary_1.sync();
	dashes.update();
	lasers.update();
	goal0.update(delta);
	for(var mixer of mixers){
		mixer.update(delta);

	}
	renderer.render( scene, player1.camera );
}

if ( WebGL.isWebGL2Available() ) {

	// Initiate function or other initializations here
	renderer.setAnimationLoop( animate );

} else {

	const warning = WebGL.getWebGL2ErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}