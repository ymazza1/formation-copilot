# TP1 — Résolution

> L'interface de Copilot dans VS Code évolue toutes les semaines. Les libellés de menus peuvent légèrement différer de ceux décrits ici ; la logique reste la même.

## Étape 1 — Installation et jauge

- Selon la version de VS Code, Copilot est fourni par l'extension **GitHub Copilot Chat** seule ou accompagnée de l'extension **GitHub Copilot** ; VS Code propose l'installation à la première ouverture du chat.
- Connexion : **Accounts** (icône en bas à gauche) → *Sign in with GitHub to use GitHub Copilot*.
- L'icône Copilot de la barre d'état ouvre un panneau qui affiche le plan, la consommation (complétions, crédits/chat) et un bouton pour **désactiver les complétions** (globalement ou pour le langage courant).

## Étape 2 — Paramètres de l'espace de travail

Dans l'éditeur de paramètres, onglet **Espace de travail** :

- `GitHub › Copilot: Enable` → *Edit in settings.json*, puis compléter l'objet par langage.
- `GitHub › Copilot › Next Edit Suggestions: Enabled` → coché.

Fichier obtenu — **`.vscode/settings.json`** (nouveau fichier) :

```json
{
  "github.copilot.enable": {
    "*": true,
    "markdown": true,
    "plaintext": false,
    "json": false
  },
  "github.copilot.nextEditSuggestions.enabled": true,
  "editor.inlineSuggest.enabled": true
}
```

Pourquoi au niveau espace de travail : ces réglages sont versionnés avec le projet et partagés par toute l'équipe, contrairement aux paramètres utilisateur.

Bonus — **`.vscode/extensions.json`** (nouveau fichier) pour recommander l'extension à tout nouvel arrivant :

```json
{
  "recommendations": ["github.copilot-chat"]
}
```

## Étape 3 — Instructions personnalisées

Fichier **`.github/copilot-instructions.md`** (nouveau fichier) : voir le fichier présent dans ce dossier.

Points clés :

- Ce fichier est automatiquement ajouté au contexte de chaque requête de chat dans ce dépôt.
- On y met des **règles stables** (conventions, outils, interdits), pas des demandes ponctuelles.
- Vérification : dans la réponse du chat, la liste des références utilisées mentionne `copilot-instructions.md`. Une réponse en français sans qu'on l'ait demandé est aussi un bon indice.
- Plus le fichier est court et précis, mieux il est respecté.

## Étape 4 — Les quatre interfaces

- **Complétion** : le commentaire `// retourne les produits dont la qualité est nulle` produit en général une méthode du type `getZeroQualityProducts() { return this.products.filter(p => p.quality === 0); }`. `Tab` accepte, `Échap` refuse, `Ctrl+→` accepte mot par mot.
- **Chat en ligne (`Ctrl+I`)** : la réponse ou la modification apparaît directement dans l'éditeur ; idéal pour une action locale sur la sélection.
- **Vue Chat** : `#codebase` déclenche une recherche dans tout le projet ; la réponse doit citer `GET /products`, `POST /products` et `POST /day/end` définies dans `src/app.js`.
- **Chat rapide** : fenêtre légère au centre de l'écran pour une question ponctuelle, sans quitter le fichier courant.

## Étape 5 — Actions intelligentes, `@`, `/`, `#`

Actions intelligentes (clic droit) : *Explain*, *Fix*, *Review*, *Generate Docs*, *Generate Tests* (la liste exacte dépend de la version).

Exemples attendus dans la fiche :

| Préfixe | Rôle | Exemples |
|---|---|---|
| `@` participant | Interlocuteur spécialisé | `@workspace`, `@vscode`, `@terminal`, `@github` |
| `/` commande | Intention prédéfinie | `/explain`, `/fix`, `/tests`, `/doc`, `/new`, `/clear` |
| `#` variable | Contexte ajouté au prompt | `#file`, `#selection`, `#codebase`, `#terminalSelection`, `#changes` |

Modes du chat : **Ask** (répond, ne modifie rien) et **Agent** (modifie les fichiers, lance des commandes, itère). Le mode **Edit** a été déprécié dans VS Code 1.111 (mars 2026).
Sur le plan Free, le sélecteur de modèle est limité à la sélection automatique.
