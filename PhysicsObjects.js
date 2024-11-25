import * as THREE from 'three';
import * as CANNON from 'cannon-es';


export class PhysicsObject {
    constructor({body, mesh}) {
        this.body = body;
        this.mesh = mesh;
        // this.mesh.position.copy(this.body.position);
        // this.mesh.quaternion.copy(this.body.quaternion);
    }

    // Method to synchronize the mesh with the physics body
    sync() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    // Add the physics body to the world and the mesh to the scene
    addTo(world, scene) {
        world.addBody(this.body); // Add to CANNON world
        scene.add(this.mesh);     // Add to THREE scene
    }
}


export class PlayerObject extends PhysicsObject {
    constructor(position) {
        const boxSize = { x: 1, y: 2, z: 1 };
        const box_Shape = new CANNON.Box(new CANNON.Vec3(boxSize.x / 2, boxSize.y / 2, boxSize.z / 2));
        const body_player = new CANNON.Body({
            shape: box_Shape,
            mass: 10,
        })
        body_player.position.set(position.x, position.y, position.z);
        const mesh_Geo = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        const mesh_Mat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const mesh_player = new THREE.Mesh(mesh_Geo, mesh_Mat);
        
        super({
            body: body_player, 
            mesh: mesh_player
        });
        
        this.init_camera_offset = new THREE.Vector3(0, 2, -0.55);
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

        // this.mesh.position.copy(this.body.position);
        // this.mesh.quaternion.copy(this.body.quaternion);
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

        console.log()

        super.sync();
    }

    addTo(world, scene) {
        scene.add(this.camera); 
        scene.add(this.mesh);
        world.addBody(this.body);
    }
}