import { el, clear } from "../utils/dom.js";

function tile(label, cls = "") {
  const value = el("div", { class: "stat__value", text: "0" });
  const box = el("div", { class: "stat " + cls }, [
    el("div", { class: "stat__label", text: label }),
    value,
  ]);
  return { box, value };
}

export class Hud {
  constructor(root) {
    this.root = root;
  }

  render() {
    clear(this.root);
    this.wpm = tile("Vitesse");
    this.wpm.value.append(el("small", { text: " mots/min" }));
    this.acc = tile("Précision");
    this.acc.value.append(el("small", { text: " %" }));
    this.combo = tile("Combo");

    this.fill = el("div", { class: "progress-fill" });
    this.progressValue = el("div", { class: "stat__value", text: "0 %" });
    const progress = el("div", { class: "stat stat--progress" }, [
      el("div", { class: "stat__label", text: "Progression" }),
      this.progressValue,
      el("div", { class: "progress-bar" }, [this.fill]),
    ]);

    this.root.append(this.wpm.box, this.acc.box, this.combo.box, progress);
  }

  update(stats, progress) {
    this.wpm.value.firstChild.textContent = String(stats.wpm);
    this.acc.value.firstChild.textContent = String(stats.accuracy);
    this.combo.value.textContent = stats.combo >= 2 ? "x" + stats.combo : "0";
    const pct = Math.round((progress?.ratio ?? 0) * 100);
    this.progressValue.textContent = pct + " %";
    this.fill.style.width = pct + "%";
  }
}
