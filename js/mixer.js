/**
 * Recherche, parmi les pigments disponibles, la combinaison de couleurs et
 * les proportions qui approchent le mieux une couleur cible.
 *
 * Stratégie : on part d'une recherche large sur 1 à 3 pigments, puis on
 * essaie d'ajouter un 4e puis un 5e pigment — on ne les garde que s'ils
 * améliorent vraiment le résultat. On termine par un affinage au pourcent
 * près (descente de coordonnées) sur la combinaison retenue.
 */
const MAX_PIGMENTS = 5;
const EXTEND_MIN_GAIN = 1.5; // gain minimum de deltaE pour justifier un pigment de plus

function findBestMix(targetHex, pigments) {
  const targetLab = rgbToLab(hexToRgb(targetHex));

  let best = coarseSearch(pigments, targetLab);

  for (let size = 4; size <= MAX_PIGMENTS; size++) {
    best = tryExtend(best, pigments, targetLab, size);
  }

  const refinedWeights = refine(best.combo, best.weightsPercent, targetLab);
  best = { combo: best.combo, weightsPercent: refinedWeights, ...evalMix(best.combo, refinedWeights, targetLab) };

  return formatResult(best);
}

function evalMix(combo, weightsPercent, targetLab) {
  const rgb01 = mixPigments(combo, weightsPercent);
  const dist = labDistance(rgbToLab(rgb01.map((v) => v * 255)), targetLab);
  return { dist, rgb01 };
}

function coarseSearch(pigments, targetLab) {
  let best = null;
  const consider = (combo, weightsPercent) => {
    const { dist, rgb01 } = evalMix(combo, weightsPercent, targetLab);
    if (!best || dist < best.dist) {
      best = { combo, weightsPercent, dist, rgb01 };
    }
  };

  pigments.forEach((p) => consider([p], [100]));

  for (let i = 0; i < pigments.length; i++) {
    for (let j = i + 1; j < pigments.length; j++) {
      for (let w = 5; w <= 95; w += 5) {
        consider([pigments[i], pigments[j]], [w, 100 - w]);
      }
    }
  }

  for (let i = 0; i < pigments.length; i++) {
    for (let j = i + 1; j < pigments.length; j++) {
      for (let k = j + 1; k < pigments.length; k++) {
        for (let a = 1; a <= 8; a++) {
          for (let b = 1; b <= 9 - a; b++) {
            const c = 10 - a - b;
            if (c < 1) continue;
            consider([pigments[i], pigments[j], pigments[k]], [a * 10, b * 10, c * 10]);
          }
        }
      }
    }
  }

  return best;
}

/** Essaie d'ajouter un pigment de plus à `best`, ne le garde que si ça améliore nettement le résultat. */
function tryExtend(best, pigments, targetLab, size) {
  if (best.combo.length !== size - 1) return best;

  const remaining = pigments.filter((p) => !best.combo.includes(p));
  let candidate = null;

  remaining.forEach((extra) => {
    for (let wExtra = 5; wExtra <= 40; wExtra += 5) {
      const scale = (100 - wExtra) / 100;
      const weightsPercent = roundToSum100([...best.weightsPercent.map((w) => w * scale), wExtra]);
      const combo = [...best.combo, extra];
      const { dist, rgb01 } = evalMix(combo, weightsPercent, targetLab);
      if (!candidate || dist < candidate.dist) {
        candidate = { combo, weightsPercent, dist, rgb01 };
      }
    }
  });

  return candidate && best.dist - candidate.dist > EXTEND_MIN_GAIN ? candidate : best;
}

/** Descente de coordonnées : ajuste chaque proportion pas à pas pour coller de plus près à la cible. */
function refine(combo, weightsPercent, targetLab) {
  if (combo.length < 2) return weightsPercent;

  let weights = weightsPercent.slice();
  let bestDist = evalMix(combo, weights, targetLab).dist;
  const steps = [5, 2, 1, -1, -2, -5];

  let improved = true;
  let guard = 0;
  while (improved && guard < 40) {
    improved = false;
    guard++;
    for (let i = 0; i < weights.length; i++) {
      for (const step of steps) {
        const trial = weights.slice();
        trial[i] = Math.max(1, trial[i] + step);
        const normalized = roundToSum100(trial);
        const dist = evalMix(combo, normalized, targetLab).dist;
        if (dist < bestDist - 1e-9) {
          bestDist = dist;
          weights = normalized;
          improved = true;
        }
      }
    }
  }
  return weights;
}

function roundToSum100(weights) {
  const total = weights.reduce((a, w) => a + w, 0);
  const rounded = weights.map((w) => Math.max(1, Math.round((w / total) * 100)));
  let diff = 100 - rounded.reduce((a, b) => a + b, 0);
  while (diff !== 0) {
    const idx = rounded.indexOf(Math.max(...rounded));
    if (diff > 0) {
      rounded[idx] += 1;
      diff--;
    } else if (rounded[idx] > 1) {
      rounded[idx] -= 1;
      diff++;
    } else {
      break; // évite une boucle infinie sur un cas dégénéré
    }
  }
  return rounded;
}

function gcd(a, b) {
  return b < 1e-6 ? a : gcd(b, a % b);
}

/** Convertit des pourcentages en un nombre de "parts" toujours affichable, simplifié si possible. */
function toParts(percentages) {
  const DENOM = 20;
  const raw = percentages.map((p) => Math.max(1, Math.round((p / 100) * DENOM)));
  let diff = DENOM - raw.reduce((a, b) => a + b, 0);
  while (diff !== 0) {
    const idx = raw.indexOf(Math.max(...raw));
    if (diff > 0) { raw[idx] += 1; diff--; }
    else if (raw[idx] > 1) { raw[idx] -= 1; diff++; }
    else break;
  }
  const divisor = raw.reduce((g, v) => gcd(g, v), raw[0]);
  return divisor > 1 ? raw.map((v) => v / divisor) : raw;
}

function formatResult(best) {
  const percentages = roundToSum100(best.weightsPercent);
  const resultHex = rgb01ToHex(best.rgb01);
  const precision = Math.max(0, Math.min(100, Math.round(100 - best.dist * 1.1)));
  const parts = toParts(percentages);

  return {
    parts: best.combo.map((p, i) => ({
      pigment: p,
      percent: percentages[i],
      ratio: parts[i],
    })),
    resultHex,
    precision,
  };
}
