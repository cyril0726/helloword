# 🚀 HelloWord

Full-stack web project: interactive web lab + portfolio system + backend API.

Built with Vue 3 frontend and Cloudflare Workers backend.

---

## 🧭 Vision

HelloWord is a personal interactive web lab focused on building:
- experiments
- mini-games
- UI prototypes
- developer tools

It is not a traditional portfolio, but a **living product lab**.

---

## 🛠️ Tech Stack

### Frontend
- Vue 3
- Vite
- Vue Router
- TypeScript

### Backend
- Cloudflare Workers
- Hono framework

### Database
- Cloudflare D1 (SQLite-like)

### Deployment
- Cloudflare Pages (frontend)
- Cloudflare Workers (backend)

---

## 📦 Structure

/frontend → Vue application (public UI + lab + pages)
/backend → API (Hono + Workers)
/docs → Project documentation

---

## 🚀 Features

### Public interface
- Landing page (product-style entry point)
- Lab (interactive grid of experiments)
- About (product identity card)

### Lab system
- Interactive cards system
- WIP / Live states
- Click-based navigation
- Component-based UI architecture

---

## 🎨 UI / Design System

This project now includes a lightweight design system:

- `.page` → global layout container
- `.card` → reusable UI container
- `.btn` → unified buttons
- `.is-hoverable` → interactive states

Design philosophy:
> consistency over page-specific styling

---

## 🔌 API

Backend exposed under:


/api/*


Examples:
- GET `/api/hello`
- GET `/api/messages`
- POST `/api/messages`

---

## 🧪 Development

```bash
npm run dev

Runs:

Frontend (Vite)
Backend (Wrangler)
Local environment
📌 Status

Project is currently in active development:

Architecture: ✅
Routing: ✅
UI system: ⚙️ in progress (design system v1)
Lab system: ⚙️ in progress (WIP cards)
Backend API: ✅ stable
📚 Documentation

See /docs:

Architecture
Roadmap