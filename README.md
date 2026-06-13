# MenuGo

Application mobile de commande à emporter pour les restaurants locaux du Québec — projet vitrine démontrant la capacité à livrer une vraie app mobile fonctionnelle avec authentification, base de données relationnelle, panier multi-restaurants et suivi de commande en temps réel.

## Démo

Tester l'app via **Expo Go** (iOS / Android) :

1. Installer [Expo Go](https://expo.dev/go) sur ton téléphone
2. Scanner le QR code généré par `npx expo start`
3. Se connecter avec un compte démo

### Comptes démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Client | `client@demo.com` | `Demo2024!` |
| Restaurateur | `resto@demo.com` | `Demo2024!` |

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework mobile | React Native + Expo SDK 54 |
| Navigation | Expo Router v6 (file-based) |
| Styling | NativeWind v4 (Tailwind CSS) |
| Backend | Supabase (Auth + PostgreSQL) |
| État global | Zustand |
| Requêtes | TanStack Query |
| Formulaires | React Hook Form + Zod |
| Icons | Expo Vector Icons (Ionicons) |
| Langage | TypeScript 5 |

## Architecture des écrans

```
app/
├── (auth)/
│   ├── login.tsx          → Connexion
│   └── signup.tsx         → Inscription
│
├── (tabs)/
│   ├── index.tsx          → Accueil — Explorer les restaurants
│   ├── search.tsx         → Recherche avec historique local
│   ├── orders.tsx         → Mes commandes (en cours + historique)
│   └── profile.tsx        → Mon profil
│
├── restaurant/[id].tsx    → Menu du restaurant + bottom sheet item
├── cart.tsx               → Panier avec TPS/TVQ québécois
├── checkout.tsx           → Tunnel de commande
├── order-confirmation.tsx → Confirmation + suivi en temps réel (démo)
└── onboarding.tsx         → 3 slides au premier lancement
```

## Installation

```bash
# 1. Cloner et installer
git clone https://github.com/ChristinNegou/menugo-app.git
cd menugo-app
npm install --legacy-peer-deps

# 2. Configurer les variables d'environnement
cp .env.example .env
# Remplir avec vos clés Supabase

# 3. Créer les tables et insérer les données démo
# Exécuter supabase-schema.sql dans l'éditeur SQL Supabase

# 4. Lancer le serveur de développement
npx expo start --clear
```

## Variables d'environnement

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## Base de données Supabase

Le fichier `supabase-schema.sql` contient :
- Les 5 tables : `user_profiles`, `restaurants`, `menu_categories`, `menu_items`, `orders`, `favorites`
- Les politiques RLS (Row Level Security)
- Le trigger de création de profil à l'inscription
- 8 restaurants fictifs québécois avec menus complets
- 3 commandes démo pour le compte client

## Fonctionnalités

### Navigation
- Onboarding 3 slides (affiché une seule fois au premier lancement)
- Authentification complète avec Supabase Auth (login, inscription, mot de passe oublié)
- Mode invité (navigation sans compte, panier non sauvegardé)

### Accueil
- Catégories filtrables : Burgers, Pizza, Sushi, Poutine, Mexicain, Végétarien, Déjeuner
- Sections : Populaires, Nouveaux sur MenuGo, Ouvert maintenant
- Skeleton loaders, pull-to-refresh

### Restaurant
- Photo de couverture, infos, note étoile, temps de préparation
- Menu par catégorie avec tabs sticky
- Bottom sheet de détail item avec sélecteur de quantité
- Gestion du changement de restaurant (dialog de confirmation panier)

### Panier
- Items avec contrôles +/- et suppression
- Calcul automatique TPS (5%) + TVQ (9.975%)
- Note pour le restaurant
- Bouton fixé en bas avec total

### Commande
- Choix heure de récupération (ASAP ou heure précise)
- Méthode de paiement (caisse ou carte démo)
- Confirmation avec animation de succès
- Suivi en 4 étapes : Reçue → En préparation → Prête → Récupérée
- Avancement automatique en mode démo (toutes les 12 secondes)

### Profil
- Avatar avec initiales
- Sections : Mon compte, Préférences, Support
- Déconnexion avec confirmation

## Partager avec un client (EAS Build)

```bash
# Créer un build de prévisualisation installable directement sur le téléphone
npx eas build --profile preview --platform all
```

Le client reçoit un lien d'installation sans passer par l'App Store.

## Développeur

**Christin Negou** — Développeur web & mobile, Québec  
[github.com/ChristinNegou](https://github.com/ChristinNegou) · Portfolio freelance · 2026
