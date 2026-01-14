import * as THREE from 'three';

export class Assets {
    constructor(scene) {
        this.scene = scene;
        this.cashewGeometry = this.createCashewGeometry();
        this.cashewMaterial = new THREE.MeshStandardMaterial({
            color: 0xc9a227,
            roughness: 0.7,
            metalness: 0.1,
            emissive: 0x221100
        });
    }

    // Procedurally create a cashew-like shape (seed + apple)
    createCashewGeometry() {
        // We'll create a composite geometry or a more specific lathe
        const points = [];
        // Bottom seed part (kidney shape)
        for (let i = 0; i < 8; i++) {
            const rad = Math.sin(i * 0.4) * 1.5 + 1.2;
            points.push(new THREE.Vector2(rad, i * 0.8));
        }
        // Top apple part
        for (let i = 8; i < 15; i++) {
            const rad = Math.cos((i - 8) * 0.4) * 3 + 1;
            points.push(new THREE.Vector2(rad, i * 1.2));
        }
        return new THREE.LatheGeometry(points, 20);
    }

    createCashew() {
        const cashew = new THREE.Mesh(this.cashewGeometry, this.cashewMaterial);
        cashew.castShadow = true;
        cashew.receiveShadow = true;
        cashew.scale.set(0.5, 0.5, 0.5);
        return cashew;
    }

    createTree(x, z) {
        // Simple low-poly tree representation
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 1, 15, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4d291a });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 7.5, z);

        const foliageGeometry = new THREE.SphereGeometry(6, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x1a472a });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, 15, z);

        this.scene.add(trunk);
        this.scene.add(foliage);
    }

    createLandscape() {
        const geometry = new THREE.PlaneGeometry(500, 500, 20, 20);
        const material = new THREE.MeshStandardMaterial({
            color: 0x050a05,
            roughness: 0.8,
            wireframe: false
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add some trees
        for (let i = 0; i < 15; i++) {
            const tx = (Math.random() - 0.5) * 200;
            const tz = (Math.random() - 0.5) * 200;
            if (Math.abs(tx) > 30 || Math.abs(tz) > 30) {
                this.createTree(tx, tz);
            }
        }
    }
}
