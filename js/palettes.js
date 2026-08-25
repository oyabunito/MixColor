/** Types de peinture proposés, avec un conseil pratique propre à chaque médium. */
const PAINT_TYPES = [
  {
    id: 'acrylique',
    label: 'Acrylique',
    tip: "Séchage rapide : préparez le mélange en quantité suffisante d'un coup, il est difficile de le raviver ensuite.",
  },
  {
    id: 'huile',
    label: 'Huile',
    tip: 'Séchage lent : vous pouvez mélanger directement sur la palette et ajuster pendant plusieurs heures.',
  },
  {
    id: 'gouache',
    label: 'Gouache',
    tip: 'Opaque et mate : les proportions comptent surtout pour la teinte, la couvrance reste forte même diluée.',
  },
  {
    id: 'aquarelle',
    label: 'Aquarelle',
    tip: "Pas de blanc : c'est l'eau qui éclaircit en diluant la couleur et en laissant transparaître le papier.",
  },
];

/**
 * Pigments de base. Chaque couleur est définie par ses coordonnées dans le
 * cube RYB (rouge/jaune/bleu, chacune dans [0,1]) : c'est ce triplet qui sert
 * au calcul des mélanges. `types` liste les mediums où ce pigment est proposé.
 */
const PIGMENTS = [
  { id: 'blanc', name: 'Blanc de titane', ryb: [0, 0, 0], types: ['acrylique', 'huile', 'gouache'] },
  { id: 'eau', name: 'Eau (dilution)', ryb: [0, 0, 0], types: ['aquarelle'] },
  { id: 'noir', name: 'Noir ivoire', ryb: [1, 1, 1], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
  { id: 'jaune', name: 'Jaune primaire (citron)', ryb: [0, 1, 0], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
  { id: 'rouge', name: 'Rouge primaire (vermillon)', ryb: [1, 0, 0], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
  { id: 'bleu', name: 'Bleu primaire (outremer)', ryb: [0, 0, 1], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
  { id: 'orange', name: 'Orange', ryb: [1, 1, 0], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
  { id: 'vert', name: 'Vert', ryb: [0, 1, 1], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
  { id: 'violet', name: 'Violet', ryb: [1, 0, 1], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
  { id: 'ocre', name: 'Ocre jaune', ryb: [0.4, 0.55, 0.15], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
  { id: 'cyan', name: 'Bleu cyan (phtalo)', ryb: [0, 0.25, 0.7], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
  { id: 'carmin', name: 'Rouge alizarine (carmin)', ryb: [1, 0, 0.5], types: ['acrylique', 'huile', 'gouache', 'aquarelle'] },
];

function pigmentsForType(typeId) {
  return PIGMENTS.filter((p) => p.types.includes(typeId));
}
