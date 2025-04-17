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
    const time = Date.now() / 2500;
    
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