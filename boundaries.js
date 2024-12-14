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

        var boxSize1 = { x: 0.3, y: 2.5, z: 10 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(-5, 1.25, 0); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);

        var boxSize1 = { x: 10, y: 2.5, z: 0.3 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(0, 1.25, 5); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);

        var boxSize1 = { x: 3, y: 2.5, z: 0.3 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(-3.5, 1.25, -5); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);


        var boxSize1 = { x: 4, y: 2.5, z: 0.3 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(3, 1.25, -5); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);

        
        var boxSize1 = { x: 0.3, y: 2.5, z: 3 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(5, 1.25, -3.5); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);


        var boxSize1 = { x: 0.3, y: 2.5, z: 4 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(5, 1.25, 3); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);

        
        var boxSize1 = { x: 0.3, y: 2.5, z: 3 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(3, 1.25, -6.5); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);
        

        var boxSize1 = { x: 0.3, y: 2.5, z: 3 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(-3, 1.25, -6.5); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);


        this.bodies.push(box1);var boxSize1 = { x: 6, y: 2.5, z: 0.3 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(0, 1.25, -8); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);


        var boxSize1 = { x: 0.3, y: 2.5, z: 5 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(10, 1.25, -0.5); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);

        
        var boxSize1 = { x: 0.3, y: 2.5, z: 1 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(7, 1.25, -2.5); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);

        
        var boxSize1 = { x: 0.3, y: 2.5, z: 1 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(7, 1.25, 1.5); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);


        
        var boxSize1 = { x: 5, y: 2.5, z: 0.3 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(7.5, 1.25, -3); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);

        
        var boxSize1 = { x: 5, y: 2.5, z: 0.3 };
        var box_Shape1 = new CANNON.Box(new CANNON.Vec3(boxSize1.x / 2, boxSize1.y / 2, boxSize1.z / 2));
        var box_Body1 = new CANNON.Body({
            shape: box_Shape1,
            mass: 0,
        })
        // console.log(box_Body.index);
        box_Body1.position.set(7.5, 1.25, 2); // Set the position
        var box_Geometry1 = new THREE.BoxGeometry(boxSize1.x, boxSize1.y, boxSize1.z);
        var box_Material1 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        var box1 = new PhysicsObject(box_Geometry1, box_Material1, box_Body1)
        // box1.addTo(world, scene);
        world.addBody(box_Body1);
        this.bodies.push(box1);
    }

    sync() {
        for(var i=0; i<this.bodies.length; ++i) {
            this.bodies[i].sync();
        }
    }
}