import * as THREE from 'three'; 
console.log('THREE', THREE.REVISION);
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new 
THREE.Color(0x151515);

// Camera setup
const camera = new
THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10); 

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

document.body.style.margin = '0';

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = true; 
controls.screenSpacePanning = true;
controls.minDistance = 0.1;
controls.maxDistance = 100000;

// Keyboard controls setup 
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});
// function to move camera 
function moveCamera() {
    const speed = 0.3;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    const movement = new THREE.Vector3();

    if (keys['w']) movement.add(forward);
    if (keys['s']) movement.sub(forward);
    if (keys['a']) movement.sub(right);
    if (keys['d']) movement.add(right);
    if (keys['q']) movement.y -= 1;
    if (keys['e']) movement.y += 1;

    if (movement.lengthSq() > 0) {
        movement.normalize().multiplyScalar(speed);

        camera.position.add(movement);
        controls.target.add(movement);
    }
}

//Allow camera movement
controls.enablePan = true;
controls.screenSpacePanning = true;

// Allow unrestricted zoom
controls.minDistance = 0.1;
controls.maxDistance = 100000;

// Coordinate axes setup
const axesHelper = new THREE.AxesHelper(2000);
scene.add(axesHelper);


// Dynamic grid function
let gridRadius = 100;
let gridSpacing = 1;
let grid; 

//Create grid
function createGrid(){
    if (grid) {
        scene.remove(grid);
        grid.geometry.dispose();
        grid.material.dispose();
    }
    const divisions = Math.max(2,Math.round((gridRadius * 2) / gridSpacing));
    const actualSize = divisions * gridSpacing;
    grid = new THREE.GridHelper(actualSize, divisions, 0x777777, 0x444444);
    scene.add(grid);
}

createGrid();

//function to move grid with camera target
function updateGridPosition() {
    const spacing = gridSpacing;
    const x = Math.round(controls.target.x / spacing) * spacing;
    const z = Math.round(controls.target.z / spacing) * spacing;
    grid .position.set(x, 0, z);
}



// Lighting setup
const light = new 
THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    moveCamera();
    controls.update();
    renderer.render(scene, camera);
    updateGridPosition();
}
animate();

// window resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});