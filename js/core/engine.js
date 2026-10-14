import { Emitter } from "../utils/emitter.js";
import { wpm, accuracy } from "./stats.js";

/**
 * Moteur de frappe.
 *
 * Émet des événements — utilisés par le HUD aujourd'hui, et par le futur
 * "runner" (personnage qui avance / tombe) plus tard :
 *   - "correct"   { index, key, combo }
 *   - "error"     { index, expected, got, combo }
 *   - "progress"  { cursor, length, ratio }
 *   - "combo"     { combo, max }
 *   - "complete"  { stats }
 */
export class TypingEngine extends Emitter {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.text = [];
    this.cursor = 0;
    this.startedAt = null;
    this.finishedAt = null;
    this.correct = 0;
    this.errors = 0;
    this.errorIndexes = new Set();
    this.combo = 0;
    this.maxCombo = 0;
    this.active = false;
  }

  load(text) {
    this.reset();
    this.text = Array.from(text);
    this.active = true;
    return this;
  }

  get elapsedMs() {
    if (this.startedAt == null) return 0;
    return (this.finishedAt ?? performance.now()) - this.startedAt;
  }

  get stats() {
    return {
      correct: this.correct,
      errors: this.errors,
      combo: this.combo,
      maxCombo: this.maxCombo,
      wpm: wpm(this.correct, this.elapsedMs),
      accuracy: accuracy(this.correct, this.errors),
      elapsedMs: Math.round(this.elapsedMs),
    };
  }

  progress() {
    return { cursor: this.cursor, length: this.text.length, ratio: this.text.length ? this.cursor / this.text.length : 0 };
  }

  handleKey(key) {
    if (!this.active) return;
    const expected = this.text[this.cursor];
    if (expected === undefined) return;

    if (this.startedAt == null) this.startedAt = performance.now();

    if (key === expected) {
      const index = this.cursor;
      this.correct += 1;
      this.combo += 1;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.cursor += 1;
      this.emit("correct", { index, key, combo: this.combo });
      this.emit("combo", { combo: this.combo, max: this.maxCombo });
      this.emit("progress", this.progress());
      if (this.cursor >= this.text.length) this.finish();
    } else {
      this.errors += 1;
      this.combo = 0;
      this.errorIndexes.add(this.cursor);
      this.emit("error", { index: this.cursor, expected, got: key, combo: 0 });
      this.emit("combo", { combo: 0, max: this.maxCombo });
      this.emit("progress", this.progress());
    }
  }

  finish() {
    if (!this.active) return;
    this.active = false;
    this.finishedAt = performance.now();
    this.emit("progress", this.progress());
    this.emit("complete", this.stats);
  }

  abort() {
    this.active = false;
  }
}
