# TP1 — Explorer les paramètres et l'interface de GitHub Copilot

**Durée indicative : 30 min**

## Contexte du fil rouge

Vous rejoignez l'équipe qui maintient **epicerie-stock**, l'API de gestion de stock d'une épicerie fine. Chaque soir, un traitement fait « vieillir » le stock : les dates de péremption avancent et la qualité des produits évolue selon des règles métier… que plus personne ne maîtrise vraiment. Le code n'est ni documenté ni testé.

Tout au long de la journée, vous allez vous servir de GitHub Copilot pour comprendre, documenter, faire évoluer, tester puis assainir ce code.

## Prérequis

- VS Code à jour, Node.js 20 ou plus.
- Un compte GitHub avec Copilot activé (le plan Free suffit).
- Le projet est un dépôt Git (cloné depuis GitHub, ou initialisé avec `git init && git add . && git commit -m "Version initiale"`). Les TP s'appuient sur `git diff` pour vérifier les modifications.
- Depuis ce dossier : `npm install`, puis `npm run simulate` doit afficher l'état du stock sur 2 jours.

> ⚠️ Plan Free : vos interactions avec le chat sont limitées chaque mois. Gardez un œil sur la jauge d'utilisation (étape 1) et privilégiez des demandes précises plutôt que de multiplier les essais.

## Étape 1 — Vérifier l'installation et la jauge d'utilisation

1. Vérifiez que l'extension **GitHub Copilot Chat** est installée et que vous êtes connecté avec votre compte GitHub.
2. Repérez l'icône Copilot dans la barre d'état (en bas de la fenêtre). Cliquez dessus.
3. Identifiez : votre plan, la consommation des complétions et du chat, et l'option pour désactiver temporairement les complétions.

## Étape 2 — Configurer les paramètres

1. Ouvrez les paramètres (`Ctrl+,` / `Cmd+,`) et recherchez `copilot`.
2. Dans les paramètres de l'**espace de travail** (pas utilisateur) :
   - désactivez les complétions pour les fichiers `plaintext` et `json` ;
   - laissez-les actives pour JavaScript et Markdown ;
   - vérifiez que les **Next Edit Suggestions** sont activées.
3. Ouvrez le fichier `.vscode/settings.json` généré et observez son contenu.

## Étape 3 — Ajouter des instructions personnalisées (règles du projet)

1. Créez le fichier `.github/copilot-instructions.md`.
2. Rédigez-y les règles de l'équipe : langue des réponses, langue du code et des commentaires, framework de test (Jest, dossier `test/`), interdiction de modifier `src/inventory.js` sans tests, pas de nouvelle dépendance sans le signaler.
3. Dans la vue Chat, posez une question simple sur le projet et vérifiez dans la réponse (section *References* / *Used references*) que le fichier d'instructions a bien été pris en compte.

## Étape 4 — Découvrir les quatre interfaces de Copilot

Sur le fichier `src/inventory.js` :

| Interface | Raccourci (Windows/Linux) | À essayer |
|---|---|---|
| Complétion de code | (automatique) / `Tab` pour accepter | Sous la classe `Inventory`, tapez `// retourne les produits dont la qualité est nulle` puis passez à la ligne |
| Chat en ligne | `Ctrl+I` | Sélectionnez la méthode `endOfDay` et demandez « Que fait ce code en une phrase ? » |
| Vue Chat | `Ctrl+Alt+I` | Demandez « Quelles sont les routes exposées par cette API ? » en ajoutant `#codebase` |
| Chat rapide | `Ctrl+Shift+Alt+L` | Demandez « Comment lancer les tests avec Jest ? » |

Annulez (`Ctrl+Z`) le code éventuellement ajouté à `inventory.js` : on n'y touche pas encore.

## Étape 5 — Actions intelligentes, participants, commandes et variables

1. Clic droit dans l'éditeur → menu **Copilot** (ou **Generate Code**) : listez les actions intelligentes proposées.
2. Dans la vue Chat, tapez `@` puis `/` puis `#` et notez ce que chaque préfixe propose.
3. Repérez le sélecteur de **mode** (Ask / Agent) et le sélecteur de **modèle** de la vue Chat.

## Livrable

- `.vscode/settings.json` et `.github/copilot-instructions.md` présents dans votre projet.
- Une fiche personnelle (papier ou fichier) listant : 3 participants `@`, 4 commandes `/`, 3 variables `#`.
