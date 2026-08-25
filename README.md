# MixColor

Petite web app mobile pour calculer des mélanges de peinture.

- Choix du type de peinture (acrylique, huile, gouache, aquarelle).
- **Trouver un mélange** : on choisit une couleur cible, l'app propose la
  combinaison de pigments (1 à 3) et les proportions qui s'en rapprochent le
  plus.
- **Simuler un mélange** : on choisit jusqu'à 3 pigments et leurs parts
  relatives, l'app affiche en direct la couleur obtenue.

Aucune dépendance, aucun build : HTML/CSS/JS statique. Pour lancer en local,
servir le dossier avec n'importe quel serveur statique, par ex. :

```
python3 -m http.server 8000
```

puis ouvrir `http://localhost:8000`.

Le mélange des couleurs est calculé dans l'espace RYB (rouge/jaune/bleu),
qui approxime le comportement des pigments (soustractif) bien mieux qu'une
simple moyenne RGB — voir `js/color.js`.
