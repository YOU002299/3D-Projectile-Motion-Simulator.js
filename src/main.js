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

// Grid floor setup
let gridSize = 2000;
let divisions = 200;
const gridHelper = new THREE.GridHelper(gridSize, divisions);
scene.add(grid);

// Function to update grid
function updateGrid(size, numberOfDivisions) {
    scene.remove(grid)
    grid.geometry.dispose();
    grid.material.dispose();
    grid = new THREE.GridHelper(size, numberOfDivisions,0x888888, 0x444444);

    scene.add(grid);
    gridSize = size;
    divisions = numberOfDivisions;
}
updateGrid(5000,5000);

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
}
animate();

// window resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});