import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsObject, PlayerObject } from './PhysicsObjects'

export class Boundary_1 {
    constructor(world, scene) {
        this.world = world;
        this.scene = scene;
        this.bodies = [];
        
        var boxSize1 = { x: 1000, y: 2, z: 1000 };
        var groundShape = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var groundBody = new CANNON.Body({
            shape: groundShape,
            mass: 0 // mass == 0 makes the body static
        });
        world.addBody(groundBody);
        // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2); // Rotate 90° around the z-axis
        groundBody.position.set(0, -1, 0); // Set the position
        const planeGeometry = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z); // Width and height of the plane
        const planeMaterial = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
        });
        const ground = new PhysicsObject(planeGeometry, planeMaterial, groundBody);
        ground.receiveShadow = true; // To cast shadows if needed
        // ground.addTo(world, scene);
        world.addBody(groundBody);
        // scene.add(ground);
        this.bodies.push(ground);
    }

    sync() {
        for(var i=0; i<this.bodies.length; ++i) {
            this.bodies[i].sync();
        }
    }
}