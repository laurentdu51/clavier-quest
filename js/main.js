import { $, el, clear, starRow } from "./utils/dom.js";
import { state } from "./core/state.js";
import { LAYOUTS, getLayout } from "./core/layout.js";
import { TypingEngine } from "./core/engine.js";
import { computeStars } from "./core/stats.js";
import { CHAPTERS } from "./data/curriculum.js";
import * as Missions from "./data/missions.js";
import { KeyboardView } from "./ui/keyboardView.js";
import { Hud } from "./ui/hud.js";
import { TypingView } from "./ui/typingView.js";

const AVATARS = ["🦊", "🐱", "🐼", "🐸", "🐵", "🦉", "🐧", "🦄"];

const screens = {
  home: $("#screen-home"),
  map: $("#screen-map"),
  game: $("#screen-game"),
  result: $("#screen-result"),
};

const engine = new TypingEngine();
const keyboard = new KeyboardView($("#keyboard"));
const hud = new Hud($("#hud"));
const typing = new TypingView($("#typing"));

let currentMission = null;
let lastResult = null;

function show(name) {
  Object.values(screens).forEach((s) => s.classList.remove("is-active"));
  screens[name].classList.add("is-active");
}

/* ============================ ACCUEIL ============================ */

function renderHome() {
  const picker = $("#layout-picker");
  clear(picker);
  Object.values(LAYOUTS).forEach((layout) => {
    const btn = el("button", {
      class: "layout-option" + (layout.id === state.layout ? " is-selected" : ""),
      dataset: { layout: layout.id },
      onclick: () => {
        state.setLayout(layout.id);
        renderHome();
      },
    }, [
      el("strong", { text: layout.name }),
      el("span", { text: layout.label }),
    ]);
    picker.append(btn);
  });

  const avatarPicker = $("#avatar-picker");
  clear(avatarPicker);
  AVATARS.forEach((emoji) => {
    const btn = el("button", {
      class: "avatar-option" + (state.profile.avatar === emoji ? " is-selected" : ""),
      text: emoji,
      onclick: () => {
        state.setProfile({ avatar: emoji });
        renderHome();
      },
    });
    avatarPicker.append(btn);
  });

  const nameInput = $("#player-name");
  nameInput.value = state.profile.name;
}

$("#player-name").addEventListener("input", (e) => state.setProfile({ name: e.target.value }));
$("#btn-play").addEventListener("click", () => {
  renderMap();
  show("map");
});

/* ============================ CARTE ============================ */

function missionCard(mission) {
  const progress = state.missionProgress(mission.id);
  const unlocked = Missions.isUnlocked(mission.id, state.data.progress);
  const keys = Missions.resolveKeys(mission, state.layout);

  const card = el("button", {
    class: "mission" + (unlocked ? "" : " mission--locked"),
    disabled: unlocked ? null : "true",
    onclick: () => {
      if (!unlocked) return;
      startMission(mission.id);
    },
  });

  const top = el("div", { class: "mission__top" }, [
    el("span", { class: "mission__name", text: unlocked ? mission.title : "🔒 " + mission.title }),
    starRow(progress?.stars || 0),
  ]);
  card.append(top);

  if (keys.length) {
    const chips = el("div", { class: "mission__keys" });
    keys.forEach((k) => chips.append(el("span", { class: "key-chip", text: k })));
    card.append(chips);
  }

  if (progress?.bestWpm) {
    card.append(el("div", { class: "chapter__sub", text: `Record : ${progress.bestWpm} mots/min · ${progress.bestAccuracy}%` }));
  }

  return card;
}

function renderMap() {
  const map = $("#map");
  clear(map);

  const p = state.profile;
  $("#map-player").textContent = `${p.avatar} ${p.name || "Aventurier"}`;

  CHAPTERS.forEach((chapter) => {
    const missions = Missions.missionsByChapter(chapter.id);
    const section = el("section", { class: "chapter" });
    section.append(
      el("div", { class: "chapter__head" }, [
        el("span", { class: "chapter__badge", text: String(chapter.number) }),
        el("div", {}, [
          el("div", { class: "chapter__title", text: chapter.title }),
          el("div", { class: "chapter__sub", text: chapter.subtitle }),
        ]),
      ]),
    );
    const grid = el("div", { class: "mission-grid" });
    missions.forEach((m) => grid.append(missionCard(m)));
    section.append(grid);
    map.append(section);
  });
}

$("#btn-map-home").addEventListener("click", () => {
  renderHome();
  show("home");
});

/* ============================ JEU ============================ */

function startMission(id) {
  const mission = Missions.findMission(id);
  if (!mission) return;
  currentMission = mission;
  const layout = getLayout(state.layout);
  const text = Missions.missionText(mission, state.layout);

  engine.load(text);
  $("#game-title").textContent = mission.title;

  keyboard.render(layout);
  typing.render(text);
  hud.render();
  hud.update(engine.stats, engine.progress());

  startRunnerPlaceholder();
  show("game");
}

// Branchement des événements du moteur (une seule fois).
engine.on("correct", ({ index, key }) => {
  typing.markDone(index);
  typing.setCursor(index + 1);
  keyboard.flash(key, true);
  const next = engine.text[engine.cursor];
  keyboard.highlight(next);
});

engine.on("error", ({ index, expected, got }) => {
  typing.flashWrong(index);
  keyboard.flash(got === " " ? " " : got.toLowerCase(), false);
  keyboard.highlight(expected);
});

engine.on("progress", (p) => {
  hud.update(engine.stats, p);
});

engine.on("complete", (stats) => finishMission(stats));

// Placeholder : le futur "runner" écoutera ces mêmes événements.
function startRunnerPlaceholder() {
  /* Étape 4 : ici on branchera le personnage qui avance / tombe. */
}

document.addEventListener("keydown", (e) => {
  if (!screens.game.classList.contains("is-active")) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "Escape") {
    quitMission();
    return;
  }
  if (e.key.length !== 1) return; // ignore Shift, Backspace, Flèches…
  e.preventDefault();
  engine.handleKey(e.key);
});

function quitMission() {
  engine.abort();
  renderMap();
  show("map");
}

$("#btn-game-quit").addEventListener("click", quitMission);

/* ============================ RÉSULTAT ============================ */

function finishMission(stats) {
  const stars = computeStars(stats, currentMission);
  state.recordMission(currentMission.id, { stars, wpm: stats.wpm, accuracy: stats.accuracy });
  lastResult = { stats, stars };

  $("#result-title").textContent = stars >= 2 ? "Bravo !" : "Mission terminée !";

  const starsBox = $("#result-stars");
  clear(starsBox);
  for (let i = 1; i <= 3; i++) {
    starsBox.append(el("span", { class: "star" + (i <= stars ? " on" : ""), text: "★" }));
  }

  const statsBox = $("#result-stats");
  clear(statsBox);
  const stat = (value, unit, label) =>
    el("div", { class: "result__stat" }, [
      el("b", { text: unit ? `${value} ${unit}` : String(value) }),
      el("span", { text: label }),
    ]);
  statsBox.append(
    stat(stats.wpm, "mots/min", "Vitesse"),
    stat(stats.accuracy, "%", "Précision"),
    stat(stats.maxCombo, "x", "Meilleur combo"),
  );

  const next = Missions.nextMission(currentMission.id);
  $("#btn-next").disabled = !next;
  $("#btn-next").textContent = next ? "Mission suivante ▶" : "Parcours terminé 🎉";

  show("result");
}

$("#btn-replay").addEventListener("click", () => startMission(currentMission.id));
$("#btn-result-map").addEventListener("click", () => {
  renderMap();
  show("map");
});
$("#btn-next").addEventListener("click", () => {
  const next = Missions.nextMission(currentMission.id);
  if (next) startMission(next.id);
});

/* ============================ INIT ============================ */

renderHome();
show("home");
