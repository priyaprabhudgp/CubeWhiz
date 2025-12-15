/*/ Simple 2D Canvas Cube Animation
class RubiksCubeVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.container.clientWidth || 400;
    this.canvas.height = this.container.clientHeight || 300;
    this.canvas.style.border = '2px solid #999';
    this.canvas.style.borderRadius = '5px';
    this.canvas.style.backgroundColor = '#1a1a1a';
    this.container.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    this.isAnimating = false;
    this.rotationX = 0.5;
    this.rotationY = 0.5;
    this.moveCount = 0;
    
    this.animate();
  }
  
  drawCube() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    
    // Draw cube outline
    const size = 60;
    
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    
    // Draw a rotating wireframe cube
    this.ctx.rotate(this.rotationX);
    
    // Front face
    this.ctx.strokeRect(-size, -size, size * 2, size * 2);
    
    // Back face (offset)
    this.ctx.strokeRect(-size + 20, -size + 20, size * 2, size * 2);
    
    // Connecting lines
    this.ctx.beginPath();
    this.ctx.moveTo(-size, -size);
    this.ctx.lineTo(-size + 20, -size + 20);
    this.ctx.moveTo(size, -size);
    this.ctx.lineTo(size + 20, -size + 20);
    this.ctx.moveTo(size, size);
    this.ctx.lineTo(size + 20, size + 20);
    this.ctx.moveTo(-size, size);
    this.ctx.lineTo(-size + 20, size + 20);
    this.ctx.stroke();
    
    // Draw move counter
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Moves: ${this.moveCount}`, 0, size + 50);
    
    this.ctx.restore();
  }
  
  animate() {
    this.rotationX += 0.01;
    this.rotationY += 0.01;
    
    this.drawCube();
    requestAnimationFrame(() => this.animate());
  }
  
  playSolution(moves) {
    console.log('Playing solution animation with moves:', moves);
    this.isAnimating = true;
    
    const moveArray = moves.split(' ').filter(m => m.length > 0);
    this.moveCount = 0;
    
    moveArray.forEach((move, index) => {
      setTimeout(() => {
        this.moveCount = index + 1;
        this.rotationX += 0.3;
        this.rotationY += 0.3;
      }, index * 400);
    });
    
    setTimeout(() => {
      this.isAnimating = false;
      this.canvas.style.borderColor = '#00ff00';
    }, moveArray.length * 400);
  }
}

// Make it globally available
window.RubiksCubeVisualizer = RubiksCubeVisualizer;

*/