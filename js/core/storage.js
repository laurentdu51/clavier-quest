const STORAGE_KEY = "clavier-quest";
const VERSION = 2;
export const MAX_SLOTS = 4;

export function emptySlot() {
  return { name: "", avatar: "🦊", progress: {} };
}

function defaultData() {
  const slots = Array.from({ length: MAX_SLOTS }, () => null);
  slots[0] = emptySlot();
  return {
    version: VERSION,
    settings: { layout: "azerty", sound: false, mode: "gentle", legalConsent: false },
    activeSlot: 0,
    slots,
    scores: [],
  };
}

/** Normalise un slot : garantit name/avatar/progress. */
function normalizeSlot(slot) {
  if (!slot || typeof slot !== "object") return null;
  return {
    name: typeof slot.name === "string" ? slot.name : "",
    avatar: typeof slot.avatar === "string" && slot.avatar ? slot.avatar : "🦊",
    progress: slot.progress && typeof slot.progress === "object" ? slot.progress : {},
  };
}

/** Migration v1 (profil unique) -> v2 (4 slots). */
function migrateV1(data) {
  const out = defaultData();
  out.slots[0] = {
    name: data?.profile?.name || "",
    avatar: data?.profile?.avatar || "🦊",
    progress: data?.progress && typeof data.progress === "object" ? data.progress : {},
  };
  out.settings = { ...out.settings, ...(data?.settings || {}) };
  out.scores = Array.isArray(data?.scores) ? data.scores : [];
  return out;
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
      const base = data?.version >= 2 ? { ...defaultData(), ...data } : migrateV1(data);
      const slots = Array.from({ length: MAX_SLOTS }, (_, i) => normalizeSlot(base.slots?.[i]) ?? null);
      if (!slots.some(Boolean)) slots[0] = emptySlot();
      const active = Number.isInteger(base.activeSlot) ? base.activeSlot : 0;
      return {
        version: VERSION,
        settings: { ...defaultData().settings, ...(base.settings || {}) },
        activeSlot: slots[active] ? active : slots.findIndex(Boolean),
        slots,
        scores: Array.isArray(base.scores) ? base.scores : [],
      };
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
