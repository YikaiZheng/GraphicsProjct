import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CameraControls } from './CameraControl';
import { ToolsGroup } from './ToolsGroup';
import { cube, connector, emittor, receiver, door, goal, plate, wall, fence } from './InteractiveObjects'
import {Dash, DashesGroup, RaysGroup} from './RaysGroup';
import { PhysicsObject, PlayerObject, AnimatedPhysicsObject } from './PhysicsObjects';
import { PlayerControl_KeyMouse, PlayerControl_Joystick } from './PlayerControl';
import { Boundary_1 } from './boundaries';
import React, {useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { FirstPage, Man } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { styled } from '@mui/material/styles';
const { palette } = createTheme();
const { augmentColor } = palette;
const createColor = (mainColor) => augmentColor({ color: { main: mainColor } });

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    black: createColor('#212121'),
  },
});

const Input = styled(MuiInput)`
  width: 42px;
`;

function InputSlider(props) {
    const handleSliderChange = (event, newValue) => {
        const realnewValue = props.min + newValue / 100 * (props.max-props.min)
      props.onChange(realnewValue);
    };
  
    const handleInputChange = (event) => {
      props.onChange(event.target.value === '' ? props.min : Number(event.target.value));
    };
  
    const handleBlur = () => {
      const value = props.value < props.min ? props.min : (props.value > props.max ? props.max : props.value);
      props.onChange(value);
    };
  
    return (
      <Box sx={{ width: 350 }}>
        <Typography id="input-slider" gutterBottom>
          {props.title}
        </Typography>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid item xs>
            <Slider
              value={typeof props.value === 'number' ? (props.value-props.min) / (props.max-props.min) * 100 : 0}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
            />
          </Grid>
          <Grid item>
            <Input
              value={props.value}
              size="small"
              onChange={handleInputChange}
              onBlur={handleBlur}
              inputProps={{
                step: props.step,
                min: props.min,
                max: props.max,
                type: 'number',
                'aria-labelledby': 'input-slider',
              }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
  

class Running {
    constructor() {
        this.manualOpen = true;
        this.isinLevel = false;
        this.isPaused = false;
        this.isMouseLocked = false;
    }
}

var running_global = new Running();

export default function Level1(){
    const [loading,setLoading] = useState(true);
    const navigate = useNavigate();
    const [restart,setRestart] = useState(0);
    const [paused, setPaused] = useState(false);
    const [conf, setConf] = useState(null);
    const [settingOpen, setSettingOpen] = useState(false);
    const [passed, setPassed] = useState(false);
    const [manualOpen, setManualOpen] = useState(true);
    const [settings, setSettings] = useState({fov:75,bgmVolume:0.5,soundVolume:0.9})
    
    running_global.isPaused = paused;
    // const ref = useRef(null);
    useEffect(()=>{
        if(window.location.pathname == '/level1'){
        setLoading(true);
        async function ready(){
            await init(running_global).then((ret=>setConf(ret)));
            console.log('set loading to false')
            setLoading(false);
        };
        ready();
        document.addEventListener('pass',event=>{setPaused(true);setPassed(true)})
    }
    },[navigate,restart])

    const destroy = (conf)=>{
        conf['bgm'].stop();
        // conf['control'].disconnect();
        // conf['tools'].disconnect(conf['renderer'].domElement);
        disposeObjectTree(conf['scene']);
        let gl = conf['renderer'].domElement.getContext("webgl");
        gl && gl.getExtension("WEBGL_lose_context").loseContext();
        conf['renderer'].dispose();
        conf['renderer'].forceContextLoss();
        conf['renderer'].domElement = null;
        conf['renderer'].content = null;
        conf['scene'].clear();
        conf['scene'] = null;
        conf['renderer'] = null;
    }

    const handleRestart = ()=>{
        destroy(conf);
        setConf(null);
        const element = document.getElementById("level1");
        element.remove();
        setRestart(restart+1);
        setPaused(false);

    }

    const handleBackToMenu =()=>{
        running_global.isinLevel = false;
        destroy(conf);
        const element = document.getElementById("level1");
        element.remove();
        setConf(null);
        navigate('/');
        setPaused(false);
    }

    const handleNext =()=>{
        running_global.isinLevel = false;
        destroy(conf);
        const element = document.getElementById("level1");
        element.remove();
        setConf(null);
        navigate('/level2');
        setPassed(false);
    }

    const handleSliderChange = (sliderName, value) => {
        setSettings({
          ...settings,
          [sliderName]: value,
        });
    };

    const handleSettingsSubmit = () => {
        conf.camera.fov = settings.fov;
        conf.camera.updateProjectionMatrix();
        conf.bgm.setVolume(settings.bgmVolume);
        for(const sound of conf.sounds){
            sound.setVolume(settings.soundVolume);
        }
        setSettingOpen(false);
    }

    return(
        <ThemeProvider theme={darkTheme}>
        <div className ="container" id='content'>
        <div id="cross">
            <div className="horizontal"></div>
            <div className="vertical"></div>
        </div>
                {loading && <div className="box stack-top">
                        <CssBaseline />
                        <Stack sx={{ width: '100%', height:'100%', color: 'grey.500' }} spacing={2}>
                            <img src = {'/level1cover.png'} className= "cover"/>
                            <LinearProgress color="inherit" />
                        </Stack>
                </div>}
                <AppBar position="absolute" color='black' sx={{zIndex:6 ,height:'40px'}}>
            `        <Toolbar sx={{height:'40px' ,mt:-4}}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick = {()=>setPaused(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        第一关 交汇
                    </Typography>
                    </Toolbar>
                </AppBar>`
                {/* <canvas className="box" id="level1"></canvas> */}
        </div>
        {!loading && <Dialog open={manualOpen} onClose={()=>{return;}} maxWidth='500px' maxHeight='500px'>
            <Box sx={{ m: 2 }}>
            <Typography style={{ wordWrap: "break-word" }}>
                你好，旅行者。欢迎来到这个世界。
            </Typography>
            <Typography style={{ wordWrap: "break-word" }}>
            数万年前，各个文明的人类都有着神明为他们带来火焰的传说。但火焰本就不是神明的礼物，也终有熄灭的时刻。
            </Typography>
            <Typography style={{ wordWrap: "break-word" }}>
            幸而，人类在这片大地上播撒了新文明的火种，有一天，或许火焰会重新燃起。
            </Typography>
            <Typography style={{ wordWrap: "break-word" }}>
                出发吧，旅行者，用前人给你的智慧与勇气，还有你自己的努力，去点燃新文明的圣火。
            </Typography>
            <Typography style={{ wordWrap: "break-word" }}>
                ---   
            </Typography>
            <Typography style={{ wordWrap: "break-word" }}>
                按WASD移动
            </Typography>
            <Typography style={{ wordWrap: "break-word" }}>
                按空格键跳跃
            </Typography>
            <Typography style={{ wordWrap: "break-word" }}>
                鼠标左键与物品交互
            </Typography>
            <Typography style={{ wordWrap: "break-word" }}>
                ---   
            </Typography>
            <Typography style={{ wordWrap: "break-word" }}>
                但记住，程序只是人类为你设定的前传，去这个世界里自由探索吧，如何写你的故事，由你决定。
            </Typography>
            </Box>
            <Button color ='inherit' variant='contained' onClick = {()=>{
                running_global.manualOpen = false;
                running_global.isinLevel = true;
                setManualOpen(false) 
            }}>启程</Button>
        </Dialog>}
        <Dialog open={paused && ! passed} onClose={()=>{
            setPaused(false);
        }}>
            <DialogTitle><Typography variant="h6" align="center">暂停</Typography></DialogTitle>
            <List sx={{ pt: 0 }}>
                    <ListItem>
                        <Button color ='inherit' variant='contained' onClick = {()=>setPaused(false) } style={{maxWidth: '200px', maxHeight: '50px', minWidth: '200px', minHeight: '50px'}}>返回游戏</Button>
                    </ListItem>
                    <ListItem>
                        <Button color ='inherit' variant='contained' onClick = {handleRestart} style={{maxWidth: '200px', maxHeight: '50px', minWidth: '200px', minHeight: '50px'}}>重新开始</Button>
                    </ListItem>
                    <ListItem>
                        <Button color ='inherit' variant='contained' onClick = {()=>setSettingOpen(true)} style={{maxWidth: '200px', maxHeight: '50px', minWidth: '200px', minHeight: '50px'}}>设置</Button>
                    </ListItem>
                    <ListItem>
                        <Button color ='inherit' variant='contained' onClick = {handleBackToMenu} style={{maxWidth: '200px', maxHeight: '50px', minWidth: '200px', minHeight: '50px'}}>返回主菜单</Button>
                    </ListItem>
            </List>
        </Dialog>
        <Dialog open={settingOpen} onClose={()=>setSettingOpen(false)} >
            <DialogTitle><Typography variant="h6" align="center">设置</Typography></DialogTitle>
            <List sx={{ pt: 0 }}>
                    <ListItem>
                        <InputSlider title='相机视角' value={settings.fov} onChange={(value) => handleSliderChange('fov', value)} max={120} min={30} step={5}></InputSlider>
                    </ListItem>
                    <ListItem>
                        <InputSlider title='背景音量' value={settings.bgmVolume} onChange={(value) => handleSliderChange('bgmVolume', value)} max={1} min={0} step={0.1}></InputSlider>
                    </ListItem>
                    <ListItem>
                        <InputSlider title='音效音量' value={settings.soundVolume} onChange={(value) => handleSliderChange('soundVolume', value)} max={1} min={0} step={0.1}></InputSlider>
                    </ListItem>
                    <ListItem>
                        <Button variant='contained' onClick={handleSettingsSubmit}>确定</Button>
                    </ListItem>
            </List>
        </Dialog>
        <Dialog open={passed} onClose={()=>{return;}}>
            <DialogTitle><Typography variant="h6" align="center">通关！</Typography></DialogTitle>
            <List sx={{ pt: 0 }}>
                    <ListItem>
                        <Button color ='inherit' variant='contained' onClick = {()=>{handleNext()}} style={{maxWidth: '200px', maxHeight: '50px', minWidth: '200px', minHeight: '50px'}}>下一关</Button>
                    </ListItem>
                    <ListItem>
                        <Button color ='inherit' variant='contained' onClick = {()=>{handleBackToMenu();setPassed(false)}} style={{maxWidth: '200px', maxHeight: '50px', minWidth: '200px', minHeight: '50px'}}>返回主菜单</Button>
                    </ListItem>
            </List>
        </Dialog>
        </ThemeProvider>
    )
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function init(running){
    navigator.mediaDevices.getUserMedia({ audio: true });

    var world = new CANNON.World();
    world.gravity.set(0, -10, 0); // m/s²
    const scene = new THREE.Scene();
    // const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    // camera.layers.enable(2)
    const clock = new THREE.Clock();
    console.log(window.innerWidth)
    console.log(window.innerHeight)

    const boundary_1 = new Boundary_1(world, scene);

    const starting_position = new THREE.Vector3(-4, 1.5, 0);
    var player1 = new PlayerObject(starting_position, scene, world);
    player1.addToWorld();
    player1.addToScene();
    player1.camera.layers.enable(2);
    player1.load_model();

    // const renderer = new THREE.WebGLRenderer();
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // window.addEventListener('resize', () => {
    //     renderer.setSize(window.innerWidth, window.innerHeight);
    // });
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const content = document.querySelector('#content');
    const canvas = document.createElement("canvas");              //! Change the initialization of the canvas
    canvas.setAttribute('id', 'level1');
    canvas.setAttribute('className', 'box');
    // const canvas = document.querySelector('#level1');
    content.appendChild(canvas)
    const renderer = new THREE.WebGLRenderer({canvas: canvas});
    // console.log(window.devicePixelRatio)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const gltfLoader = new GLTFLoader();
    const url = '/level1/level1.gltf'; 
    gltfLoader.load(url, (gltf) => {
        var root = gltf.scene;
        // root.castShadow = true;
        // root.receiveShadow = true;
        root.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
          });
        // scene.add(root); 
        for(var i=0; i<15; i++){
            if(i!=2){
                tools.add(new wall(scene,world,root.children[i], 2));
            }             //2 is the ground
        }
        const ground = root.children[2]
        const tower = root.children[15]
        scene.add(ground)
        scene.add(tower)
    });

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
    '/dikhololo_night.jpg',
    () => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
    });
    const listener = new THREE.AudioListener();
    player1.addSoundEffect(listener);

    {
        // 灯光
        // 方向光
        const color = 0xffcf8f
        const intensity = 3
        const light = new THREE.DirectionalLight(color, intensity);
        // console.log("light.shadow.camera.left", light.shadow.camera.left);
        // console.log("light.shadow.mapSize.width", light.shadow.mapSize.width);
        light.shadow.camera.left = -10;   // Left boundary
        light.shadow.camera.right = 10;  // Right boundary
        light.shadow.camera.top = 10;    // Top boundary
        light.shadow.camera.bottom = -10;// Bottom boundary
        light.shadow.mapSize.width = 1024;  // Increase for better quality
        light.shadow.mapSize.height = 1024;
        light.position.set(-50, 10, 0);
        light.castShadow = true;
        // light.shadow.intensity = 2;
        light.target.position.set(0, 0, 0);
        scene.add(light);

        const ambientlight = new THREE.AmbientLight(color)
        var skyLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.1);
        skyLight.position.set(0, 50, 0);
        scene.add(skyLight);
        var hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.1);
        hemiLight.position.set(0, 50, 0);
        scene.add(hemiLight);
        scene.add(ambientlight);
        // scene.add(light.target);
    }

    // camera.position.set(-4, 1.7, 0);
    // camera.lookAt(0, 0, 0);
    // camera.up.set(0, 1, 0);
    // scene.add(camera)

    // const firstPersonControl = new CameraControls(camera, renderer.domElement);
    // firstPersonControl.lookSpeed = 0.1;
    // firstPersonControl.movementSpeed = 20;
    // firstPersonControl.noFly = true;
    // firstPersonControl.lookVertical = true;
    // firstPersonControl.constraintVertical = true;
    // firstPersonControl.verticalMin = 1.0;
    // firstPersonControl.verticalMax = 2.0;

    const mixers = [];

    const dashes = new DashesGroup();
    const tools = new ToolsGroup(player1, scene, world, renderer);
    const lasers = new RaysGroup();
    var sounds = [];

    const Material1 = new CANNON.Material("Material1");
    const Material2 = new CANNON.Material("Material2");

    const connector1 = new connector(gltfLoader, dashes, lasers, scene, world, 
                    {x:2, y:0.75, z:2}, {x:0, y:0, z:0, w:1}, Material1);
    // connector1.position.set(2,0.75,2);
    const connector2 = new connector(gltfLoader, dashes, lasers, scene, world, 
                    {x:6, y:0.75, z:-2}, {x:0, y:0, z:0, w:1}, Material1);
    // connector2.position.set(6,0.75,-2);
    const cube1 = new cube(scene, world, {x:2, y:0.4, z:-6}, {x:0, y:0, z:0, w:1},gltfLoader,Material2);
    // cube1.position.set(2,0.4,-6);
    const goal0 = new goal(gltfLoader, scene, world, {x:9, y:1, z:-0.5}, {x:0, y:0, z:0, w:1});
    // goal0.position.set(9,1,-0.5);
    goal0.setAnimation().then((mixer)=>{const goalmixer = mixer; mixers.push(goalmixer);});
    sounds = sounds.concat(goal0.setAudio(listener));
    const door1 = new door(scene, world, {x:5, y:1, z:-0.5}, "z");
    const mixer1 = new THREE.AnimationMixer(door1);
    door1.setAnimation(mixer1);
    sounds = sounds.concat(door1.setAudio(listener));
    mixers.push(mixer1);
    const door2 = new door(scene, world, {x:7, y:1, z:-0.5}, "z");
    const mixer2 = new THREE.AnimationMixer(door2);
    sounds = sounds.concat(door2.setAudio(listener));
    door2.setAnimation(mixer2);
    mixers.push(mixer2);
    const door3 = new door(scene, world, {x:-0.5, y:1, z:-5}, "x");
    const mixer3 = new THREE.AnimationMixer(door3);
    sounds = sounds.concat(door3.setAudio(listener));
    door3.setAnimation(mixer3);
    mixers.push(mixer3);
    const emittor1 = new emittor(0xff3333, gltfLoader, scene, world, 
                    {x:-4.8, y:1.2, z:-2}, {x:0, y:0, z:Math.sin(-Math.PI/4), w:Math.cos(-Math.PI/4)});
    // emittor1.position.set(-4.8,1.2,-2);
    // emittor1.rotation.z = -Math.PI/2;
    const emittor2 = new emittor(0x3333ff, gltfLoader, scene, world,
                    {x:-4.8, y:1.2, z:2}, {x:0, y:0, z:Math.sin(-Math.PI/4), w:Math.cos(-Math.PI/4)});
    // emittor2.position.set(-4.8,1.2,2);
    // emittor2.rotation.z = -Math.PI/2;
    const receiver1 = new receiver(0x3333ff, gltfLoader, door1, scene, world, 
                    {x:4.8, y:1.2, z:-3}, {x:0, y:0, z:Math.sin(Math.PI/4), w:Math.cos(Math.PI/4)});
    // receiver1.position.set(4.8,1.2,-3);
    // receiver1.rotation.z = Math.PI/2;
    const receiver2 = new receiver(0xff3333, gltfLoader, door2, scene, world, 
                    {x:6.8, y:1.2, z:1.5}, {x:0, y:0, z:Math.sin(Math.PI/4), w:Math.cos(Math.PI/4)});
    // receiver2.position.set(6.8,1.2,1.5);
    // receiver2.rotation.z = Math.PI/2;
    const receiver3 = new receiver(0xff3333,gltfLoader, door3, scene, world, 
                    {x:2, y:1.2, z:-4.8}, {x:Math.sin(Math.PI/4), y:0, z:0, w:Math.cos(Math.PI/4)});
    // receiver3.position.set(2,1.2,-4.8);
    // receiver3.rotation.x = Math.PI/2;

    // const plate1 = new plate(scene,world,{x:0,y:0.5,z:0},{x:0, y:0, z:0, w:1},gltfLoader,0xff3333);
    // const mixer4 = new THREE.AnimationMixer(plate1)
    // plate1.setAnimation(mixer4,2,{x:0,y:0.5,z:0},{x:3,y:0.5,z:0})
    // mixers.push(mixer4)
    // sounds = sounds.concat(plate1.setAudio(listener));

    const contactMaterial = new CANNON.ContactMaterial(Material1, Material2, {
        friction: 2, // Adjust this value (0 is no friction, higher values increase friction)
        // restitution: 0.3, // Optional, defines the bounciness
    });

    world.addContactMaterial(contactMaterial);

    tools.add(connector1);
    // connector1.addToWorldScene(world, scene);
    tools.add(connector2);
    tools.add(cube1);
    tools.add(goal0);
    tools.add(door1);
    tools.add(door2);
    tools.add(door3);
    tools.add(emittor1);
    tools.add(emittor2);
    tools.add(receiver1);
    tools.add(receiver2);
    tools.add(receiver3);
    await sleep(3000);

    lasers.addintersectobjects(tools.children);
    // tools.listenToPointerEvents(renderer, player1.camera);
    tools.addToWorld();
    tools.addToScene();
    // scene.add(tools);
    scene.add(dashes);
    scene.add(lasers);

    // var player1_Control = new PlayerControl_Joystick(player1, world, tools);
    var player1_Control = new PlayerControl_KeyMouse(player1, world, tools, running);

    var fixedTimeStep = 1.0 / 60.0; // seconds
    var maxSubSteps = 3;

    const bgm = new THREE.Audio(listener);
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load('level1bgm.mp3', function(AudioBuffer) {
        bgm.setBuffer(AudioBuffer);
        bgm.setLoop(true);
        bgm.setVolume(0.5); 
        bgm.play();
    });

    function animate() {
        if(running.isinLevel && running.isMouseLocked && (!running.isPaused)) {
            const delta = clock.getDelta();
            // console.log("delta", delta);
            world.step(fixedTimeStep, delta, maxSubSteps);
            // firstPersonControl.update(delta);
            player1_Control.update();
            player1.sync();
            tools.sync();
            boundary_1.sync();
            dashes.update();
            lasers.update();
            goal0.update(delta);
            for(var mixer of mixers){
                mixer.update(delta);
            }
            player1.update_mixer(delta);
            // robotmixer.update(delta*2);
        }
        renderer.render( scene, player1.camera );
    }

    if ( WebGL.isWebGL2Available() ) {

        // Initiate function or other initializations here
        renderer.setAnimationLoop( animate );

    } else {

        const warning = WebGL.getWebGL2ErrorMessage();
        document.getElementById( 'container' ).appendChild( warning );
    }
    await sleep(3000);
    if(!running.manualOpen) {
        running.isinLevel = true;
    }
    return {scene:scene,renderer:renderer,control:player1_Control,tools:tools,bgm:bgm, camera:player1.camera, sounds:sounds};
}

const isRenderItem = (obj) => {
    return 'geometry' in obj && 'material' in obj
}


const disposeMaterial= (obj) =>{
    if (!isRenderItem(obj)) return

    // because obj.material can be a material or array of materials
    const materials = ([]).concat(obj.material)

    for (const material of materials) {
        material.dispose()
        if (material.map) {
            material.map.dispose();
            material.map = null;
        }
    }
}

const disposeObject = (obj, removeFromParent = true, destroyGeometry = true, destroyMaterial = true)=> {
    if (!obj) return

    if (isRenderItem(obj)) {
        if (obj.geometry && destroyGeometry) {
            obj.geometry.dispose();
            // obj.geometry.attributes = null;
        }
        if (destroyMaterial) disposeMaterial(obj)
    }

    // if (obj.isLight) {
    //     if (obj.shadow) {
    //       if (obj.shadow.map) {
    //         obj.shadow.map.dispose();
    //       }
    //       obj.shadow.camera = null; 
    //     }
    // }

    // removeFromParent &&
    //     Promise.resolve().then(() => {
    //         // if we remove children in the same tick then we can't continue traversing,
    //         // so we defer to the next microtask
    //         obj.parent && obj.parent.remove(obj)
    //     })
    obj = null;
}


const disposeObjectTree = (obj, disposeOptions={}) =>{
    obj.traverse(node => {
        disposeObject(
            node,
            disposeOptions.removeFromParent,
            disposeOptions.destroyGeometry,
            disposeOptions.destroyMaterial
        )
    })
    console.log(obj.background)
    obj.background.dispose();
    obj.background = null;
}