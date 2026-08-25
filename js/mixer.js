/**
 * Recherche, parmi les pigments disponibles, la combinaison (1 à 3 couleurs)
 * et les proportions qui approchent le mieux une couleur cible.
 */
function findBestMix(targetHex, pigments) {
  const targetLab = rgbToLab(hexToRgb(targetHex));
  let best = null;

  const consider = (combo, weights) => {
    const rgb01 = mixPigments(combo, weights);
    const dist = labDistance(rgbToLab(rgb01.map((v) => v * 255)), targetLab);
    if (!best || dist < best.dist) {
      best = { combo, weights: normalize(weights), dist, rgb01 };
    }
  };

  // 1 pigment seul
  pigments.forEach((p) => consider([p], [1]));

  // 2 pigments
  for (let i = 0; i < pigments.length; i++) {
    for (let j = i + 1; j < pigments.length; j++) {
      for (let w = 5; w <= 95; w += 5) {
        consider([pigments[i], pigments[j]], [w, 100 - w]);
      }
    }
  }

  // 3 pigments (pas de 10%, en excluant les poids nuls déjà couverts ci-dessus)
  for (let i = 0; i < pigments.length; i++) {
    for (let j = i + 1; j < pigments.length; j++) {
      for (let k = j + 1; k < pigments.length; k++) {
        for (let a = 1; a <= 8; a++) {
          for (let b = 1; b <= 9 - a; b++) {
            const c = 10 - a - b;
            if (c < 1) continue;
            consider([pigments[i], pigments[j], pigments[k]], [a, b, c]);
          }
        }
      }
    }
  }

  best = refineLocally(best, targetLab);

  return formatResult(best);
}

/**
 * Repart de la meilleure combinaison trouvée par la recherche large (pas de
 * 5 à 10%) et affine les proportions au pourcent près, dans un voisinage
 * autour de cet optimum grossier.
 */
function refineLocally(best, targetLab) {
  if (best.combo.length < 2) return best;

  const guess = best.weights.map((w) => Math.round(w * 100));
  let refined = best;

  const tryWeights = (weights) => {
    const rgb01 = mixPigments(best.combo, weights);
    const dist = labDistance(rgbToLab(rgb01.map((v) => v * 255)), targetLab);
    if (dist < refined.dist) {
      refined = { combo: best.combo, weights: normalize(weights), dist, rgb01 };
    }
  };

  const RADIUS = 6;
  if (best.combo.length === 2) {
    const g = guess[0];
    for (let a = Math.max(1, g - RADIUS); a <= Math.min(99, g + RADIUS); a++) {
      tryWeights([a, 100 - a]);
    }
  } else {
    const [ga, gb] = guess;
    for (let a = Math.max(1, ga - RADIUS); a <= Math.min(98, ga + RADIUS); a++) {
      for (let b = Math.max(1, gb - RADIUS); b <= Math.min(99 - a, gb + RADIUS); b++) {
        const c = 100 - a - b;
        if (c < 1) continue;
        tryWeights([a, b, c]);
      }
    }
  }

  return refined;
}

function normalize(weights) {
  const total = weights.reduce((a, w) => a + w, 0);
  return weights.map((w) => w / total);
}

function gcd(a, b) {
  return b < 1e-6 ? a : gcd(b, a % b);
}

function simplifyRatio(percentages) {
  const rounded = percentages.map((p) => Math.max(1, Math.round(p)));
  let divisor = rounded.reduce((g, v) => gcd(g, v), rounded[0]);
  divisor = divisor < 1 ? 1 : divisor;
  const simplified = rounded.map((v) => Math.round(v / divisor));
  const clean = simplified.every((v) => v <= 12);
  return clean ? simplified : null;
}

function formatResult(best) {
  const percentages = best.weights.map((w) => Math.round(w * 100));
  // Ajuste l'arrondi pour que la somme fasse bien 100.
  const diff = 100 - percentages.reduce((a, b) => a + b, 0);
  percentages[0] += diff;

  const resultHex = rgb01ToHex(best.rgb01);
  const precision = Math.max(0, Math.min(100, Math.round(100 - best.dist * 1.1)));
  const ratio = best.combo.length > 1 ? simplifyRatio(percentages) : null;

  return {
    parts: best.combo.map((p, i) => ({
      pigment: p,
      percent: percentages[i],
      ratio: ratio ? ratio[i] : null,
    })),
    resultHex,
    precision,
  };
}
