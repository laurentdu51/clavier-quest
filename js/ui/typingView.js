import { el, clear } from "../utils/dom.js";

export class TypingView {
  constructor(root) {
    this.root = root;
    this.chars = [];
  }

  render(text) {
    clear(this.root);
    this.chars = [];
    for (const char of Array.from(text)) {
      const isSpace = char === " ";
      const span = el("span", { class: "ch ch--pending" + (isSpace ? " ch--space" : "") });
      span.textContent = isSpace ? "\u00A0" : char;
      this.root.append(span);
      this.chars.push(span);
    }
    this.setCursor(0);
    this.root.scrollTop = 0;
  }

  setCursor(index) {
    this.chars.forEach((s) => s.classList.remove("ch--current"));
    const current = this.chars[index];
    if (current) {
      current.classList.add("ch--current");
      current.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  markDone(index) {
    const span = this.chars[index];
    if (!span) return;
    span.classList.remove("ch--pending", "ch--current", "ch--error");
    span.classList.add("ch--done");
  }

  flashWrong(index) {
    const span = this.chars[index];
    if (!span) return;
    span.classList.add("ch--wrong");
    setTimeout(() => span.classList.remove("ch--wrong"), 140);
    span.classList.add("ch--error");
  }
}
