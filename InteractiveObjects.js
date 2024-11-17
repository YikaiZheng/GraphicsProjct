import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// export class receiver extends Mesh{
//     constructor(mesh, targetlist){
//         super(mesh.geometry,mesh.material);
//         this.targetlist = targetlist;
//     }

//     activate() {
//         for (i in targetlist){
//             targetlist[i].activate();
//         }
//     }
// }

// class emittor {

// }

export class connector extends THREE.Mesh {
    constructor(id,loader){
        const geometry = new THREE.CylinderGeometry(0.2,0.5,1.5);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        super(geometry,Mat);
        const layer = new THREE.Layers();
        layer.set(1);
        this.layers = layer;
        const url = '/connector.glb';
        loader.load(url, (gltf) => {
            const root = gltf.scene;
            this.add(root);
            root.position.set(0,-0.75,0);
            console.log(root)
        })
        this.identity = id;
        this.click = ['pick','connect'];
        this.use = 'connect';
        this.color = 'none';
        this._connected = [];
        this.addEventListener('pick',onPickTool);
        this.addEventListener('place',onPlaceTool);
        this.addEventListener('mouseover',onHoverConnector);
        this.addEventListener('mouseout',onMouseoutConnector);
        this.addEventListener('connect',onConnect);
    }
}

function onPickTool( event ) {
    this.position.set(0.5,-0.9,-1);
    this.quaternion.set(0,0,0,1);
}

function onPlaceTool( event ) {
    this.quaternion.set(0,0,0,1);
    this.position.y = 0.75;
}

function onHoverConnector( event ) {
    const color3 = new THREE.Color(0x444444);
    for (var i=1; i<=8;i++){
        const object = this.children[0].children[i];
        object.material.emissive = color3;
        object.material.needsUpdate = true;
    }
}

function onMouseoutConnector( event ) {
    const color3 = new THREE.Color(0x000000);
    for (var i=1; i<=8;i++){
        const object = this.children[0].children[i];
        object.material.emissive = color3;
        object.material.needsUpdate = true;
    }
}

function onConnect( event ) {
    var included = false;
    console.log(event.targetobject)
    for(var object of this._connected){
        if (object.identity === event.targetobject.identity){
            const index = this._connected.indexOf(object);
            this._connected.splice(index, 1);
            included = true;
            break;
        }
    }
    if(!included){
        this._connected.push(event.targetobject);
    }
    console.log(this._connected)
}

export class cube extends THREE.Mesh {
    constructor(id){
        const cubeSize = 0.6
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
        const cubeMat = new THREE.MeshPhongMaterial({ color: '#8f4b2e' })
        super(cubeGeo,cubeMat);
        this.idendity = id;
        this.click = ['pick'];
        this.use = 'none';
        this.addEventListener('pick',onPick);
        this.addEventListener('place',onPlace);
        this.addEventListener('mouseover',onHover);
        this.addEventListener('mouseout',onMouseout);
        this._attached = false;
    }
}

function onPick( event ) {
    console.log('pick');
    console.log(this.position);
    this.position.set(0,-0.9,-1);
    this.quaternion.set(0,0,0,1);
    console.log(this.position);
    this._attached = true;
}
function onPlace( event ) {
    console.log(this.position);
    this.quaternion.set(0,0,0,1);
    this.position.y=0.3;

    this._attached = false;
}
function onHover( event ) {
    const color3 = new THREE.Color(0x444444);
    this.material.emissive = color3;
    this.material.needsUpdate = true;
}
function onMouseout( event ) {
    const color3 = new THREE.Color(0x000000);
    this.material.emissive = color3;
    this.material.needsUpdate = true;
}

export class emittor extends THREE.Mesh {
    constructor(id,color,loader){
        const geometry = new THREE.CylinderGeometry(0.15,0.3,0.15);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        super(geometry,Mat);
        const layer = new THREE.Layers();
        layer.set(1);
        this.layers = layer;
        const url = '/emittor.glb';
        loader.load(url, (gltf) => {
            const root = gltf.scene;
            this.add(root);
            root.position.set(0,-0.075,0);
            for(var i=1;i<=5;i++){
                const object = root.children[i];
                object.material.color.setHex(color);
                object.material.needsUpdate=true;
            }
            const object = root.children[0];
            object.material.emissive = new THREE.Color(color);
            // object.material.emissiveIntensity = ;
            object.material.needsUpdate=true;
            console.log(root);
        })
        this.identity = id;
        this.click = 'connect';
        this.use = 'emit';
        this.color = color;
        this.addEventListener('mouseover',onHoverEmittor);
        this.addEventListener('mouseout',onMouseoutEmittor);
    }
}

function onHoverEmittor( event ) {
    const color3 = new THREE.Color(0x444444);
    for(var i=1;i<=6;i++){
        const object = this.children[0].children[i];
        object.material.emissive = color3;
        object.material.needsUpdate = true;
    }
}
function onMouseoutEmittor( event ) {
    const color3 = new THREE.Color(0x000000);
    for(var i=1;i<=6;i++){
        const object = this.children[0].children[i];
        object.material.emissive = color3;
        object.material.needsUpdate = true;
    }
}

export class receiver extends THREE.Mesh{
    constructor(id,color,loader){
        const geometry = new THREE.CylinderGeometry(0.3,0.3,0.1);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        super(geometry,Mat);
        const layer = new THREE.Layers();
        layer.set(1);
        this.layers = layer;
        const url = '/receiver.glb';
        loader.load(url, (gltf) => {
            const root = gltf.scene;
            this.add(root);
            root.position.set(0,-0.075,0);
            console.log(root);
            for(var i=1;i<=12;i++){
                const object = root.children[i];
                object.material.color.setHex(color);
                object.material.neesUpdate = true;
            }
            const object = root.children[14];
            object.material.color.setHex(color);
            object.material.neesUpdate = true;
        })
        this.identity = id;
        this.color = color;
        this.click = 'connect';
        this.use = 'receive';
        this._activated = false;
        this.addEventListener('mouseover',onHoverReceiver);
        this.addEventListener('mouseout',onMouseoutReceiver);
    }
}

function onHoverReceiver(event){
    const color3 = new THREE.Color(0x444444);
    for(var i=0;i<=12;i++){
        const object = this.children[0].children[i];
        object.material.emissive = color3;
        object.material.needsUpdate = true;
    }
    const object = this.children[0].children[14];
    object.material.emissive = color3;
    object.material.needsUpdate = true;
}

function onMouseoutReceiver(event){
    const color3 = new THREE.Color(0x000000);
    for(var i=0;i<=12;i++){
        const object = this.children[0].children[i];
        object.material.emissive = color3;
        object.material.needsUpdate = true;
    }
    const object = this.children[0].children[14];
    object.material.emissive = color3;
    object.material.needsUpdate = true;
}


// class door extends Mesh {

// }