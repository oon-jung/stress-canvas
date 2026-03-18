import { GalleryItem, Statistics } from '@/types';

const GALLERY_KEY = 'stress-canvas-gallery';

export function getGallery(): GalleryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(GALLERY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToGallery(imageData: string, stats: Statistics): GalleryItem {
  const gallery = getGallery();
  const item: GalleryItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    imageData,
    createdAt: Date.now(),
    stats,
  };
  gallery.unshift(item);
  // Keep max 20 items
  if (gallery.length > 20) gallery.pop();
  localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery));
  return item;
}

export function deleteFromGallery(id: string) {
  const gallery = getGallery().filter(item => item.id !== id);
  localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery));
}
