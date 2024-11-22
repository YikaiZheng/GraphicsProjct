var THREEx = THREEx || {}

THREEx.LaserBeam	= function(){
	var object3d	= new THREE.Object3D()
	this.object3d	= object3d
	// generate the texture
	var canvas	= generateLaserBodyCanvas()
	var texture	= new THREE.Texture( canvas )
	texture.needsUpdate	= true;
	// do the material	
	var material	= new THREE.MeshBasicMaterial({
		map		: texture,
		blending	: THREE.AdditiveBlending,
		color		: 0x4444aa,
		side		: THREE.DoubleSide,
		depthWrite	: false,
		transparent	: true
	})
	var geometry	= new THREE.PlaneGeometry(1, 0.1)
	var nPlanes	= 16;
	for(var i = 0; i < nPlanes; i++){
		var mesh	= new THREE.Mesh(geometry, material)
		mesh.position.x	= 1/2
		mesh.rotation.x	= i/nPlanes * Math.PI
		object3d.add(mesh)
	}
	return
	
	function generateLaserBodyCanvas(){
		// init canvas
		var canvas	= document.createElement( 'canvas' );
		var context	= canvas.getContext( '2d' );
		canvas.width	= 1;
		canvas.height	= 64;
		// set gradient
		var gradient	= context.createLinearGradient(0, 0, canvas.width, canvas.height);		
		gradient.addColorStop( 0  , 'rgba(  0,  0,  0,0.1)' );
		gradient.addColorStop( 0.1, 'rgba(160,160,160,0.3)' );
		gradient.addColorStop( 0.5, 'rgba(255,255,255,0.5)' );
		gradient.addColorStop( 0.9, 'rgba(160,160,160,0.3)' );
		gradient.addColorStop( 1.0, 'rgba(  0,  0,  0,0.1)' );
		// fill the rectangle
		context.fillStyle	= gradient;
		context.fillRect(0,0, canvas.width, canvas.height);
		// return the just built canvas 
		return canvas;	
	}
}

THREEx.LaserCooked	= function(laserBeam){
	// for update loop
	var updateFcts	= []
	this.update	= function(){
		updateFcts.forEach(function(updateFct){
			updateFct()	
		})
	}
	
	var object3d	= laserBeam.object3d

	// build THREE.Sprite for impact
	var textureUrl	= THREEx.LaserCooked.baseURL+'images/blue_particle.jpg';
	var texture	= new THREE.TextureLoader().load(textureUrl)	
	var material	= new THREE.SpriteMaterial({
		map		: texture,
		blending	: THREE.AdditiveBlending,
	})
	var sprite	= new THREE.Sprite(material)
	sprite.scale.x = 0.5
	sprite.scale.y = 2;

	sprite.position.x	= 1-0.01
	object3d.add(sprite)

	// add a point light
	var light	= new THREE.PointLight( 0x4444ff);
	light.intensity	= 0.5
	light.distance	= 4
	light.position.x= -0.05
	this.light	= light
	sprite.add(light)

	// to exports last intersects
	this.lastIntersects	= []

	var raycaster	= new THREE.Raycaster()
	// TODO assume object3d.position are worldPosition. works IFF attached to scene
	raycaster.ray.origin.copy(object3d.position)

	updateFcts.push(function(){
		// get laserBeam matrixWorld
		object3d.updateMatrixWorld();
		var matrixWorld	= object3d.matrixWorld.clone()
		// set the origin
		raycaster.ray.origin.setFromMatrixPosition(matrixWorld)
		// keep only the roation
		matrixWorld.setPosition(new THREE.Vector3(0,0,0))		
		// set the direction
		raycaster.ray.direction.set(1,0,0)
			.applyMatrix4( matrixWorld )
			.normalize()

		var intersects		= raycaster.intersectObjects( scene.children );
		if( intersects.length > 0 ){
			var position	= intersects[0].point
			var distance	= position.distanceTo(raycaster.ray.origin)
			object3d.scale.x	= distance
		}else{
			object3d.scale.x	= 10			
		}
		// backup last intersects
		this.lastIntersects	= intersects
	}.bind(this));
}

THREEx.LaserCooked.baseURL