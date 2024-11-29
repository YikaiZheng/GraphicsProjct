import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CameraControls } from './CameraControl';
import { ToolsGroup } from './ToolsGroup';
import { cube, connector, emittor, receiver, door, goal } from './InteractiveObjects'
import {Dash, DashesGroup, RaysGroup} from './RaysGroup'


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.layers.enable(2)
const clock = new THREE.Clock();
console.log(window.innerWidth)
console.log(window.innerHeight)

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
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
	scene.add(ambientlight)
	scene.add(light.target)
}

camera.position.set(0, 1.8, 20);
camera.lookAt(0, 0, 0);
camera.up.set(0, 1, 0);
scene.add(camera)
	
const firstPersonControl = new CameraControls(camera, renderer.domElement);
firstPersonControl.lookSpeed = 0.1;
firstPersonControl.movementSpeed = 20;
firstPersonControl.noFly = true;
firstPersonControl.lookVertical = true;
firstPersonControl.constraintVertical = true;
firstPersonControl.verticalMin = 1.0;
firstPersonControl.verticalMax = 2.0;

const mixers = [];

const dashes = new DashesGroup();
const tools = new ToolsGroup();
const lasers = new RaysGroup();
const cube1 = new cube(0);
const cube2 = new cube(1);
const door1 = new door(11,new THREE.Vector3(0,1,-5),'x');
const mixer = new THREE.AnimationMixer(door1);
door1.setAnimation(mixer);
mixers.push(mixer);
const connector1 = new connector(2,gltfLoader,dashes,lasers);
connector1.position.set(0,0.75,2);
const connector2 = new connector(10,gltfLoader,dashes,lasers);
connector1.position.set(0,0.75,3);
cube1.position.set(0,0.3,4);
cube2.position.set(3,0.3,8);
const emittor1 = new emittor(3,0x3333ff,gltfLoader);
emittor1.position.set(2,1,1);
var quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);
emittor1.quaternion.set(quaternion.x,quaternion.y,quaternion.z,quaternion.w);
const receiver1 = new receiver(4,0x3333ff,gltfLoader,door1);
receiver1.position.set(2,1,0);
const goal0 = new goal(5,gltfLoader);
goal0.position.set(3,1,-5);
goal0.setAnimation().then((mixer)=>{const goalmixer = mixer; mixers.push(goalmixer);});


tools.add(cube1);
tools.add(cube2);
tools.add(connector1);
tools.add(connector2);
tools.add(emittor1);
tools.add(receiver1);
tools.add(door1);
tools.add(goal0);
lasers.addintersectobjects(tools.children);
tools.listenToPointerEvents(renderer,camera);
scene.add(tools);
scene.add(dashes);
scene.add(lasers);


function animate() {
	const delta = clock.getDelta();
	firstPersonControl.update(delta);
	dashes.update();
	lasers.update();
	goal0.update(delta);
	for(var mixer of mixers){
		mixer.update(delta);

	}
	renderer.render( scene, camera );
}

if ( WebGL.isWebGL2Available() ) {

	// Initiate function or other initializations here
	renderer.setAnimationLoop( animate );

} else {

	const warning = WebGL.getWebGL2ErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}