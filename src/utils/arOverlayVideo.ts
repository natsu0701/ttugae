const DB_NAME = "ttugae.ar.overlay.v1";
const STORE = "video";
const KEY = "current";

export type StoredOverlayVideo = {
  name: string;
  type: string;
  blob: Blob;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function isOverlayVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return /\.(webm|mov|mp4|m4v)$/i.test(file.name);
}

export async function saveOverlayVideo(file: File): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(
      { name: file.name, type: file.type || "video/webm", blob: file } satisfies StoredOverlayVideo,
      KEY,
    );
  });
  db.close();
}

export async function loadOverlayVideo(): Promise<StoredOverlayVideo | null> {
  try {
    const db = await openDb();
    const stored = await new Promise<StoredOverlayVideo | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(KEY);
      request.onsuccess = () => {
        const value = request.result as StoredOverlayVideo | undefined;
        resolve(value?.blob ? value : null);
      };
      request.onerror = () => reject(request.error);
    });
    db.close();
    return stored;
  } catch {
    return null;
  }
}

export async function clearOverlayVideo(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).delete(KEY);
    });
    db.close();
  } catch {
    // private mode
  }
}
