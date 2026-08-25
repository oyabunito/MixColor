/**
 * Modèle de mélange RYB (rouge/jaune/bleu) : approxime le comportement
 * "peinture" (soustractif) bien mieux qu'une simple moyenne RGB.
 * Référence : Gossett & Chen, "Paint Inspired Color Mixing and Compositing".
 */

function cubicInterp(t, a, b) {
  const w = t * t * (3 - 2 * t);
  return a + w * (b - a);
}

// Couleurs des 8 sommets du cube RYB (r,y,b ∈ {0,1}).
const RYB_CORNERS = {
  white: [1, 1, 1],
  red: [1, 0, 0],
  yellow: [1, 1, 0],
  blue: [0.163, 0.373, 0.6],
  violet: [0.5, 0, 0.5],
  green: [0, 0.66, 0.2],
  orange: [1, 0.5, 0],
  black: [0.2, 0.094, 0],
};

/**
 * Interpolation brute des 8 sommets du cube, telle que décrite dans la
 * littérature (Gossett & Chen). Avec cette formule, le 1er paramètre
 * correspond en réalité à l'axe jaune et le 2e à l'axe rouge : on corrige
 * l'ordre dans `rybToRgb` ci-dessous pour que l'API reste (rouge, jaune, bleu).
 */
function rybCornerBlend(a, b, c) {
  const out = [];
  for (const channel of [0, 1, 2]) {
    const x0 = cubicInterp(c, RYB_CORNERS.white[channel], RYB_CORNERS.blue[channel]);
    const x1 = cubicInterp(c, RYB_CORNERS.red[channel], RYB_CORNERS.violet[channel]);
    const x2 = cubicInterp(c, RYB_CORNERS.yellow[channel], RYB_CORNERS.green[channel]);
    const x3 = cubicInterp(c, RYB_CORNERS.orange[channel], RYB_CORNERS.black[channel]);
    const y0 = cubicInterp(b, x0, x1);
    const y1 = cubicInterp(b, x2, x3);
    out.push(cubicInterp(a, y0, y1));
  }
  return out;
}

/** Convertit une coordonnée (rouge, jaune, bleu) dans [0,1]^3 en RGB [0,1]^3. */
function rybToRgb(r, y, b) {
  return rybCornerBlend(y, r, b);
}

/** Mélange pondéré de plusieurs pigments (coordonnées RYB) -> RGB [0,1]^3. */
function mixPigments(pigments, weights) {
  let r = 0, y = 0, b = 0;
  const total = weights.reduce((a, w) => a + w, 0) || 1;
  pigments.forEach((p, i) => {
    const w = weights[i] / total;
    r += p.ryb[0] * w;
    y += p.ryb[1] * w;
    b += p.ryb[2] * w;
  });
  return rybToRgb(r, y, b);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function rgb01ToHex(rgb01) {
  return rgbToHex(rgb01.map((v) => v * 255));
}

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToXyz([r, g, b]) {
  r = srgbToLinear(r); g = srgbToLinear(g); b = srgbToLinear(b);
  return [
    (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
    (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100,
    (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100,
  ];
}

function xyzToLab([X, Y, Z]) {
  const refX = 95.047, refY = 100.0, refZ = 108.883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f(X / refX), y = f(Y / refY), z = f(Z / refZ);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

function rgbToLab(rgb) {
  return xyzToLab(rgbToXyz(rgb));
}

function labDistance(l1, l2) {
  return Math.sqrt((l1[0] - l2[0]) ** 2 + (l1[1] - l2[1]) ** 2 + (l1[2] - l2[2]) ** 2);
}

function normalizeSearch(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

/** Nom français approximatif d'une couleur, à partir de sa teinte/saturation/luminosité. */
function nameColor(rgb) {
  const [h, s, l] = rgbToHsl(rgb);

  if (s < 8) {
    if (l < 12) return 'noir';
    if (l > 92) return 'blanc';
    if (l < 40) return 'gris foncé';
    if (l > 65) return 'gris clair';
    return 'gris';
  }

  const hues = [
    [15, 'rouge'], [35, 'orange'], [50, 'orange doré'], [65, 'jaune'],
    [90, 'jaune-vert'], [150, 'vert'], [175, 'vert émeraude'], [195, 'turquoise'],
    [220, 'bleu ciel'], [245, 'bleu'], [270, 'indigo'], [290, 'violet'],
    [320, 'magenta'], [345, 'rose'], [360, 'rouge'],
  ];
  let base = hues.find(([max]) => h <= max)?.[1] || 'rouge';

  let modifier = '';
  if (l < 25) modifier = 'très foncé';
  else if (l < 40) modifier = 'foncé';
  else if (l > 85) modifier = 'très clair';
  else if (l > 70) modifier = 'clair';
  else if (s < 30) modifier = 'terne';
  else if (s > 80 && l > 40 && l < 60) modifier = 'vif';

  return modifier ? `${base} ${modifier}` : base;
}
