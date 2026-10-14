import { CHAPTERS } from "./curriculum.js";

const S = (twoAcc, threeAcc, threeWpm) => ({
  two: { accuracy: twoAcc },
  three: { accuracy: threeAcc, wpm: threeWpm },
});

/**
 * Contenu des missions.
 * `keys` et `items` peuvent être soit un tableau (identique pour les deux
 * dispositions), soit un objet { azerty, qwerty }.
 * Règle pédagogique : les chapitres 2 à 4 ne réutilisent que des touches
 * déjà introduites au chapitre 1.
 */
const MISSIONS = [
  // ---------- CHAPITRE 1 : LES LETTRES ----------
  { id: "c1m1", chapter: "letters", title: "Les repères : F et J", keys: ["f", "j"],
    items: ["ff", "jj", "fj", "jf", "fjf", "jfj", "ffj", "jjf", "fjfj"], stars: S(90, 96, 12) },
  { id: "c1m2", chapter: "letters", title: "Les index : G et H", keys: ["f", "j", "g", "h"],
    items: ["gg", "hh", "gh", "hg", "fg", "jh", "gf", "hj", "ghf", "hgj", "fgh", "jhg"], stars: S(90, 96, 12) },
  { id: "c1m3", chapter: "letters", title: "Les majeurs : D et K", keys: ["f", "j", "g", "h", "d", "k"],
    items: ["dd", "kk", "dk", "kd", "fd", "jk", "df", "kj", "dsk", "kfd", "djf", "kdk"], stars: S(90, 96, 13) },
  { id: "c1m4", chapter: "letters", title: "Les annulaires : S et L", keys: ["f", "j", "g", "h", "d", "k", "s", "l"],
    items: ["ss", "ll", "sl", "ls", "ds", "kl", "sf", "lj", "slf", "lsd", "gls", "hlk"], stars: S(90, 96, 13) },
  { id: "c1m5", chapter: "letters", title: "Les auriculaires", stars: S(90, 96, 13),
    keys: { azerty: ["q", "m"], qwerty: ["a", ";"] },
    items: {
      azerty: ["qq", "mm", "qm", "mq", "qs", "ml", "qf", "mj", "qmfj", "glqm"],
      qwerty: ["aa", ";;", "a;", ";a", "as", ";l", "af", ";j", "a;fj", "gl;q"],
    } },
  { id: "c1m6", chapter: "letters", title: "Révision : la rangée de repos", keys: ["s", "d", "f", "g", "h", "j", "k", "l"],
    items: ["sdf", "jkl", "ghj", "fgh", "lkj", "dsf", "hgl", "fds", "dgj", "sfl", "hkd", "gjsl"], stars: S(92, 97, 15) },
  { id: "c1m7", chapter: "letters", title: "Rangée haute : E et I", keys: ["s", "d", "f", "g", "h", "j", "k", "l", "e", "i"],
    items: ["ee", "ii", "ei", "ie", "ed", "ik", "es", "il", "dei", "kie", "sei", "lie"], stars: S(90, 96, 14) },
  { id: "c1m8", chapter: "letters", title: "Rangée haute : R, T, Y, U", keys: ["e", "i", "r", "t", "y", "u"],
    items: ["rr", "tt", "yy", "uu", "rt", "yu", "tr", "uy", "rtuy", "yutr", "trf", "yuj", "rit", "tuy"], stars: S(90, 96, 14) },
  { id: "c1m9", chapter: "letters", title: "Rangée haute : l'extérieur", stars: S(90, 96, 14),
    keys: { azerty: ["a", "z", "o", "p"], qwerty: ["q", "w", "o", "p"] },
    items: {
      azerty: ["aa", "zz", "oo", "pp", "az", "op", "za", "po", "azer", "tyui", "azop", "poza"],
      qwerty: ["qq", "ww", "oo", "pp", "qw", "op", "wq", "po", "qwer", "tyui", "qwop", "powq"],
    } },
  { id: "c1m10", chapter: "letters", title: "Rangée basse : V, B, N", keys: ["s", "d", "f", "j", "k", "l", "v", "b", "n"],
    items: ["vv", "bb", "nn", "vb", "bn", "nv", "fv", "jn", "vbn", "nbv", "jvn", "fbv"], stars: S(90, 96, 14) },
  { id: "c1m11", chapter: "letters", title: "Rangée basse : les extérieurs", stars: S(90, 96, 14),
    keys: { azerty: ["w", "x", "c", ","], qwerty: ["z", "x", "c", ","] },
    items: {
      azerty: ["cc", "xx", "ww", ",,", "cx", "xw", "c,", "w,", "cxf", "xcr", "xwc", "wcx"],
      qwerty: ["cc", "xx", "zz", ",,", "cx", "xz", "c,", "z,", "cxs", "xcd", "xzc", "zxc"],
    } },

  // ---------- CHAPITRE 2 : LES SYLLABES ----------
  { id: "c2m1", chapter: "syllables", title: "Syllabes en 2 lettres",
    items: ["as", "sa", "de", "ed", "fi", "if", "jo", "oj", "lu", "ul", "ma", "am"], stars: S(92, 97, 16) },
  { id: "c2m2", chapter: "syllables", title: "Syllabes de mots",
    items: ["ma", "pa", "ta", "ra", "la", "sa", "mi", "pi", "si", "li", "du", "lu", "nu"], stars: S(92, 97, 16) },
  { id: "c2m3", chapter: "syllables", title: "Syllabes en 3 lettres",
    items: ["tri", "pla", "mon", "bac", "lun", "sac", "mur", "tas", "fil", "col", "rad", "pit"], stars: S(93, 97, 18) },
  { id: "c2m4", chapter: "syllables", title: "Syllabes mélangées",
    items: ["bra", "flo", "gra", "tro", "pru", "cli", "fra", "gri", "blo", "dra"], stars: S(93, 98, 18) },

  // ---------- CHAPITRE 3 : LES MOTS ----------
  { id: "c3m1", chapter: "words", title: "Petits mots",
    items: ["chat", "pain", "lait", "lion", "main", "papa", "table", "porte", "pomme", "jardin"], stars: S(93, 97, 18) },
  { id: "c3m2", chapter: "words", title: "Mots fréquents",
    items: ["dans", "pour", "avec", "tout", "bien", "plus", "aussi", "alors", "comme", "autre"], stars: S(94, 97, 20) },
  { id: "c3m3", chapter: "words", title: "Mots avec accents", stars: S(93, 97, 16),
    items: {
      azerty: ["forêt", "élève", "père", "mère", "tête", "chèvre", "fenêtre", "fête"],
      qwerty: ["foret", "eleve", "pere", "mere", "tete", "chevre", "fenetre", "fete"],
    } },
  { id: "c3m4", chapter: "words", title: "Mots longs",
    items: ["ordinateur", "montagne", "aventure", "tresor", "clavier", "mission", "chocolat", "elephant"], stars: S(94, 98, 22) },

  // ---------- CHAPITRE 4 : LES PHRASES ----------
  { id: "c4m1", chapter: "phrases", title: "Deux mots",
    items: ["bonjour toi", "le chat", "ma maison", "un tresor", "je tape"], stars: S(94, 97, 20) },
  { id: "c4m2", chapter: "phrases", title: "Phrases courtes",
    items: ["le chat dort", "tape plus vite", "bravo champion", "on joue bien"], stars: S(95, 98, 22) },
  { id: "c4m3", chapter: "phrases", title: "Ponctuation",
    items: ["salut, ca va ?", "oui, tres bien !", "j aime taper.", "ouvre la porte !"], stars: S(95, 98, 22) },
  { id: "c4m4", chapter: "phrases", title: "Defi vitesse",
    items: ["apprends a taper vite et bien, chaque jour un peu plus !"], stars: S(96, 99, 30) },
];

const ORDER = MISSIONS.map((m) => m.id);

export function allMissions() {
  return MISSIONS;
}

export function getChapter(id) {
  return CHAPTERS.find((c) => c.id === id);
}

export function missionsByChapter(chapterId) {
  return MISSIONS.filter((m) => m.chapter === chapterId);
}

export function findMission(id) {
  return MISSIONS.find((m) => m.id === id) || null;
}

export function nextMission(id) {
  const i = ORDER.indexOf(id);
  return i >= 0 && i < ORDER.length - 1 ? MISSIONS[i + 1] : null;
}

export function previousMissionId(id) {
  const i = ORDER.indexOf(id);
  return i > 0 ? MISSIONS[i - 1].id : null;
}

export function resolveKeys(mission, layoutId) {
  if (Array.isArray(mission.keys)) return mission.keys;
  return mission.keys?.[layoutId] || [];
}

export function resolveItems(mission, layoutId) {
  if (Array.isArray(mission.items)) return mission.items;
  return mission.items?.[layoutId] || [];
}

export function missionText(mission, layoutId) {
  return resolveItems(mission, layoutId).join(" ");
}

/** Une mission est débloquée si c'est la 1ère, ou si la précédente est finie. */
export function isUnlocked(id, progress) {
  const i = ORDER.indexOf(id);
  if (i <= 0) return true;
  const prevId = ORDER[i - 1];
  return Boolean(progress?.[prevId]?.completed);
}
