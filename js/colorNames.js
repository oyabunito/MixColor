/**
 * Nuancier de couleurs nommées, pour la recherche par nom dans le mode
 * "Trouver un mélange". `tags` liste les mots-clés (famille de couleur,
 * synonymes) qui doivent aussi faire remonter cette entrée — ex. taper
 * "rouge" doit sortir "Bordeaux" même si le mot "rouge" n'est pas dans
 * le nom.
 */
const NAMED_COLORS = [
  // Rouges
  { name: 'Rouge vermillon', hex: '#e34234', tags: ['rouge'] },
  { name: 'Rouge carmin', hex: '#960018', tags: ['rouge'] },
  { name: 'Rouge cerise', hex: '#de3163', tags: ['rouge', 'rose'] },
  { name: 'Rouge coquelicot', hex: '#ff4433', tags: ['rouge'] },
  { name: 'Bordeaux', hex: '#6d071a', tags: ['rouge'] },
  { name: 'Grenat', hex: '#7c0a02', tags: ['rouge'] },
  { name: 'Rouge brique', hex: '#8b2500', tags: ['rouge', 'orange', 'marron'] },
  { name: 'Rouge tomate', hex: '#e63946', tags: ['rouge'] },
  { name: 'Rouge sang', hex: '#660000', tags: ['rouge'] },
  { name: 'Rouge écarlate', hex: '#ff2400', tags: ['rouge'] },
  { name: 'Rouge cardinal', hex: '#c41e3a', tags: ['rouge'] },
  { name: 'Rouge groseille', hex: '#a30015', tags: ['rouge'] },
  { name: 'Rouge rubis', hex: '#9b111e', tags: ['rouge'] },
  { name: 'Rouge brûlé', hex: '#8a3324', tags: ['rouge', 'orange', 'marron'] },

  // Roses
  { name: 'Rose poudré', hex: '#e8b4b8', tags: ['rose'] },
  { name: 'Rose pâle', hex: '#fadadd', tags: ['rose'] },
  { name: 'Rose bonbon', hex: '#f4c2c2', tags: ['rose'] },
  { name: 'Rose saumon', hex: '#fa8072', tags: ['rose', 'orange'] },
  { name: 'Magenta', hex: '#cc0066', tags: ['rose', 'violet'] },
  { name: 'Fuchsia', hex: '#c94277', tags: ['rose', 'violet'] },
  { name: 'Rose thé', hex: '#f1b2b3', tags: ['rose'] },
  { name: 'Vieux rose', hex: '#c08081', tags: ['rose'] },
  { name: 'Rose indien', hex: '#cd5c5c', tags: ['rose', 'rouge'] },

  // Oranges
  { name: 'Orange vif', hex: '#ff6600', tags: ['orange'] },
  { name: 'Corail', hex: '#ff6f61', tags: ['orange', 'rose'] },
  { name: 'Terracotta', hex: '#e2725b', tags: ['orange', 'marron'] },
  { name: 'Abricot', hex: '#fbceb1', tags: ['orange'] },
  { name: 'Orange brûlé', hex: '#cc5500', tags: ['orange', 'marron'] },
  { name: 'Mandarine', hex: '#f28c28', tags: ['orange'] },
  { name: 'Safran', hex: '#f4c430', tags: ['orange', 'jaune'] },
  { name: 'Pêche', hex: '#ffdab9', tags: ['orange'] },
  { name: 'Cuivre', hex: '#b87333', tags: ['orange', 'marron'] },

  // Jaunes
  { name: 'Jaune citron', hex: '#fff44f', tags: ['jaune'] },
  { name: 'Jaune moutarde', hex: '#c9a227', tags: ['jaune'] },
  { name: 'Jaune ocre', hex: '#cc7722', tags: ['jaune', 'orange'] },
  { name: 'Jaune paille', hex: '#f5e050', tags: ['jaune'] },
  { name: 'Jaune canari', hex: '#ffef00', tags: ['jaune'] },
  { name: 'Doré', hex: '#d4af37', tags: ['jaune', 'orange'] },
  { name: 'Jaune poussin', hex: '#fff35c', tags: ['jaune'] },
  { name: 'Champagne', hex: '#f7e7ce', tags: ['jaune', 'beige'] },

  // Verts
  { name: 'Vert forêt', hex: '#228b22', tags: ['vert'] },
  { name: 'Vert olive', hex: '#708238', tags: ['vert'] },
  { name: 'Vert émeraude', hex: '#50c878', tags: ['vert'] },
  { name: 'Vert menthe', hex: '#98ff98', tags: ['vert'] },
  { name: 'Vert sapin', hex: '#0b6623', tags: ['vert'] },
  { name: 'Vert pomme', hex: '#8db600', tags: ['vert', 'jaune'] },
  { name: 'Kaki', hex: '#78866b', tags: ['vert', 'marron'] },
  { name: 'Vert bouteille', hex: '#006a4e', tags: ['vert'] },
  { name: 'Vert amande', hex: '#82c46c', tags: ['vert'] },
  { name: 'Vert céladon', hex: '#ace1af', tags: ['vert'] },
  { name: 'Vert anis', hex: '#9fe855', tags: ['vert', 'jaune'] },
  { name: 'Vert prairie', hex: '#4f7942', tags: ['vert'] },
  { name: 'Vert d\'eau', hex: '#8fd6bd', tags: ['vert', 'bleu', 'turquoise'] },

  // Bleus
  { name: 'Bleu marine', hex: '#1b2a4a', tags: ['bleu'] },
  { name: 'Bleu roi', hex: '#4169e1', tags: ['bleu'] },
  { name: 'Bleu ciel', hex: '#87ceeb', tags: ['bleu'] },
  { name: 'Bleu pétrole', hex: '#005f6a', tags: ['bleu', 'vert'] },
  { name: 'Bleu cobalt', hex: '#0047ab', tags: ['bleu'] },
  { name: 'Bleu canard', hex: '#045d5d', tags: ['bleu', 'vert'] },
  { name: 'Bleu nuit', hex: '#0c1445', tags: ['bleu'] },
  { name: 'Bleu poudre', hex: '#b0e0e6', tags: ['bleu'] },
  { name: 'Bleu paon', hex: '#1b6b93', tags: ['bleu', 'vert'] },
  { name: 'Indigo', hex: '#4b0082', tags: ['bleu', 'violet'] },
  { name: 'Bleu layette', hex: '#c9e7f5', tags: ['bleu'] },
  { name: 'Turquoise', hex: '#30d5c8', tags: ['bleu', 'vert', 'turquoise'] },
  { name: 'Bleu-vert', hex: '#0d98ba', tags: ['bleu', 'vert', 'turquoise'] },

  // Violets
  { name: 'Prune', hex: '#5b2a5e', tags: ['violet'] },
  { name: 'Lavande', hex: '#b497bd', tags: ['violet'] },
  { name: 'Mauve', hex: '#a55a9a', tags: ['violet', 'rose'] },
  { name: 'Aubergine', hex: '#3b0910', tags: ['violet', 'marron'] },
  { name: 'Violet parme', hex: '#8e4585', tags: ['violet'] },
  { name: 'Violet évêque', hex: '#5d3fd3', tags: ['violet', 'bleu'] },
  { name: 'Lilas', hex: '#c8a2c8', tags: ['violet', 'rose'] },
  { name: 'Violine', hex: '#632039', tags: ['violet', 'rouge'] },

  // Marrons
  { name: 'Marron chocolat', hex: '#4a2c1c', tags: ['marron'] },
  { name: 'Café', hex: '#4b3621', tags: ['marron'] },
  { name: 'Caramel', hex: '#af6e4d', tags: ['marron', 'orange'] },
  { name: 'Terre de sienne', hex: '#a0522d', tags: ['marron', 'orange'] },
  { name: 'Noisette', hex: '#8b5a2b', tags: ['marron'] },
  { name: 'Acajou', hex: '#5e2129', tags: ['marron', 'rouge'] },
  { name: 'Havane', hex: '#977148', tags: ['marron'] },
  { name: 'Chocolat noir', hex: '#3d1e10', tags: ['marron'] },
  { name: 'Camel', hex: '#c19a6b', tags: ['marron', 'beige'] },

  // Neutres
  { name: 'Beige', hex: '#d2b48c', tags: ['beige', 'marron'] },
  { name: 'Gris perle', hex: '#c6c4c0', tags: ['gris'] },
  { name: 'Gris souris', hex: '#9e9e9e', tags: ['gris'] },
  { name: 'Gris anthracite', hex: '#2c2c2c', tags: ['gris', 'noir'] },
  { name: 'Gris taupe', hex: '#7b6d63', tags: ['gris', 'marron'] },
  { name: 'Blanc cassé', hex: '#f5f5dc', tags: ['blanc', 'beige'] },
  { name: 'Ivoire', hex: '#fffff0', tags: ['blanc'] },
  { name: 'Noir profond', hex: '#0b0b0b', tags: ['noir'] },
];
