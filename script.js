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
let waves = [];

// Debug: Log if canvas exists
console.log('Canvas element:', canvas);

class Wave {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.speed = 2;
        this.maxRadius = Math.max(canvas.width, canvas.height) * 3.0;
        this.strength = 1;
        this.birthTime = Date.now();
    }

    update() {
        this.radius += this.speed;
        // Smoother strength decay
        const age = (Date.now() - this.birthTime) / 1000;
        this.strength = Math.max(0, 1 - (age * 0.5));
        return this.strength > 0;
    }

    getInfluence(x, y) {
        const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
        const waveFront = Math.abs(distance - this.radius);
        // Sharper wave front with higher intensity
        return Math.exp(-waveFront * 0.02) * this.strength;
    }
}

canvas.addEventListener('click', (e) => {
    // Get position relative to the canvas itself
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log('Click canvas pos:', x, y);
    waves.push(new Wave(x, y));
});

// Add pointer-events style directly to canvas
canvas.style.pointerEvents = 'auto';

// Debug: Log any existing waves
setInterval(() => {
    console.log('Current waves:', waves.length);
}, 1000);

function animate() {
    const speed = 10000;
    const time = Date.now() / speed;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const numCols = Math.ceil(canvas.width / cellSize);
    const numRows = Math.ceil(canvas.height / cellSize);
    
    // Update and filter waves
    waves = waves.filter(wave => wave.update());
    
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * cellSize + cellSize / 2;
            const y = row * cellSize + cellSize / 2;
            
            // Calculate base color
            let hue = 240 + (Math.sin(time + row * 0.1 + col * 0.1) * 40);
            let saturation = 70 + Math.sin(time + col * 0.1) * 20;
            let lightness = 50 + Math.sin(time + row * 0.1 + col * 0.2) * 20;
            
            // Apply wave effects with stronger influence
            let waveInfluence = 0;
            for (const wave of waves) {
                waveInfluence += wave.getInfluence(x, y);
            }
            
            // More dramatic color changes
            hue += waveInfluence * 120; // Doubled hue shift
            saturation = Math.min(100, saturation + waveInfluence * 50);
            lightness = Math.min(90, lightness + waveInfluence * 60);
            
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