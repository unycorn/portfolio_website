import { useEffect, useRef } from 'react';

const GridBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    
    // Cell size (25px for dense grid)
    const cellSize = 25;
    
    // Animation function using canvas instead of DOM
    const animate = () => {
      const time = Date.now() / 2500; // Fast animation as requested
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate number of rows and columns
      const numCols = Math.ceil(canvas.width / cellSize);
      const numRows = Math.ceil(canvas.height / cellSize);
      
      // Draw grid
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          // Color calculation (purple, blue, pink range)
          const hue = 240 + (Math.sin(time + row * 0.1 + col * 0.1) * 40);
          const saturation = 70 + Math.sin(time + col * 0.1) * 20;
          const lightness = Math.max(30, Math.min(70, 
            50 + Math.sin(time + row * 0.1 + col * 0.2) * 20));
          
          ctx.fillStyle = `hsl(${hue}deg, ${saturation}%, ${lightness}%)`;
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default GridBackground;