import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsObject } from './PhysicsObjects'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const _event = {type:''}

// class MeshwithId extends THREE.Mesh {
//     constructor(geometry, material, id) {
//         super(geometry, material);
//         this.identity = id;
//     }
// }

export class connector extends PhysicsObject {
    constructor(loader,dashgroup,lasergroup){
        const geometry = new THREE.CylinderGeometry(0.2, 0.5, 1.5);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        const shape = new CANNON.Cylinder(0.2, 0.5, 1.5);
        const body = new CANNON.Body({
            shape: shape,
            mass: 1,
        });
        super(geometry, Mat, body);
        const layer = new THREE.Layers();
        layer.set(1);
        this.layers = layer;
        const url = '/connector.glb';
        loader.load(url, (gltf) => {
            const root = gltf.scene;
            this.add(root);
            const layer = new THREE.Layers();
            layer.set(2);
            for(var object of root.children){
                object.layers = layer;
            }
            root.position.set(0,-0.75,0);
            console.log(root)
        })
        this.identity = 0;
        this.connectposition = new THREE.Vector3(0,0.45,0);
        this.click = ['pick','connect'];
        this.use = 'connect';
        this.lasergroup = lasergroup;
        this.dashgroup = dashgroup;
        this._attached = false;
        this._connected = [];
        this._source = [];
        this._color = 0x000000;
        this.addEventListener('pick',onPickTool);
        this.addEventListener('place',onPlaceTool);
        this.addEventListener('mouseover',onHoverConnector);
        this.addEventListener('mouseout',onMouseoutConnector);
        this.addEventListener('connect',onConnect);
        this.addEventListener('receive',onReceive);
        this.addEventListener('break',onBreak);
    }

    setId(id) {
        this.identity = id;
    }
}

function computeColor( sourcelist ){        //This function should be called each time a new laserBeam reach the connector, or an existing laserBeam disconnects.
    var color = 0x000000;
    for (var object of sourcelist) {
        if (object.use === 'emit'){
            if(color!=0x000000 && color!= object._color){  //connected to two emittors of different colors, connector is disabled.
                return 0x000000;
            }
            if(color===0x000000){
                color = object._color;
            }
        }
    }
    if(color!=0x000000){    //color from emittors always overwrite color from lit connectors
        return color;
    }
    for (var object of sourcelist) {
        if (object.use === 'connect' && object._color!=0x000000){    //loop through lit connectors
            if(color!=0x000000 && color!= object._color){  //connected to two connectors of different colors, connector is disabled. 
                return 0x000000;
            }
            if(color===0x000000){
                color = object._color;
            }
        }
    }
    return color;
}

function onPickTool( event ) {
    this._attached = true;
    this.body.position.set(0.5,-0.9,-1);
    this.body.quaternion.set(0,0,0,1);
    this._source = [];
    this._color = 0x000000;
    this.children[0].children[0].material.emissive = new THREE.Color(0xbbbbbb);
    this.lasergroup.deleteconnectedLaser(this);
    for(var object of this._connected){
        this.dashgroup.addline(this,object);
    }
}

function onPlaceTool( event ) {
    this._attached = false;
    this.body.quaternion.set(0,0,0,1);
    this.body.position.y = 0.75;
    this.updateMatrixWorld();
    this.dashgroup.clear();
    for(var object of this._connected){
        if(object.use === 'emit' || (object.use === 'connect' && object._color!= 0x000000)){
            console.log('onplace adding laser')
            this.lasergroup.addLaser(object._color,object,this);
        }
    }
}

function onReceive( event) {
    if(!this._attached){
        this._source.push(event.sourceobject);
        const color = computeColor(this._source);
        if(color === 0x000000){
            this.children[0].children[0].material.emissive = new THREE.Color(0x888888);
        }
        else{
            this.children[0].children[0].material.emissive = new THREE.Color(color);
        }
        this.children[0].children[0].material.needsUpdate = true;
        this.lasergroup.deletestartingLaser(this);
        if(color!=0x000000){
            for(var object of this._connected){
                var source = false;
                for(var src of this._source){
                    if(src.identity === object.identity){
                        source = true;
                    }
                }
                if(!source){
                    console.log('onreceive addlaser')
                    this.lasergroup.addLaser(color,this,object);
                }
            }
        }
        this._color = color;
    }                                //when receive a laserBeam, recompute color and send laserBeam to objects not in sourcelist.
}

function onBreak(event) {
    if(!this._attached){
        // for(var object of this._source){
            // if(object.identity === event.sourceobject.identity){
            //     const index = this._source.indexOf(object);
            //     this._source.splice(index, 1);
            // }}
            this._source = this._source.filter(function(object){return object.identity!=event.sourceobject.identity})
        const color = computeColor(this._source);
        if(color === 0x000000){
            this.children[0].children[0].material.emissive = new THREE.Color(0x888888);
        }
        else{
            this.children[0].children[0].material.emissive = new THREE.Color(color);
        }
        this.children[0].children[0].material.needsUpdate = true;
        this.lasergroup.deletestartingLaser(this);
        if(color!=0x000000){
            for(var object of this._connected){
                var source = false;
                for(var src of this._source){
                    if(src.identity === object.identity){
                        source = true;
                    }
                }
                if(!source && object.use!='emit' && !object._attached){
                    console.log('onbreak addlaser')
                    this.lasergroup.addLaser(color,this,object);
                }
            }
        }
        this._color = color;
    }
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
            if(this._attached){
                this.dashgroup.deleteline(this,event.targetobject);
            }
            included = true;
            break;
        }
    }
    if(!included){
        this._connected.push(event.targetobject);
        if(this._attached){
            this.dashgroup.addline(this,event.targetobject);
        }
    }
    console.log(this._connected)
}

export class cube extends PhysicsObject {
    constructor(){
        const boxSize = { x: 0.6, y: 1.8, z: 0.6 };
        const cubeGeo = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        const cubeMat = new THREE.MeshPhongMaterial({ color: '#8f4b2e' });
        const cubeShape = new CANNON.Box(new CANNON.Vec3(boxSize.x / 2, boxSize.y / 2, boxSize.z / 2));
        const cubeBody = new CANNON.Body({
            shape: cubeShape,
            mass: 1,
        })
        super(cubeGeo, cubeMat, cubeBody);
        this.identity = 0;
        this.click = ['pick'];
        this.use = 'none';
        this.addEventListener('pick',onPick);
        this.addEventListener('place',onPlace);
        this.addEventListener('mouseover',onHover);
        this.addEventListener('mouseout',onMouseout);
        this._attached = false;
    }

    setId(id) {
        this.identity = id;
    }
}

function onPick( event ) {
    console.log('pick');
    console.log(this.position);
    this.body.position.set(0,1,-2);
    this.body.quaternion.set(0,0,0,1);
    // console.log(this.body.position);
    this._attached = true;
}
function onPlace( event ) {
    // console.log(this.body.position);
    this.body.quaternion.set(0,0,0,1);
    this.body.position.y=0.9;
    this._attached = false;
}
function onHover( event ) {
    const color3 = new THREE.Color(0x444444);
    // console.log(this);
    this.material.emissive = color3;
    this.material.needsUpdate = true;
}
function onMouseout( event ) {
    const color3 = new THREE.Color(0x000000);
    this.material.emissive = color3;
    this.material.needsUpdate = true;
}

export class emittor extends PhysicsObject {
    constructor(color,loader){
        const geometry = new THREE.CylinderGeometry(0.15, 0.3, 0.15);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        const shape = new CANNON.Cylinder(0.15, 0.3, 0.15);
        const body = new CANNON.Body({
            shape: shape,
            mass: 1,
        });
        super(geometry, Mat, body);
        const layer = new THREE.Layers();
        layer.set(1);
        this.layers = layer;
        const url = '/emittor.glb';
        loader.load(url, (gltf) => {
            const root = gltf.scene;
            this.add(root);
            const layer = new THREE.Layers();
            layer.set(2);
            for(var child of root.children){
                child.layers = layer;
            }
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
        this.identity = 0;
        this.click = 'connect';
        this.use = 'emit';
        this._color = color;
        this.connectposition = new THREE.Vector3(0,0,0);
        this.addEventListener('mouseover',onHoverEmittor);
        this.addEventListener('mouseout',onMouseoutEmittor);
    }
    setId(id) {
        this.identity = id;
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

export class receiver extends PhysicsObject {
    constructor(color,loader,targetobject){
        const geometry = new THREE.CylinderGeometry(0.3,0.3,0.1);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        const shape = new CANNON.Cylinder(0.3, 0.3, 0.1);
        const body = new CANNON.Body({
            shape: shape,
            mass: 1,
        });
        super(geometry, Mat, body);
        const layer = new THREE.Layers();
        layer.set(1);
        this.layers = layer;
        const url = '/receiver.glb';
        loader.load(url, (gltf) => {
            const root = gltf.scene;
            this.add(root);
            const layer = new THREE.Layers();
            layer.set(2);
            for(var child of root.children){
                child.layers = layer;
            }
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
        this.identity = 0;
        this.color = color;
        this.click = 'connect';
        this.use = 'receive';
        this._sourcelist = [];
        this.targetobject = targetobject;
        this.connectposition = new THREE.Vector3(0,0,0);
        this.addEventListener('mouseover',onHoverReceiver);
        this.addEventListener('mouseout',onMouseoutReceiver);
        this.addEventListener('receive',onReceiverActivate);
        this.addEventListener('break',onReceiverBreak);
    }
    setId(id) {
        this.identity = id;
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

function onReceiverActivate(event){
    if(event.color===this.color){
        if(this._sourcelist.length === 0){
            _event.type = 'activate'
            this.targetobject.dispatchEvent(_event);
        }
        this._sourcelist.push(event.sourceobject);
    }
}

function onReceiverBreak(event){
    if(event.color===this.color){
        for(var object of this._sourcelist){
            if(object.identity===event.sourceobject.identity){
                const index = this._sourcelist.indexOf(object);
                this._sourcelist.splice(index, 1);
                break;
            }
        }
        if(this._sourcelist.length===0){
            _event.type = 'deactivate'
            this.targetobject.dispatchEvent(_event);
        }
    }
}


export class door extends PhysicsObject {
    constructor(position,orientation){
        const boxSize = { x: 3, y: 2, z: 0.25 };
        const geometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        const material = new THREE.MeshPhongMaterial({  color: '#800080',emissive: '#800080',specular: '#cd00cd',shininess: 10,transparent: true,opacity: 0.6});
        const shape = new CANNON.Box(new CANNON.Vec3(boxSize.x / 2, boxSize.y / 2, boxSize.z / 2));
        const body = new CANNON.Body({
            shape: shape,
            mass: 0,
        });
        super(geometry, material, body);
        this.identity = 0;
        this.body.position.set(position.x,position.y,position.z);
        this.orientation = orientation;
        this.addEventListener('activate',onActivate);
        this.addEventListener('deactivate',onDeactivate);
        this.name = 'door';
        this.click = ['none'];
        this.use = 'none';
        this.openAction = null;
        this.closeaction = null;
    }
    setId(id) {
        this.identity = id;
    }
    setAnimation(mixer){
        const times = [0,1];
        var openvalues = [];
        var closevalues = [];
        if(this.orientation==='x'){
            openvalues = [this.position.x,this.position.y,this.position.z,this.position.x-1.5,this.position.y,this.position.z];
            closevalues = [this.position.x-1.5,this.position.y,this.position.z,this.position.x,this.position.y,this.position.z];
        }
        else if(this.orientation==='z'){
            openvalues = [this.position.x,this.position.y,this.position.z,this.position.x,this.position.y,this.position.z-1.5];
            closevalues = [this.position.x,this.position.y,this.position.z-1.5,this.position.x,this.position.y,this.position.z];
            this.rotation.y = Math.PI/2;
        }
        const openposKF = new THREE.KeyframeTrack('door.position', times, openvalues);
        const closeposKF = new THREE.KeyframeTrack('door.position', times, closevalues);
        const openscaleKF = new THREE.KeyframeTrack('door.scale',times,[1,1,1,0,1,1]);
        const closescaleKF = new THREE.KeyframeTrack('door.scale',times,[0,1,1,1,1,1]);
        const open = new THREE.AnimationClip("open", 1, [openposKF, openscaleKF]);
        const close = new THREE.AnimationClip("close", 1, [closeposKF, closescaleKF]);
        this.openAction = mixer.clipAction(open);
        this.closeAction = mixer.clipAction(close);
        this.openAction.clampWhenFinished = true;
        this.openAction.loop = THREE.LoopOnce;
        this.closeAction.clampWhenFinished = true;
        this.closeAction.loop = THREE.LoopOnce;
    }
}

function onActivate(event){
    this.closeAction.stop();
    this.openAction.play();
}

function onDeactivate(event){
    this.closeAction.clampWhenFinished = true;
    this.openAction.stop();
    this.closeAction.play();
}