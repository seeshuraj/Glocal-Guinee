export class Physics {
    constructor() {
        this.gravity = -9.8; // Antigravity (upward)
        this.damping = 0.98;
        this.objects = [];
        this.dt = 0.016; // Approx 60 FPS
    }

    addObject(mesh, initialVelocity = { x: 0, y: 0, z: 0 }) {
        const obj = {
            mesh: mesh,
            pos: mesh.position.clone(),
            oldPos: mesh.position.clone().sub(initialVelocity),
            velocity: new THREE.Vector3(initialVelocity.x, initialVelocity.y, initialVelocity.z)
        };
        this.objects.push(obj);
        return obj;
    }

    update() {
        this.objects.forEach(obj => {
            // Verlet Integration
            const tempPos = obj.pos.clone();

            // Calculate velocity from current and old position
            const vel = obj.pos.clone().sub(obj.oldPos).multiplyScalar(this.damping);

            // Apply gravity (antigravity)
            vel.y -= this.gravity * this.dt * this.dt * 100; // Multiplier to make it visible

            // Update position
            obj.pos.add(vel);
            obj.oldPos.copy(tempPos);

            // Update mesh
            obj.mesh.position.copy(obj.pos);

            // Continuous rotation
            obj.mesh.rotation.x += 0.02;
            obj.mesh.rotation.y += 0.01;

            // Remove if way out of bounds
            if (obj.pos.y > 100 || obj.pos.y < -50) {
                // We'll handle removal in the main loop or pooling
            }
        });
    }

    setGravity(value) {
        this.gravity = value;
    }
}
