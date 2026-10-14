const STORAGE_KEY = "clavier-quest";
const VERSION = 1;

function defaultData() {
  return {
    version: VERSION,
    profile: { name: "", avatar: "🦊" },
    settings: { layout: "azerty", sound: false, mode: "gentle" },
    progress: {},
  };
}

/**
 * Interface de stockage. On garde la même forme pour pouvoir brancher
 * plus tard un backend (comptes, API) sans toucher au reste du code.
 */
export class LocalStorageAdapter {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const data = JSON.parse(raw);
      return { ...defaultData(), ...data, settings: { ...defaultData().settings, ...data.settings } };
    } catch (err) {
      console.warn("[storage] lecture impossible, réinitialisation.", err);
      return defaultData();
    }
  }

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("[storage] écriture impossible.", err);
    }
  }

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("[storage] suppression impossible.", err);
    }
  }
}

export const storage = new LocalStorageAdapter();
