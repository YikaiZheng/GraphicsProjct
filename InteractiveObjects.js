import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import particleFire from './fire/three-particle-fire'
import { PhysicsObject, PlayerObject, AnimatedPhysicsObject } from './PhysicsObjects'

particleFire.install( { THREE: THREE } );

const _event = {type:''}

export class connector extends PhysicsObject {
    constructor(loader, dashgroup, lasergroup, scene, world, position, quaternion){
        const size = {t:0.2, b:0.5, h:1.5};
        const geometry = new THREE.CylinderGeometry(size.t, size.b, size.h);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        const cylinderShape = new CANNON.Cylinder(size.t, size.b, size.h);
        const cylinderBody = new CANNON.Body({
          mass: 1,
          position: new CANNON.Vec3(position.x, position.y, position.z),
          quaternion: new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
          shape: cylinderShape,
        });
        super(geometry, Mat, cylinderBody, scene, world);

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
    }
    setId(id) {
        this.identity = id;
    }
    sync() {
        const position = this.body.position.clone();
        const quaternion = this.body.quaternion.clone();
        const { x, y, z, w } = quaternion;
        // Yaw (Y-axis rotation)
        const yaw = Math.atan2(2 * (w * y + z * x), 1 - 2 * (y * y + z * z));
        quaternion.setFromEuler(0, yaw, 0, 'YXZ');
        this.body.quaternion.setFromEuler(0, yaw, 0, 'YXZ');

        super.sync();

    }
    computeColor( sourcelist ){        //This function should be called each time a new laserBeam reach the connector, or an existing laserBeam disconnects.
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
    
    onPick() {
        this._attached = true;
        this.position.set(0.5,-0.9,-1);
        this.quaternion.set(0,0,0,1);
        this._source = [];
        this._color = 0x000000;
        this.children[0].children[0].material.emissive = new THREE.Color(0xbbbbbb);
        this.lasergroup.deleteconnectedLaser(this);
        for(var object of this._connected){
            this.dashgroup.addline(this,object);
        }
    }
    
    onPlace() {
        this._attached = false;
        this.quaternion.set(0,0,0,1);
        this.position.y = 0.75;
        this.updateMatrixWorld();
        this.dashgroup.clear();
        for(var object of this._connected){
            if(object.use === 'emit' || (object.use === 'connect' && object._color!= 0x000000)){
                console.log('onplace adding laser')
                this.lasergroup.addLaser(object._color,object,this);
            }
        }
    }
    
    onReceive(sourceobject) {
        if(!this._attached){
            this._source.push(sourceobject);
            const color = this.computeColor(this._source);
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
    
    onBreak(sourceobject) {
        if(!this._attached){
            // for(var object of this._source){
                // if(object.identity === event.sourceobject.identity){
                //     const index = this._source.indexOf(object);
                //     this._source.splice(index, 1);
                // }}
                this._source = this._source.filter(function(object){return object.identity!=sourceobject.identity})
            const color = this.computeColor(this._source);
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
    
    onMouseover() {
        const color3 = new THREE.Color(0x444444);
        for (var i=1; i<=8;i++){
            const object = this.children[0].children[i];
            object.material.emissive = color3;
            object.material.needsUpdate = true;
        }
    }
    
    onMouseout() {
        const color3 = new THREE.Color(0x000000);
        for (var i=1; i<=8;i++){
            const object = this.children[0].children[i];
            object.material.emissive = color3;
            object.material.needsUpdate = true;
        }
    }
    
    
    onConnect(targetobject) {
        var included = false;
        console.log(targetobject)
        for(var object of this._connected){
            if (object.identity === targetobject.identity){
                const index = this._connected.indexOf(object);
                this._connected.splice(index, 1);
                if(this._attached){
                    this.dashgroup.deleteline(this,targetobject);
                }
                included = true;
                break;
            }
        }
        if(!included){
            this._connected.push(targetobject);
            if(this._attached){
                this.dashgroup.addline(this,targetobject);
            }
        }
        console.log(this._connected)
    }
}


export class cube extends PhysicsObject {
    constructor(scene, world, position, quaternion){
        const cubeSize = { x: 0.8, y: 0.8, z: 0.8 };
        const cubeGeo = new THREE.BoxGeometry(cubeSize.x, cubeSize.y, cubeSize.z)
        const cubeMat = new THREE.MeshPhongMaterial({ color: '#8f4b2e' })
        const cube_Shape = new CANNON.Box(new CANNON.Vec3(cubeSize.x / 2, cubeSize.y / 2, cubeSize.z / 2));
        const cube_Body = new CANNON.Body({
            shape: cube_Shape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            quaternion: new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
            mass: 1,
        })
        super(cubeGeo, cubeMat, cube_Body, scene, world);
        
        this.idendity = 0;
        this.click = ['pick'];
        this.use = 'none';
        // this.addEventListener('pick',onPick);
        // this.addEventListener('place',onPlace);
        // this.addEventListener('mouseover',onHover);
        // this.addEventListener('mouseout',onMouseout);
        this._attached = false;
    }
    setId(id) {
        this.identity = id;
    }

    onPick() {
        console.log('pick');
        console.log(this.position);
        this.position.set(0,-0.9,-1);
        this.quaternion.set(0,0,0,1);
        console.log(this.position);
        this._attached = true;
    }
    onPlace() {
        console.log(this.position);
        this.quaternion.set(0,0,0,1);
        this.position.y=0.3;
        this._attached = false;
    }
    onMouseover() {
        const color3 = new THREE.Color(0x444444);
        this.material.emissive = color3;
        this.material.needsUpdate = true;
    }
    onMouseout() {
        const color3 = new THREE.Color(0x000000);
        this.material.emissive = color3;
        this.material.needsUpdate = true;
    }
}

export class emittor extends PhysicsObject {
    constructor(color, loader, scene, world, position, quaternion){
        const size = {t:0.15, b:0.3, h:0.15};
        const geometry = new THREE.CylinderGeometry(size.t, size.b, size.h);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        const cylinderShape = new CANNON.Cylinder(size.t, size.b, size.h);
        const cylinderBody = new CANNON.Body({
          mass: 0,
          position: new CANNON.Vec3(position.x, position.y, position.z),
          quaternion: new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
          shape: cylinderShape,
        });
        super(geometry, Mat, cylinderBody, scene, world);

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
        // this.addEventListener('mouseover',onHoverEmittor);
        // this.addEventListener('mouseout',onMouseoutEmittor);
    }
    setId(id) {
        this.identity = id;
    }
    onMouseover() {
        const color3 = new THREE.Color(0x444444);
        for(var i=1;i<=6;i++){
            const object = this.children[0].children[i];
            object.material.emissive = color3;
            object.material.needsUpdate = true;
        }
    }
    onMouseout() {
        const color3 = new THREE.Color(0x000000);
        for(var i=1;i<=6;i++){
            const object = this.children[0].children[i];
            object.material.emissive = color3;
            object.material.needsUpdate = true;
        }
    }
    
}

export class receiver extends PhysicsObject{
    constructor(color, loader, targetobject, scene, world, position, quaternion){
        const size = {t:0.3, b:0.3, h:0.1};
        const geometry = new THREE.CylinderGeometry(size.t, size.b, size.h);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        const cylinderShape = new CANNON.Cylinder(size.t, size.b, size.h);
        const cylinderBody = new CANNON.Body({
          mass: 0,
          position: new CANNON.Vec3(position.x, position.y, position.z),
          quaternion: new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
          shape: cylinderShape,
        });
        super(geometry, Mat, cylinderBody, scene, world);
        
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
        // this.addEventListener('mouseover',onHoverReceiver);
        // this.addEventListener('mouseout',onMouseoutReceiver);
        // this.addEventListener('receive',onReceiverActivate);
        // this.addEventListener('break',onReceiverBreak);
    }
    setId(id) {
        this.identity = id;
    }
    
    onMouseover(){
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

    onMouseout(){
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

    onReceive(sourceobject, color){
        if(color===this.color){
            if(this._sourcelist.length === 0){
                // _event.type = 'activate'
                // this.targetobject.dispatchEvent(_event);
                this.targetobject.onActivate();
                console.log('receiver activated')
            }
            this._sourcelist.push(sourceobject);
        }
    }

    onBreak(sourceobject, color){
        if(color===this.color){
            for(var object of this._sourcelist){
                if(object.identity===sourceobject.identity){
                    const index = this._sourcelist.indexOf(object);
                    this._sourcelist.splice(index, 1);
                    break;
                }
            }
            if(this._sourcelist.length===0){
                // _event.type = 'deactivate'
                // this.targetobject.dispatchEvent(_event);
                this.targetobject.onDeactivate();
            }
        }
    }

}


export class door extends AnimatedPhysicsObject {
    constructor(scene, world, position, orientation){
        const doorsize = {x:3, y:2, z:0.05};
        const geometry = new THREE.BoxGeometry(doorsize.x,doorsize.y,doorsize.z);
        const material = new THREE.MeshPhongMaterial({  color: '#800080',emissive: '#800080',specular: '#cd00cd',shininess: 10,transparent: true,opacity: 0.6});
        
        const Shape = new CANNON.Box(new CANNON.Vec3(doorsize.x / 2, doorsize.y / 2, 0.2 + doorsize.z / 2));
        const doorbody = new CANNON.Body({
            shape: Shape,
            // position: new CANNON.Vec3(position.x, position.y, position.z),
            mass: 0,
        })
        super(geometry, material, doorbody, scene, world);

        this.identity = 0;
        this.position.set(position.x, position.y, position.z);
        this.orientation = orientation;
        var quaternion = {x:0, y:0, z:0, w:1};
        if(orientation == "z") {
            quaternion.y = Math.sin(Math.PI/4);
            quaternion.w = Math.cos(Math.PI/4);
        }
        this.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        // this.orientation = orientation;
        this.body.position.copy(this.position);
        this.body.quaternion.copy(this.quaternion);
        // this.addEventListener('activate',onActivate);
        // this.addEventListener('deactivate',onDeactivate);
        this.name = 'door';
        this.click = ['none'];
        this.use = 'none';
        this._openAction = null;
        this._closeAction = null;
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
        this._openAction = mixer.clipAction(open);
        this._closeAction = mixer.clipAction(close);
        this._openAction.clampWhenFinished = true;
        this._openAction.loop = THREE.LoopOnce;
        this._closeAction.clampWhenFinished = true;
        this._closeAction.loop = THREE.LoopOnce;
    }
    
    onActivate(){
        this._closeAction.stop();
        this._openAction.play();
        this.world.removeBody(this.body);
    }

    onDeactivate(){
        this._openAction.stop();
        this._closeAction.play();
        this.world.addBody(this.body);
    }

}

export class goal extends PhysicsObject {
    constructor(loader, scene, world, position, quaternion){
        const size = {t:0.25, b:0.25, h:0.2};
        const geometry = new THREE.CylinderGeometry(size.t, size.b, size.h);
        const Mat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        const cylinderShape = new CANNON.Cylinder(size.t, size.b, size.h);
        const cylinderBody = new CANNON.Body({
          mass: 0,
          position: new CANNON.Vec3(position.x, position.y, position.z),
          quaternion: new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w),
          shape: cylinderShape,
        });
        super(geometry, Mat, cylinderBody, scene, world);

        const layer = new THREE.Layers();
        layer.set(1);
        this.layers = layer;
        const url = '/switch.glb';
        loader.load(url, (gltf) => {
            const root = gltf.scene;
            this.add(root);
            const layer = new THREE.Layers();
            layer.set(2);
            for(var child of root.children){
                child.layers = layer;
            }
            console.log(root);
            this.switch = root.children[1];
        })
        this.identity = 0;
        // this.addEventListener('reach',onReach);
        this.click = ['win'];
        this.use = 'none';
        this.Action = null;
        this._update = false;
    }
    setId(id) {
        this.identity = id;
    }

    async setAnimation(){
        while(!this.switch){
            await sleep(1);
        }
        const mixer = new THREE.AnimationMixer(this.switch);
        const times = [0,2,4];
        const initpos = this.switch.position;
        this.switch.name='switch';
        const pos = [initpos.x,initpos.y,initpos.z,initpos.x,initpos.y-0.05,initpos.z,initpos.x,initpos.y-0.05,initpos.z];
        const yAxis = new THREE.Vector3(0,1,0)
        const qInitial = new THREE.Quaternion().setFromAxisAngle(yAxis,Math.PI/3);
        const qFinal = new THREE.Quaternion().setFromAxisAngle(yAxis,0);
        const rot = [qInitial.x,qInitial.y,qInitial.z,qInitial.w,
                    qInitial.x,qInitial.y,qInitial.z,qInitial.w,
                    qFinal.x,qFinal.y,qFinal.z,qFinal.w]
        const posKF = new THREE.KeyframeTrack('switch.position', times, pos);
        const rotKF = new THREE.KeyframeTrack('switch.quaternion', times, rot);
        const clip = new THREE.AnimationClip("clip", 4, [posKF,rotKF]);
        this.Action = mixer.clipAction(clip);
        this.Action.clampWhenFinished = true;
        this.Action.loop = THREE.LoopOnce;
        console.log('animation ready')
        return mixer;
    }
    update(delta){
        if(this._update){
            this.children[1].material.update( delta )
        }
    }

    async onReach(){
        console.log(this.Action)
        this.Action.play();
        await sleep(4000);
        var fireRadius = 0.03;
        var fireHeight = 0.6;
        var particleCount = 400;
        var geometry0 = new particleFire.Geometry( fireRadius, fireHeight, particleCount );
        var material0 = new particleFire.Material( { color: 0xff2200 } );
        material0.setPerspective( 75, window.innerHeight);
        var particleFireMesh0 = new THREE.Points( geometry0, material0 );
        particleFireMesh0.position.set(0,0.1,0);
        this.add( particleFireMesh0 );
        this._update = true;
    }
}
    
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}