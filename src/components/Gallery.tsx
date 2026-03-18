'use client';

import { useEffect, useState } from 'react';
import { GalleryItem } from '@/types';
import { getGallery, deleteFromGallery } from '@/lib/gallery-store';

interface GalleryProps {
  onClose: () => void;
}

export default function Gallery({ onClose }: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    setItems(getGallery());
  }, []);

  const handleDelete = (id: string) => {
    deleteFromGallery(id);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleDownload = (item: GalleryItem) => {
    const link = document.createElement('a');
    link.download = `stress-canvas-${item.id}.png`;
    link.href = item.imageData;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">Gallery</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No saved artworks yet</p>
              <p className="text-sm mt-1">Create something and save it!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map(item => (
                <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-md bg-gray-50">
                  <img
                    src={item.imageData}
                    alt="Stress Canvas Artwork"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                    <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(item)}
                          className="flex-1 py-1.5 rounded-lg bg-white/90 text-xs font-medium text-gray-700 hover:bg-white transition-all"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/90 text-xs font-medium text-white hover:bg-red-500 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="text-[10px] text-white/80 mt-2">
                        {item.stats.totalShots} shots &middot; {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
