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
            if  (scope.player.attached.length > 0){
                if(intersects.length === 0 || intersects[0].object.click.includes('none') || 
                    intersects[0].object.identity == scope.player.attached[0].identity) {
                    if(scope.player.test_intersection(0) == false) {
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
                    }
                }
            }
            else if(intersects.length>0 && intersects[0].object.click.includes('pick')){
                console.log('pick object')
                if( scope.player.attached.length == 0){
                    const object = intersects[0].object;
                    const uv = intersects[0].uv;
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
                }
            }
            else if(intersects.length>0 && intersects[0].object.click.includes('win')){
                console.log('reach goal')
                if( scope.player.attached.length == 0){
                    const object = intersects[0].object;
                    const uv = intersects[0].uv;
                    _event.type = 'reach';
                    _event.data.set( uv.x, 1 - uv.y );
                    object.dispatchEvent(_event);
                }
            }
            else if(intersects.length>0 && intersects[0].object.click.includes('connect')){
                if( scope.player.attached.length > 0 && scope.player.attached[0].use === 'connect'){
                    const connectobject =  scope.player.attached[0];
                    if(intersects[0].object.identity!=connectobject.identity){
                        console.log(intersects[0].object);
                        _event.targetobject = intersects[0].object;
                        _event.type = 'connect';
                        connectobject.dispatchEvent(_event);
                        if(intersects[0].object.use==='connect'){
                            _event.targetobject = connectobject;
                            _event.type = 'connect';
                            intersects[0].object.dispatchEvent(_event);
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

            if ( intersects.length === 0 ||  scope.player.attached.length > 0 || intersects[0].object.click.includes('none')) {
                if(scope.currentObject){
                    _event.type = 'mouseout';
                    scope.currentObject.dispatchEvent(_event);
                    scope.currentObject = null;
                }
            }

			else if ( intersects.length > 0 && intersects[0].object.click.includes('pick')) {

				const intersection = intersects[ 0 ];

				const object = intersection.object;
				const uv = intersection.uv;
                if ((!scope.currentObject || scope.currentObject.identity != object.identity) && scope.player.attached.length === 0){
                    _event.type = 'mouseover';
                    _event.data.set( uv.x, 1 - uv.y );
                    object.dispatchEvent( _event );
                    scope.currentObject = object;
                    
                }
			}
            else if ( intersects.length > 0 && intersects[0].object.click.includes('connect')) {
                const intersection = intersects[ 0 ];

				const object = intersection.object;
				const uv = intersection.uv;
                if ((!scope.currentObject || scope.currentObject.identity != object.identity) &&
                     scope.player.attached.length > 0 && scope.player.attached[0].use === 'connect'){
                    _event.type = 'mouseover';
                    _event.data.set( uv.x, 1 - uv.y );
                    object.dispatchEvent( _event );
                    scope.currentObject = object;
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