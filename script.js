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
    constructor(x, y, birthTime, startStrength = 1) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.speed = 4;
        this.maxRadius = Math.max(canvas.width, canvas.height) * 3.0;
        this.strength = startStrength
        this.startStrength = startStrength;
        this.birthTime = birthTime;
        this.age = (Date.now() - this.birthTime) / 1000;
    }

    update() {
        this.age = (Date.now() - this.birthTime) / 1000;
        if (this.age > 0) {
            this.radius += this.speed;
            this.strength = Math.max(0, this.startStrength - (this.age * 0.5));
        }
        return this.strength > 0;
    }

    getInfluence(x, y) {
        if (this.age <= 0) return 0;

        const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
        const waveFront = Math.abs(distance - this.radius);
        return Math.exp(-waveFront * 0.04) * this.strength;
    }
}

canvas.addEventListener('click', (e) => {
    // Get position relative to the canvas itself
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log('Click canvas pos:', x, y);

    for (let i = 0; i < 5; i++) {
        waves.push(new Wave(x, y, Date.now() + 150*i, Math.exp(0-(i/3)**2)/2));
    }
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

// Audio Setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

class Synth {
    constructor() {
        this.activeOscillators = new Map();
        this.setupEffects();
    }

    setupEffects() {
        // Create delay effect
        this.delay = audioContext.createDelay();
        this.delay.delayTime.value = 0.25;
        
        this.delayGain = audioContext.createGain();
        this.delayGain.gain.value = 0.3;
        
        this.feedback = audioContext.createGain();
        this.feedback.gain.value = 0.3;
        
        // Create main output chain
        this.mainGain = audioContext.createGain();
        this.mainGain.gain.value = 0.5;
        
        // Connect delay feedback loop
        this.delay.connect(this.feedback);
        this.feedback.connect(this.delay);
        
        // Connect main output chain
        this.mainGain.connect(audioContext.destination);
        this.mainGain.connect(this.delay);
        this.delay.connect(this.delayGain);
        this.delayGain.connect(audioContext.destination);
    }

    playNote(frequency) {
        if (audioContext.state !== 'running') {
            audioContext.resume();
        }

        if (this.activeOscillators.has(frequency)) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.005);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.mainGain);
        
        oscillator.start();
        this.activeOscillators.set(frequency, { oscillator, gainNode });
    }

    stopNote(frequency) {
        if (!this.activeOscillators.has(frequency)) return;
        
        const { oscillator, gainNode } = this.activeOscillators.get(frequency);
        const now = audioContext.currentTime;
        
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
        
        setTimeout(() => {
            oscillator.stop();
            oscillator.disconnect();
            gainNode.disconnect();
        }, 60);
        
        this.activeOscillators.delete(frequency);
    }
}

// Create synth instance
const synth = new Synth();

// Note frequencies mapping (piano keys with black keys on number row)
const noteFrequencies = {
    // White keys (bottom row)
    'a': 261.63, // C4
    's': 293.66, // D4
    'd': 329.63, // E4
    'f': 349.23, // F4
    'g': 392.00, // G4
    'h': 440.00, // A4
    'j': 493.88, // B4
    'k': 523.25, // C5
    'l': 587.33, // D5
    
    // Black keys (top number row)
    'w': 277.18, // C#4
    'e': 311.13, // D#4
    't': 369.99, // F#4
    'y': 415.30, // G#4
    'u': 466.16, // A#4
};

// Set up event listeners
document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext resumed successfully');
        });
    }
});

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (noteFrequencies[key]) {
        synth.playNote(noteFrequencies[key]);
    }
    x = Math.random() * canvas.width;
    y = Math.random() * canvas.height;
    console.log('Keyboard wave canvas pos:', x, y);
    // Create multiple waves at a random position
    for (let i = 0; i < 5; i++) {
        waves.push(new Wave(x, y, Date.now() + 150*i, Math.exp(0-(i/3)**2)/2));
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (noteFrequencies[key]) {
        synth.stopNote(noteFrequencies[key]);
    }
});

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