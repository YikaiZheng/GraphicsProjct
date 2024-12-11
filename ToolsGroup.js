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

class ToolsGroup extends Group {
    constructor(player, scene, world) {
        super();
        // this._attached = [];
        this.currentObject = null;
        this.cnt = 0;
        this.player = player;
        this.scene = scene;
        this.world = world;
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

    listenToPointerEvents( renderer, camera ) {

		const scope = this;
		const raycaster = new Raycaster();
        raycaster.layers.enable(1);

		const element = renderer.domElement;

        function onClickEvent( event ) {
            console.log('resolving click event');
            event.stopPropagation();

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
                        intersection = intersects[ 0 ];
                    }
                    else {
                        has_intersection = false;
                        intersection = null;
                    }
                }
            }

            
            if(has_intersection && intersection.object.click.includes('pick') && scope.player.attached.length === 0){
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
                _event.type = 'pick';

                _event.data.set( uv.x, 1 - uv.y );
                object.dispatchEvent(_event);
                scope.player.update_animation_idx(-1);
            }
            else if(has_intersection && intersection.object.click.includes('win') &&  scope.player.attached.length === 0){
                console.log('reach goal')
                const object = intersection.object;
                const uv = intersection.uv;
                _event.type = 'reach';
                _event.data.set( uv.x, 1 - uv.y );
                object.dispatchEvent(_event);
            }
            else if(has_intersection && intersection.object.click.includes('connect') && is_holding_connector){
                const connectobject =  scope.player.attached[0];
                if(intersection.object.identity!=connectobject.identity){
                    console.log(intersection.object);
                    _event.targetobject = intersection.object;
                    _event.type = 'connect';
                    connectobject.dispatchEvent(_event);
                    if(intersection.object.use==='connect'){
                        _event.targetobject = connectobject;
                        _event.type = 'connect';
                        intersection.object.dispatchEvent(_event);
                    }
                }
            }
            else {
                if  (scope.player.attached.length > 0) {
                    if((!has_intersection) || intersection.object == scope.player.attached[0] || intersection.object == scope.player || intersection.distance > scope.player.attached_distance) {
                        if(scope.player.test_intersection(0) === false) {
                            _event.type = 'place';
                            const object = scope.player.attached[0];
                            console.log(object.parent);
                            // camera.remove( object );
                            scope.player.remove_obj(object);
                            object.addToWorld();
                            object.matrixWorld.decompose( object.position, object.quaternion, object.scale );
                            // scope.attach(object);
                            console.log(object.parent);
                            object.dispatchEvent(_event);
                            scope.player.update_animation_idx(-2);
                        }
                    }
                }
            }
        }

		function onPointerEvent( event ) {

			event.stopPropagation();

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
                        intersection = intersects[ 0 ];
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

			if ( has_intersection && intersection.object.click.includes('pick') && scope.player.attached.length == 0) {
                // console.log("PICKABLE");

				const object = intersection.object;
				const uv = intersection.uv;
                if ((!scope.currentObject || scope.currentObject.identity != object.identity) ){
                    _event.type = 'mouseover';
                    _event.data.set( uv.x, 1 - uv.y );
                    object.dispatchEvent( _event );
                    scope.currentObject = object;
                    
                }
			}
            else if ( has_intersection && intersection.object.click.includes('connect') && is_holding_connector) {
                // console.log("CONNECTABLE");
				const object = intersection.object;
				const uv = intersection.uv;
                if ((!scope.currentObject || scope.currentObject.identity != object.identity)){
                    _event.type = 'mouseover';
                    _event.data.set( uv.x, 1 - uv.y );
                    object.dispatchEvent( _event );
                    scope.currentObject = object;
                }
            }
            else {
                // console.log("NO INTERSECTION");
                if(scope.currentObject){
                    _event.type = 'mouseout';
                    scope.currentObject.dispatchEvent(_event);
                    scope.currentObject = null;
                }
            }
		}

		// document.addEventListener( 'pointerdown', onPointerEvent );
		// document.addEventListener( 'pointerup', onPointerEvent );
		// document.addEventListener( 'pointermove', onPointerEvent );
		// document.addEventListener( 'mousedown', onPointerEvent );
		// document.addEventListener( 'mouseup', onPointerEvent );
		document.addEventListener( 'mousemove', onPointerEvent );
		document.addEventListener( 'click', onClickEvent );

	}

}

export { ToolsGroup };