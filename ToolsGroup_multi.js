import {
	Group,
	Raycaster,
	Vector2,
    Vector3,
    Object3D,
    StaticCopyUsage
} from 'three';

const _pointer = new Vector2();
const _event = { type: '', data: _pointer, targetobject: null};

class ToolsGroupMP extends Group {
    constructor(player1, player2, scene, world, renderer) {
        super();
        // this._attached = [];
        this.currentObject = null;
        this.cnt = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.scene = scene;
        this.world = world;
        this.renderer = renderer;
        // console.log(this.scene);
    }

    add(object) {
        super.add(object);
        object.setId(this.cnt);
        this.cnt += 1;
    }

    addToWorld() {
        for(var i=0; i<this.children.length; i++) {
            // console.log(i);
            this.children[i].addToWorld(this.world);
        }
    }

    addToScene() {
        this.scene.add(this);
    }

    sync() {
        for(var i=0; i<this.children.length; i++) {
            this.children[i].sync();
            // console.log("======================");
            // console.log(this.children[i].position);
            // console.log(this.children[i].body.position);
        }
    }

    onClickEvent() {
        const scope = this;
        const camera = scope.player1.camera;
        const renderer = scope.renderer;
        const raycaster = new Raycaster();
        const reach = this.player.reach;
        raycaster.layers.enable(1);

        const element = renderer.domElement;

        const rect = renderer.domElement.getBoundingClientRect();

        // _pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1;
        // _pointer.y = - ( event.clientY - rect.top ) / rect.height * 2 + 1;
        _pointer.x = 0;
        _pointer.y = 0;
        raycaster.setFromCamera( _pointer, camera );

        const intersects = raycaster.intersectObjects( scope.children, false );
        var is_holding_connector = false;
        var has_intersection = false;
        if(scope.player1.attached.length > 0 && scope.player1.attached[0].use === 'connect') {
            is_holding_connector = true;
        }
        var intersection = null;
        if(intersects.length > 0) {
            has_intersection = true;
            intersection = intersects[ 0 ];
            if(is_holding_connector && intersection.object.identity === scope.player.attached[0].identity) {
                if(intersects.length > 1) {
                    intersection = intersects[ 1 ];
                }
                else {
                    has_intersection = false;
                    intersection = null;
                }
            }
        }

        
        if(has_intersection && intersection.distance < reach && intersection.object.click.includes('pick') && scope.player.attached.length === 0){
            console.log('pick object')
            const object = intersection.object;
            const uv = intersection.uv;
            // scope._attached.push(object);
            console.log(object.parent);
            // scope.remove( object );
            object.matrixWorld.decompose( object.position, object.quaternion, object.scale );
            // camera.add( object );
            scope.player.add_obj(object);
            object.removeFromWorld();
            console.log(object.parent);
            // let _event = new Event('pick');    
            // _event.data.set( uv.x, 1 - uv.y );
            // object.dispatchEvent(_event);
            object.onPick();
            scope.player.update_animation_idx(-1);
        }
        else if(has_intersection && intersection.distance < reach && intersection.object.click.includes('win') &&  scope.player.attached.length === 0){
            console.log('reach goal')
            const object = intersection.object;
            const uv = intersection.uv;
            // let _event = new Event('reach');    
            // _event.data.set( uv.x, 1 - uv.y );
            // object.dispatchEvent(_event);
            object.onReach();
        }
        else if(has_intersection && intersection.object.click.includes('connect') && is_holding_connector){
            console.log('connect');
            console.log(intersection.object);
            const connectobject =  scope.player.attached[0];
            if(intersection.object.identity!=connectobject.identity){
                // _event.targetobject = intersection.object;
                // connectobject.dispatchEvent(_event);
                console.log('onConnect', intersection.object);
                connectobject.onConnect(intersection.object);
                if(intersection.object.use==='connect'){
                    // _event.targetobject = connectobject;
                    // _event.type = 'connect';
                    // intersection.object.dispatchEvent(_event);
                    intersection.object.onConnect(connectobject);
                }
            }
        }
        else {
            if  (scope.player.attached.length > 0) {
                if((!has_intersection) || intersection.object == scope.player.attached[0] || intersection.object == scope.player || intersection.distance > scope.player.attached_distance) {
                    if(scope.player.test_intersection(0) === false) {
                        console.log('place object');
                        const object = scope.player.attached[0];
                        console.log(object.parent);
                        // camera.remove( object );
                        scope.player.remove_obj(object);
                        object.addToWorld();
                        object.matrixWorld.decompose( object.position, object.quaternion, object.scale );
                        // scope.attach(object);
                        object.onPlace();
                        // object.dispatchEvent(_event);
                        scope.player.update_animation_idx(-2);
                    }
                }
            }
        }
    }

    onPointerEvent() {
        const scope = this;
        const camera = scope.player.camera;
        const renderer = scope.renderer;
        const raycaster = new Raycaster();
        const reach = this.player.reach;
        raycaster.layers.enable(1);

        const element = renderer.domElement;

        const rect = renderer.domElement.getBoundingClientRect();
        
        // _pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1;
        // _pointer.y = - ( event.clientY - rect.top ) / rect.height * 2 + 1;
        _pointer.x = 0;
        _pointer.y = 0;
        raycaster.setFromCamera( _pointer, camera );

        const intersects = raycaster.intersectObjects( scope.children, false );
        var is_holding_connector = false;
        var has_intersection = false;
        if(scope.player.attached.length > 0 && scope.player.attached[0].use === 'connect') {
            is_holding_connector = true;
        }
        var intersection = null;
        if(intersects.length > 0) {
            has_intersection = true;
            intersection = intersects[ 0 ];
            if(is_holding_connector && intersection.object.identity === scope.player.attached[0].identity) {
                if(intersects.length > 1) {
                    intersection = intersects[ 1 ];
                }
                else {
                    has_intersection = false;
                    intersection = null;
                }
            }
        }
        // console.log(intersects.length);
        // console.log(is_holding_connector);
        // console.log(has_intersection);

        if ( has_intersection && intersection.distance < reach && intersection.object.click.includes('pick') && scope.player.attached.length == 0) {
            // console.log("PICKABLE");

            const object = intersection.object;
            const uv = intersection.uv;
            if ((!scope.currentObject || scope.currentObject.identity != object.identity) ){
                // _event.data.set( uv.x, 1 - uv.y );
                // object.dispatchEvent( _event );
                object.onMouseover();
                scope.currentObject = object;
                
            }
        }
        else if ( has_intersection && intersection.object.click.includes('connect') && is_holding_connector) {
            // console.log("CONNECTABLE");
            const object = intersection.object;
            const uv = intersection.uv;
            if ((!scope.currentObject || scope.currentObject.identity != object.identity)){
                // _event.data.set( uv.x, 1 - uv.y );
                // object.dispatchEvent( _event );
                object.onMouseover();
                scope.currentObject = object;
            }
        }
        else {
            // console.log("NO INTERSECTION");
            if(scope.currentObject){
                // let _event = new Event('mouseout'); 
                // scope.currentObject.dispatchEvent(_event);
                scope.currentObject.onMouseout();
                scope.currentObject = null;
            }
        }
    }

}

export { ToolsGroup };