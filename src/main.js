import * as THREE from 'three';
import { ParticleSystem } from './ParticleSystem.js';
import { HandTracker } from './HandTracker.js';
import { UI } from './UI.js';

class App {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particleSystem = null;
    this.handTracker = null;
    this.ui = null;
    this.clock = new THREE.Clock();

    this.init();
    this.animate();
  }

  init() {
    // Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Camera Setup
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 15;

    // Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('app').appendChild(this.renderer.domElement);

    // Particle System
    this.particleSystem = new ParticleSystem(this.scene);

    // UI
    this.ui = new UI(this.particleSystem);

    // Hand Tracker
    const videoElement = document.getElementById('input-video');
    try {
      this.handTracker = new HandTracker(videoElement, (interactionValue) => {
        // Callback when hand tracking updates
        // interactionValue is -1 if no hand, 0..1 otherwise

        if (interactionValue === -1) {
          this.ui.setTrackingStatus("No Hand Detected");
          this.ui.updateTension(0); // Reset bar
        } else {
          this.ui.setTrackingStatus("Tracking Active");
          this.ui.updateTension(interactionValue);
        }

        // Update particle system target
        this.particleSystem.targetInteraction = interactionValue;
      });
    } catch (e) {
      console.error("HandTracker init failed:", e);
      this.ui.setTrackingStatus("Tracking Failed: " + e.message);
    }

    // Lights (Optional for particles but good for standard materials)
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    // Resize Handler
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();

    // Update Particle System
    // Mock interaction value for now (e.g., pulsing)
    // const mockInteraction = (Math.sin(time) + 1) / 2 * 0.5;
    if (this.particleSystem) {
      // Interaction smoothing is now handled inside ParticleSystem.update
      // We just pass the raw target value (which might be -1)
      const target = this.particleSystem.targetInteraction !== undefined ? this.particleSystem.targetInteraction : -1;
      this.particleSystem.update(target);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

new App();
