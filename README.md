# Atelier - Gestionnaire de taches

Application web React permettant de gerer simplement des taches dans trois colonnes : **A faire**, **En cours** et **Terminees**.

Les taches sont sauvegardees automatiquement dans le `localStorage` du navigateur.

## Fonctionnalites

- Creer une tache avec un titre, une description, une personne assignee, un statut, une priorite et une echeance.
- Modifier une tache depuis le menu `...`.
- Supprimer une tache depuis le menu `...`.
- Deplacer une tache entre les colonnes avec le glisser-deposer.
- Rechercher une tache.
- Filtrer les taches par personne.
- Suivre la progression des taches terminees.

## Prerequis

- Node.js 18 ou une version plus recente.
- npm, installe avec Node.js.

Verifier les versions :

```bash
node --version
npm --version
```

## Installation

Cloner le projet puis entrer dans son dossier :

```bash
git clone <URL_DU_DEPOT>
cd atelier-taches
```

Installer les dependances :

```bash
npm install
```

Sous Windows PowerShell, utiliser `npm.cmd install` si la commande `npm` est bloquee par la politique d'execution PowerShell.

## Lancer le projet en developpement

```bash
npm run dev
```

Puis ouvrir l'URL indiquee par Vite, generalement :

```text
http://localhost:5173/
```

Sous Windows PowerShell, l'equivalent est :

```bash
npm.cmd run dev
```

## Tester la version de production

Compiler le projet :

```bash
npm run build
```

Lancer le serveur de previsualisation :

```bash
npm run preview
```

## Developpement

Les fichiers principaux sont dans `src/` :

- `src/main.jsx` : composants React et logique de l'application.
- `src/styles.css` : styles de l'interface.

Pour arreter le serveur de developpement, utiliser `Ctrl + C` dans le terminal.

## Envoyer le projet sur GitHub

Le fichier `.gitignore` exclut les dependances, les fichiers de build, les variables d'environnement et les fichiers temporaires. Il faut bien versionner `package.json` et `package-lock.json` afin que les autres puissent installer exactement les dependances du projet.

```bash
git add .
git commit -m "Initialise le gestionnaire de taches"
git branch -M main
git remote add origin <URL_DU_DEPOT>
git push -u origin main
```

Si le depot distant existe deja :

```bash
git add .
git commit -m "Met a jour le gestionnaire de taches"
git push origin main
```
