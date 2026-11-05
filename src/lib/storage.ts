import { SavedGeneration } from '../types';

const STORAGE_KEYS = {
  ACCESS_KEY: 'scp_access_key',
  DEVICE_ID: 'scp_device_id',
  SAVED_ITEMS: 'scp_saved_generations',
  PENDING_ORDER: 'scp_pending_order_id',
};

export function getStoredAccessKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_KEY, key.trim());
  } catch (e) {
    console.error('Failed to save access key to localStorage', e);
  }
}

export function clearStoredAccessKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_KEY);
  } catch {}
}

export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  } catch {
    return 'temp_device_' + Date.now();
  }
}

export function getSavedGenerations(): SavedGeneration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGenerationToStorage(item: SavedGeneration): void {
  try {
    const current = getSavedGenerations();
    // Keep maximum 10 latest items
    const updated = [item, ...current.filter((g) => g.id !== item.id)].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save generation to localStorage', e);
  }
}

export function deleteSavedGeneration(id: string): void {
  try {
    const current = getSavedGenerations();
    const updated = current.filter((g) => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(updated));
  } catch {}
}

export function getPendingOrderId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.PENDING_ORDER);
  } catch {
    return null;
  }
}

export function setPendingOrderId(orderId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_ORDER, orderId.trim());
  } catch {}
}

export function clearPendingOrderId(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_ORDER);
  } catch {}
}
