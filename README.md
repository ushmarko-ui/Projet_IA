# 🚀 AstroLink Lite

[![Déployé sur GitHub Pages](https://img.shields.io/badge/Déploiement-GitHub_Pages-blue?style=for-the-badge&logo=github)](https://ushmarko-ui.github.io/Projet_IA/)
[![SvelteKit](https://img.shields.io/badge/Framework-SvelteKit-ff3e00?style=for-the-badge&logo=svelte)](https://kit.svelte.dev/)

Bienvenue sur **AstroLink Lite**, une interface web moderne, rapide et épurée conçue pour interagir avec vos modèles d'IA locaux via **Ollama**.

---

## 🔗 Aperçu du projet

Vous pouvez visualiser l'interface utilisateur et explorer le design directement en ligne ici :

👉 **[VOIR L'APERÇU DE L'INTERFACE](https://ushmarko-ui.github.io/Projet_IA/)**

---

## ✨ Fonctionnalités de l'interface

- 🎨 **Design Moderne** : Une interface sombre (dark mode) avec des accents néon cyan.
- 📱 **Responsive** : Parfaitement adaptable sur mobile, tablette et ordinateur.
- ⚡ **Performance** : Construit avec SvelteKit pour une navigation instantanée.
- 🛠️ **Gestion des Modèles** : Interface prévue pour lister, sélectionner et discuter avec différents modèles d'IA.

## ⚙️ Comment utiliser l'IA en local ?

L'aperçu ci-dessus permet de voir l'interface. Pour que l'IA puisse vous répondre, vous devez :

1. Installer [Ollama](https://ollama.ai/) sur votre ordinateur.
2. Lancer un modèle (ex: `ollama run llama3`).
3. L'interface se connectera automatiquement à votre API locale sur `http://localhost:11434`.

## 🛠️ Installation (Développement)

Si vous souhaitez modifier le code sur votre machine :

```bash
# Cloner le projet
git clone [https://github.com/ushmarko-ui/Projet_IA.git](https://github.com/ushmarko-ui/Projet_IA.git)

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev