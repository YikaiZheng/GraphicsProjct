import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsObject } from './PhysicsObjects'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class PlayerInterface {
    constructor(player, world, toolsgroup) {
        this.world = world;
        this.player = player;
        this.toolsgroup = toolsgroup;
        this.isMouselocked = false;

        // Element to enable pointer lock (e.g., the entire document body)
        const element = document.body;

        // Request Pointer Lock on Click
        element.addEventListener('click', () => {
            if(!this.isMouselocked) {
                element.requestPointerLock();
            }
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

        window.addEventListener('resize', () => {
            player.camera.aspect = window.innerWidth / window.innerHeight;
            player.camera.updateProjectionMatrix();
        });
    }

    movecamera(dX, dY) {
        this.player.rotate(dX, dY);
        this.toolsgroup.onPointerEvent();
    }

    click1() {
        this.toolsgroup.onClickEvent();
    }

    move(v, animation_idx) {
        v.multiplyScalar(5);
        this.player.body.velocity.x = v.x;
        this.player.body.velocity.z = v.z;
        this.player.update_animation_idx(animation_idx);
    }

    tryjump() {
        if(this.player.test_standing()) {
            this.player.body.velocity.y += 5;
            this.player.update_animation_idx(5);
        }
    }

}

export class PlayerControl_KeyMouse {
    constructor(player, world, toolsgroup) {
        this.world = world;
        this.player = player;
        this.interface = new PlayerInterface(player, world, toolsgroup);
        // Track Keyboard Input
        this.key_state = {}; // Object to store key states
        this.key_down = {}; // Object to store key states
        this.key_up = {}; // Object to store key states
        // Track Mouse Movement
        this.isMouseLeftDown = false;
        this.mouse_deltaX = 0;
        this.mouse_deltaY = 0;

        // Element to enable pointer lock (e.g., the entire document body)
        const element = document.body;

        document.addEventListener('keydown', (event) => {
            if(this.interface.isMouselocked) {
                if((!(event.key in this.key_state)) || this.key_state[event.key] == false) {
                    this.key_state[event.key] = true; // Mark key as pressed
                    this.key_down[event.key] = true; // Mark key as pressed
                    console.log(`Key pressed: ${event.key}`);
                }
            }
        });
        document.addEventListener('keyup', (event) => {
            if(this.interface.isMouselocked) {
                if(this.key_state[event.key] == true) {
                    this.key_state[event.key] = false; // Mark key as released
                    this.key_up[event.key] = true; // Mark key as released
                    console.log(`Key released: ${event.key}`);
                }
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === element) {
                console.log(`Mouse moved: deltaX=${event.movementX}, deltaY=${event.movementY}`);
                // Use event.movementX and event.movementY for smooth movement tracking
                if (this.interface.isMouselocked) {
                    this.mouse_deltaX += event.movementX;
                    this.mouse_deltaY += event.movementY;
                }
            }
        });
        
        // Track Mouse Clicks
        document.addEventListener('mousedown', (event) => {
            if (this.interface.isMouselocked) {
                console.log(`Mouse button pressed: ${event.button}`); 
                if (event.button == 0) {
                    this.isMouseLeftDown = true;
                    this.interface.click1();
                }
            }
        });
        document.addEventListener('mouseup', (event) => {
            if (this.interface.isMouselocked) {
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
        var animation_idx = 0;
        if (this.key_state['ArrowUp'] || this.key_state['w']) {
            v.add(direction_front); 
            if(animation_idx == 0) {
                animation_idx = 1;
            }
        }
        if (this.key_state['ArrowDown'] || this.key_state['s']) {
            v.sub(direction_front);
            if(animation_idx == 0) {
                animation_idx = 4;
            }
        }
        if (this.key_state['ArrowLeft'] || this.key_state['a']) {
            v.add(direction_left);
            if(animation_idx == 0) {
                animation_idx = 3;
            }
        }
        if (this.key_state['ArrowRight'] || this.key_state['d']) {
            v.sub(direction_left);
            if(animation_idx == 0) {
                animation_idx = 2;
            }
        }
        v.normalize();
        this.interface.move(v, animation_idx);


        if (this.key_down[' ']) {
            this.interface.tryjump();
        }


        this.interface.movecamera(-this.mouse_deltaX * 0.005, -this.mouse_deltaY * 0.005);
        

        this.mouse_deltaX = 0;
        this.mouse_deltaY = 0;
        this.key_up = {};
        this.key_down = {};
    }
}

function getGamepad(idx) {
    const gamepads = navigator.getGamepads();
    return gamepads[idx];
}

export class PlayerControl_Joystick {
    constructor(player, world, toolsgroup) {
        this.world = world;
        this.player = player;
        this.interface = new PlayerInterface(player, world, toolsgroup);
        this.joystick = getGamepad();
        this.stick_index = -1;
        this.button_size = 0;
        this.button_now = null;
        this.button_up = null;
        this.button_down = null;
        this.isMouselocked = false;
        // console.log(this.joystick);
        if (!this.joystick) {
            console.log("Press Any Key to Recognize Joystick");
        }
        

        window.addEventListener("gamepadconnected", (event) => {
            console.log("Gamepad connected:", event.gamepad);
            this.stick_index = event.gamepad.index;
            this.button_size = event.gamepad.buttons.length;
            this.button_now = new Array(this.button_size).fill(false);
            this.button_up = new Array(this.button_size).fill(false);
            this.button_down = new Array(this.button_size).fill(false);
        });

    }

    update() {            
        if (this.stick_index < 0) {
            console.log("Press Any Key to Recognize Joystick");
        }
        else {
            this.joystick = getGamepad(this.stick_index);
            const LX = this.joystick.axes[0];  // Left joystick horizontal
            const LY = this.joystick.axes[1];  // Left joystick vertical
            const RX = this.joystick.axes[2]; // Right joystick horizontal
            const RY = this.joystick.axes[3]; // Right joystick vertical

            // Read button states (true for pressed, false for not pressed)
            // 0:A 1:B 2:X 3:Y 4:LB 5:RB 6:LT 7:RT 8:LMenu 9:RMenu 10:Lstick 11:Rstick 12:v 13:> 14:< 16:^

            this.joystick.buttons.forEach((button, index) => {
                this.button_up[index] = false;
                this.button_down[index] = false;
                if(button.pressed) {
                    if(!this.button_now[index]) {
                        this.button_down[index] = true;
                    }
                    this.button_now[index] = true;
                }
                else {
                    if(this.button_now[index]) {
                        this.button_up[index] = true;
                    }
                    this.button_now[index] = false;
                }
            });
            const zerovec = new THREE.Vector3(0, 0, 0);
            const direction_front = this.player.facing_direction.clone();
            // console.log(direction_front);
            const direction_up = new THREE.Vector3(0, 1, 0);
            const direction_left = new THREE.Vector3(0, 1, 0);
            direction_left.cross(direction_front);
            var v = new THREE.Vector3(0, 0, 0);
            const vz = direction_front.clone().multiplyScalar(LY);
            const vx = direction_left.clone().multiplyScalar(LX);
            v.add(vz);
            v.add(vx);
            var animation_idx = 0;
            v.normalize();
            if(Math.abs(LY) >= Math.abs(LX)) {
                if(LY >= LX) { animation_idx = 1; }
                else { animation_idx = 4; }
            }
            else {
                if(LY >= LX) { animation_idx = 2; }
                else { animation_idx = 3; }
            }
            this.interface.move(v, animation_idx);

            if (this.button_down[0]) { 
                this.interface.tryjump();
            }

            if (this.button_down[2]) {
                this.interface.click1();
            }
            
            this.interface.movecamera(-LX * 0.005, -LY * 0.005);

        }
    }
}