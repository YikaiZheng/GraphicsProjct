import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsObject } from './PhysicsObjects'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class PlayerInterface {
    constructor(player, world, toolsgroup, running, role, num_player) {
        this.world = world;
        this.player = player;
        this.toolsgroup = toolsgroup;
        // this.isMouselocked = false;
        this.running = running;
        this.role = role;
        this.num_player = num_player

    }

    movecamera(dX, dY) {
        this.player.rotate(dX, dY);
        this.toolsgroup.onPointerEvent(this.role);
    }

    click1() {
        this.toolsgroup.onClickEvent(this.role);
    }

    move(v, animation_idx) {
        v.multiplyScalar(5);
        this.player.body.velocity.x = v.x;
        this.player.body.velocity.z = v.z;
        this.player.update_animation_idx(animation_idx);
    }

    tryjump() {
        // this.player.body.velocity.y += 5;
        if(this.player.test_standing()) {
            this.player.body.velocity.y += 5;
            this.player.update_animation_idx(5);
        }
    }

}

export class PlayerControl_KeyMouse {
    constructor(player, world, toolsgroup, running, role=1, num_player=1, element) {
        this.world = world;
        this.player = player;
        this.role = role;
        this.interface = new PlayerInterface(player, world, toolsgroup, running, role, num_player);
        // Track Keyboard Input
        this.key_state = {}; // Object to store key states
        this.key_down = {}; // Object to store key states
        this.key_up = {}; // Object to store key states
        // Track Mouse Movement
        this.isMouseLeftDown = false;
        this.mouse_deltaX = 0;
        this.mouse_deltaY = 0;

        // Element to enable pointer lock (e.g., the entire document body)
        // const element = document.body;

        document.addEventListener('keydown', (event) => {
            if(this.interface.running.isMouseLocked[this.role]) {
                if((!(event.key in this.key_state)) || this.key_state[event.key] == false) {
                    this.key_state[event.key] = true; // Mark key as pressed
                    this.key_down[event.key] = true; // Mark key as pressed
                    console.log(`Key pressed: ${event.key}`);
                }
            }
        });
        document.addEventListener('keyup', (event) => {
            if(this.interface.running.isMouseLocked[this.role]) {
                if(this.key_state[event.key] == true) {
                    this.key_state[event.key] = false; // Mark key as released
                    this.key_up[event.key] = true; // Mark key as released
                    console.log(`Key released: ${event.key}`);
                }
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === element) {
                // console.log(`Mouse moved: deltaX=${event.movementX}, deltaY=${event.movementY}`);
                // Use event.movementX and event.movementY for smooth movement tracking
                if (this.interface.running.isMouseLocked[this.role]) {
                    this.mouse_deltaX += event.movementX;
                    this.mouse_deltaY += event.movementY;
                }
            }
        });
        
        // Track Mouse Clicks
        document.addEventListener('mousedown', (event) => {
            if (this.interface.running.isMouseLocked[this.role]) {
                console.log(`Mouse button pressed: ${event.button}`); 
                if (event.button == 0) {
                    this.isMouseLeftDown = true;
                    this.interface.click1();
                }
            }
        });
        document.addEventListener('mouseup', (event) => {
            if (this.interface.running.isMouseLocked[this.role]) {
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

    // cleanup() {
    //     const element = document.body;

    //     document.removeEventListener('keydown', (event) => {
    //         if(this.interface.running.isMouseLocked) {
    //             if((!(event.key in this.key_state)) || this.key_state[event.key] == false) {
    //                 this.key_state[event.key] = true; // Mark key as pressed
    //                 this.key_down[event.key] = true; // Mark key as pressed
    //                 console.log(`Key pressed: ${event.key}`);
    //             }
    //         }
    //     });
    //     document.removeEventListener('keyup', (event) => {
    //         if(this.interface.running.isMouseLocked) {
    //             if(this.key_state[event.key] == true) {
    //                 this.key_state[event.key] = false; // Mark key as released
    //                 this.key_up[event.key] = true; // Mark key as released
    //                 console.log(`Key released: ${event.key}`);
    //             }
    //         }
    //     });

    //     document.removeEventListener('mousemove', (event) => {
    //         if (document.pointerLockElement === element) {
    //             console.log(`Mouse moved: deltaX=${event.movementX}, deltaY=${event.movementY}`);
    //             // Use event.movementX and event.movementY for smooth movement tracking
    //             if (this.interface.running.isMouseLocked) {
    //                 this.mouse_deltaX += event.movementX;
    //                 this.mouse_deltaY += event.movementY;
    //             }
    //         }
    //     });
        
    //     // Track Mouse Clicks
    //     document.removeEventListener('mousedown', (event) => {
    //         if (this.interface.running.isMouseLocked[role]) {
    //             console.log(`Mouse button pressed: ${event.button}`); 
    //             if (event.button == 0) {
    //                 this.isMouseLeftDown = true;
    //                 this.interface.click1();
    //             }
    //         }
    //     });
    //     document.removeEventListener('mouseup', (event) => {
    //         if (this.interface.running.isMouseLocked[role]) {
    //             console.log(`Mouse button released: ${event.button}`);
    //             if (event.button == 0) {
    //                 this.isMouseLeftDown = false;
    //             }
    //         }
    //     });
    //     document.removeEventListener('wheel', (event) => {
    //         if (document.pointerLockElement === element) {
    //             event.preventDefault(); // Optional: Prevent page scrolling
    //             console.log(`Mouse wheel scrolled: deltaY=${event.deltaY}`);
    //         } 
    //     }, { passive: false }); // Passive must be false for preventDefault
    // }

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
    constructor(player, world, toolsgroup, running, role = 2, num_player=2, joystick_idx) {
        this.world = world;
        this.player = player;
        this.role = role;
        this.interface = new PlayerInterface(player, world, toolsgroup, running, role, num_player);
        this.stick_index = joystick_idx;        
        this.joystick = getGamepad(this.stick_index);
        this.button_size = this.joystick.buttons.length;;
        this.button_now = new Array(this.button_size).fill(false);
        this.button_up = new Array(this.button_size).fill(false);
        this.button_down = new Array(this.button_size).fill(false);
        // this.isMouselocked = false;
        // console.log(this.joystick);

    }

    update() {            
        // if (this.stick_index < 0) {
        //     console.log("Press Any Key to Recognize Joystick");
        // }
        // else {
        this.joystick = getGamepad(this.stick_index);
        const LX = this.joystick.axes[0];  // Left joystick horizontal
        const LY = this.joystick.axes[1];  // Left joystick vertical
        const RX = this.joystick.axes[2]; // Right joystick horizontal
        const RY = this.joystick.axes[3]; // Right joystick vertical

        console.log(this.button_now);
        console.log("LX", LX);
        console.log("LY", LY);
        console.log("RX", RX);
        console.log("RY", RY);

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
        const vz = direction_front.clone().multiplyScalar(-LY);
        const vx = direction_left.clone().multiplyScalar(-LX);
        v.add(vz);
        v.add(vx);
        var animation_idx = 0;
        // v.normalize();
        if(Math.abs(LY) >= Math.abs(LX)) {
            if(LY >= LX && LY > 0.01) { animation_idx = 1; }
            else if(LY < -0.01) { animation_idx = 4; }
        }
        else {
            if(LY >= LX && LX < -0.01) { animation_idx = 2; }
            else if(LX > 0.01) { animation_idx = 3; }
        }
        this.interface.move(v, animation_idx);

        if (this.button_down[0]) { 
            this.interface.tryjump();
        }

        if (this.button_down[2]) {
            this.interface.click1();
        }
        
        this.interface.movecamera(-RX * 0.05, -RY * 0.05);

        // }
    }
}

export class PlayerControl {
    constructor(player, world, toolsgroup, running, role=1, num_player=1, element) {

        this.controller_type = -1;
        this.controller = null;

        this.player = player;
        this.world = world;
        this.toolsgroup = toolsgroup;
        this.running = running;
        this.role = role;
        this.num_player = num_player;
        this.element = element;
        
        // const element = document.body;

        this.element.addEventListener('click', () => {
            console.log(this.running.isinLevel);
            console.log((!this.running.isPaused));
            console.log((!this.running.isMouseLocked[role]));
            if(this.running.isinLevel && (!this.running.isPaused) && (!this.running.isMouseLocked[role]) && (this.controller_type < 0)) {
                console.log("requestPointerLock");
                this.element.requestPointerLock();
            }
        });

        // Listen for Pointer Lock Changes
        document.addEventListener('pointerlockchange', () => {
            console.log("pointlockelement", document.pointerLockElement);
            if (document.pointerLockElement === element) {
                console.log("Pointer lock enabled, role = ", this.role);
                this.running.isMouseLocked[role] = true;
                this.controller_type = 1;
                this.controller = new PlayerControl_KeyMouse(this.player, this.world, this.toolsgroup, this.running, this.role, this.num_player, this.element);
            } else if(document.pointerLockElement === null && this.controller_type == 1) {
                console.log("Pointer lock disabled, role = ", this.role);
                this.running.isMouseLocked[role] = false;
                this.controller_type = -1;
                this.controller = null;
            }
        });

        window.addEventListener('resize', () => {
            player.camera.aspect = window.innerWidth / window.innerHeight / this.num_player;
            player.camera.updateProjectionMatrix();
        });
        
        document.addEventListener('keydown', (event) => {
            console.log("KEYDOWN", event.key);
            if(this.running.isMouseLocked[role]) {
                if(event.key === '`') {
                    // console.log("Esc Pressed!");
                    this.running.isMouseLocked[role] = false;
                    this.controller_type = -1;
                    
                    const index = this.running.UsedJoystick.indexOf(this.controller.stick_index);
                    if(index != -1) {
                        this.running.UsedJoystick.splice(this.controller.stick_index);
                    }
                    this.controller = null;
                }
            }
        });

        // window.addEventListener("gamepadconnected", (event) => {
        //         console.log("Gamepad connected:", event.gamepad);
        //         const gamepads = navigator.getGamepads();
        //         // this.button_now = [];
        //         // for(var i = 0; i < gamepads.length; ++i) {
        //         //     const gamepad_i = gamepads[i];
        //         //     const button_size = gamepad_i.buttons.length;
        //         //     this.button_now.push(new Array(button_size).fill(false));
        //         // }
        // });
    }

    find_controller() {
        if(this.controller_type < 0) {
            const gamepads = navigator.getGamepads();
            // console.log(gamepads.length);
            for(var i = 0; i < gamepads.length && this.controller_type < 0; ++i) {
                const gamepad_i = gamepads[i];
                if(gamepad_i) {
                    gamepad_i.buttons.forEach((button, index) => {
                        if(button.pressed) {
                            console.log("this.running.UsedJoystick", this.running.UsedJoystick);
                            if(!(this.running.UsedJoystick.includes(i))) {
                                this.controller_type = 2;
                                this.running.UsedJoystick.push(i);
                                this.running.isMouseLocked[this.role] = true;
                                this.controller = new PlayerControl_Joystick(this.player, this.world, this.toolsgroup, this.running, this.role, this.num_player, i);
                            }
                        }
                    });
                }
            }
        }
    }

    update() {
        if(this.controller_type > 0) {
            this.controller.update();
        }
    }
}