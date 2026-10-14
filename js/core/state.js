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
    const prev = this.data.progress[id] || { stars: 0, bestWpm: 0, bestAccuracy: 0 };
    this.data.progress[id] = {
      stars: Math.max(prev.stars, result.stars),
      bestWpm: Math.max(prev.bestWpm, Math.round(result.wpm)),
      bestAccuracy: Math.max(prev.bestAccuracy, Math.round(result.accuracy)),
      completed: true,
    };
    this.persist();
    this.emit("progress", this.data.progress);
    return this.data.progress[id];
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
