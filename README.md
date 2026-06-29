# 🧭 Helloword — Fullstack System Dashboard

![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)
![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-f38020?logo=cloudflare)
![D1](https://img.shields.io/badge/Database-Cloudflare%20D1-2c7be5)
![Vite](https://img.shields.io/badge/Frontend-Vite-646cff?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-007acc?logo=typescript)

---

## 📌 Description

Helloword est une application fullstack servant de **socle de test et de dashboard système**.

Elle permet de vérifier simplement :

- Frontend Vue 3
- API Cloudflare Workers
- Base de données Cloudflare D1
- Déploiement Cloudflare Pages + Workers

---

## 🧱 Architecture

Frontend (Vue 3 + Vite)
↓
API (Cloudflare Workers + Hono)
↓
Database (Cloudflare D1)

---

## 🚀 Fonctionnalités

### 🧭 Dashboard système
Page unique permettant de vérifier :

- API status (`/api/hello`)
- Database status (`/api/messages`)
- Test d’écriture en base
- État global du système

---

### 💬 Guestbook

Mini système de messages :

- GET `/api/messages` → liste
- POST `/api/messages` → ajout
- DELETE `/api/messages` → suppression totale

---

## ⚙️ Stack

Frontend :
- Vue 3
- Vite
- Vue Router
- TypeScript

Backend :
- Cloudflare Workers
- Hono

Database :
- Cloudflare D1 (SQLite)

Dev :
- Wrangler
- concurrently
- npm scripts

---

## 🧪 Installation (local)

### 1. Cloner le projet
```bash
git clone https://github.com/yourname/helloword.git
cd helloword

2. Installer dépendances
npm install
cd frontend && npm install
cd ../backend && npm install

3. Lancer en dev
npm run dev

Accès :

Frontend : http://localhost:5173
Backend : http://127.0.0.1:8787

🧱 Base de données
Migration locale
cd backend
npx wrangler d1 migrations apply DB --local

Table messages
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

🌍 Variables d’environnement
Local
VITE_API_URL=http://127.0.0.1:8787
Production
VITE_API_URL=https://helloword-api.your-domain.workers.dev

⚠️ En production, configurer dans Cloudflare Pages (pas via .env).

🚀 Déploiement
Backend
cd backend
npx wrangler deploy
Frontend

Déploiement automatique via Cloudflare Pages (Git push)

☁️ URLs
Frontend : https://helloword-app.pages.dev
Backend : https://helloword-api.workers.dev
⚠️ Notes importantes
Les variables Vite sont injectées au build uniquement
D1 nécessite des migrations (local + remote)
CORS activé via Hono middleware
Cloudflare Pages n’utilise pas .env.production automatiquement

🧠 Objectif

Projet sandbox fullstack pour :

tester architecture moderne
API + DB + frontend
déploiement cloud complet
base pour futurs projets SaaS


## Recap IA : PROJECT CONTEXT — HELLOWORLD FULLSTACK APP

## Stack
- Frontend: Vue 3 + Vite + Vue Router + TypeScript
- Backend: Cloudflare Workers (Hono framework)
- Database: Cloudflare D1 (SQLite-like)
- Deployment:
  - Frontend: Cloudflare Pages
  - Backend: Cloudflare Workers
- Dev tooling: Wrangler, concurrently, npm scripts

---

## Architecture

Frontend (Vue SPA)
→ communicates with backend API via VITE_API_URL

Backend (Worker)
→ exposes REST API under /api/*
→ connects to D1 database

Database
→ D1 SQLite database
→ managed via Wrangler migrations

---

## Features

### System Dashboard (main page)
Single-page dashboard used to monitor system health:

- API status check (/api/hello)
- Database status (fetch messages)
- Write test (POST message)
- System info panel (future extensible)

---

### Guestbook feature
- GET /api/messages → list messages
- POST /api/messages → create message
- DELETE /api/messages → clear messages
- Messages stored in D1 with:
  - id
  - text
  - created_at

---

## Backend API (Cloudflare Worker)

Endpoints:
- GET /api/hello → health check
- GET /api/messages
- POST /api/messages
- DELETE /api/messages

CORS enabled via Hono middleware

---

## Database (D1)

Table: messages

Schema:
- id INTEGER PRIMARY KEY AUTOINCREMENT
- text TEXT NOT NULL
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP

Migrations handled via:
- wrangler d1 migrations apply

---

## Environment variables

Frontend:
- VITE_API_URL (dev + prod separated)

Local:
- http://127.0.0.1:8787

Production:
- https://helloword-api.cyrilgourdon-cg.workers.dev

---

## Dev workflow

- npm run dev → starts:
  - frontend (Vite)
  - backend (wrangler dev)
  - DB migration local apply

- concurrently used for parallel execution

---

## Deployment

- git push triggers Cloudflare Pages + Workers build
- frontend build injects VITE_API_URL at build time
- backend deployed via wrangler deploy

---

## Known constraints / lessons learned

- Cloudflare Pages env vars must be defined in dashboard
- Vue-tsc strict mode breaks build if unused imports exist
- D1 requires migrations (local + remote separation)
- API URL must be injected at build time (not runtime)

fdf