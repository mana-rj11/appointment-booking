# 🎯 BookServices - Plateforme de Réservation de Services

Une application web moderne permettant aux clients de réserver des services (coiffure, beauté, massage, fitness) et aux propriétaires d'entreprises de gérer leurs réservations.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192.svg)

---

## 📚 **GLOSSAIRE POUR DÉBUTANTS**

> **Termes techniques expliqués en une phrase simple**

| Terme | Définition Simple |
|-------|-------------------|
| **API** | Un "serveur" qui permet à ton application de demander et envoyer des données (comme demander la météo à Google). |
| **Backend** | La partie "cachée" de l'application qui gère les données et la logique métier (serveur). |
| **Frontend** | La partie "visible" de l'application que les utilisateurs voient et utilisent (interface). |
| **Base de données (BDD)** | Un endroit organisé où on stocke toutes les informations (comme un classeur géant numérique). |
| **SQL** | Le langage qu'on utilise pour parler à la base de données et lui demander/modifier des informations. |
| **CRUD** | Les 4 actions de base : **C**reate (créer), **R**ead (lire), **U**pdate (modifier), **D**elete (supprimer). |
| **Framework** | Une "boîte à outils" avec du code déjà prêt pour construire plus vite (React, Express). |
| **Déploiement** | Mettre ton application en ligne sur internet pour que tout le monde puisse l'utiliser. |
| **JWT** | Un "badge numérique" qui prouve que tu es connecté et autorisé à accéder à certaines pages. |
| **REST** | Une façon standard d'organiser ton API pour que le frontend et backend communiquent facilement. |
| **npm** | Un "magasin d'outils" où tu télécharges des morceaux de code déjà faits par d'autres développeurs. |
| **JSON** | Un format pour échanger des données entre le frontend et le backend (comme un langage commun). |
| **Routing** | Le système qui décide quelle page afficher quand tu cliques sur un lien. |
| **State** | La "mémoire temporaire" de ton application (ce qu'elle se rappelle pendant que tu l'utilises). |
| **Component** | Un "morceau réutilisable" d'interface (comme un bouton ou une carte) qu'on peut utiliser partout. |
| **Middleware** | Un "garde du corps" qui vérifie chaque demande avant qu'elle arrive au serveur. |
| **Endpoint** | Une "adresse" spécifique de ton API (comme `/api/bookings` pour les réservations). |
| **Token** | Un code secret temporaire qui prouve ton identité quand tu es connecté. |

---

## ✨ **FONCTIONNALITÉS**

### 👥 **Pour les Clients**
- ✅ Inscription et connexion sécurisées
- ✅ Recherche et filtrage d'entreprises par catégorie
- ✅ Réservation de services avec sélection de date et heure
- ✅ Système de fidélité avec 4 niveaux (Bronze, Argent, Or, Platine)
- ✅ Gestion de "Mes Réservations" (voir, annuler)
- ✅ Système d'avis avec notation (1-5 étoiles)
- ✅ Notifications en temps réel
- ✅ Filtres avancés (note, prix, popularité)

### 💼 **Pour les Propriétaires**
- ✅ Dashboard complet avec statistiques
- ✅ Gestion des réservations (accepter, refuser, terminer)
- ✅ Vue d'ensemble des revenus et clients
- ✅ Gestion des services proposés
- ✅ Consultation des avis clients

---

## 🛠️ **TECHNOLOGIES UTILISÉES**

### **Frontend (Ce que tu vois)**
- **React 18** - Librairie JavaScript pour créer l'interface utilisateur
- **React Router** - Pour naviguer entre les pages sans recharger
- **Axios** - Pour communiquer avec le backend
- **Lucide React** - Icônes modernes et jolies
- **CSS inline** - Styles directement dans le code

### **Backend (Ce qui est caché)**
- **Node.js** - Pour exécuter du JavaScript côté serveur
- **Express** - Framework pour créer l'API facilement
- **PostgreSQL** - Base de données pour stocker toutes les infos
- **JWT** - Pour sécuriser les connexions
- **bcrypt** - Pour crypter les mots de passe
- **express-validator** - Pour valider les données reçues

---

## 📁 **STRUCTURE DU PROJET**
```
appointment-booking/
│
├── frontend/                    # Application React (interface utilisateur)
│   ├── public/                  # Fichiers publics (images, favicon)
│   ├── src/
│   │   ├── bookservices.jsx     # Page principale clients
│   │   ├── Dashboard.jsx        # Page dashboard propriétaires
│   │   ├── App.js               # Point d'entrée avec routes
│   │   ├── services/
│   │   │   └── api.js           # Configuration Axios
│   │   └── index.js             # Démarrage de l'application
│   ├── package.json             # Dépendances frontend
│   └── README.md
│
├── backend/                     # Serveur Node.js + API
│   ├── server.js                # Point d'entrée du serveur
│   ├── package.json             # Dépendances backend
│   └── .env                     # Variables d'environnement (secrets)
│
└── database/                    # Scripts SQL
    └── schema.sql               # Structure de la base de données
```

---

## 🚀 **INSTALLATION ET DÉMARRAGE**

### **Prérequis**

> Logiciels à installer sur ton Mac AVANT de commencer

- **Node.js** (version 18+) → https://nodejs.org
- **PostgreSQL** (version 15+) → https://www.postgresql.org
- **Git** → https://git-scm.com
- **VS Code** (éditeur de code recommandé) → https://code.visualstudio.com

### **Étape 1 : Cloner le projet**

Ouvre le Terminal et tape :
```bash
# Télécharger le projet depuis GitHub
git clone https://github.com/ton-username/appointment-booking.git

# Aller dans le dossier
cd appointment-booking
```

### **Étape 2 : Configurer la base de données**
```bash
# Démarrer PostgreSQL
brew services start postgresql

# Créer la base de données
psql postgres
CREATE DATABASE bookservices;
\q

# Importer la structure (tables)
psql bookservices < database/schema.sql
```

### **Étape 3 : Installer le backend**
```bash
# Aller dans le dossier backend
cd backend

# Installer toutes les dépendances
npm install

# Créer le fichier de configuration
touch .env

# Éditer .env et ajouter :
# DB_USER=ton_nom_utilisateur
# DB_PASSWORD=ton_mot_de_passe
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=bookservices
# JWT_SECRET=ton_secret_super_complique_123456
# PORT=5000

# Démarrer le serveur
npm run dev
```

**✅ Le backend tourne maintenant sur http://localhost:5000**

### **Étape 4 : Installer le frontend**

Ouvre UN AUTRE Terminal (garde le premier ouvert !) :
```bash
# Aller dans le dossier frontend
cd frontend

# Installer toutes les dépendances
npm install

# Démarrer l'application React
npm start
```

**✅ L'application s'ouvre automatiquement sur http://localhost:3000**

---

## 👤 **COMPTES DE TEST**

### **Compte Client**
- **Email :** `nilton@test.com`
- **Mot de passe :** `password123`
- **Niveau :** Argent (154 points)

### **Compte Propriétaire**
- **Email :** `owner@test.com`
- **Mot de passe :** `password123`
- **Entreprise :** Salon Élégance
- **Dashboard :** http://localhost:3000/dashboard

---

## 📊 **ARCHITECTURE DE LA BASE DE DONNÉES**
```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   USERS     │       │  BUSINESSES  │       │  SERVICES   │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id          │◄──────┤ owner_id     │       │ id          │
│ name        │       │ name         │◄──────┤ business_id │
│ email       │       │ location     │       │ name        │
│ password    │       │ category     │       │ price       │
│ role        │       │ rating       │       │ discount    │
│ points      │       └──────────────┘       └─────────────┘
└─────────────┘              │                       │
       │                     │                       │
       │                     ▼                       │
       │            ┌──────────────┐                 │
       └───────────►│   BOOKINGS   │◄────────────────┘
                    ├──────────────┤
                    │ id           │
                    │ user_id      │
                    │ business_id  │
                    │ service_id   │
                    │ date         │
                    │ time         │
                    │ status       │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   REVIEWS    │
                    ├──────────────┤
                    │ booking_id   │
                    │ rating       │
                    │ comment      │
                    └──────────────┘
```

---

## 🎨 **APERÇU DES PAGES**

### **Page d'accueil (Clients)**
- Header avec recherche et filtres
- Système de fidélité (barre de progression)
- Cartes des entreprises avec avis
- Modal de réservation

### **Dashboard (Propriétaires)**
- Sidebar avec navigation
- Statistiques en temps réel (KPIs)
- Tableau de gestion des réservations
- Vue des services et avis

### **Notifications**
- Cloche avec badge de compteur
- Dropdown avec liste complète
- 4 types de notifications

---

## 🐛 **RÉSOLUTION DE PROBLÈMES COURANTS**

### **Le backend ne démarre pas**
```bash
# Vérifier que PostgreSQL tourne
brew services list

# Redémarrer PostgreSQL
brew services restart postgresql

# Vérifier les logs
tail -f /usr/local/var/log/postgres.log
```

### **Erreur "Port 5000 already in use"**
```bash
# Trouver le processus qui utilise le port 5000
lsof -ti:5000

# Le tuer (remplace PID par le numéro trouvé)
kill -9 PID
```

### **L'application ne se connecte pas à la BDD**
1. Vérifie que PostgreSQL tourne
2. Vérifie les identifiants dans `.env`
3. Vérifie que la BDD `bookservices` existe

### **Erreur "Module not found"**
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 **DOCUMENTATION DES ENDPOINTS**

### **Authentification**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/register` | Créer un compte |
| POST | `/api/login` | Se connecter |

### **Entreprises**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/businesses` | Liste des entreprises |
| GET | `/api/businesses/:id` | Détails d'une entreprise |
| GET | `/api/businesses/:id/reviews` | Avis d'une entreprise |

### **Réservations**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/bookings` | Créer une réservation |
| GET | `/api/bookings/my` | Mes réservations |
| PATCH | `/api/bookings/:id/cancel` | Annuler une réservation |

### **Dashboard Propriétaire**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/owner/stats` | Statistiques globales |
| GET | `/api/owner/bookings` | Toutes les réservations |
| PATCH | `/api/owner/bookings/:id` | Modifier statut réservation |
| GET | `/api/owner/services` | Liste des services |
| GET | `/api/owner/reviews` | Liste des avis |

---

## 🎓 **APPRENDRE EN ANALYSANT LE CODE**

### **Pour les débutants : par où commencer ?**

1. **Commence par le frontend** (`frontend/src/bookservices.jsx`)
   - Cherche `useState` → C'est la "mémoire" de l'application
   - Cherche `useEffect` → C'est ce qui se lance au démarrage
   - Cherche `onClick` → C'est ce qui se passe quand tu cliques

2. **Puis regarde le backend** (`backend/server.js`)
   - Cherche `app.get` → Les endpoints qui RÉCUPÈRENT des données
   - Cherche `app.post` → Les endpoints qui CRÉENT des données
   - Cherche `pool.query` → Les requêtes SQL à la base de données

3. **Ensuite la base de données** (`database/schema.sql`)
   - Lis les `CREATE TABLE` → Structure des données
   - Lis les `FOREIGN KEY` → Relations entre tables

### **Exercices pour progresser**

1. **Facile** : Change la couleur du bouton "Réserver"
2. **Moyen** : Ajoute un champ "Téléphone" dans le formulaire d'inscription
3. **Difficile** : Ajoute une nouvelle catégorie d'entreprises ("Restaurant")
4. **Expert** : Ajoute un système de favoris

---

## 🚀 **DÉPLOIEMENT (METTRE EN LIGNE)**

### **Option 1 : Render (Gratuit)**

1. Créer un compte sur https://render.com
2. Connecter ton repository GitHub
3. Créer un "Web Service" pour le backend
4. Créer un "Static Site" pour le frontend
5. Créer une "PostgreSQL Database"
6. Configurer les variables d'environnement

### **Option 2 : Railway (Gratuit avec limitations)**

1. Créer un compte sur https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Sélectionner ton repository
4. Railway détecte automatiquement Node.js
5. Ajouter une base de données PostgreSQL

### **Option 3 : Vercel + Railway**

- **Frontend** sur Vercel (https://vercel.com)
- **Backend + BDD** sur Railway

---

## 👥 **CONTRIBUER AU PROJET**

Tu veux améliorer le projet ? Voici comment :

1. **Fork** le projet (copie sur ton compte)
2. Crée une **branche** (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** tes changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvre une **Pull Request**

---

## 📝 **TODO / AMÉLIORATIONS FUTURES**

- [ ] Upload d'images pour les entreprises
- [ ] Paiement en ligne (Stripe)
- [ ] Emails de confirmation
- [ ] Système de chat client/propriétaire
- [ ] Application mobile (React Native)
- [ ] Export PDF des réservations
- [ ] Calendrier interactif
- [ ] Mode sombre
- [ ] Support multilingue (FR/EN)
- [ ] Intégration Google Maps
- [ ] Notifications push
- [ ] Programme de parrainage


---

## 📄 **LICENCE**

Ce projet est sous licence MIT. Tu peux l'utiliser librement pour apprendre, modifier, et même créer ton propre business avec !

---

## 🙏 **REMERCIEMENTS**

- **React** - Pour le framework frontend
- **Node.js** - Pour le runtime JavaScript
- **PostgreSQL** - Pour la base de données
- **Express** - Pour le framework backend
- **Lucide ou l'IA** - Pour les icônes
- **Stack Overflow** - Pour toutes les réponses aux bugs 😄

---

## 💡 **POUR LES DÉBUTANTS COMPLETS**

### **"Je ne comprends rien, par où commencer ?"**

1. **Suis le guide d'apprentissage** (voir message précédent)
2. **Commence par HTML/CSS/JavaScript de base**
3. **Ne saute pas les étapes !**
4. **Ce projet est un OBJECTIF, pas un point de départ**
### **"C'est trop compliqué !"**

Normal ! Tout développeur a commencé par là. Voici les étapes :
```
Débutant (toi maintenant)
    ↓
HTML/CSS (2 mois)
    ↓
JavaScript de base (2 mois)
    ↓
React (3 mois)
    ↓
Backend Node.js (3 mois)
    ↓
Base de données SQL (2 mois)
    ↓
Projet complet comme celui-ci (3 mois)
    ↓
Développeur capable ! 🎉
```

**Total : ~15 mois en travaillant 10-15h/semaine**

---

## 🎯 **MOTS DE LA FIN**

> "Le meilleur moment pour planter un arbre était il y a 20 ans.
> Le deuxième meilleur moment est maintenant."

---

---------------------------------------------------------------------------------------------

# 📚 GLOSSAIRE COMPLET - TERMES DE PROGRAMMATION

## A

**API (Application Programming Interface)**
→ Un serveur qui permet à différentes applications de communiquer entre elles.

**Axios**
→ Un outil JavaScript pour faire des requêtes HTTP facilement.

**Asynchrone**
→ Du code qui continue à s'exécuter sans attendre qu'une action se termine.

## B

**Backend**
→ La partie cachée d'une application (serveur, base de données, logique).

**Base de données**
→ Un endroit organisé où on stocke toutes les informations d'une application.

**bcrypt**
→ Un outil pour crypter les mots de passe de façon sécurisée.

**Bug**
→ Une erreur dans le code qui fait que l'application ne fonctionne pas comme prévu.

## C

**CRUD**
→ Les 4 opérations de base : Create (créer), Read (lire), Update (modifier), Delete (supprimer).

**CSS (Cascading Style Sheets)**
→ Le langage pour styliser et décorer les pages web (couleurs, tailles, positions).

**Component (Composant)**
→ Un morceau réutilisable d'interface utilisateur (bouton, carte, formulaire).

## D

**Déploiement**
→ Mettre une application en ligne sur internet pour que tout le monde puisse l'utiliser.

**DOM (Document Object Model)**
→ La représentation de ta page HTML que JavaScript peut modifier.

## E

**Endpoint**
→ Une adresse spécifique de ton API (comme `/api/users` pour les utilisateurs).

**Express**
→ Un framework Node.js pour créer des serveurs web facilement.

## F

**Fetch**
→ Une fonction JavaScript pour récupérer des données depuis une API.

**Framework**
→ Une boîte à outils avec du code déjà prêt pour construire plus vite.

**Frontend**
→ La partie visible d'une application (ce que l'utilisateur voit et utilise).

## G

**Git**
→ Un système pour sauvegarder et partager ton code avec d'autres développeurs.

**GitHub**
→ Un site web pour stocker et partager du code avec Git.

## H

**HTML (HyperText Markup Language)**
→ Le langage pour créer la structure d'une page web (titres, paragraphes, images).

**HTTP (HyperText Transfer Protocol)**
→ Le "langage" qu'utilisent les navigateurs et serveurs pour communiquer.

**Hook**
→ Une fonction React spéciale (comme useState) pour ajouter des fonctionnalités.

## J

**JavaScript**
→ Le langage de programmation du web (interactivité, logique).

**JSON (JavaScript Object Notation)**
→ Un format pour échanger des données entre frontend et backend.

**JWT (JSON Web Token)**
→ Un badge numérique qui prouve que tu es connecté et autorisé.

## M

**Middleware**
→ Un garde du corps qui vérifie chaque demande avant qu'elle arrive au serveur.

## N

**Node.js**
→ Un outil pour exécuter du JavaScript en dehors du navigateur (côté serveur).

**npm (Node Package Manager)**
→ Un magasin d'outils où tu télécharges du code déjà fait par d'autres.

## P

**PostgreSQL**
→ Un système de base de données relationnel très puissant et gratuit.

**Props**
→ Des données qu'on passe d'un composant parent à un composant enfant en React.

## R

**React**
→ Une librairie JavaScript pour créer des interfaces utilisateurs modernes.

**REST (Representational State Transfer)**
→ Une façon standard d'organiser ton API.

**Routing**
→ Le système qui décide quelle page afficher selon l'URL.

## S

**SQL (Structured Query Language)**
→ Le langage pour parler à une base de données et manipuler des données.

**State**
→ La mémoire temporaire d'un composant React (ce qu'il se rappelle).

## T

**Token**
→ Un code secret temporaire qui prouve ton identité.

## U

**URL (Uniform Resource Locator)**
→ L'adresse d'une page web (comme https://google.com).

## V

**Variable**
→ Une boîte qui contient une valeur (nombre, texte, etc.).

**VS Code**
→ Un éditeur de code gratuit et très populaire chez les développeurs.

--------------------------------------------------------------------------

UN SIMPLE BOUTON "RÉSERVER" = 

Frontend (ce que tu vois) :
├── 50 lignes de code React
├── Vérification du formulaire
├── Gestion des erreurs
├── Animation de chargement
└── Mise à jour de l'interface

Backend (invisible) :
├── Vérifier que tu es connecté (JWT)
├── Valider les données (express-validator)
├── Vérifier que le créneau est disponible
├── Créer la réservation dans la BDD
├── Créer une notification
├── Mettre à jour les points de fidélité
├── Envoyer une réponse au frontend
└── Gérer les erreurs possibles

Base de données :
├── 5 tables différentes
├── 3 relations entre tables
├── 1 trigger automatique
└── Vérification de contraintes

------------------------------------------------

TU VOIS : Une belle maison 🏠
         "Ça a l'air simple !"

CE QU'IL Y A EN DESSOUS :
├── Fondations en béton
├── Système électrique complet
├── Plomberie
├── Isolation
├── Charpente
├── Plans d'architecte
├── Normes de construction
└── 6 mois de travail

C'EST PAREIL AVEC UNE APPLICATION !

------------------------------------------------

<!-- HTML : Tu apprends ça -->
<button>Cliquer ici</button>

<!-- CSS : Tu ajoutes des couleurs -->
<button style="background: blue; color: white;">
  Cliquer ici
</button>

<!-- JavaScript : Tu le rends interactif -->
<button onclick="alert('Bonjour!')">
  Cliquer ici
</button>

-------------------------------------------------

// React : Ça commence à être dur : 
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const handleClick = async () => {
  setIsLoading(true);
  try {
    const response = await API.post('/bookings', data);
    setSuccess(true);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};


-----------------------------------------------------------------

// Express + PostgreSQL : C'est encore plus complexe :

app.post('/api/bookings', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const booking = await client.query(
      'INSERT INTO bookings (user_id, date) VALUES ($1, $2)',
      [userId, date]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
});
```
**❓❓❓ "C'est quoi pool ? BEGIN ? COMMIT ?"**
→ 6 mois pour bien comprendre !

---

### **LA VÉRITÉ SUR LA DIFFICULTÉ**

| Étape | Difficulté (1-10) | Temps |
|-------|-------------------|-------|
| HTML/CSS de base | 2/10 | 2 mois |
| JavaScript bases | 5/10 | 3 mois |
| React | 7/10 | 4 mois |
| Backend Node.js | 8/10 | 4 mois |
| Base de données | 7/10 | 3 mois |
| Tout assembler | 9/10 | 3 mois |
| **TOTAL** | **Très difficile** | **~15-18 mois** |

**💡 Mais c'est FAISABLE ! Des millions de gens y arrivent !**

---

## 2️⃣ **"COMMENT COMPRENDRE VISUELLEMENT ?" - EXPLICATIONS SIMPLES**

### **🎨 ANALOGIE : UNE APPLICATION = UN RESTAURANT**
```
┌─────────────────────────────────────────────┐
│         LE RESTAURANT (L'APPLICATION)        │
└─────────────────────────────────────────────┘

🏠 LA SALLE (FRONTEND)
├── Tables et chaises = Interface utilisateur
├── Menu = Pages et boutons
├── Serveurs = Code React
└── Ce que les clients VOIENT

🍳 LA CUISINE (BACKEND)
├── Chefs = Code Node.js
├── Recettes = Logique métier
├── Fours/plaques = Serveur
└── Ce que les clients NE VOIENT PAS

📋 LE STOCK (BASE DE DONNÉES)
├── Frigo = Tables SQL
├── Ingrédients = Données (users, bookings)
├── Inventaire = Requêtes SQL
└── Stockage organisé

📞 LES COMMANDES (API)
├── Serveur qui prend la commande = Endpoint
├── Ticket de commande = JSON
├── Sonnette cuisine = HTTP Request
└── Communication salle ↔ cuisine
```

---

### **EXEMPLE VISUEL : CLIQUER SUR "RÉSERVER"**
```
                  TU VOIS ÇA
                      ↓
    ┌─────────────────────────────┐
    │  [  Réserver  ]  ← BOUTON   │
    └─────────────────────────────┘
                      ↓
              Tu cliques
                      ↓
    ┌─────────────────────────────┐
    │    ⏳ Chargement...          │
    └─────────────────────────────┘


                CE QUI SE PASSE
                      ↓
    ┌─────────────────────────────┐
    │   1. FRONTEND (React)        │
    │   Récupère les données       │
    │   du formulaire              │
    └─────────────────────────────┘
                      ↓
              Envoie par Internet
                      ↓
    ┌─────────────────────────────┐
    │   2. BACKEND (Node.js)       │
    │   Vérifie que tu es          │
    │   connecté (JWT)             │
    └─────────────────────────────┘
                      ↓
    ┌─────────────────────────────┐
    │   3. BASE DE DONNÉES         │
    │   Enregistre la              │
    │   réservation                │
    └─────────────────────────────┘
                      ↓
              Réponse
                      ↓
    ┌─────────────────────────────┐
    │   ✅ Réservation confirmée!  │
    └─────────────────────────────┘

    TOUT ÇA EN 2 SECONDES !

-----------------------------------------------
Ce qu'un débutant imagine :

    function reserver() {
  // Créer réservation
  // Afficher "Confirmé"
}

----------------------------------------------------

La réalité : 

const handleCreateBooking = async () => {
  // 1. Vérifier le formulaire
  if (!bookingForm.serviceId || !bookingForm.bookingDate) {
    setError('Remplissez tous les champs');
    return;
  }

  // 2. Loading state
  setIsLoading(true);
  setError(null);

  try {
    // 3. Appel API
    const response = await API.post('/api/bookings', {
      businessId: selectedBusiness.id,
      serviceId: bookingForm.serviceId,
      bookingDate: bookingForm.bookingDate,
      bookingTime: bookingForm.bookingTime
    });

    // 4. Mise à jour des points
    setUser(prev => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints + response.data.pointsEarned
    }));

    // 5. Notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);

    // 6. Rafraîchir les données
    await fetchMyBookings();
    
    // 7. Fermer le modal
    setShowBookingModal(false);
    
    // 8. Reset formulaire
    setBookingForm({ serviceId: '', bookingDate: '', bookingTime: '' });

  } catch (error) {
    // 9. Gestion d'erreurs
    if (error.response?.status === 400) {
      setError('Créneau non disponible');
    } else if (error.response?.status === 401) {
      setError('Session expirée, reconnectez-vous');
      handleLogout();
    } else {
      setError('Erreur serveur, réessayez');
    }
  } finally {
    // 10. Toujours enlever le loading
    setIsLoading(false);
  }
};
