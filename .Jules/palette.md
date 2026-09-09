## 2024-09-09 - Suppression de maximum-scale
**Learning:** L'utilisation de `maximum-scale=1` dans la balise `<meta name="viewport">` empêche les utilisateurs de zoomer sur la page, ce qui nuit gravement à l'accessibilité pour les utilisateurs malvoyants. Il est crucial d'autoriser le zoom pour se conformer aux normes d'accessibilité web (WCAG).
**Action:** La prochaine fois, vérifier systématiquement que la balise viewport n'inclut pas de restriction de zoom. La configuration recommandée est `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
