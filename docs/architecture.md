# 🏗️ Architecture

## Overview

HelloWord is a full-stack web application composed of:

- Frontend: Vue 3 SPA
- Backend: Cloudflare Workers API
- Database: Cloudflare D1

It is split into two main parts:

1. Public application (portfolio + lab)
2. Admin dashboard (internal tools)

---

## 🖥️ Frontend (Vue 3)

### Stack
- Vue 3 + Vite
- Vue Router
- TypeScript

### Structure

- `/views` → pages (Home, Projects, Lab, Dashboard)
- `/components` → reusable UI components
- `/layouts` → layout system (Public / Dashboard)
- `/router` → route definitions

### Layouts

#### Public Layout
- Navbar
- Content
- Footer

#### Dashboard Layout
- Sidebar
- Topbar
- Content area

---

## ⚙️ Backend (Cloudflare Workers)

### Stack
- Cloudflare Workers
- Hono framework

### Responsibilities
- REST API
- Data access layer (D1)
- System endpoints

### API endpoints


GET /api/hello
GET /api/messages
POST /api/messages
DELETE /api/messages


---

## 🗄️ Database (D1)

### Table: messages

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
text TEXT NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP

Used for:

guestbook feature
test write/read operations
🔌 Data Flow

Frontend → API → D1

Example:

Vue component calls /api/messages
Worker handles request via Hono
D1 returns data
Vue updates UI
🚀 Deployment
Frontend
Cloudflare Pages
Build injected with VITE_API_URL
Backend
Cloudflare Workers
Deployed via Wrangler
🧠 Key design decisions
SPA architecture for simplicity
Separation of public vs admin UI
API-first backend design
Cloudflare-native stack for edge performance