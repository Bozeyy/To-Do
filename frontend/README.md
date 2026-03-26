# To-Doux ✅

To-Doux est une application de gestion de tâches (To-Do list) complète, moderne et responsive, conçue pour vous aider à organiser votre quotidien efficacement. Développée avec Next.js, elle offre une expérience utilisateur fluide et intuitive (PWA) de type application native.

## 🌟 Fonctionnalités Principales

### 1. Gestion des Utilisateurs (Authentification)
- **Inscription & Connexion** : Créez un compte et connectez-vous de manière sécurisée (NextAuth.js). Les données de chaque utilisateur sont isolées.
- **Sessions** : Maintien de la connexion pour ne pas avoir à se reconnecter à chaque visite.

### 2. Organisation par Groupes
- **Dashboard Principal** : Un aperçu global de tous vos groupes de tâches avec des badges dynamiques affichant le nombre de tâches restantes (rouge, parfaitement rond).
- **Création de Groupes** : Regroupez vos tâches par listes personnalisées (ex: Travail, Maison, Courses).
- **Personnalisation** : Chaque groupe peut avoir une couleur spécifique et un nom.
- **Vue "Toutes les tâches"** : Un groupe généré automatiquement pour rassembler et visualiser toutes les tâches confondues, peu importe le groupe.

### 3. Gestion Indépendante des Tâches
- **Ajout de Tâches** : Créez des tâches rapidement au sein d'un groupe spécifique.
- **Détails Complets** :
  - Titre de la tâche.
  - Description optionnelle pour plus de contexte.
  - Date d'échéance (affichée en rouge si dépassée).
  - Couleur spécifique de tâche ou hérité du groupe (illustrée par une pastille/bande visuelle soignée).
- **Statut (À faire / Faites)** : Basculez l'état d'une tâche d'un simple clic. Les vues sont séparées en onglets "À faire" et "Faites".
- **Actions Rapides** : Menu dédié sur chaque tâche pour modifier (Edit) ou supprimer (Delete).
- **Détail en Modale (Long Press)** : Maintenez l'appui (ou le clic) sur une tâche pour afficher un modal de détail complet avec toutes ses informations (titre, dates, statut, couleur, description).

### 4. Vue Calendrier (Calendar)
- **Navigation Mensuelle** : Visualisez l'ensemble de vos tâches réparties dans un calendrier complet.
- **Indicateurs Visuels** : Chaque tâche de la journée apparaît avec la couleur de son groupe associé.
- **Détail Journalier** : Cliquez sur une date pour afficher toutes les tâches prévues ce jour-là via un modal flottant (avec onglets À faire/Faites).
- **Ajout au Calendrier** : Créez une tâche directement associée au jour consulté.

### 5. Application Progressive (PWA)
- **Bouton d'Installation** : L'interface permet une installation rapide du site web comme une application native (sur iOS/Android/Desktop).
- **Service Worker** : Met en cache et optimise l'application pour une réactivité mobile (icônes maskable, chargement rapide).
- **Mode Mobile** : De l'interface au menu "long-press", l'ergonomie mobile est priorisée pour une utilisation au doigt.

### 6. Notifications Web Push
- **Rappels** : Gestion de notifications (Push API / Service Worker) pour rappeler aux utilisateurs leurs tâches. (Backend et SW configurés).

---

## 🏗️ Structure de l'Application (Architecture)

L'application repose sur un écosystème Full-stack Next.js (App Router) connecté à une base de données PostgreSQL via Prisma ORM.

```text
frontend/
├── app/                  # (App Router) Routes, Pages, Layouts et Endpoints API
│   ├── api/              # API Rest Routes (Next.js Route Handlers)
│   │   ├── auth/         # NextAuth.js endpoints
│   │   ├── groups/       # CRUD des Groupes
│   │   ├── todos/        # CRUD des Tâches
│   │   └── notifications/# Gestion des Web Push Subscriptions
│   ├── dashboard/        # Espace Utilisateur connecté
│   │   ├── groups/       # Vues dynamiques par groupe de tâche
│   │   └── calendar/     # Vue Calendrier intégrée
│   ├── login/            # Page de connexion
│   ├── signup/           # Page d'inscription
│   ├── globals.css       # Tailwind & Variables CSS / Styles de base
│   └── page.tsx          # Home page publique (Landing/PWA install)
│
├── components/           # Composants UI Réutilisables
│   ├── Calendar.tsx      # Logique de la grille de mois
│   ├── TaskModal.tsx     # Modale de création / édition de tâche
│   ├── TaskDetailModal.tsx # Modale de vue en lecture seule (Long press)
│   ├── InstallPWA.tsx    # Bouton d'installation Progressive Web App
│   └── ...
│
├── prisma/               # Modèles de données (Schema) de la DB
│   └── schema.prisma     # Définition des Users, Groups, Todos
│
├── public/               # Ressources statiques
│   ├── sw.js             # Service Worker (PWA & Push)
│   ├── manifest.json     # Configuration de la Progressive Web App
│   └── icons/            # Icônes de l'App
│
├── lib/                  # Utilitaires & configurations partagées
└── package.json          # Dépendances (Next, Prisma, Tailwind, Lucide, NextAuth...)
```

---

## 🛠️ Stack Technique

- **Framework Front/Back** : Next.js (App Router)
- **Base de Données** : PostgreSQL
- **ORM** : Prisma Client
- **Authentication** : NextAuth.js (Credentials, bcrypt)
- **Styling** : Tailwind CSS (Vanille/Classes utilitaires)
- **Icônes** : Lucide React
- **Gestion des dates** : `date-fns`

## 🚀 Commencer (Getting Started)

Pour lancer le projet en local :

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Configurer les variables d'environnement (`.env`) avec une connexion URL de Base de données PostgreSQL et un NextAuth secret :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/todoux"
   NEXTAUTH_SECRET="votre_secret"
   ```

3. Mettre en place la base de données :
   ```bash
   npx prisma db push
   # ou
   npx prisma migrate dev
   ```

4. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).
