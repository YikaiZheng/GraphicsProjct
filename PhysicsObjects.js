import * as THREE from 'three';
import * as CANNON from 'cannon-es';


export class PhysicsObject extends THREE.Mesh {
    constructor(geometry, material, body, scene, world) {
        super(geometry, material)
        this.body = body;
        this.world = world;
        this.scene = scene;
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
    constructor(position, scene, world) {

        const boxSize = { x: 1, y: 1.7, z: 1 };
        const box_Shape = new CANNON.Box(new CANNON.Vec3(boxSize.x / 2, boxSize.y / 2, boxSize.z / 2));
        const body_player = new CANNON.Body({
            shape: box_Shape,
            mass: 10,
        })
        body_player.position.set(position.x, position.y, position.z);
        const mesh_Geo = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        const mesh_Mat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        
        super(mesh_Geo, mesh_Mat, body_player, scene, world);
        
        this.init_camera_offset = new THREE.Vector3(0, 0.8, -0.55);
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
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
        // this.position.copy(this.body.position);
        // this.quaternion.copy(this.body.quaternion);
    }

    add_obj(object) {
        this.attached.push(object);
        // const facing_direction = this.facing_direction.clone();
        // facing_direction.multiplyScalar(3);
        // this.attached_offset.push(facing_direction);
        this.attached_offset.push(new THREE.Vector3(0, 0, -3));
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
        console.log(targetBody);
        // Compute the bounding box of the target body
        const targetAABB = new CANNON.AABB();
        targetBody.shapes[0].calculateWorldAABB(
            targetBody.position,
            targetBody.quaternion,
            targetAABB.lowerBound,
            targetAABB.upperBound
        );
    
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
            console.log("Intersection detected with body:", otherBody);
            return true; // Exit early if any intersection is found
            }
        }
        }
    
        return false; // No intersections found
    }

    set_velocity(v) {
        this.body.velocity.set(v.x, v.y, v.z);
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
            this.attached[i].body.position.set(obj_position.x, obj_position.y, obj_position.z);
            this.attached[i].body.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w);
            // console.log(this.attached[i].body.position);
            // console.log(this.attached[i].position);

        }

        super.sync();
    }

    addToScene() {
        super.addToScene();
        this.scene.add(this);
    }
}