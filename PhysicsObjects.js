import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export class PhysicsObject extends THREE.Mesh {
    constructor(geometry, material, body, scene, world) {
        super(geometry, material)
        this.body = body;
        this.world = world;
        this.scene = scene;
        this.receiveShadow = true;
        this.castShadow = true;
        // this.position.copy(this.body.position);
        // this.quaternion.copy(this.body.quaternion);
    }

    // Method to synchronize the mesh with the physics body
    sync() {
        this.position.copy(this.body.position);
        this.quaternion.copy(this.body.quaternion);
    }

    
    addToWorld(world) {
        this.world.addBody(this.body);
    }
    removeFromWorld(world) {
        this.world.removeBody(this.body);
    }
    addToScene(Scene) {
        this.scene.add(this);
    }
    removeFromScene(Scene) {
        this.scene.remove(this);
    }

}

export class AnimatedPhysicsObject extends PhysicsObject {
    constructor(geometry, material, body, scene, world) {
        super(geometry, material, body, scene, world);
    }
    sync() {
        this.body.position.copy(this.position);
        this.body.quaternion.copy(this.quaternion);
    }

}

  

export class PlayerObject extends PhysicsObject {
    constructor(position, scene, world, num_player = 1) {

        const boxSize = { x: 1.2, y: 1.8, z: 0.6 };
        const box_Shape = new CANNON.Box(new CANNON.Vec3(boxSize.x / 2, boxSize.y / 2, boxSize.z / 2));
        const body_player = new CANNON.Body({
            shape: box_Shape,
            mass: 10,
        })
        body_player.position.set(position.x, position.y, position.z);
        const mesh_Geo = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        const mesh_Mat = new THREE.MeshBasicMaterial({
            color: 0x0000ff,  // Set the color of the material
            opacity: 0,     // Set opacity (0 = fully transparent, 1 = fully opaque)
            transparent: true // Enable transparency
        });
        super(mesh_Geo, mesh_Mat, body_player, scene, world);
        
        this.init_camera_offset = new THREE.Vector3(0, 0.7, -0.3);
        // this.init_camera_offset = new THREE.Vector3(0, 1.2, 1.5);
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight / num_player, 0.1, 1000 );
        this.camera.position.set(position.x, position.y, position.z);
        this.camera.position.add(this.init_camera_offset);
        this.facing_direction = new THREE.Vector3(0, 0, -1);
        this.init_facing_direction = this.facing_direction.clone();
        const lookat = this.camera.position;
        lookat.add(this.init_facing_direction);
        // console.log(lookat);
        this.camera.lookAt(lookat.x, lookat.y, lookat.z);
        // this.camera.lookAt(0, 1, 7);
        this.camera.up.set(0, 1, 0);
        this.camera.rotation.order = 'YXZ';

        
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.attached = [];
        this.attached_offset = [];
        this.attached_abletoPlace = [];
        this.attached_distance = 2.5;
        this.reach = 3;
        // this.position.copy(this.body.position);
        // this.quaternion.copy(this.body.quaternion);

        this.castShadow = false;
        this.model = null;
        this.mixer = null;
        this.action = null;
        this.animation_time = 0;
        this.jumping = false;
        this.animation_idx = 0;
        this.start_frame = 0;
        this.end_frame = 31;
        this.done_load_model = false;
        this.playspeed = 2;
    }

    load_model() {
        const robotloader = new GLTFLoader();
        var robotmixer, robotaction, robotarmup;
        robotloader.load(
            '/robot/robot2.gltf',
            (gltf) => {
                robotmixer = new THREE.AnimationMixer(gltf.scene);
                this.model = gltf.scene;
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                      child.castShadow = true;
                    }
                  });
                this.scene.add(gltf.scene);
                robotarmup = robotmixer.clipAction(gltf.animations[0]);
                robotaction = robotmixer.clipAction(gltf.animations[1]);
                console.log("NUM ANIMATIONS:", gltf.animations.length);
                this.mixer = robotmixer;
                this.action_armup = robotarmup;
                this.action = robotaction;
                this.action.setLoop(THREE.LoopRepeat);
                const duration = this.action.getClip().duration;
                this.action.setDuration(duration/this.playspeed);
                this.action.play();
                this.done_load_model = true;
            },
            (xhr) => { console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}% complete`); },
            (error) => { console.error('An error occurred while loading the GLTF scene:', error); }
        );
    }

    update_mixer(delta) {
        if(this.done_load_model) {
            const tot_frame = 340;
            const fpm = 24 * this.playspeed;
            // console.log("delta0", delta);
            // if(delta*fpm > tot_frame + this.end_frame - this.start_frame) {
            //     var times = (delta*fpm/(this.end_frame - this.start_frame));
            //     times = Math.floor(times);
            //     delta -= times * ((this.end_frame - this.start_frame) / fpm);
            // }
            // console.log("delta1", delta);
            var delta_new = delta;
            this.animation_time += delta;
            // console.log("animation_time", this.animation_time*24);
            if(this.animation_time > this.end_frame/fpm) {
                if(this.jumping) {
                    this.jumping = false;
                }
                else {
                    var times = ((this.animation_time*fpm - this.end_frame)/(this.end_frame - this.start_frame));
                    times = Math.floor(times);
                    // console.log("times", times);
                    delta_new += (tot_frame - this.end_frame + this.start_frame) / fpm;
                    delta_new -= times * ((this.end_frame - this.start_frame) / fpm);
                    this.animation_time += (this.start_frame - this.end_frame) / fpm;
                    this.animation_time -= times * ((this.end_frame - this.start_frame) / fpm);
                }
            }
            // console.log("update_mixer", delta_new);
            this.mixer.update(delta_new);
        }
    }

    // idx   0:idle  1:walk  2:walk_right  3:walk_left  4:walk_back  5:jump 
    //       -1:arm_up  -2:arm_down
    update_animation_idx(idx) {
        // console.log("animation_idx", idx);
        // console.log("jumping?", this.jumping);
        if(idx == this.animation_idx) { return; }
        if(idx == -1 || idx == -2) {
            this.action_armup.stop();
            if(idx == -1) {
                this.action_armup.setEffectiveTimeScale(1);
            }
            else if(idx == -2) {
                this.action_armup.setEffectiveTimeScale(-1);
                this.action_armup.time += 0.25;
            }
            this.action_armup.setLoop(THREE.LoopOnce);
            this.action_armup.clampWhenFinished = true;
            this.action_armup.play();
        }
        else if (!this.jumping) {
            this.animation_idx = idx;
            const fpm = 24 * this.playspeed;
            const start_frame = [0, 32, 73, 113, 153, 193];
            const end_frame = [31, 72, 112, 152, 192, 200];
            this.start_frame = start_frame[idx];
            this.end_frame = end_frame[idx];
            if(this.done_load_model) {
                this.action.stop();
                this.action.play();
                this.animation_time = 0;
                if(idx == 5) {
                    this.jumping = true;
                    this.action.setLoop(THREE.LoopOnce); // Play the animation only once
                }
                else {
                    this.action.setLoop(THREE.LoopRepeat); // Play the animation only once
                }
                this.update_mixer(this.start_frame / fpm);
            }
        }
    }


    add_obj(object) {
        this.attached.push(object);
        // const facing_direction = this.facing_direction.clone();
        // facing_direction.multiplyScalar(3);
        // this.attached_offset.push(facing_direction);
        this.attached_offset.push(new THREE.Vector3(0.5, 0, -this.attached_distance));
        this.attached_abletoPlace.push(true);
    }

    remove_obj(object) {
        var idx = this.attached.indexOf(object);
        this.attached.splice(idx, 1);
        this.attached_offset.splice(idx, 1);
        this.attached_abletoPlace.splice(idx, 1);
    }
    
    test_intersection(idx) {
        const targetBody = this.attached[idx].body;
        // console.log(targetBody);
        // Compute the bounding box of the target body
        const targetAABB = new CANNON.AABB();
        targetBody.shapes[0].calculateWorldAABB(
            targetBody.position,
            targetBody.quaternion,
            targetAABB.lowerBound,
            targetAABB.upperBound
        );
        // console.log(targetBody.quaternion);
        // console.log(targetAABB.lowerBound);
        // console.log(targetAABB.upperBound);
    
        // Iterate through all other bodies in the world
        for (const otherBody of this.world.bodies) {
            if (targetBody !== otherBody) {
                // Compute the bounding box of the other body
                const otherAABB = new CANNON.AABB();
                otherBody.shapes[0].calculateWorldAABB(
                    otherBody.position,
                    otherBody.quaternion,
                    otherAABB.lowerBound,
                    otherAABB.upperBound
                );
        
                // Check if the AABBs intersect
                if (targetAABB.overlaps(otherAABB)) {
                    // console.log("Intersection detected with body:", otherBody);
                    return true; // Exit early if any intersection is found
                }
            }
        }
        
        return false; // No intersections found
    }
    
    test_standing(body) {
        // Create a ray from the body’s current position straight down (negative y-axis)
        const ray = new CANNON.Ray(new CANNON.Vec3(this.body.position.x, this.body.position.y, this.body.position.z),
        new CANNON.Vec3(this.body.position.x, this.body.position.y-1, this.body.position.z));
    
        // Cast the ray and check if it hits something
        var options = {
            skipBackfaces: true,    // Include backfaces
        };
        const hit = ray.intersectWorld(this.world, options);
        return hit;
    }

    move(dr) {
        const position = this.body.position;
        this.body.position.set(position.x + dr.x, position.y + dr.y, position.z + dr.z);
    }

    rotate(omegaY, omegaX) {
        this.camera.rotation.y += omegaY;
        this.camera.rotation.x += omegaX; 
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
        this.body.quaternion.setFromEuler(0, this.camera.rotation.y, 0, 'YXZ');
    }

    sync() {
        // console.log(this.body.velocity);
        const position = this.body.position.clone();
        const quaternion = this.body.quaternion.clone();
        // Constraint only horizontal rotation for Body
        // Extract yaw (horizontal rotation) while keeping roll and pitch zero
        const { x, y, z, w } = quaternion;
        // Yaw (Y-axis rotation)
        const yaw = Math.atan2(2 * (w * y + z * x), 1 - 2 * (y * y + z * z));
        quaternion.setFromEuler(0, yaw, 0, 'YXZ');
        this.body.quaternion.setFromEuler(0, yaw, 0, 'YXZ');

        // Camera rotation and position
        // this.camera.rotation.y = yaw;
        // Convert CANNON.Quaternion to THREE.Quaternion
        const threeQuaternion = new THREE.Quaternion(
            quaternion.x,
            quaternion.y,
            quaternion.z,
            quaternion.w
        );
        var camera_offset = this.init_camera_offset.clone();
        camera_offset.applyQuaternion(threeQuaternion);
        this.camera.position.set(position.x, position.y, position.z);
        this.camera.position.add(camera_offset);

        this.facing_direction = this.init_facing_direction.clone();
        this.facing_direction.applyQuaternion(threeQuaternion);

        for(let i=0; i<this.attached.length; i++) {
            var obj_offset = this.attached_offset[i].clone();
            obj_offset.applyQuaternion(this.camera.quaternion);
            var obj_position = new THREE.Vector3(position.x, position.y, position.z);
            obj_position.add(obj_offset);
            this.attached[i].body.position.set(obj_position.x, obj_position.y+0.5, obj_position.z);
            this.attached[i].body.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
            // console.log(this.attached[i].body.position);
            // console.log(this.attached[i].position);

        }

        super.sync();

        if(this.done_load_model) {
            this.model.position.copy(this.body.position);
            this.model.position.y -= 0.9;
            this.model.quaternion.copy(this.body.quaternion);
            let additionalRotation = new THREE.Quaternion();
            additionalRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
            this.model.quaternion.multiply(additionalRotation);
        }
    }

    addToScene() {
        super.addToScene();
        this.scene.add(this);
    }
    addSoundEffect(listener){
        this.camera.add(listener);
    }
}