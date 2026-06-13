import React, { useRef, useState } from 'react';

export const TiltCard = ({ children, className, style }) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const maxTilt = 8; // Деликатный наклон в 8 градусов
    
    const rotateX = ((centerY - y) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      transition: 'transform 0.05s ease, box-shadow 0.05s ease'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    });
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        ...tiltStyle,
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
};
