import React, { useEffect, useRef } from 'react';

export default function NeuralBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color system for Titanium Glass AI
    const colors = {
      ambientBlue: 'rgba(37, 99, 235, 0.035)',   // Royal Blue (#2563EB)
      ambientCyan: 'rgba(6, 182, 212, 0.025)',   // Accent Cyan (#06B6D4)
      titaniumSilver: 'rgba(209, 213, 219, 0.05)', // Titanium (#D1D5DB)
      glassHighlight: 'rgba(255, 255, 255, 0.75)',
    };

    // Luxury Floating Glass Spheres
    class GlassSphere {
      constructor() {
        this.reset();
        this.y = Math.random() * height; // initial random spread
      }

      reset() {
        this.radius = Math.random() * 60 + 35;
        this.x = Math.random() * width;
        this.y = height + this.radius + 10;
        this.vx = Math.random() * 0.25 - 0.125;
        this.vy = -(Math.random() * 0.2 + 0.1); // slow elegant float
        this.angle = Math.random() * Math.PI * 2;
        this.morphSpeed = Math.random() * 0.003 + 0.0015;
        this.opacity = Math.random() * 0.35 + 0.35; // clean and bright
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.morphSpeed;

        if (this.x < -this.radius || this.x > width + this.radius || this.y < -this.radius) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        
        // Morph effect
        const currentRadius = this.radius + Math.sin(this.angle) * 5;
        
        // 1. Soft Dynamic Shadow
        ctx.beginPath();
        ctx.arc(this.x + 5, this.y + 10, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(17, 24, 39, 0.025)`;
        ctx.fill();

        // 2. Glass Base Circle (High-end metallic titanium glow)
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          this.x - currentRadius * 0.25,
          this.y - currentRadius * 0.25,
          currentRadius * 0.05,
          this.x,
          this.y,
          currentRadius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.75})`);
        grad.addColorStop(0.3, `rgba(255, 255, 255, ${this.opacity * 0.25})`);
        grad.addColorStop(0.85, `rgba(229, 231, 235, ${this.opacity * 0.12})`); // Silver
        grad.addColorStop(1, `rgba(209, 213, 219, ${this.opacity * 0.28})`);   // Titanium border glow
        
        ctx.fillStyle = grad;
        ctx.fill();

        // 3. Titanium Metallic Border (extremely thin, glossy reflection)
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = `rgba(209, 213, 219, ${this.opacity * 0.45})`;
        ctx.stroke();

        // 4. Highlight Crescent (upper-left light reflection)
        ctx.beginPath();
        ctx.arc(
          this.x - currentRadius * 0.12,
          this.y - currentRadius * 0.12,
          currentRadius * 0.82,
          Math.PI * 1.05,
          Math.PI * 1.55
        );
        ctx.lineWidth = currentRadius * 0.06;
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.65})`;
        ctx.stroke();

        // 5. Bright highlight spot
        ctx.beginPath();
        ctx.arc(
          this.x - currentRadius * 0.45,
          this.y - currentRadius * 0.45,
          currentRadius * 0.1,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = colors.glassHighlight;
        ctx.fill();

        ctx.restore();
      }
    }

    // Soft Gradient Waves
    class SoftWave {
      constructor(yOffset, speed, color, amplitude) {
        this.yOffset = yOffset;
        this.speed = speed;
        this.color = color;
        this.amplitude = amplitude;
        this.phase = Math.random() * 100;
      }

      update() {
        this.phase += this.speed;
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = this.color;
        
        for (let x = 0; x < width; x += 15) {
          const y = this.yOffset + Math.sin(x * 0.002 + this.phase) * this.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        ctx.restore();
      }
    }

    // Floating Silver Particles
    class SilverParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.8 + 0.8;
        this.speedY = -(Math.random() * 0.15 + 0.08);
        this.speedX = Math.random() * 0.12 - 0.06;
        this.opacity = Math.random() * 0.45 + 0.15;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y < 0 || this.x < 0 || this.x > width) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(209, 213, 219, ${this.opacity * 0.5})`; // Silver
        ctx.shadowBlur = 1;
        ctx.shadowColor = '#D1D5DB';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    // Ambient lighting spots (slow drifting)
    class AmbientLight {
      constructor(color, radius, speedX, speedY) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = radius;
        this.color = color;
        this.vx = speedX;
        this.vy = speedY;
        this.angle = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += 0.001;

        if (this.x < -this.radius || this.x > width + this.radius) this.vx *= -1;
        if (this.y < -this.radius || this.y > height + this.radius) this.vy *= -1;
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        const currentRadius = this.radius + Math.sin(this.angle) * 20;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentRadius);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'rgba(248, 250, 252, 0)');
        
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }
    }

    // Setup arrays
    const ambientLights = [
      new AmbientLight(colors.ambientBlue, 480, 0.08, 0.06),
      new AmbientLight(colors.ambientCyan, 400, -0.06, 0.08),
      new AmbientLight(colors.titaniumSilver, 350, 0.05, -0.05),
    ];

    const spheres = Array.from({ length: 4 }, () => new GlassSphere());
    const waves = [
      new SoftWave(height * 0.4, 0.001, 'rgba(37, 99, 235, 0.02)', 30),
      new SoftWave(height * 0.7, -0.0008, 'rgba(209, 213, 219, 0.03)', 20),
    ];
    const particles = Array.from({ length: 12 }, () => new SilverParticle());

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      // Base background: #F8FAFC
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Ambient Lights
      ambientLights.forEach(light => {
        light.update();
        light.draw();
      });

      // 2. Draw Soft Waves
      waves.forEach(wave => {
        wave.update();
        wave.draw();
      });

      // 3. Draw Silver Particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // 4. Draw Floating Glass Spheres
      spheres.forEach(sphere => {
        sphere.update();
        sphere.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
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
        zIndex: -2,
        pointerEvents: 'none',
      }}
    />
  );
}
