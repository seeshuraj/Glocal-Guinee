import * as THREE from 'three';

export class Scene {
    constructor() {
        this.container = document.getElementById('hero-canvas');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050510);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 50;
        this.camera.position.y = 20;
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        this.setupLights();
        this.onWindowResize();
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x8a4fff, 2);
        directionalLight.position.set(20, 40, 20);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        const blueLight = new THREE.PointLight(0x00d2ff, 5, 100);
        blueLight.position.set(-20, 10, 20);
        this.scene.add(blueLight);

        const pinkLight = new THREE.PointLight(0xff007a, 3, 100);
        pinkLight.position.set(20, -10, 10);
        this.scene.add(pinkLight);
    }

    addFog() {
        this.scene.fog = new THREE.FogExp2(0x050510, 0.002);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
