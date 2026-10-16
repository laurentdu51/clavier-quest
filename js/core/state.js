import { Emitter } from "../utils/emitter.js";
import { storage, emptySlot, MAX_SLOTS } from "./storage.js";

class State extends Emitter {
  constructor() {
    super();
    this.data = storage.load();
  }

  get layout() { return this.data.settings.layout; }
  get settings() { return this.data.settings; }
  get slots() { return this.data.slots; }
  get activeSlot() { return this.data.activeSlot; }
  get scores() { return this.data.scores || []; }
  get profile() { return this._active(); }
  get progress() { return this._active().progress; }

  _active() {
    const slot = this.data.slots[this.data.activeSlot];
    if (slot) return slot;
    const first = this.data.slots.findIndex(Boolean);
    this.data.activeSlot = first >= 0 ? first : 0;
    if (!this.data.slots[this.data.activeSlot]) this.data.slots[this.data.activeSlot] = emptySlot();
    return this.data.slots[this.data.activeSlot];
  }

  setLayout(layout) {
    this.data.settings.layout = layout;
    this.persist();
    this.emit("layout", layout);
  }

  setProfile(patch) {
    const slot = this._active();
    Object.assign(slot, patch);
    this.persist();
    this.emit("profile", slot);
  }

  /** Bascule vers un emplacement (créé au besoin s'il est libre). */
  selectSlot(index) {
    if (index < 0 || index >= MAX_SLOTS) return;
    if (!this.data.slots[index]) this.data.slots[index] = emptySlot();
    this.data.activeSlot = index;
    this.persist();
    this.emit("slot", index);
    this.emit("profile", this.profile);
  }

  createSlot(index) {
    if (index < 0 || index >= MAX_SLOTS) return;
    this.data.slots[index] = emptySlot();
    this.data.activeSlot = index;
    this.persist();
    this.emit("slot", index);
  }

  resetProgress() {
    const slot = this._active();
    slot.progress = {};
    this.persist();
    this.emit("progress", slot.progress);
  }

  deleteSlot(index) {
    if (index < 0 || index >= MAX_SLOTS) return;
    this.data.slots[index] = null;
    if (!this.data.slots.some(Boolean)) this.data.slots[0] = emptySlot();
    if (this.data.activeSlot === index || !this.data.slots[this.data.activeSlot]) {
      this.data.activeSlot = this.data.slots.findIndex(Boolean);
    }
    this.persist();
    this.emit("slot", this.data.activeSlot);
    this.emit("profile", this.profile);
  }

  missionProgress(id) {
    return this.progress[id] || null;
  }

  recordMission(id, result) {
    const progress = this.progress;
    const prev = progress[id] || { stars: 0, bestWpm: 0, bestAccuracy: 0, bestPoints: 0 };
    progress[id] = {
      stars: Math.max(prev.stars, result.stars),
      bestWpm: Math.max(prev.bestWpm, Math.round(result.wpm)),
      bestAccuracy: Math.max(prev.bestAccuracy, Math.round(result.accuracy)),
      bestPoints: Math.max(prev.bestPoints, result.points || 0),
      completed: true,
    };
    this.persist();
    this.emit("progress", progress);
    return progress[id];
  }

  bestScore() {
    return this.scores.reduce((max, s) => Math.max(max, s.score || 0), 0);
  }

  /** Insère un score de Défi, garde le top 10, renvoie le rang (1-based, 0 si hors top). */
  recordScore(entry) {
    const list = [...this.scores, entry].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
    const rank = list.indexOf(entry) + 1;
    this.data.scores = list;
    this.persist();
    this.emit("scores", list);
    return rank;
  }

  clearProgress() {
    this.resetProgress();
  }

  persist() {
    storage.save(this.data);
  }
}

export const state = new State();
