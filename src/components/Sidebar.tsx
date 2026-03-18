'use client';

import { Statistics } from '@/types';
import { COLOR_MAP } from '@/lib/color-mapper';
import { saveToGallery } from '@/lib/gallery-store';
import { useState } from 'react';

interface SidebarProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onDownload: () => void;
  onShowGallery: () => void;
  stats: Statistics;
  lastSignal: { intensity: number; colorName: string; color: string } | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  getCanvasDataURL: () => string;
}

export default function Sidebar({
  isRunning,
  onToggle,
  onReset,
  onDownload,
  onShowGallery,
  stats,
  lastSignal,
  soundEnabled,
  onToggleSound,
  getCanvasDataURL,
}: SidebarProps) {
  const [saved, setSaved] = useState(false);

  const handleSaveToGallery = () => {
    const imageData = getCanvasDataURL();
    if (imageData) {
      saveToGallery(imageData, stats);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const colorEntries = Object.entries(COLOR_MAP);
  const maxCount = Math.max(1, ...Object.values(stats.colorCounts));

  return (
    <div className="w-72 bg-white m-3 ml-3 rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800">Stress Canvas</h1>
        <p className="text-xs text-gray-400 mt-1">EEG/ECG Stress Visualization</p>
      </div>

      {/* Current Signal */}
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Current Signal</h2>
        {lastSignal ? (
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl shadow-inner"
              style={{ backgroundColor: lastSignal.color }}
            />
            <div>
              <div className="text-2xl font-bold text-gray-800">{lastSignal.intensity}</div>
              <div className="text-xs text-gray-500">{lastSignal.colorName}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">No signal yet</div>
        )}
      </div>

      {/* Statistics */}
      <div className="p-5 border-b border-gray-100 flex-1 overflow-auto">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Statistics ({stats.totalShots} shots)
        </h2>
        <div className="space-y-2.5">
          {colorEntries.map(([key, { hex, nameKo }]) => {
            const count = stats.colorCounts[key] || 0;
            const pct = stats.totalShots > 0 ? (count / stats.totalShots) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{nameKo}</span>
                  <span className="text-gray-400">{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: hex,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="p-5 space-y-2.5">
        <button
          onClick={onToggle}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
          >
            Reset
          </button>
          <button
            onClick={onToggleSound}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              soundEnabled
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-300 text-gray-500'
            }`}
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <button
          onClick={onDownload}
          className="w-full py-2 rounded-lg text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-all"
        >
          Download PNG
        </button>

        <button
          onClick={handleSaveToGallery}
          className="w-full py-2 rounded-lg text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white transition-all"
        >
          {saved ? 'Saved!' : 'Save to Gallery'}
        </button>

        <button
          onClick={onShowGallery}
          className="w-full py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
        >
          Open Gallery
        </button>
      </div>
    </div>
  );
}
