import { StressSignal } from '@/types';
import { getColorFromIntensity } from './color-mapper';

export function generateRandomSignal(): StressSignal {
  const intensity = Math.floor(Math.random() * 10) + 1;
  const colorInfo = getColorFromIntensity(intensity);
  return {
    intensity,
    color: colorInfo.hex,
    colorName: colorInfo.nameKo,
    timestamp: Date.now(),
  };
}

export function getRandomInterval(): number {
  return 2000 + Math.random() * 2000; // 2-4 seconds
}
