# Helloword — Fullstack Web Application

## 1. Overview

Application fullstack composée de :
- un frontend SPA en Vue.js
- une API serverless via Cloudflare Workers
- un déploiement frontend via Cloudflare Pages

Architecture découplée frontend / backend.

---

## 2. Architecture


Frontend (Cloudflare Pages)
↓ HTTP
Backend API (Cloudflare Workers)


---

## 3. Frontend

### Stack
- Vue.js
- Vite
- TypeScript

### Localisation
`/frontend`

### Responsabilités
- Interface utilisateur
- Routing SPA
- Consommation API backend

### Build
cd frontend
npm install
npm run build
Output
frontend/dist
Déploiement
Cloudflare Pages



## 4. Backend API
Stack
Cloudflare Workers
TypeScript
Localisation

/backend

Responsabilités
API REST
endpoints applicatifs
logique serveur
Exemple endpoint

GET /api/hello

Déploiement

Cloudflare Workers (Wrangler)

## 5. Communication

Le frontend consomme l’API backend via HTTP.

Exemple
fetch("https://<worker-url>.workers.dev/api/hello")

En production :

fetch("/api/hello")

## 6. Déploiement
Frontend (Pages)
Root directory : frontend
Build command :
npm install && npm run build
Output directory :
dist
Backend (Workers)

Déploiement via Wrangler :

npx wrangler deploy

## 7. Structure du projet
helloword/
├── frontend/        # Application Vue.js
├── backend/         # API Cloudflare Worker
├── node_modules/
└── README.md

## 8. Stack technique
Frontend : Vue.js + Vite + TypeScript
Backend : Cloudflare Workers
Hosting frontend : Cloudflare Pages
Hosting backend : Cloudflare Workers
Infra : Cloudflare Edge

## 9. Notes techniques
Le frontend est une SPA (Single Page Application)
Le backend est serverless (edge runtime)
Les deux sont indépendants et communiquent via HTTP
Le build frontend génère un dossier dist servi par Pages

## 10. Objectif

Architecture web moderne :

frontend découplé
API serverless
déploiement automatisé
performance edge (Cloudflare)