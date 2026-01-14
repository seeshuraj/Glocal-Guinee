import * as THREE from 'three';

export class Particles {
    constructor(scene) {
        this.scene = scene;
        this.systems = [];
    }

    createTrail(position) {
        const count = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            ));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xffd700,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
        this.systems.push({ points, velocities, life: 1.0 });
    }

    update() {
        for (let i = this.systems.length - 1; i >= 0; i--) {
            const system = this.systems[i];
            const positions = system.points.geometry.attributes.position.array;

            for (let j = 0; j < system.velocities.length; j++) {
                positions[j * 3] += system.velocities[j].x;
                positions[j * 3 + 1] += system.velocities[j].y;
                positions[j * 3 + 2] += system.velocities[j].z;
            }

            system.points.geometry.attributes.position.needsUpdate = true;
            system.life -= 0.02;
            system.points.material.opacity = system.life;

            if (system.life <= 0) {
                this.scene.remove(system.points);
                this.systems.splice(i, 1);
            }
        }
    }
}
