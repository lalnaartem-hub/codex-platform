import React, { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Координаты мыши
    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Конфигурация космической пыли
    const particles = [];
    const particleCount = 75;
    
    class MicroDustParticle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 0.9 + 0.6; // Крошечный размер 0.6px - 1.5px
        this.baseSpeedX = Math.random() * 0.1 - 0.05;
        this.baseSpeedY = -(Math.random() * 0.15 + 0.05); // Дрейфуют снизу вверх
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.alpha = Math.random() * 0.18 + 0.06; // Едва заметная прозрачность
        this.friction = 0.96;
      }

      update() {
        // Сила расталкивания курсором
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const repelRadius = 130;

        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius;
          const angle = Math.atan2(dy, dx);
          // Добавляем скорость отталкивания
          this.speedX += Math.cos(angle) * force * 0.4;
          this.speedY += Math.sin(angle) * force * 0.4;
        }

        // Применяем трение
        this.speedX *= this.friction;
        this.speedY *= this.friction;

        // Возвращаем базовый дрейф
        this.speedX += this.baseSpeedX * 0.04;
        this.speedY += this.baseSpeedY * 0.04;

        this.x += this.speedX;
        this.y += this.speedY;

        // Граничные условия
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < -10) this.reset();
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new MicroDustParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Статическая сетка точек */}
      <div className="grid-bg" />
      
      {/* Canvas с живым микрокосмом */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          background: 'transparent'
        }}
      />
    </>
  );
};
