# ميزان الصوت — Mīzān al-Ṣawt
> **Miroir vocal & entraînement à la justesse pour la récitation du Coran**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Local--First](https://img.shields.io/badge/Architecture-100%25_Local--First-emerald?style=flat-square)](https://localfirstweb.dev/)
[![Offline PWA](https://img.shields.io/badge/PWA-Installable-purple?style=flat-square)](https://web.dev/progressive-web-apps/)

---

## 🎯 Vision du Produit

**Mīzān al-Ṣawt (ميزان الصوت)** est une application web personnelle conçue pour réduire l'écart entre ce que l'oreille intérieure imagine et ce que la voix parvient réellement à produire lors de la récitation.

> **Principe fondamental :**  
> *« La technique vocale sert la récitation. La récitation ne doit jamais être déformée pour servir une mélodie. »* (Tajwīd > Mélodie)

---

## ✨ Fonctionnalités Clés (MVP v0.1)

1. **Moteur Audio Déterministe Temps Réel :**
   - Implémentation de l'algorithme **YIN** pour une détection de fréquence fondamentale ($F_0$) ultra-précise et sans latence perceptible.
   - Filtre passe-bande préliminaire (80 Hz - 800 Hz) pour éliminer les bruits de fond et harmoniques non vocales.
2. **Visualisation « Route Vocale » à 60 FPS :**
   - Rendu fluide sur `<canvas>` natif superposant la trajectoire cible et la voix de l'utilisateur.
   - Guidage intuitif : *✓ Juste*, *↑ Monte un peu*, *↓ Descends un peu*, *→ Stabilise* (sans jargon musical occidental).
3. **Quatre Exercices Fondamentaux (Niveau 1) :**
   - **Tenir une hauteur (ثبات الصوت)** : Maintien stable d'une fréquence confortable pendant 6 secondes.
   - **Montée progressive (صعود تدريجي)** : Glissement continu maîtrisé vers les aigus sans forcer.
   - **Descente progressive (نزول تدريجي)** : Descente contrôlée et calme avec gestion du souffle.
   - **Montée puis descente (صعود ثم نزول)** : Enchaînement fluide en arche vocale.
4. **Sécurité Vocale Maximale :**
   - Bouton persistant **« Je sens une gêne »** pour stopper instantanément l'exercice et préserver les cordes vocales.
5. **Confidentialité Totale (100% Local-First) :**
   - Zéro serveur applicatif, zéro compte, zéro upload.
   - La voix ne quitte jamais l'appareil.
   - Sauvegarde et restauration locale par export/import de fichier JSON.

---

## 🚀 Installation & Développement

```bash
# Cloner le dépôt
git clone https://github.com/novaskilltech/MIZAN-AL-SAWT.git
cd MIZAN-AL-SAWT

# Installer les dépendances
npm install

# Lancer la suite de tests unitaires
npm test

# Lancer le serveur de développement
npm run dev

# Compiler pour la production
npm run build
```

---

## 🧪 Tests Unitaires Automatisés

Le projet inclut une suite de tests unitaires avec le test-runner natif Node.js (`node:test`) pour valider :
- La précision de l'algorithme YIN sur ondes synthétiques (145 Hz, 220 Hz).
- Le rejet du silence et des bruits résiduels.
- La justesse du calcul des écarts en cents ($1200 \times \log_2(f_1 / f_2)$).

---

## 📄 Licence

Projet personnel sous licence MIT.
