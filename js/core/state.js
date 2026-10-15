import { Emitter } from "../utils/emitter.js";
import { storage } from "./storage.js";

class State extends Emitter {
  constructor() {
    super();
    this.data = storage.load();
  }

  get layout() { return this.data.settings.layout; }
  get profile() { return this.data.profile; }
  get settings() { return this.data.settings; }
  get scores() { return this.data.scores || []; }

  setLayout(layout) {
    this.data.settings.layout = layout;
    this.persist();
    this.emit("layout", layout);
  }

  setProfile(patch) {
    this.data.profile = { ...this.data.profile, ...patch };
    this.persist();
    this.emit("profile", this.data.profile);
  }

  missionProgress(id) {
    return this.data.progress[id] || null;
  }

  recordMission(id, result) {
    const prev = this.data.progress[id] || { stars: 0, bestWpm: 0, bestAccuracy: 0, bestPoints: 0 };
    this.data.progress[id] = {
      stars: Math.max(prev.stars, result.stars),
      bestWpm: Math.max(prev.bestWpm, Math.round(result.wpm)),
      bestAccuracy: Math.max(prev.bestAccuracy, Math.round(result.accuracy)),
      bestPoints: Math.max(prev.bestPoints, result.points || 0),
      completed: true,
    };
    this.persist();
    this.emit("progress", this.data.progress);
    return this.data.progress[id];
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
    this.data.progress = {};
    this.persist();
    this.emit("progress", this.data.progress);
  }

  persist() {
    storage.save(this.data);
  }
}

export const state = new State();
