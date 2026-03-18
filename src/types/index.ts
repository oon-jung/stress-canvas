export interface Splash {
  id: number;
  x: number;
  y: number;
  color: string;
  intensity: number;
  size: number;
  rotation: number;
  shape: SplashShape;
  droplets: Droplet[];
}

export interface SplashShape {
  points: { x: number; y: number }[];
  controlPoints: { cp1x: number; cp1y: number; cp2x: number; cp2y: number }[];
}

export interface Droplet {
  x: number;
  y: number;
  radius: number;
  angle: number;
  distance: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  intensity: number;
  targetX: number;
  targetY: number;
  progress: number;
  active: boolean;
}

export interface StressSignal {
  intensity: number;
  color: string;
  colorName: string;
  timestamp: number;
}

export interface Statistics {
  totalShots: number;
  colorCounts: Record<string, number>;
}

export interface GalleryItem {
  id: string;
  imageData: string;
  createdAt: number;
  stats: Statistics;
}
