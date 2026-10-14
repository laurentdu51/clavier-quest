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
