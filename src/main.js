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

// Updated Coordinate axes setup
const axisGroup = new THREE.Group();

scene.add(axisGroup);

// Independent axis intervals (metres)

let xScale = 1;

let yScale = 1;

let zScale = 1;

// Axis line length

const axisLength = 100000;

// Create axis lines

function createAxis(start, end, color) {

    const geometry = new THREE.BufferGeometry();

    geometry.setFromPoints([

        new THREE.Vector3(...start),

        new THREE.Vector3(...end)

    ]);

    const material = new THREE.LineBasicMaterial({

        color: color

    });

    const line = new THREE.Line(geometry, material);

    axisGroup.add(line);

}

createAxis(

    [-axisLength, 0, 0],

    [axisLength, 0, 0],

    0xff3333

);

createAxis(

    [0, -axisLength, 0],

    [0, axisLength, 0],

    0x33ff33

);

createAxis(

    [0, 0, -axisLength],

    [0, 0, axisLength],

    0x3388ff

);

// Create numbered coordinate labels

function createLabel(text, color, position, size) {

    const canvas = document.createElement('canvas');

    canvas.width = 256;

    canvas.height = 128;

    const context = canvas.getContext('2d');

    context.clearRect(0, 0, 256, 128);

    context.font = 'bold 64px Arial';

    context.textAlign = 'center';

    context.textBaseline = 'middle';

    context.fillStyle = color;

    context.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({

        map: texture,

        transparent: true,

        depthTest: false

    });

    const sprite = new THREE.Sprite(material);

    sprite.position.copy(position);

    sprite.scale.set(size * 2, size, 1);

    axisGroup.add(sprite);

}

// Clear old labels and ticks, keeping axis lines

function clearAxisMarkers() {

    const removable = axisGroup.children.slice(3);

    removable.forEach(object => {

        axisGroup.remove(object);

        if (object.geometry) object.geometry.dispose();

        if (object.material) {

            if (object.material.map) {

                object.material.map.dispose();

            }

            object.material.dispose();

        }

    });

}

// Generate numbered axis markings

let lastMarkerPosition = '';

function updateAxisMarkers() {

    const centerX = Math.round(controls.target.x / xScale);

    const centerY = Math.round(controls.target.y / yScale);

    const centerZ = Math.round(controls.target.z / zScale);

    const markerPosition =

        `${centerX},${centerY},${centerZ},${xScale},${yScale},${zScale}`;

    if (markerPosition === lastMarkerPosition) return;

    lastMarkerPosition = markerPosition;

    clearAxisMarkers();

    const count = 15;

    // X AXIS

    for (let i = -count; i <= count; i++) {

        const value = (centerX + i) * xScale;

        const position = new THREE.Vector3(value, 0, 0);

        createLabel(

            value.toString(),

            '#ff4444',

            position.clone().add(new THREE.Vector3(0, 0.7, 0)),

            Math.max(0.3, xScale * 0.35)

        );

    }

    // Y AXIS

    for (let i = -count; i <= count; i++) {

        const value = (centerY + i) * yScale;

        const position = new THREE.Vector3(0, value, 0);

        createLabel(

            value.toString(),

            '#44ff44',

            position.clone().add(new THREE.Vector3(0.7, 0, 0)),

            Math.max(0.3, yScale * 0.35)

        );

    }

    // Z AXIS

    for (let i = -count; i <= count; i++) {

        const value = (centerZ + i) * zScale;

        const position = new THREE.Vector3(0, 0, value);

        createLabel(

            value.toString(),

            '#4488ff',

            position.clone().add(new THREE.Vector3(0.7, 0, 0)),

            Math.max(0.3, zScale * 0.35)

        );

    }

}

// Axes setup settings
// Open and close settings panel

const axisButton = document.getElementById('axisButton');

const axisPanel = document.getElementById('axisPanel');

axisButton.addEventListener('click', () => {

    const isOpen = axisPanel.style.display === 'block';

    axisPanel.style.display = isOpen ? 'none' : 'block';

});

// Connect slider and number input

function connectAxisControls(axis) {

    const slider = document.getElementById(axis + 'Slider');

    const input = document.getElementById(axis + 'Input');

    // Update the correct axis variable

    function updateScale(value) {

        const newValue = Number(value);

        if (!Number.isFinite(newValue) || newValue <= 0) {

            return;

        }

        if (axis === 'x') xScale = newValue;

        if (axis === 'y') yScale = newValue;

        if (axis === 'z') zScale = newValue;

        lastMarkerPosition = '';

        updateAxisMarkers();

    }

    // When slider moves

    slider.addEventListener('input', () => {

        input.value = slider.value;

        updateScale(slider.value);

    });

    // When number is typed

    input.addEventListener('input', () => {

        const value = Number(input.value);

        if (input.value === '' || !Number.isFinite(value)) {

            return;

        }

        const min = Number(input.min);

        const max = Number(input.max);

        if (value < min || value > max) {

            return;

        }

        slider.value = value;

        updateScale(value);

    });

    // When number input loses focus, restore valid range

    input.addEventListener('change', () => {

        const min = Number(input.min);

        const max = Number(input.max);

        let value = Number(input.value);

        if (!Number.isFinite(value)) value = 1;

        value = Math.max(min, Math.min(max, value));

        input.value = value;

        slider.value = value;

        updateScale(value);

    });

}

// Initialise all three axes

connectAxisControls('x');

connectAxisControls('y');

connectAxisControls('z');

updateAxisMarkers();


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
    updateAxisMarkers();
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