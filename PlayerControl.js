import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsObject } from './PhysicsObjects'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class PlayerControl {
    constructor(player) {
        this.player = player;
        // Track Keyboard Input
        this.key_state = {}; // Object to store key states
        this.key_down = {}; // Object to store key states
        this.key_up = {}; // Object to store key states
        // Track Mouse Movement
        this.isMouselocked = false;
        this.isMouseLeftDown = false;
        this.mouse_deltaX = 0;
        this.mouse_deltaY = 0;

        document.addEventListener('keydown', (event) => {
            this.key_state[event.key] = true; // Mark key as pressed
            this.key_down[event.key] = true; // Mark key as pressed
            console.log(`Key pressed: ${event.key}`);
        });
        document.addEventListener('keyup', (event) => {
            this.key_state[event.key] = false; // Mark key as released
            this.key_up[event.key] = true; // Mark key as released
            console.log(`Key released: ${event.key}`);
        });

        // Element to enable pointer lock (e.g., the entire document body)
        const element = document.body;

        // Request Pointer Lock on Click
        element.addEventListener('click', () => {
            element.requestPointerLock();
        });

        // Listen for Pointer Lock Changes
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === element) {
                console.log("Pointer lock enabled");
                this.isMouselocked = true;
            } else {
                console.log("Pointer lock disabled");
                this.isMouselocked = false;
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === element) {
                console.log(`Mouse moved: deltaX=${event.movementX}, deltaY=${event.movementY}`);
                // Use event.movementX and event.movementY for smooth movement tracking
                if (this.isMouselocked) {
                    this.mouse_deltaX += event.movementX;
                    this.mouse_deltaY += event.movementY;
                }
            }
        });
        
        // Track Mouse Clicks
        document.addEventListener('mousedown', (event) => {
            if (this.isMouselocked) {
                console.log(`Mouse button pressed: ${event.button}`); 
                if (event.button == 0) {
                    this.isMouseLeftDown = true;
                }
            }
        });
        document.addEventListener('mouseup', (event) => {
            if (this.isMouselocked) {
                console.log(`Mouse button released: ${event.button}`);
                if (event.button == 0) {
                    this.isMouseLeftDown = false;
                }
            }
        });
        document.addEventListener('wheel', (event) => {
            if (document.pointerLockElement === element) {
                event.preventDefault(); // Optional: Prevent page scrolling
                console.log(`Mouse wheel scrolled: deltaY=${event.deltaY}`);
            } 
        }, { passive: false }); // Passive must be false for preventDefault
        
        window.addEventListener('resize', () => {
            player.camera.aspect = window.innerWidth / window.innerHeight;
            player.camera.updateProjectionMatrix();
        });

    }

    update() {
        const zerovec = new THREE.Vector3(0, 0, 0);
        const direction_front = this.player.facing_direction.clone();
        // console.log(direction_front);
        const direction_up = new THREE.Vector3(0, 1, 0);
        const direction_left = new THREE.Vector3(0, 1, 0);
        direction_left.cross(direction_front);
        const speed = 0.1;
        // ugly movement
        // if (this.key_state['ArrowUp'] || this.key_state['w']) this.player.move(direction_front.multiplyScalar(speed));
        // if (this.key_state['ArrowDown'] || this.key_state['s']) this.player.move(zerovec.sub(direction_front).multiplyScalar(speed));
        // if (this.key_state['ArrowLeft'] || this.key_state['a']) this.player.move(direction_left.multiplyScalar(speed));
        // if (this.key_state['ArrowRight'] || this.key_state['d']) this.player.move(zerovec.sub(direction_left).multiplyScalar(speed));
        // beautiful movement
        var v = new THREE.Vector3(0, 0, 0);
        if (this.key_state['ArrowUp'] || this.key_state['w']) v.add(direction_front);
        if (this.key_state['ArrowDown'] || this.key_state['s']) v.sub(direction_front);
        if (this.key_state['ArrowLeft'] || this.key_state['a']) v.add(direction_left);
        if (this.key_state['ArrowRight'] || this.key_state['d']) v.sub(direction_left);
        v.normalize();
        v.multiplyScalar(5);
        // v.y = this.player.velocity.y;
        if (this.key_down[' ']) {  // and player on ground
            this.player.body.velocity.y += 5;
        }
        // console.log(v);
        this.player.body.velocity.x = v.x;
        this.player.body.velocity.z = v.z;

        this.player.rotate(-this.mouse_deltaX * 0.005, -this.mouse_deltaY * 0.005)

        this.mouse_deltaX = 0;
        this.mouse_deltaY = 0;
        this.key_up = {};
        this.key_down = {};
    }
}