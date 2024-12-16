import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'

const _pointer = new THREE.Vector2();
const _event = { type: '', data: _pointer, sourceobject: null, color: 0x000000};

function computepositions(startobject,endobject){
    var startposition = new THREE.Vector3;
    var startbasequaternion = new THREE.Quaternion;
    var startbasescale = new THREE.Vector3;
    var endposition = new THREE.Vector3;
    var endbasequaternion = new THREE.Quaternion;
    var endbasescale = new THREE.Vector3;
    // console.log(endobject)
    startobject.matrixWorld.decompose( startposition, startbasequaternion, startbasescale );
    endobject.matrixWorld.decompose(endposition, endbasequaternion, endbasescale);
    startposition.add(startobject.connectposition);
    endposition.add(endobject.connectposition);
    return [startposition, endposition];
}


export class LaserBeam extends THREE.Mesh{
    constructor(color,startobject,endobject,id){
        const pos = computepositions(startobject,endobject);
        const startposition = pos[0];
        const endposition = pos[1];
        // console.log(startposition);
        // console.log(endposition);
        const dvector = new THREE.Vector3().subVectors(endposition, startposition);
        length = dvector.length();
        const theta = Math.acos(dvector.y/length);
        var phi = Math.atan(dvector.x/dvector.z);
        // console.log(phi)
        if(dvector.z<0){
            phi = phi + Math.PI;
        }
        const euler = new THREE.Euler(theta,phi,0,'YXZ');
        const boundgeometry = new THREE.CylinderGeometry(0.05,0.05,1);
        const boundmaterial = new THREE.MeshPhongMaterial();
        super(boundgeometry,boundmaterial);
        this.position.set(startposition.x+dvector.x/2,startposition.y+dvector.y/2,startposition.z+dvector.z/2);
        this.rotation.copy(euler);
        this.startposition = startposition;
        const layer = new THREE.Layers();
        layer.set(1);
        this.layers = layer;
	    // generate the texture
	    var canvas	= generateLaserBodyCanvas()
	    var texture	= new THREE.Texture( canvas )
	    texture.needsUpdate	= true;
	    // do the material	
	    var material	= new THREE.MeshBasicMaterial({
		    map		: texture,
		    blending	: THREE.AdditiveBlending,
		    color		: color,
		    side		: THREE.DoubleSide,
		    depthWrite	: false,
		    transparent	: true
	    })
	var geometry	= new THREE.PlaneGeometry(0.1, 1)
	var nPlanes	= 16;
	for(var i = 0; i < nPlanes; i++){
		var mesh = new THREE.Mesh(geometry, material)
		mesh.rotation.y	= i/nPlanes * Math.PI
		this.add(mesh)
	}
    var color_sprite = '';
    if(color===0xff3333){
        color_sprite = 'red'
    }
    else if(color===0x3333ff){
        color_sprite = 'blue'
    }
    var textureUrl	= `/${color_sprite}.jpg`;
	var texture	= new THREE.TextureLoader().load(textureUrl)	
	var material	= new THREE.SpriteMaterial({
		map		: texture,
		blending	: THREE.AdditiveBlending,
	})
	var sprite	= new THREE.Sprite(material)
	sprite.scale.x = 0.5;
	sprite.scale.y = 1;

	sprite.position.y	= 0.49
	this.add(sprite);
    this.lastIntersects	= [];
    this.raycaster	= new THREE.Raycaster();
    this.raycaster.layers.enable(1);
    this.raycaster.ray.origin.copy(this.startposition);
    // var matrixWorld	= this.matrixWorld.clone();
    // matrixWorld.setPosition(new THREE.Vector3(0,0,0));		
	this.raycaster.ray.direction.set(0,1,0).applyEuler(euler).normalize();
    this.startobject = startobject;
    this.endobject = endobject;
    this._intersectobject = startobject;
    this.identity = id;
    this.color = color
    console.log(this)
    }
    intersect(intersectobjects){       
        const pos = computepositions(this.startobject,this.endobject);
        const startposition = pos[0];
        const endposition = pos[1];
        var dvector = new THREE.Vector3().subVectors(endposition, startposition);
        length = dvector.length();
        // console.log(dvector);
        const theta = Math.acos(dvector.y/length);
        var phi = Math.atan(dvector.x/dvector.z);
        // console.log(phi)
        if(dvector.z<0){
            phi = phi + Math.PI;
        }
        const euler = new THREE.Euler(theta,phi,0,'YXZ');
        this.raycaster.ray.origin.copy(startposition);
        this.raycaster.ray.direction.set(0,1,0).applyEuler(euler).normalize();
        var intersects = this.raycaster.intersectObjects(intersectobjects, false);         //TODO: Recompute origin and direction before intersecting
        // console.log(intersects.length)
        var position = intersects[0].point;
        // const startposition = pos[0];
        // const dvector = new THREE.Vector3().subVectors(position, startposition);
        // length = dvector.length();
        // // console.log(dvector);
        // const theta = Math.acos(dvector.y/length);
        // var phi = Math.atan(dvector.x/dvector.z);
        // // console.log(phi)
        // if(dvector.z<0){
        //     phi = phi + Math.PI;
        // }
        // const euler = new THREE.Euler(theta,phi,0,'YXZ');
        dvector = new THREE.Vector3().subVectors(position, startposition);
        this.position.set(startposition.x+dvector.x/2,startposition.y+dvector.y/2,startposition.z+dvector.z/2);
        this.rotation.copy(euler);                                                                                        //First update the geometry of the laser. This can be helpful when connectors' position change without picking it (e.g. lifted up by fan)
        var distance = position.distanceTo(this.raycaster.ray.origin)
        this.scale.y = distance+0.05;
        this.children[this.children.length-1].scale.y = 0.49/(distance+0.01);
        var intersectobject = intersects[0].object;
        if(intersectobject.identity===this.startobject.identity){
            intersectobject = intersects[1].object;
        }
        if(intersectobject.identity === this.endobject.identity && this._intersectobject.identity!=this.endobject.identity){        //If reach endobject, the two objects are connected
            // _event.type = 'receive';
            // _event.color = this.color;
            // _event.sourceobject = this.startobject;
            // this.endobject.dispatchEvent(_event);
            console.log(this.endobject)
            this.endobject.onReceive(this.startobject, this.color);
        }
        if(intersectobject.identity != this.endobject.identity && this._intersectobject.identity===this.endobject.identity){        //If cannot reach endobject, disconnected
            // _event.type = 'break';
            // _event.color = this.color;
            // _event.sourceobject = this.startobject;
            // this.endobject.dispatchEvent(_event);
            this.endobject.onBreak(this.startobject, this.color);
        }
        this._intersectobject = intersectobject;
    }
    delete(){
        if(this._intersectobject.identity === this.endobject.identity){
            // _event.type = 'break';
            // _event.color = this.color;
            // _event.sourceobject = this.startobject;
            // this.endobject.dispatchEvent(_event);
            
            this.endobject.onBreak(this.startobject, this.color);                    
        }
        this.material.dispose();
        this.geometry.dispose();
    }
}

function generateLaserBodyCanvas(){
    // init canvas
    var canvas	= document.createElement( 'canvas' );
    var context	= canvas.getContext( '2d' );
    canvas.width	= 64;
    canvas.height	= 1;
    // set gradient
    var gradient	= context.createLinearGradient(0, 0, canvas.width, canvas.height);	        //The edge of the laser is not as bright as the center	
    gradient.addColorStop( 0  , 'rgba(  0,  0,  0,0.1)' );
    gradient.addColorStop( 0.1, 'rgba(160,160,160,0.3)' );
    gradient.addColorStop( 0.5, 'rgba(255,255,255,0.5)' );
    gradient.addColorStop( 0.9, 'rgba(160,160,160,0.3)' );
    gradient.addColorStop( 1.0, 'rgba(  0,  0,  0,0.1)' );
    // fill the rectangle
    context.fillStyle	= gradient;
    context.fillRect(0,0, canvas.width, canvas.height);
    // return the just built canvas 
    return canvas;	
}

export class RaysGroup extends THREE.Group{
    constructor(){
        super();
        this._identity = 1000;
        this._intersectobjects = []
    }
    addintersectobjects(intersectobjects){
        for(var object of intersectobjects){
            this._intersectobjects.push(object);
        }
    }
    addLaser(color,startobject,endobject){
        this.add(new LaserBeam(color,startobject,endobject,this._identity));
        this._identity += 1;
    }
    deleteconnectedLaser(connectobject){
        const lasertodispose = [];
        for(var laser of this.children){
            if(laser.startobject.identity === connectobject.identity || laser.endobject.identity === connectobject.identity){
                lasertodispose.push(laser);
            }
        }
        for (var laser of lasertodispose){
            this.remove(laser);
            laser.delete();
        }
    }
    deletestartingLaser(startobject){
        const lasertodispose = [];
        for(var laser of this.children){
            if(laser.startobject.identity === startobject.identity){
                lasertodispose.push(laser);
            }
        }
        for (var laser of lasertodispose){
            this.remove(laser);
            laser.delete();
        }
    }
    update(){
        for(var laser of this.children){
            const intersectobjects = [];
            for(var object of this._intersectobjects){
                intersectobjects.push(object);
            }
            for(var new_laser of this.children){
                if(new_laser.startobject.identity!=laser.startobject.identity &&            //Only intersect lasers that do not have common endpoints
                    new_laser.endobject.identity!=laser.startobject.identity && 
                    new_laser.startobject.identity!=laser.endobject.identity && 
                    new_laser.endobject.identity!=laser.endobject.identity){
                    intersectobjects.push(new_laser);
                }
            }
            // for(var new_laser of this.children){
            //     if(new_laser.color!=laser.color){
            //         intersectobjects.push(new_laser);
            //     }
            // }
            laser.intersect(intersectobjects)
        }
    }
}

export class Dash extends Line2{
    constructor(startobject,endobject){
        const pos = computepositions(startobject,endobject);
        const startposition = pos[0];
        const endposition = pos[1];
        const points = [startposition.x,startposition.y,startposition.z,endposition.x,endposition.y,endposition.z];
        const geometry =  new LineGeometry();
        geometry.setPositions(points);
        const material = new LineMaterial({color:0xffffff, dashed:true, dashSize:0.25, gapSize:0.25});
        super(geometry,material);
        this.computeLineDistances();
        this.startobject = startobject;
        this.endobject = endobject;
        this._startposition = startposition;
        this._endposition = endposition;
    }
    update(){
        const pos = computepositions(this.startobject,this.endobject);
        const startposition = pos[0];
        const endposition = pos[1];
        const points = [this._startposition.x,this._startposition.y,this._startposition.z,this._endposition.x,this._endposition.y,this._endposition.z];
        this.geometry.setPositions(points);
        this.computeLineDistances();
        this._startposition = startposition;
        this._endposition = endposition;
    }
}

export class DashesGroup extends THREE.Group{
    constructor(){
        super();
    }
    update(){
        for(var line of this.children){
            line.update();
        }
    }
    clear(){
        const toremove = [];
        for(var line of this.children){
            line.geometry.dispose();
            line.material.dispose();
            toremove.push(line);
        }
        for(var line of toremove){
            this.remove(line);
        }
    }
    addline(startobject,endobject){
        const dash = new Dash(startobject,endobject);
        this.add(dash);
    }
    deleteline(startobject,endobject){
        for(var line of this.children){
            if(line.startobject.identity===startobject.identity && line.endobject.identity===endobject.identity){
                line.geometry.dispose();
                line.material.dispose();
                this.remove(line);
                break;
            }
        }
    }
}