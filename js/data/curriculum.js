/**
 * Ordre d'apprentissage des touches (la "logique" pédagogique).
 * Rangée de repos d'abord, en partant des index (repères f/j) puis en
 * s'éloignant vers l'extérieur ; ensuite rangée haute, puis basse.
 * Sert de référence (et plus tard pour calculer les touches débloquées).
 */
export const KEY_ORDER = {
  azerty: ["f", "j", "g", "h", "d", "k", "s", "l", "q", "m", "e", "i", "r", "t", "y", "u", "a", "z", "o", "p", "v", "b", "n", "c", "x", "w", ",", ";", ":"],
  qwerty: ["f", "j", "g", "h", "d", "k", "s", "l", "a", ";", "e", "i", "r", "t", "y", "u", "q", "w", "o", "p", "v", "b", "n", "m", "c", "x", "z", ",", ".", "/"],
};

export const CHAPTERS = [
  { id: "letters", number: 1, title: "Les lettres", subtitle: "Découverte des touches, rangée par rangée" },
  { id: "syllables", number: 2, title: "Les syllabes", subtitle: "Enchaîne les lettres en petits morceaux" },
  { id: "words", number: 3, title: "Les mots", subtitle: "De vrais mots, de plus en plus longs" },
  { id: "phrases", number: 4, title: "Les phrases", subtitle: "Phrases complètes et défi de vitesse" },
];
