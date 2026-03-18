import { Splash, SplashShape, Droplet } from '@/types';
import { getIntensitySize } from './color-mapper';

let splashIdCounter = 0;

function generateSplashShape(numPoints: number): SplashShape {
  const points: { x: number; y: number }[] = [];
  const controlPoints: { cp1x: number; cp1y: number; cp2x: number; cp2y: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPoints;
    const radius = 0.6 + Math.random() * 0.4;
    // Create organic tendrils extending outward
    const tendril = Math.random() > 0.6 ? 1.2 + Math.random() * 0.6 : radius;
    points.push({
      x: Math.cos(angle) * tendril,
      y: Math.sin(angle) * tendril,
    });

    const cpAngle1 = angle + (Math.PI * 2) / numPoints * 0.3;
    const cpAngle2 = angle + (Math.PI * 2) / numPoints * 0.7;
    const cpRadius1 = 0.5 + Math.random() * 0.8;
    const cpRadius2 = 0.5 + Math.random() * 0.8;
    controlPoints.push({
      cp1x: Math.cos(cpAngle1) * cpRadius1,
      cp1y: Math.sin(cpAngle1) * cpRadius1,
      cp2x: Math.cos(cpAngle2) * cpRadius2,
      cp2y: Math.sin(cpAngle2) * cpRadius2,
    });
  }

  return { points, controlPoints };
}

function generateDroplets(count: number, baseSize: number): Droplet[] {
  const droplets: Droplet[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = baseSize * (1.2 + Math.random() * 1.5);
    droplets.push({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      radius: 1.5 + Math.random() * 4,
      angle,
      distance,
    });
  }
  return droplets;
}

export function createSplash(x: number, y: number, color: string, intensity: number): Splash {
  const baseSize = getIntensitySize(intensity, 40);
  const numPoints = 7 + Math.floor(Math.random() * 5);
  const dropletCount = 4 + Math.floor(Math.random() * 8);

  return {
    id: ++splashIdCounter,
    x,
    y,
    color,
    intensity,
    size: baseSize,
    rotation: Math.random() * Math.PI * 2,
    shape: generateSplashShape(numPoints),
    droplets: generateDroplets(dropletCount, baseSize),
  };
}

export function renderSplash(ctx: CanvasRenderingContext2D, splash: Splash) {
  ctx.save();
  ctx.translate(splash.x, splash.y);
  ctx.rotate(splash.rotation);

  // Main splash body
  const { points, controlPoints } = splash.shape;
  ctx.beginPath();
  ctx.moveTo(points[0].x * splash.size, points[0].y * splash.size);

  for (let i = 0; i < points.length; i++) {
    const next = (i + 1) % points.length;
    const cp = controlPoints[i];
    ctx.bezierCurveTo(
      cp.cp1x * splash.size,
      cp.cp1y * splash.size,
      cp.cp2x * splash.size,
      cp.cp2y * splash.size,
      points[next].x * splash.size,
      points[next].y * splash.size
    );
  }

  ctx.closePath();
  ctx.fillStyle = splash.color;
  ctx.fill();

  // Glossy highlight
  const gradient = ctx.createRadialGradient(
    -splash.size * 0.2, -splash.size * 0.2, 0,
    0, 0, splash.size * 0.8
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0.25)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Droplets
  for (const droplet of splash.droplets) {
    ctx.beginPath();
    ctx.arc(droplet.x, droplet.y, droplet.radius, 0, Math.PI * 2);
    ctx.fillStyle = splash.color;
    ctx.fill();
  }

  ctx.restore();
}
