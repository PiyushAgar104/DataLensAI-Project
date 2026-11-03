import React, { useEffect, useState } from 'react';

export default function MouseGlow() {
  const [coords, setCoords] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: coords.x,
        top: coords.y,
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(91, 127, 255, 0.05) 0%, rgba(123, 97, 255, 0.01) 45%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
}
