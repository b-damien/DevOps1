# Atelier - Gestionnaire de tâches

Application web React permettant de gérer simplement des tâches dans trois colonnes : **À faire**, **En cours** et **Terminées**.

Le projet sert de support à un labo DevOps : l'application est conteneurisée avec Docker, l'infrastructure AWS est décrite avec Terraform et chaque push sur `main` déclenche un pipeline CI/CD (CodePipeline → CodeBuild → CodeDeploy) qui teste, construit et déploie automatiquement l'application sur une instance EC2.

Application en ligne : https://mon-app-react.ainz05.com

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Lancer le projet en local](#lancer-le-projet-en-local)
- [Tests](#tests)
- [Docker](#docker)
- [Infrastructure AWS (Terraform)](#infrastructure-aws-terraform)
- [Pipeline CI/CD](#pipeline-cicd)

## Fonctionnalités

- Créer une tâche avec un titre, une description, une personne assignée, un statut, une priorité et une échéance.
- Modifier ou supprimer une tâche depuis le menu `...`.
- Déplacer une tâche entre les colonnes avec le glisser-déposer.
- Rechercher une tâche et filtrer par personne.
- Suivre la progression des tâches terminées.
- Sauvegarde automatique dans le `localStorage` du navigateur.

## Stack technique

| Domaine | Outils |
| --- | --- |
| Front-end | React, Vite, lucide-react |
| Tests | Vitest, Testing Library, jsdom |
| Conteneur | Docker (build multi-étapes Node 20 → Nginx) |
| Infrastructure | Terraform, AWS (EC2, Elastic IP, ECR, IAM, S3) |
| CI/CD | AWS CodePipeline, CodeBuild, CodeDeploy |
| Reverse proxy / HTTPS | Traefik v3 + Let's Encrypt |

## Structure du projet

```text
.
├── src/
│   ├── main.jsx            # Composants React et logique de l'application
│   ├── taskUtils.js        # Fonctions utilitaires (chargement, filtres, progression)
│   ├── styles.css          # Styles de l'interface
│   ├── App.test.jsx        # Tests unitaires et d'intégration
│   └── setupTests.js       # Configuration de Testing Library
├── scripts/
│   ├── start_container.sh  # Hook CodeDeploy : récupère l'image ECR et (re)lance le conteneur
│   └── stop_container.sh   # Hook CodeDeploy : sans effet (logique gérée dans start)
├── terraform/
│   ├── provider.tf         # Provider AWS (région eu-west-3)
│   ├── variables.tf        # Type d'instance et clé SSH
│   ├── main.tf             # Ressources AWS et pipeline
│   ├── outputs.tf          # IP publique et URL du dépôt ECR
│   └── install_docker.sh   # user_data de l'EC2 (Docker, AWS CLI, agent CodeDeploy, Traefik)
├── Dockerfile
├── docker-compose.yml
├── buildspec.yml           # Étapes CodeBuild
└── appspec.yml             # Étapes CodeDeploy
```

## Lancer le projet en local

Prérequis : Node.js 20.19 ou plus récent (exigé par Vite 7 et Vitest 4), et npm.

```bash
git clone <URL_DU_DEPOT>
cd DevOps1
npm install
npm run dev
```

L'application est ensuite disponible sur l'URL indiquée par Vite, généralement http://localhost:5173/.

Sous Windows PowerShell, utiliser `npm.cmd` à la place de `npm` si la politique d'exécution bloque la commande.

Pour tester la version de production :

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test             # exécution unique (utilisée par le pipeline)
npm run test:watch   # mode surveillance pendant le développement
```

Les tests couvrent :

- le chargement des tâches depuis le `localStorage` ;
- le filtrage par personne et par mot-clé ;
- l'affichage des tâches enregistrées dans le tableau ;
- la création d'une tâche depuis la fenêtre modale ;
- le filtrage combiné recherche + personne dans l'interface.

Le pipeline exécute `npm test` **avant** de construire l'image : si un test échoue, aucune image n'est construite ni déployée.

## Docker

Le `Dockerfile` utilise un build multi-étapes :

1. `node:20-alpine` installe les dépendances et compile l'application (`npm run build`) ;
2. `nginx:alpine` sert uniquement le dossier `dist/` généré, sur le port 80.

Lancer l'application avec Docker Compose :

```bash
docker compose up --build
```

L'application est alors accessible sur http://localhost:8080.

## Infrastructure AWS (Terraform)

L'infrastructure est décrite dans le dossier `terraform/`, dans la région `eu-west-3` (Paris). Seule la connexion GitHub de CodePipeline est créée à la main (voir plus bas).

| Ressource | Rôle |
| --- | --- |
| `aws_instance.web` | Instance EC2 Ubuntu (`t3.micro`) qui héberge l'application |
| `aws_eip.web_eip` | Adresse IP publique fixe |
| `aws_security_group.web_sg` | Ouvre les ports 22 (SSH), 80 (HTTP) et 443 (HTTPS) |
| `aws_ecr_repository.app_repo` | Dépôt d'images Docker `mon-app-react` (scan à chaque push) |
| `aws_codebuild_project.app_build` | Projet de build (mode privilégié pour Docker) |
| `aws_codedeploy_app` / `deployment_group` | Déploiement sur les instances taguées `Name=web-server-react` |
| `aws_codepipeline.app_pipeline` | Orchestration Source → Build → Deploy |
| `aws_s3_bucket.pipeline_artifacts` | Stockage des artefacts du pipeline |
| Rôles IAM | Un rôle par service (EC2, CodeBuild, CodeDeploy, CodePipeline) |

Au premier démarrage, le script `install_docker.sh` (user_data) installe Docker, l'AWS CLI et l'agent CodeDeploy, crée le réseau Docker `web`, lance **Traefik** (reverse proxy avec certificat HTTPS Let's Encrypt) puis démarre le conteneur de l'application.

### Déployer l'infrastructure

Prérequis : Terraform, l'AWS CLI configurée avec des identifiants valides, et une paire de clés SSH `devops-key` existante dans AWS.

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Les sorties affichent l'IP publique de l'instance (`instance_public_ip`) et l'URL du dépôt ECR (`ecr_repository_url`). Le nom de domaine doit pointer vers cette IP pour que Traefik obtienne le certificat HTTPS.

Pour tout supprimer :

```bash
terraform destroy
```

> La connexion GitHub (`ConnectionArn`) utilisée par CodePipeline doit être créée et validée au préalable dans la console AWS (Developer Tools → Connections).

> Lors du tout premier `terraform apply`, le dépôt ECR est encore vide : le `docker pull` du script `install_docker.sh` échoue et l'application ne démarre qu'après le premier passage du pipeline (lancement manuel avec « Release change » dans CodePipeline si besoin).

## Pipeline CI/CD

```text
push sur main ──► CodePipeline
                    │
                    ├─ Source  : récupération du dépôt GitHub (CodeConnections)
                    ├─ Build   : CodeBuild (buildspec.yml)
                    │             npm install → npm test → docker build → push ECR
                    └─ Deploy  : CodeDeploy (appspec.yml) sur l'EC2
                                  start_container.sh → pull de l'image → redémarrage si nouvelle
```

### Déclenchement

Le pipeline se lance uniquement sur un push vers `main` qui modifie des fichiers utiles à l'application :

- inclus : `src/**`, `Dockerfile`, `package*.json`, `appspec.yml`, `buildspec.yml`, `scripts/**`, `index.html`, `vite.config.js` ;
- exclus : `terraform/**`, `README.md`.

Modifier ce README ou l'infrastructure ne déclenche donc pas de nouveau déploiement.

### Build (`buildspec.yml`)

1. Installation des dépendances (`npm install`) ;
2. Exécution des tests (`npm test`) — le build s'arrête si un test échoue ;
3. Connexion à ECR ;
4. Construction de l'image, taguée `latest` et avec les 8 premiers caractères du hash du commit ;
5. Push des deux tags vers ECR.

### Déploiement (`appspec.yml`)

CodeDeploy copie les fichiers dans `/home/ubuntu/app` puis exécute `scripts/start_container.sh`, qui :

1. se connecte à ECR et télécharge l'image `latest` ;
2. compare son identifiant avec celui du conteneur en cours d'exécution ;
3. si l'image est identique, ne fait rien ; sinon, supprime l'ancien conteneur et relance le nouveau sur le réseau `web` avec les labels Traefik (HTTPS sur `mon-app-react.ainz05.com`).
