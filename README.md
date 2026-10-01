# Couturier — PWA Mobile-First de Gestion d'Atelier de Couture

Application web progressive (PWA) conçue spécifiquement pour les ateliers de couture et maîtres tailleurs au **Bénin et en Afrique de l'Ouest** (Devise : **FCFA**, montants entiers).

Elle remplace intégralement le traditionnel carnet de mesures papier par un outil tactile, réactif, sécurisé et disponible sur smartphone, tablette et desktop.

---

## 🛠️ Stack Technique (100% conforme aux spécifications)
- **Framework & Routage** : Next.js 14 App Router (React 18)
- **Typage** : TypeScript strict
- **Design & Styles** : Tailwind CSS + shadcn/ui (Palette chaleureuse Terracotta / Or / Émeraude inspirée du textile africain)
- **Ergonomie Mobile** : Cibles tactiles ≥ 44px, barre de navigation mobile fixe en bas, bouton d'action rapide flottant (FAB)
- **Base de données & Backend** : Supabase Postgres avec Row Level Security (RLS) multi-atelier & triggers d'intégrité
- **Validation** : Zod + React Hook Form
- **Gestion d'état serveur** : TanStack Query
- **Graphiques** : Recharts (Évolution CA, modèles confectionnés, statuts)
- **Calendrier des RDV** : FullCalendar (Vues Mois, Semaine, Jour, Liste tactile)
- **Documents PDF** : `@react-pdf/renderer` (Reçu de paiement, Fiche client, Fiche mensurations, Bon de commande, Facture)
- **Exports Excel** : `exceljs` (Clients, Commandes, Encaissements, Mensurations)
- **PWA & Offline** : Serwist Service Worker (`@serwist/next`) + Dexie.js (IndexedDB local)
- **Messagerie** : Liens directs `https://wa.me/...` avec modèles de messages préremplis

---

## 🛡️ Règles Métier Fondamentales Implémentées

1. **Multi-atelier dès le départ** :
   - Toute table métier (`clients`, `orders`, `measurement_profiles`, `appointments`, `payments`, etc.) est cloisonnée par `workshop_id`.
   - Politiques Supabase RLS (`workshop_isolation_policy`) garantissant une stricte étanchéité des données par atelier.
2. **Mensurations IMMUABLES (Règle 2)** :
   - Toute prise de mesures crée une nouvelle ligne `measurement_profiles` (version n+1).
   - Trigger SQL Postgres (`check_measurement_profile_immutable`) interdisant strictement tout `UPDATE` ou `DELETE` sur un profil lié à une commande.
   - Corriger des mesures = créer une nouvelle version (n+1).
3. **Association Obligatoire des Mensurations (Règle 3)** :
   - `orders.measurement_profile_id` est `NOT NULL`.
   - À la création de commande, le tailleur choisit entre :
     - *(a) Dernière version existante*
     - *(b) Nouvelle prise de mesures* (ouvre le Wizard tactile)
     - *(c) Personnalisation rapide* (copie isolée avec `parent_id` et `kind='custom'` qui n'altère jamais les mesures habituelles du client).
4. **Wizard Mobile-First de Prise de Mesures (Règle 4)** :
   - Une seule mesure par écran.
   - Grand champ numérique géant tactile, boutons pas-à-pas `+` / `-`, boutons d'incréments rapides (+0.5, +1, +2, +5 cm).
   - Valeur précédente pré-remplie affichée pour comparaison instantanée.
   - Boutons *Précédent* et *Suivant* ergonomiques pour manipulation à une main sur smartphone.
   - Écran de récapitulatif interactif avant enregistrement final.
5. **Soft Delete & Audit Logs (Règle 5)** :
   - `deleted_at` sur clients, commandes, paiements, rendez-vous.
   - `order_status_history` journalise automatiquement chaque transition d'état.
   - `activity_logs` retrace les créations, modifications et encaissements.
6. **"En retard" Calculé (Règle 6)** :
   - Jamais stocké dans la table : calculé dynamiquement (`due_date < CURRENT_DATE` et statut non livré/annulé).
7. **Montants Entiers FCFA & Vue SQL (Règle 7)** :
   - Montants entiers sans décimales.
   - `total_paid`, `remaining`, `% paid` calculés via la vue SQL `orders_summary` et la couche data unifiée.

---

## 📱 Modules & Fonctionnalités (12 MVP)

| # | Module | Fonctionnalités Clés |
|---|---|---|
| **1** | **Authentification & Rôles** | Connexion email/mot de passe, réinitialisation, simulation 1-clic pour rôles (`admin`, `tailor`, `assistant`). |
| **2** | **Dashboard** | RDV du jour, commandes en cours/à livrer/en retard, paiements en attente, CA du mois en cours, reste total à encaisser, 3 graphiques Recharts (CA/mois, modèles par type, statuts). |
| **3** | **Clients** | CRUD, archivage, recherche instantanée (nom/téléphone/quartier), bouton WhatsApp direct (`wa.me`), export Excel. |
| **4** | **Fiche Client (8 onglets)** | Infos, Mensurations (versions + courbe d'évolution corporelle Recharts), Commandes, RDV, Paiements, Photos, Notes d'atelier, Historique d'audit. |
| **5** | **Wizard Mensurations** | Prise de mesures versionnée plein écran, une mesure par écran, stepper tactile, pré-remplissage. |
| **6** | **Commandes** | Création avec 3 options de mensurations (Règle 3), avancement de statut en 1 tap tactile, galerie photos, bons de commande. |
| **7** | **Rendez-vous** | Vue Calendrier dynamique (FullCalendar mois/semaine/jour) + Vue Liste mobile optimisée tactile, statuts et rappels WhatsApp. |
| **8** | **Paiements** | Enregistrement d'acomptes (MTN MoMo, Moov Money, Espèces, etc.), calcul automatique du reste dû, génération instantanée de reçus PDF. |
| **9** | **Recherche Globale** | Accessible depuis l'en-tête pour rechercher simultanément clients, commandes (`#101`) et rendez-vous. |
| **10** | **WhatsApp Automatisé** | Modèles personnalisables avec variables `{prenom}`, `{date}`, `{numero}`, `{reste}`, `{atelier}` ouvrant directement l'application WhatsApp. |
| **11** | **PDF & Excel** | 5 documents PDF professionnels (`@react-pdf/renderer`) : Reçu, Fiche client, Fiche mensurations, Bon de commande, Facture. 4 exports Excel (`exceljs`) : Clients, Commandes, Paiements, Mensurations. |
| **12** | **Paramètres** | Configuration atelier (nom, contact, adresse), catalogue des vêtements, points de mesures personnalisables, modèles WhatsApp, gestion d'équipe. |

---

## 🚀 Lancement & Utilisation en Local

### 1. Démarrer le serveur de développement :
\`\`\`bash
npm run dev
\`\`\`
L'application est accessible sur : `http://localhost:3000`

### 2. Tester le build de production :
\`\`\`bash
npm run build
npm run start
\`\`\`

### 3. Base de données Supabase (Optionnel) :
Le fichier [supabase/schema.sql](file:///home/roserick/couturier/supabase/schema.sql) contient l'intégralité du DDL SQL, des triggers d'immutabilité, de la vue `orders_summary`, des règles RLS et des données de seed. Copiez son contenu dans l'éditeur SQL de votre projet Supabase, puis renseignez vos clés dans `.env.local` :
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
\`\`\`
*(En l'absence de Supabase configuré, l'application fonctionne immédiatement grâce au mode démo intégré et à la persistance locale !)*
