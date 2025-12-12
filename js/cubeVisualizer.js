import * as THREE from 'three';

class RubiksCubeVisualizer {
  constructor(containerId) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById(containerId).appendChild(this.renderer.domElement);
    
    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);
    this.createCube();
    this.animate();
  }
  
  createCube() {
    // Create 27 mini-cubes (3x3x3)
    const size = 1;
    const spacing = 1.1;
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geometry = new THREE.BoxGeometry(size, size, size);
          const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(x * spacing, y * spacing, z * spacing);
          this.cubeGroup.add(cube);
        }
      }
    }
  }
  
  animateMove(move) {
    // Animate a single move (e.g., 'R', 'U', 'F', etc.)
    const duration = 500; // milliseconds
    const axis = this.getMoveAxis(move);
    const angle = Math.PI / 2; // 90 degrees
    
    // Rotate the appropriate layer
    this.rotateCubeLayer(axis, angle, duration);
  }
  
  getMoveAxis(move) {
    const moveMap = {
      'R': new THREE.Vector3(1, 0, 0),
      'L': new THREE.Vector3(-1, 0, 0),
      'U': new THREE.Vector3(0, 1, 0),
      'D': new THREE.Vector3(0, -1, 0),
      'F': new THREE.Vector3(0, 0, 1),
      'B': new THREE.Vector3(0, 0, -1)
    };
    return moveMap[move[0]];
  }
  
  rotateCubeLayer(axis, angle, duration) {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentAngle = angle * progress;
      
      // Apply rotation to the layer
      this.cubeGroup.rotateOnWorldAxis(axis, currentAngle);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
  
  playSolution(moves) {
    const moveArray = moves.split(' ');
    let delay = 0;
    
    moveArray.forEach(move => {
      setTimeout(() => {
        this.animateMove(move);
      }, delay);
      delay += 600; // Wait for animation + buffer
    });
  }
}

export default RubiksCubeVisualizer;