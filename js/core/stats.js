export function wpm(correctChars, elapsedMs) {
  if (!elapsedMs || elapsedMs < 1) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round(correctChars / 5 / minutes);
}

export function accuracy(correct, errors) {
  const total = correct + errors;
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

export function computeStars(result, mission) {
  const t = mission.stars || {};
  let stars = 1;
  if (t.two && result.accuracy >= (t.two.accuracy ?? 0) && result.wpm >= (t.two.wpm ?? 0)) stars = 2;
  if (t.three && result.accuracy >= (t.three.accuracy ?? 0) && result.wpm >= (t.three.wpm ?? 0)) stars = 3;
  return stars;
}

export function computePoints(result, mission) {
  let pts = 0;
  if (result.stars >= 1) pts = 10;
  if (result.stars >= 2) pts = 20;
  if (result.stars >= 3) pts = 30;

  // Petit bonus vitesse si on dépasse bien le seuil 3★
  const w3 = mission.stars?.three?.wpm ?? 0;
  if (result.wpm >= w3 + 3) pts += 3;
  if (result.wpm >= w3 + 6) pts += 2; // max +5

  return Math.round(pts);
}
