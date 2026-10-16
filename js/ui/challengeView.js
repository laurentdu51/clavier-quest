import { el, clear } from "../utils/dom.js";
import { KeyboardView } from "./keyboardView.js";

const REASONS = {
  timeout: { icon: "⏱️", title: "Le temps est écoulé !" },
  wrong: { icon: "❌", title: "Mauvaise touche !" },
};

function statTile(label) {
  const value = el("div", { class: "stat__value", text: "0" });
  const box = el("div", { class: "stat" }, [
    el("div", { class: "stat__label", text: label }),
    value,
  ]);
  return { box, value };
}

export class ChallengeView {
  constructor(root, handlers = {}) {
    this.root = root;
    this.handlers = handlers;
    this._countId = null;
  }

  topList(top, highlightRank = 0) {
    const list = el("ol", { class: "top-list" });
    if (!top.length) {
      list.append(el("li", { class: "top-list__empty", text: "Aucun score pour l'instant — sois le premier !" }));
      return list;
    }
    top.forEach((score, i) => {
      const row = el("li", { class: "top-list__row" + (i + 1 === highlightRank ? " is-new" : "") }, [
        el("span", { class: "top-list__rank", text: "#" + (i + 1) }),
        el("span", { class: "top-list__name", text: `${score.avatar || "🦊"} ${score.name || "Anonyme"}` }),
        el("span", { class: "top-list__meta", text: `niv. ${score.level || 0} · série ${score.streak || 0}` }),
        el("span", { class: "top-list__score", text: `${score.score || 0} pts` }),
      ]);
      list.append(row);
    });
    return list;
  }

  showIntro({ top = [], best = 0 } = {}) {
    clear(this.root);
    const panel = el("div", { class: "challenge__panel" }, [
      el("p", { class: "challenge__hero", text: "⚡" }),
      el("h2", { class: "challenge__title", text: "Défi de vitesse" }),
      el("p", { class: "challenge__desc", text: "Tape la lettre affichée avant la fin du chrono. Ça accélère à chaque réussite ! Une erreur ou un temps écoulé met fin à la partie." }),
      el("div", { class: "challenge__best", text: `Meilleur score : ${best} pts` }),
      el("button", { class: "btn btn--primary btn--big", text: "Commencer ⚡", onclick: () => this.handlers.onStart?.() }),
      el("h3", { class: "challenge__top-title", text: "🏆 Top des scores" }),
      this.topList(top),
    ]);
    this.root.append(panel);
  }

  startPlay({ layout }) {
    this.cancelCountdown();
    clear(this.root);

    this.score = statTile("Score");
    this.streak = statTile("Série");
    this.level = statTile("Niveau");
    const stats = el("div", { class: "challenge__stats" }, [this.score.box, this.streak.box, this.level.box]);

    this.letterEl = el("div", { class: "challenge__letter", text: "" });
    this.barFill = el("div", { class: "challenge__bar-fill" });
    this.countEl = el("div", { class: "challenge__count" });
    const area = el("div", { class: "challenge__area" }, [
      this.countEl,
      this.letterEl,
      el("div", { class: "challenge__bar" }, [this.barFill]),
    ]);

    const kbRoot = el("div", { class: "keyboard" });
    const play = el("div", { class: "challenge__play" }, [
      stats,
      area,
      kbRoot,
      el("p", { class: "tip", text: "Tape la lettre affichée le plus vite possible !" }),
    ]);
    this.root.append(play);

    this.keyboard = new KeyboardView(kbRoot, null);
    this.keyboard.render(layout);
  }

  /** Compte à rebours 3-2-1-GO ! avant la première lettre, puis appelle `onDone`. */
  playCountdown(onDone) {
    this.cancelCountdown();
    if (!this.countEl) {
      onDone?.();
      return;
    }
    this.countEl.classList.add("is-on");
    const steps = [
      ["3", 750],
      ["2", 750],
      ["1", 750],
      ["GO !", 450],
    ];
    let i = 0;
    const next = () => {
      if (i >= steps.length) {
        this._countId = null;
        this.countEl.classList.remove("is-on");
        onDone?.();
        return;
      }
      const [text, delay] = steps[i++];
      this.countEl.textContent = text;
      this.countEl.classList.remove("is-pop");
      void this.countEl.offsetWidth;
      this.countEl.classList.add("is-pop");
      this._countId = setTimeout(next, delay);
    };
    next();
  }

  cancelCountdown() {
    if (this._countId != null) {
      clearTimeout(this._countId);
      this._countId = null;
    }
    if (this.countEl) {
      this.countEl.classList.remove("is-on", "is-pop");
      this.countEl.textContent = "";
    }
  }

  setTarget(char) {
    if (!this.letterEl) return;
    this.letterEl.textContent = char;
    this.letterEl.classList.remove("is-pop");
    void this.letterEl.offsetWidth;
    this.letterEl.classList.add("is-pop");
    this.keyboard?.highlight(char);
  }

  setTimer(ratio) {
    if (!this.barFill) return;
    const pct = Math.max(0, Math.min(1, ratio)) * 100;
    this.barFill.style.width = pct + "%";
    this.barFill.classList.toggle("is-low", ratio <= 0.3);
  }

  setStats(stats) {
    if (!this.score) return;
    this.score.value.textContent = String(stats.score);
    this.streak.value.textContent = stats.streak >= 2 ? "x" + stats.streak : String(stats.streak);
    this.level.value.textContent = String(stats.level);
  }

  flash(key, ok) {
    if (key != null) this.keyboard?.flash(key, ok);
  }

  showOver({ reason, char, got, result, top = [], rank = 0 } = {}) {
    clear(this.root);
    const info = REASONS[reason] || { icon: "🎯", title: "Partie terminée" };
    const detail =
      reason === "wrong"
        ? `Tu devais taper « ${char} » mais tu as tapé « ${got} ».`
        : `Tu as tenu ${result.streak} lettre(s) d'affilée.`;

    const newRecord = rank === 1 && result.score > 0;

    const panel = el("div", { class: "challenge__panel" }, [
      el("p", { class: "challenge__hero", text: info.icon }),
      el("h2", { class: "challenge__title", text: info.title }),
      el("p", { class: "challenge__desc", text: detail }),
      newRecord ? el("div", { class: "challenge__record", text: "🎉 Nouveau record !" }) : null,
      el("div", { class: "challenge__summary" }, [
        el("div", { class: "challenge__score-final", text: `${result.score} pts` }),
        el("div", { class: "challenge__sub", text: `Niveau ${result.level} · Meilleure série ${result.maxStreak}` }),
        rank > 0 ? el("div", { class: "challenge__rank", text: `→ ${rank}ᵉ au top` }) : null,
      ]),
      el("div", { class: "challenge__actions" }, [
        el("button", { class: "btn btn--ghost", text: "Accueil", onclick: () => this.handlers.onBack?.() }),
        el("button", { class: "btn btn--primary", text: "Rejouer ⚡", onclick: () => this.handlers.onReplay?.() }),
      ]),
      el("h3", { class: "challenge__top-title", text: "🏆 Top des scores" }),
      this.topList(top, rank),
    ]);
    this.root.append(panel);
  }
}
