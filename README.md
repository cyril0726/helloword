# 🚀 HelloWord

Full-stack web project: portfolio + lab + admin dashboard.

Built with Vue 3 frontend and Cloudflare Workers backend.

---

## 🧭 Vision

HelloWord is a hybrid project combining:
- A public portfolio (projects, lab, experiments)
- A developer lab (mini web games / experiences)
- An internal admin dashboard (system monitoring + tools)

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


/frontend → Vue application (public + admin UI)
/backend → API (Hono + Workers)
/docs → Project documentation


---

## 🚀 Features

### Public site
- Home page
- Projects showcase
- Lab (experiments / mini-games)

### Admin dashboard
- API health monitoring
- Database test (guestbook)
- System status panel

---

## 🔌 API

Backend exposed under:

```
/api/*
```

Examples:
- GET `/api/hello`
- GET `/api/messages`
- POST `/api/messages`

---

## 🧪 Development

```bash
npm run dev
```

Runs:
- Frontend (Vite)
- Backend (Wrangler)
- Local environment

---

## 📌 Status

Project is currently in active development:
- Architecture: ✅
- Routing: ✅
- Layouts: ✅
- Dashboard: ⚠️ in progress
- Design system: ❌ not started

---

## 📚 Documentation

See `/docs`:
- [Architecture](./docs/architecture.md)
- [Roadmap](./docs/roadmap.md)