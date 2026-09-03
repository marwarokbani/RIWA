# RIWA
# Implementation Plan - RIWA Studio Enhancements & Luxury Features

Mises à jour majeures de l'application **RIWA Studio** selon vos spécifications : mise en valeur du logo, écran d'accueil (Splash Screen), connexion Google avec envoi d'email de bienvenue automatique, dégradés de couleurs, poignées de redimensionnement direct sur le canvas, et sous-titre personnalisé.

---

## 🚀 Nouvelles Fonctionnalités à Implémenter

### 1. Mise en Valeur Absolue du Logo & Nouveau Sous-titre
- **Badge Lumineux du Logo** : Encart dédié avec rétro-éclairage doré et fond lumineux (verre dépoli champagne/blanc pur) pour faire ressortir le logo **RIWA** de manière spectaculaire sur l'arrière-plan sombre.
- **Nouveau Sous-titre** : Remplacement du sous-titre par : **"Des Expériences Personnelles et Personnalisées"**.

### 2. Écran d'Accueil Éblouissant (Splash Screen)
- Overlay de bienvenue au lancement de l'application avec animation d'entrée du logo RIWA.
- Citation et description poétique : *"L'Art d'immortaliser vos événements d'exception — Des expériences personnelles et personnalisées pour vos invités."*
- Bouton interactif dorée **"Découvrir le Studio"** avec transition fluide vers l'application.

### 3. Connexion Google (Gmail) & Envoi d'Email de Bienvenue Automatique
- Bouton de connexion **"Se connecter avec Google"** dans le header et le splash screen.
- Fenêtre modale d'authentification Gmail avec enregistrement de la session utilisateur (Nom, Email, Photo de profil).
- API Backend `/api/send-welcome-email` simulant / envoyant un email de bienvenue élégant de la part de RIWA (*"Bienvenue chez RIWA Studio! Votre aventure d'invitations d'exception commence ici."*).

### 4. Gestion des Dégradés de Couleurs (Gradients)
- Dégradés métalliques et luxueux prédéfinis : **Or Fondu (Gold Gradient)**, **Rose Gold Métallique**, **Émeraude Royale**, **Sunset Impérial**, **Argent Platine**.
- Rendu en temps réel des dégradés sur les textes du Canvas HTML5 et intégration dans l'exportation haute résolution Pillow.

### 5. Poignées de Redimensionnement Direct sur Canvas (Resize Handles)
- Poignées visuelles aux coins de l'élément sélectionné sur la carte : l'utilisateur peut **cliquer et glisser pour déplacer**, mais aussi **tirer sur les coins pour agrandir/réduire la taille du texte** instantanément sur le canvas.
- Expérience encore plus fluide, professionnelle et intuitive.

### 6. Téléchargement Direct sur PC
- Bouton d'export optimisé déclenchant immédiatement le téléchargement du fichier HD PNG ou PDF directement dans le dossier Téléchargements de l'ordinateur de l'utilisateur.

---

## Proposed Changes

### Backend (Python / Flask)
#### [MODIFY] [app.py](file:///c:/Users/marwa/OneDrive/Desktop/Riwa/app.py)
- Ajout de l'endpoint `/api/send-welcome-email` pour l'envoi / confirmation d'email de bienvenue.
- Prise en charge des dégradés de couleurs dans l'export Pillow.

### Frontend (HTML / CSS / JS)
#### [MODIFY] [templates/index.html](file:///c:/Users/marwa/OneDrive/Desktop/Riwa/templates/index.html)
- Ajout de la structure du **Splash Screen**.
- Ajout de la modale de **Connexion Google**.
- Mise à jour du header avec le badge éclairé du logo RIWA et le sous-titre *"Des Expériences Personnelles et Personnalisées"*.
- Ajout de l'option de dégradés de couleurs dans l'onglet de style.

#### [MODIFY] [static/css/style.css](file:///c:/Users/marwa/OneDrive/Desktop/Riwa/static/css/style.css)
- Style CSS du badge lumineux du logo (`.riwa-logo-badge`).
- Animation et design luxe du Splash Screen (`.riwa-splash-screen`).
- Modale de connexion Google (`.google-auth-modal`).
- Styles des poignées de redimensionnement (`.resize-handle`).
- Classes CSS des dégradés de texte (`.gradient-text-gold`, etc.).

#### [MODIFY] [static/js/app.js](file:///c:/Users/marwa/OneDrive/Desktop/Riwa/static/js/app.js)
- Moteur de redimensionnement à la souris via poignées sur canvas.
- Gestion de l'état utilisateur (Google Login & simulation d'envoi d'email de bienvenue).
- Gestion des dégradés de couleurs sur canvas.
- Animation du Splash Screen.

---

## Verification Plan
1. Vérifier la visibilité exceptionnelle du logo avec le badge éclairé.
2. Tester le Splash Screen lors de l'ouverture du studio.
3. Tester le flux de connexion Google et l'envoi d'email de bienvenue avec notification toast.
4. Tester le redimensionnement interactif à la souris par tirage des poignées sur canvas.
5. Vérifier le téléchargement HD sur PC.

