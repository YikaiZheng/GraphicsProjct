import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CameraControls } from './CameraControl';
import { ToolsGroup } from './ToolsGroup';
import { cube, connector, emittor, receiver, door, goal } from './InteractiveObjects';
import {Dash, DashesGroup, RaysGroup} from './RaysGroup';
import { PhysicsObject, PlayerObject, AnimatedPhysicsObject } from './PhysicsObjects';
import { PlayerControl_KeyMouse, PlayerControl_Joystick } from './PlayerControl';
import { Boundary_1 } from './boundaries';

navigator.mediaDevices.getUserMedia({ audio: true });

var world = new CANNON.World();
world.gravity.set(0, -10, 0); // m/s²
const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.layers.enable(2)
const clock = new THREE.Clock();
console.log(window.innerWidth)
console.log(window.innerHeight)

const boundary_1 = new Boundary_1(world, scene);

const starting_position = new THREE.Vector3(-4, 1.5, 0);
var player1 = new PlayerObject(starting_position, scene, world);
player1.addToWorld();
player1.addToScene();
player1.camera.layers.enable(2);
player1.load_model();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild( renderer.domElement );
const gltfLoader = new GLTFLoader();
const url = '/level1.glb';
gltfLoader.load(url, (gltf) => {
	var root = gltf.scene;
	root.castShadow = true;
	root.receiveShadow = true;
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
const listener = new THREE.AudioListener();
player1.addSoundEffect(listener);

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
	light.position.set(5, 10, 0);
	light.castShadow = true;
	// light.shadow.intensity = 100;
	light.target.position.set(0, 0, 0);
	scene.add(light);
	scene.add(ambientlight);
	scene.add(light.target);
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
const tools = new ToolsGroup(player1, scene, world, renderer);
const lasers = new RaysGroup();
var sounds = [];

const connector1 = new connector(gltfLoader, dashes, lasers, scene, world, 
				{x:2, y:0.75, z:2}, {x:0, y:0, z:0, w:1});
// connector1.position.set(2,0.75,2);
const connector2 = new connector(gltfLoader, dashes, lasers, scene, world, 
				{x:6, y:0.75, z:-2}, {x:0, y:0, z:0, w:1});
// connector2.position.set(6,0.75,-2);
const cube1 = new cube(scene, world, {x:2, y:0.4, z:-6}, {x:0, y:0, z:0, w:1});
// cube1.position.set(2,0.4,-6);
const goal0 = new goal(gltfLoader, scene, world, {x:9, y:1, z:-0.5}, {x:0, y:0, z:0, w:1});
// goal0.position.set(9,1,-0.5);
goal0.setAnimation().then((mixer)=>{const goalmixer = mixer; mixers.push(goalmixer);});
sounds = sounds.concat(goal0.setAudio(listener));
const door1 = new door(scene, world, {x:5, y:1, z:-0.5}, "z");
const mixer1 = new THREE.AnimationMixer(door1);
door1.setAnimation(mixer1);
sounds = sounds.concat(door1.setAudio(listener));
mixers.push(mixer1);
const door2 = new door(scene, world, {x:7, y:1, z:-0.5}, "z");
const mixer2 = new THREE.AnimationMixer(door2);
sounds = sounds.concat(door2.setAudio(listener));
door2.setAnimation(mixer2);
mixers.push(mixer2);
const door3 = new door(scene, world, {x:-0.5, y:1, z:-5}, "x");
const mixer3 = new THREE.AnimationMixer(door3);
sounds = sounds.concat(door3.setAudio(listener));
door3.setAnimation(mixer3);
mixers.push(mixer3);
const emittor1 = new emittor(0xff3333, gltfLoader, scene, world, 
				{x:-4.8, y:1.2, z:-2}, {x:0, y:0, z:Math.sin(-Math.PI/4), w:Math.cos(-Math.PI/4)});
// emittor1.position.set(-4.8,1.2,-2);
// emittor1.rotation.z = -Math.PI/2;
const emittor2 = new emittor(0x3333ff, gltfLoader, scene, world,
				{x:-4.8, y:1.2, z:2}, {x:0, y:0, z:Math.sin(-Math.PI/4), w:Math.cos(-Math.PI/4)});
// emittor2.position.set(-4.8,1.2,2);
// emittor2.rotation.z = -Math.PI/2;
const receiver1 = new receiver(0x3333ff, gltfLoader, door1, scene, world, 
				{x:4.8, y:1.2, z:-3}, {x:0, y:0, z:Math.sin(Math.PI/4), w:Math.cos(Math.PI/4)});
// receiver1.position.set(4.8,1.2,-3);
// receiver1.rotation.z = Math.PI/2;
const receiver2 = new receiver(0xff3333, gltfLoader, door2, scene, world, 
				{x:6.8, y:1.2, z:1.5}, {x:0, y:0, z:Math.sin(Math.PI/4), w:Math.cos(Math.PI/4)});
// receiver2.position.set(6.8,1.2,1.5);
// receiver2.rotation.z = Math.PI/2;
const receiver3 = new receiver(0xff3333,gltfLoader, door3, scene, world, 
				{x:2, y:1.2, z:-4.8}, {x:Math.sin(Math.PI/4), y:0, z:0, w:Math.cos(Math.PI/4)});
// receiver3.position.set(2,1.2,-4.8);
// receiver3.rotation.x = Math.PI/2;

tools.add(connector1);
// connector1.addToWorldScene(world, scene);
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
// tools.listenToPointerEvents(renderer, player1.camera);
tools.addToWorld();
tools.addToScene();
// scene.add(tools);
scene.add(dashes);
scene.add(lasers);

// var player1_Control = new PlayerControl_Joystick(player1, world, tools);
var player1_Control = new PlayerControl_KeyMouse(player1, world, tools);

var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;

const bgm = new THREE.Audio(listener);
var audioLoader = new THREE.AudioLoader();
audioLoader.load('bgm_level1.mp3', function(AudioBuffer) {
	bgm.setBuffer(AudioBuffer);
	bgm.setLoop(true);
	bgm.setVolume(0.5); 
	bgm.play();
});

function animate() {
	const delta = clock.getDelta();
	world.step(fixedTimeStep, delta, maxSubSteps);
	// firstPersonControl.update(delta);
	player1_Control.update();
	player1.sync();
	tools.sync();
	boundary_1.sync();
	dashes.update();
	lasers.update();
	goal0.update(delta);
	for(var mixer of mixers){
		mixer.update(delta);
	}
	player1.update_mixer(delta);
	// robotmixer.update(delta*2);
	renderer.render( scene, player1.camera );
}

if ( WebGL.isWebGL2Available() ) {

	// Initiate function or other initializations here
	renderer.setAnimationLoop( animate );

} else {

	const warning = WebGL.getWebGL2ErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}