import * as THREE from 'three';

export class Assets {
    constructor(scene) {
        this.scene = scene;
        this.cashewGeometry = this.createCashewGeometry();
        this.cashewMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a4fff,
            roughness: 0.4,
            metalness: 0.6,
        });

        this.sesameGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        this.sesameMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.3
        });

        this.cocoaGeometry = new THREE.CapsuleGeometry(1, 2, 4, 8);
        this.cocoaMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d1f14,
            roughness: 0.8
        });
    }

    createCashewGeometry() {
        const points = [];
        for (let i = 0; i < 8; i++) {
            const rad = Math.sin(i * 0.4) * 0.8 + 0.6;
            points.push(new THREE.Vector2(rad, i * 0.4));
        }
        return new THREE.LatheGeometry(points, 20);
    }

    createCashew() {
        const cashew = new THREE.Mesh(this.cashewGeometry, this.cashewMaterial);
        cashew.castShadow = true;
        cashew.scale.set(0.5, 0.5, 0.5);
        return cashew;
    }

    createSesame() {
        const sesame = new THREE.Mesh(this.sesameGeometry, this.sesameMaterial);
        sesame.scale.set(0.1, 0.2, 0.1);
        return sesame;
    }

    createCocoa() {
        const cocoa = new THREE.Mesh(this.cocoaGeometry, this.cocoaMaterial);
        cocoa.scale.set(0.5, 0.5, 0.5);
        return cocoa;
    }

    createLandscape() {
        const geometry = new THREE.PlaneGeometry(1000, 1000);
        const material = new THREE.MeshStandardMaterial({
            color: 0x050510,
            roughness: 1
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }
}
