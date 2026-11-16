// Default physics settings

export const DEFAULT_PHYSICS_SETTINGS = {

    gravity: 9.81,

    groundHeight: 0

};

// Create the initial simulation state

export function createSimulationState({

    speed = 10,

    elevationDeg = 45,

    azimuthDeg = 0,

    radius = 0.1

} = {}) {

    // Convert degrees to radians

    const elevation = elevationDeg * Math.PI / 180;

    const azimuth = azimuthDeg * Math.PI / 180;

    // Calculate initial velocity components

    const horizontalSpeed = speed * Math.cos(elevation);

    return {

        position: {

            x: 0,

            y: radius,

            z: 0

        },

        velocity: {

            x: horizontalSpeed * Math.cos(azimuth),

            y: speed * Math.sin(elevation),

            z: horizontalSpeed * Math.sin(azimuth)

        },

        object: {

            radius: radius

        },

        elapsedTime: 0,

        running: false,

        finished: false

    };

}

// Advance the simulation by one time step

export function stepSimulation(

    state,

    dt,

    settings = DEFAULT_PHYSICS_SETTINGS

) {

    if (!state.running || state.finished) {

        return state;

    }

    if (!Number.isFinite(dt) || dt <= 0) {

        return state;

    }

    // Keep individual steps small

    dt = Math.min(dt, 0.05);

    // Layer 1: Constant downward gravity

    const accelerationY = -settings.gravity;

    // Update velocity

    state.velocity.y += accelerationY * dt;

    // Update position

    state.position.x += state.velocity.x * dt;

    state.position.y += state.velocity.y * dt;

    state.position.z += state.velocity.z * dt;

    // Update simulation time

    state.elapsedTime += dt;

    // Basic ground collision

    const groundLevel = settings.groundHeight + state.object.radius;

    if (state.position.y <= groundLevel) {

        state.position.y = groundLevel;

        state.velocity.x = 0;

        state.velocity.y = 0;

        state.velocity.z = 0;

        state.running = false;

        state.finished = true;

    }

    return state;

}