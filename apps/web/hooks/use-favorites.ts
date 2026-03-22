'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'binom-favorites';
const EVENT_NAME = 'favorites-changed';

function getFavoritesSnapshot(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

let cachedIds: number[] = getFavoritesSnapshot();
let cachedJson = JSON.stringify(cachedIds);

function getSnapshot(): number[] {
  const json = typeof window !== 'undefined'
    ? (localStorage.getItem(STORAGE_KEY) || '[]')
    : '[]';
  if (json !== cachedJson) {
    cachedJson = json;
    try { cachedIds = JSON.parse(json); } catch { cachedIds = []; }
  }
  return cachedIds;
}

const SERVER_SNAPSHOT: number[] = [];

function getServerSnapshot(): number[] {
  return SERVER_SNAPSHOT;
}

function subscribe(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

function saveFavorites(ids: number[]) {
  const json = JSON.stringify(ids);
  localStorage.setItem(STORAGE_KEY, json);
  cachedJson = json;
  cachedIds = ids;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: number) => {
    const current = getFavoritesSnapshot();
    const next = current.includes(id)
      ? current.filter((fid) => fid !== id)
      : [...current, id];
    saveFavorites(next);
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites],
  );

  return { favorites, toggle, isFavorite, count: favorites.length };
}
