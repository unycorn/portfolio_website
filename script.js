// Grid Background Animation
const canvas = document.getElementById('gridBackground');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const cellSize = 25;
let animationFrame;

function animate() {
    const speed = 5000;
    const time = Date.now() / speed;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const numCols = Math.ceil(canvas.width / cellSize);
    const numRows = Math.ceil(canvas.height / cellSize);
    
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const hue = 240 + (Math.sin(time + row * 0.1 + col * 0.1) * 40);
            const saturation = 70 + Math.sin(time + col * 0.1) * 20;
            const lightness = Math.max(30, Math.min(70, 
                50 + Math.sin(time + row * 0.1 + col * 0.2) * 20));
            
            ctx.fillStyle = `hsl(${hue}deg, ${saturation}%, ${lightness}%)`;
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }
    
    animationFrame = requestAnimationFrame(animate);
}

animate();

class HadamardMatrix {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.minOrder = 3; // Start with 8x8 matrix (2^3)
        this.maxOrder = 8; // Up to 256x256 matrix (2^8)
        this.order = this.minOrder;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.render();
    }

    resizeCanvas() {
        const containerWidth = this.canvas.parentElement.clientWidth;
        const size = Math.min(containerWidth, 512); // Max size of 512px
        this.canvas.width = size;
        this.canvas.height = size;
        this.render();
    }

    // Check if position (i,j) should be black in the Hadamard matrix
    isNegative(i, j) {
        let count = 0;
        let combined = i & j;
        while (combined > 0) {
            count += combined & 1;
            combined >>= 1;
        }
        return count % 2 !== 0;
    }

    render() {
        const size = 1 << this.order; // 2^order
        const blockSize = this.canvas.width / size;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                this.ctx.fillStyle = this.isNegative(i, j) ? '#000000' : '#FFFFFF';
                this.ctx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);
            }
        }
    }

    incrementOrder() {
        this.order = this.order >= this.maxOrder ? this.minOrder : this.order + 1;
        this.render();
    }
}

// Initialize Hadamard visualization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hadamardCanvas');
    if (canvas) {
        const matrix = new HadamardMatrix(canvas);
        canvas.addEventListener('click', () => {
            matrix.incrementOrder();
        });
    }
});

// Smooth Scrolling
document.querySelectorAll('.nav-link').forEach(button => {
    button.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-scroll-to');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});