export const FINGER_COLORS = {
  pinky: "#ef5350",
  ring: "#ffa726",
  middle: "#ffca28",
  index: "#66bb6a",
  thumb: "#42a5f5",
};

export const FINGER_LABELS = {
  pinky: "Auriculaire",
  ring: "Annulaire",
  middle: "Majeur",
  index: "Index",
  thumb: "Pouce",
};

export const FINGER_SIDE = {
  pinky: "gauche/droite",
  ring: "gauche/droite",
  middle: "gauche/droite",
  index: "gauche/droite",
  thumb: "gauche/droite",
};

const HOME_FINGERS = ["pinky", "ring", "middle", "index", "index", "index", "index", "middle", "ring", "pinky"];

const AZERTY = {
  id: "azerty",
  name: "AZERTY",
  label: "Français",
  locale: "fr",
  rows: [
    { name: "numbers", keys: ["&", "é", '"', "'", "(", "-", "è", "_", "ç", "à"], fingers: HOME_FINGERS },
    { name: "top", keys: ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p"], fingers: HOME_FINGERS },
    { name: "home", keys: ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m"], fingers: HOME_FINGERS },
    { name: "bottom", keys: ["w", "x", "c", "v", "b", "n", ",", ";", ":", "!"], fingers: ["pinky", "ring", "middle", "index", "index", "index", "middle", "ring", "pinky", "pinky"] },
  ],
  spaceFinger: "thumb",
};

const QWERTY = {
  id: "qwerty",
  name: "QWERTY",
  label: "English",
  locale: "en",
  rows: [
    { name: "numbers", keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], fingers: HOME_FINGERS },
    { name: "top", keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], fingers: HOME_FINGERS },
    { name: "home", keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"], fingers: HOME_FINGERS },
    { name: "bottom", keys: ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"], fingers: ["pinky", "ring", "middle", "index", "index", "index", "index", "middle", "ring", "pinky"] },
  ],
  spaceFinger: "thumb",
};

export const LAYOUTS = { azerty: AZERTY, qwerty: QWERTY };

function buildIndex(layout) {
  const map = new Map();
  layout.rows.forEach((row, rowIndex) => {
    row.keys.forEach((key, colIndex) => {
      map.set(key, { key, finger: row.fingers[colIndex], row: rowIndex, col: colIndex, name: row.name });
    });
  });
  return map;
}

const INDEXES = {
  azerty: buildIndex(AZERTY),
  qwerty: buildIndex(QWERTY),
};

export function getLayout(id) {
  return LAYOUTS[id] || AZERTY;
}

export function keyInfo(layout, char) {
  if (!char) return null;
  if (char === " ") return { key: " ", finger: layout.spaceFinger, space: true, needsShift: false };
  const base = char.length === 1 ? char : char[0];
  const needsShift = base !== base.toLowerCase() && base.toLowerCase() !== base.toUpperCase();
  const lookup = base.toLowerCase();
  const found = INDEXES[layout.id]?.get(lookup) || INDEXES[layout.id]?.get(base);
  if (!found) return null;
  return { ...found, needsShift, display: base };
}
