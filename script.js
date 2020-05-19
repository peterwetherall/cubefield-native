//Configuration values
const globals = {};
globals.pause = true;
globals.alive = true;
globals.speed = 10000;
globals.colours = [0x82A0BC, 0x8EDCE6, 0xFFFFFF];
globals.cubes = [];
globals.size = 8;
let camera;
let scene;
let renderer;
let objects = [];
globals.moveLeft = false;
globals.moveRight = false;
$(document).ready(() => {
	$("#contextCover").removeClass("red");
	$("#contextCover").click(pause);
});
//Pause
let pause = (e) => {
	if (globals.pause) {
		globals.pause = false;
		$("#cover").hide();
		$("#pause").hide();
	} else {
		globals.pause = true;
		$("#pause").show();
	}
};
//Initialisation function
function init() {
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	//Camera positioning
	camera.position.z = 20;
	camera.position.y = 30;
	//Create scene, background and fog
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xFFFFFF);
	scene.fog = new THREE.Fog(0xFFFFFF, 0, 500);
	//Controls
	document.addEventListener("keydown", e => {
		if (globals.pause === false) {
			switch (e.keyCode) {
				case 37: //Left
				case 65: //A
					globals.moveLeft = true;
					break;
				case 39: //Right
				case 68: //D
					globals.moveRight = true;
					break;
			}
		}
	}, false);
	document.addEventListener("keyup", e => {
		if (globals.pause === false) {
			switch(e.keyCode) {
				case 37: //Left
				case 65: //A
					globals.moveLeft = false;
					break;
				case 39: //Right
				case 68: //D
					globals.moveRight = false;
					break;
			}
		}
	}, false);
	//Floor
	let floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
	floorGeometry.rotateX(- Math.PI / 2);
	let floorMaterial = new THREE.MeshBasicMaterial({color: 0x8C8C8C});
	let floor = new THREE.Mesh(floorGeometry, floorMaterial);
	scene.add(floor);
	//Cubes
	for (let i = 0; i < 100; i++) {
		globals.cubes.push(new movingCube());
	}
	//Create renderer and canvas element
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	//High score saving system
	if (window.localStorage.getItem("hs")) {
		$("#hs").html(window.localStorage.getItem("hs"));
	} else {
		window.localStorage.setItem("hs", 0);
		$("#hs").html(window.localStorage.getItem("hs"));
	}
}
//Cube function (class)
function movingCube() {
	this.geometry = new THREE.BoxBufferGeometry(globals.size, globals.size, globals.size);
	this.colour = globals.colours[Math.round(Math.random() * (globals.colours.length - 1))];
	this.material = new THREE.MeshBasicMaterial({color: this.colour});
	this.eGeometry = new THREE.EdgesGeometry(this.geometry);
	this.eMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 1});
	this.edges = new THREE.LineSegments(this.eGeometry, this.eMaterial);
	this.box = new THREE.Mesh(this.geometry, this.material);
	this.box.add(this.edges);
	this.box.position.x = Math.round(((Math.random() * window.innerWidth) - (window.innerWidth / 2)) / globals.size) * globals.size;
	this.box.position.y = 10;
	this.box.position.z = Math.round(((Math.random() * -500) - 500) / globals.size) * globals.size;
	this.move = (left, right) => {
		//Move box
		this.box.position.z += globals.speed / 5000;
		if (left && right === false) {
			this.box.position.x += 2;
			if (this.box.position.x > window.innerWidth / 2) {
				this.box.position.x = -(window.innerWidth / 2);
			}
		}
		if (right && left === false) {
			this.box.position.x -= 2;
			if (this.box.position.x < -(window.innerWidth / 2)) {
				this.box.position.x = window.innerWidth / 2;
			}
		}
		//Move boxes from front to back of fog
		if (this.box.position.z > globals.size) {
			this.box.position.z = -500;
			this.box.position.x = Math.round(((Math.random() * window.innerWidth) - (window.innerWidth / 2)) / globals.size) * globals.size;
		}
		//Check for collision
		if (this.box.position.z > (-globals.size * 2) && this.box.position.z < 0) {
				let leeway = globals.size;
				if (this.box.position.x + (leeway / 2) < leeway && this.box.position.x - (leeway / 2) > -leeway) {
					$("#contextCover").addClass("red");
					globals.alive = false;
					if (parseInt(window.localStorage.getItem("hs")) < (globals.speed - 10000)) {
						window.localStorage.setItem("hs", globals.speed - 10000);
					}
					setTimeout(() => location.reload(), 200);
				}
		}
	};
	scene.add(this.box);
}
//Animation loop
function animate() {
	if (globals.alive) {
		requestAnimationFrame(animate);
	}
	renderer.render(scene, camera);
	if (globals.pause === false) {
		if (globals.moveLeft && globals.moveRight === false && camera.rotation.z < 0.2) {
			camera.rotation.z += 0.015;
		}
		if (globals.moveRight && globals.moveLeft === false && camera.rotation.z > -0.2) {
			camera.rotation.z -= 0.015;
		}
		if (globals.moveLeft === false && globals.moveRight === false) {
			if (camera.rotation.z > 0) {
				camera.rotation.z -= 0.015;
			}
			if (camera.rotation.z < 0) {
				camera.rotation.z += 0.015;
			}
		}
		for (let cube of globals.cubes) {
			//Prevents double firing of death event
			if (globals.alive) {
				cube.move(globals.moveLeft, globals.moveRight);
			}
		}
		$("#score").html(globals.speed - 10000);
		globals.speed++;
	}
}
//Detect browser resize and refresh page
window.addEventListener("resize", (e) => {
	window.location.reload();
}, false);
//Run the game
init();
animate();