'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Splash, Projectile, Statistics } from '@/types';
import { createSplash, renderSplash } from '@/lib/splash-engine';
import { generateRandomSignal, getRandomInterval } from '@/lib/signal-simulator';
import { getColorFromIntensity } from '@/lib/color-mapper';
import { playFireSound, playSplatSound } from '@/lib/sound-manager';
import Sidebar from './Sidebar';
import Gallery from './Gallery';

export default function StressCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splashesRef = useRef<Splash[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState<Statistics>({ totalShots: 0, colorCounts: {} });
  const [lastSignal, setLastSignal] = useState<{ intensity: number; colorName: string; color: string } | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  // Redraw all splashes (persistent layer)
  const redrawSplashes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const splash of splashesRef.current) {
      renderSplash(ctx, splash);
    }
  }, []);

  // Fire a projectile
  const fire = useCallback((intensity: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colorInfo = getColorFromIntensity(intensity);
    const startX = canvas.width / 2;
    const startY = canvas.height;

    // Random target within canvas
    const margin = 60;
    const targetX = margin + Math.random() * (canvas.width - margin * 2);
    const targetY = margin + Math.random() * (canvas.height * 0.75 - margin);

    const projectile: Projectile = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      color: colorInfo.hex,
      intensity,
      targetX,
      targetY,
      progress: 0,
      active: true,
    };

    projectilesRef.current.push(projectile);

    if (soundEnabled) playFireSound();

    setLastSignal({ intensity, colorName: colorInfo.nameKo, color: colorInfo.hex });
    setStats(prev => ({
      totalShots: prev.totalShots + 1,
      colorCounts: {
        ...prev.colorCounts,
        [colorInfo.key]: (prev.colorCounts[colorInfo.key] || 0) + 1,
      },
    }));
  }, [soundEnabled]);

  // Animation loop for projectiles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const animate = () => {
      let needsRedraw = false;

      for (const proj of projectilesRef.current) {
        if (!proj.active) continue;
        proj.progress += 0.035;

        // Quadratic bezier from start to target with arc
        const t = proj.progress;
        const startX = canvas.width / 2;
        const startY = canvas.height;
        const controlX = (startX + proj.targetX) / 2 + (Math.random() - 0.5) * 50;
        const controlY = Math.min(startY, proj.targetY) - 200 - Math.random() * 100;

        const mt = 1 - t;
        proj.x = mt * mt * startX + 2 * mt * t * controlX + t * t * proj.targetX;
        proj.y = mt * mt * startY + 2 * mt * t * controlY + t * t * proj.targetY;

        if (t >= 1) {
          proj.active = false;
          const splash = createSplash(proj.targetX, proj.targetY, proj.color, proj.intensity);
          splashesRef.current.push(splash);
          if (soundEnabled) playSplatSound();
          needsRedraw = true;
        }
      }

      // Remove inactive projectiles
      projectilesRef.current = projectilesRef.current.filter(p => p.active);

      if (needsRedraw) {
        redrawSplashes();
      }

      // Draw active projectiles on top
      if (projectilesRef.current.length > 0) {
        redrawSplashes();
        const ctx = canvas.getContext('2d');
        if (ctx) {
          for (const proj of projectilesRef.current) {
            if (!proj.active) continue;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = proj.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [redrawSplashes, soundEnabled]);

  // Auto-fire timer
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const scheduleNext = () => {
      timerRef.current = setTimeout(() => {
        const signal = generateRandomSignal();
        fire(signal.intensity);
        scheduleNext();
      }, getRandomInterval());
    };

    // Fire immediately on start
    const signal = generateRandomSignal();
    fire(signal.intensity);
    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, fire]);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawSplashes();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [redrawSplashes]);

  const handleReset = () => {
    splashesRef.current = [];
    projectilesRef.current = [];
    setStats({ totalShots: 0, colorCounts: {} });
    setLastSignal(null);
    redrawSplashes();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `stress-canvas-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getCanvasDataURL = (): string => {
    return canvasRef.current?.toDataURL('image/png') || '';
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Canvas area */}
      <div className="flex-1 relative bg-white m-3 mr-0 rounded-xl shadow-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
        />
        {/* Cannon visual */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="relative">
            <div
              className="w-8 h-16 rounded-t-full mx-auto"
              style={{ background: 'linear-gradient(to bottom, #4A5568, #2D3748)' }}
            />
            <div
              className="w-14 h-6 rounded-b-lg mx-auto -mt-1"
              style={{ background: 'linear-gradient(to bottom, #2D3748, #1A202C)' }}
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isRunning={isRunning}
        onToggle={() => setIsRunning(prev => !prev)}
        onReset={handleReset}
        onDownload={handleDownload}
        onShowGallery={() => setShowGallery(true)}
        stats={stats}
        lastSignal={lastSignal}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        getCanvasDataURL={getCanvasDataURL}
      />

      {/* Gallery modal */}
      {showGallery && (
        <Gallery onClose={() => setShowGallery(false)} />
      )}
    </div>
  );
}
