import { Emitter } from "../utils/emitter.js";

/**
 * Réglages du mode Défi.
 * Le temps accordé par lettre part de `startMs` et diminue de `stepMs` à
 * chaque réussite, jusqu'à un plancher `minMs` (accélération progressive).
 * Le choix des lettres s'élargit lui aussi avec le niveau.
 */
export const CHALLENGE = {
  startMs: 6000,
  minMs: 600,
  stepMs: 100,
  baseLetters: 20,
  unlockEvery: 2,
  recentWindow: 5,
};

const now = () =>
  typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();

const requestTick =
  typeof requestAnimationFrame === "function"
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(now()), 16);

const cancelTick =
  typeof cancelAnimationFrame === "function"
    ? (id) => cancelAnimationFrame(id)
    : (id) => clearTimeout(id);

/**
 * Moteur du mode Défi.
 *
 * Événements :
 *   - "target"   { char, level, budgetMs, stats }
 *   - "tick"     { remainingMs, ratio }
 *   - "hit"      { char, gained, stats }
 *   - "gameover" { reason, char, got, stats }
 */
export class ChallengeEngine extends Emitter {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.active = false;
    this.pool = [];
    this.level = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.score = 0;
    this.target = null;
    this.budgetMs = 0;
    this.startedAt = 0;
    this._tickId = null;
    this._recent = [];
  }

  start(pool = []) {
    this.reset();
    this.pool = pool.length ? pool.slice() : ["f", "j"];
    this.active = true;
    this._next();
    return this;
  }

  get stats() {
    return { score: this.score, streak: this.streak, maxStreak: this.maxStreak, level: this.level };
  }

  get unlockedCount() {
    return Math.min(
      this.pool.length,
      CHALLENGE.baseLetters + Math.floor(this.level / CHALLENGE.unlockEvery)
    );
  }

  get speedMs() {
    return Math.max(CHALLENGE.minMs, CHALLENGE.startMs - this.level * CHALLENGE.stepMs);
  }

  _pick() {
    const choices = this.pool.slice(0, this.unlockedCount);
    if (choices.length === 1) return choices[0];
    const window = Math.min(CHALLENGE.recentWindow, choices.length - 1);
    const recent = this._recent.slice(0, window);
    let candidates = choices.filter((c) => !recent.includes(c));
    if (!candidates.length) candidates = choices;
    const char = candidates[Math.floor(Math.random() * candidates.length)];
    this._recent = [char, ...this._recent].slice(0, CHALLENGE.recentWindow);
    return char;
  }

  _next() {
    this.target = this._pick();
    this.budgetMs = this.speedMs;
    this.startedAt = now();
    this.emit("target", { char: this.target, level: this.level, budgetMs: this.budgetMs, stats: this.stats });
    this._loop();
  }

  _loop() {
    this._stopLoop();
    const step = () => {
      if (!this.active) return;
      const remaining = this.budgetMs - (now() - this.startedAt);
      const ratio = Math.max(0, Math.min(1, remaining / this.budgetMs));
      this.emit("tick", { remainingMs: Math.max(0, remaining), ratio });
      if (remaining <= 0) {
        this._over("timeout");
        return;
      }
      this._tickId = requestTick(step);
    };
    this._tickId = requestTick(step);
  }

  _stopLoop() {
    if (this._tickId != null) {
      cancelTick(this._tickId);
      this._tickId = null;
    }
  }

  handleKey(key) {
    if (!this.active) return;
    if (key === this.target) this._hit();
    else this._over("wrong", key);
  }

  _hit() {
    this._stopLoop();
    this.streak += 1;
    this.maxStreak = Math.max(this.maxStreak, this.streak);
    const gained = 10 + this.level * 2 + Math.floor(this.streak / 5) * 5;
    this.score += gained;
    this.level += 1;
    this.emit("hit", { char: this.target, gained, stats: this.stats });
    this._next();
  }

  _over(reason, got = null) {
    if (!this.active) return;
    this.active = false;
    this._stopLoop();
    this.emit("gameover", { reason, char: this.target, got, stats: this.stats });
  }

  abort() {
    this._stopLoop();
    this.active = false;
  }
}
