import { el, clear } from "../utils/dom.js";
import { FINGER_COLORS, FINGER_LABELS, keyInfo } from "../core/layout.js";

function handOf(info) {
  if (info.space) return "gauche";
  return info.col < 5 ? "gauche" : "droite";
}

export class KeyboardView {
  constructor(root, hintEl = document.getElementById("hand-hint")) {
    this.root = root;
    this.keyEls = new Map();
    this.hintEl = hintEl;
  }

  render(layout) {
    this.layout = layout;
    clear(this.root);
    this.keyEls.clear();

    layout.rows.forEach((row) => {
      const rowEl = el("div", { class: "kb-row" });
      row.keys.forEach((key, i) => {
        const finger = row.fingers[i];
        const keyEl = el("div", {
          class: "kb-key" + (row.name === "home" ? " kb-key--home" : ""),
          dataset: { key },
        });
        keyEl.style.background = FINGER_COLORS[finger];
        keyEl.append(el("span", { text: key }));
        this.keyEls.set(key, keyEl);
        rowEl.append(keyEl);
      });
      this.root.append(rowEl);
    });

    const spaceRow = el("div", { class: "kb-row" });
    const space = el("div", { class: "kb-key kb-key--space", dataset: { key: " " } });
    space.style.background = FINGER_COLORS[layout.spaceFinger];
    space.append(el("span", { text: "espace" }));
    this.keyEls.set(" ", space);
    spaceRow.append(space);
    this.root.append(spaceRow);
  }

  highlight(char) {
    this.clearNext();
    if (char == null) return this.setHint("");
    const info = keyInfo(this.layout, char);
    if (!info) return this.setHint("");
    const keyEl = this.keyEls.get(info.key);
    if (keyEl) {
      keyEl.classList.add("kb-key--next");
      this.nextEl = keyEl;
    }
    this.setHint(info);
  }

  clearNext() {
    this.nextEl?.classList.remove("kb-key--next");
    this.nextEl = null;
  }

  setHint(info) {
    if (!this.hintEl) return;
    if (!info) {
      this.hintEl.textContent = "";
      return;
    }
    if (info.space) {
      this.hintEl.textContent = "Pouce — barre espace";
      return;
    }
    this.hintEl.textContent = `Main ${handOf(info)} — ${FINGER_LABELS[info.finger] || ""}`;
  }

  flash(key, ok) {
    const keyEl = this.keyEls.get(key) || (key === " " ? this.keyEls.get(" ") : null);
    const target = keyEl || this.keyEls.get(String(key).toLowerCase());
    if (!target) return;
    const cls = ok ? "kb-key--good" : "kb-key--bad";
    target.classList.add("kb-key--pressed", cls);
    setTimeout(() => target.classList.remove("kb-key--pressed", cls), 130);
  }
}
