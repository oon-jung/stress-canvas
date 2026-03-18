export const COLOR_MAP: Record<string, { hex: string; name: string; nameKo: string }> = {
  red: { hex: '#E53E3E', name: 'Red', nameKo: '빨간색' },
  orange: { hex: '#ED8936', name: 'Orange', nameKo: '주황색' },
  yellow: { hex: '#ECC94B', name: 'Yellow', nameKo: '노란색' },
  green: { hex: '#48BB78', name: 'Green', nameKo: '초록색' },
  purple: { hex: '#9F7AEA', name: 'Purple', nameKo: '보라색' },
};

export function getColorFromIntensity(intensity: number): { hex: string; name: string; nameKo: string; key: string } {
  if (intensity <= 2) return { ...COLOR_MAP.red, key: 'red' };
  if (intensity <= 4) return { ...COLOR_MAP.orange, key: 'orange' };
  if (intensity <= 6) return { ...COLOR_MAP.yellow, key: 'yellow' };
  if (intensity <= 8) return { ...COLOR_MAP.green, key: 'green' };
  return { ...COLOR_MAP.purple, key: 'purple' };
}

export function getIntensitySize(intensity: number, baseSize: number): number {
  return baseSize * (0.5 + (intensity / 10) * 1.0);
}
