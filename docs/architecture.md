# 🏗️ Architecture

## Overview

GridCraft is a full-stack interactive web lab built with Vue 3 and Cloudflare Workers.

The project focuses on building a **modular UI system** and interactive experiments (mini-games, tools, prototypes).

---

## 🧭 System Design

The project is structured around 3 core layers:

1. **UI Layer (Frontend)**
   - Vue 3 SPA
   - Component-based architecture
   - Design system (cards, buttons, layout rules)

2. **API Layer (Backend)**
   - Cloudflare Workers
   - Hono framework
   - Simple REST API

3. **Data Layer**
   - Cloudflare D1 (SQLite-like)
   - Used for experiments (messages / test data)

---

## 🖥️ Frontend (Vue 3)

### Stack
- Vue 3
- Vite
- Vue Router
- TypeScript

### Architecture Style

The frontend is now organized as a **product UI system**:

- `/views` → pages (Home, Lab, About)
- `/components` → reusable UI components
- `/styles` → design system (global CSS)
- `/router` → route definitions

---

## 🎨 UI / Design System

The project uses a lightweight custom design system:

### Core primitives
- `.page` → layout container
- `.card` → reusable UI block
- `.btn` → action elements
- `.is-hoverable` → interactive state modifier

### Design philosophy
- consistency over per-page styling
- reusable UI components
- minimal but scalable system

---

## 🧪 Lab System

The Lab is the core of the project.

It is a grid-based system of interactive cards:

- each card represents an experiment
- states: `wip` / `live`
- click-based navigation
- modular components (LabCard, ExplorerGrid)

---

## ⚙️ Backend (Cloudflare Workers)

### Stack
- Cloudflare Workers
- Hono framework

### Role
The backend is currently a lightweight API layer used for:

- testing endpoints
- storing experimental data
- supporting future features (lab interactions)

---

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
Usage
guestbook experiment
API testing layer
data flow validation
🔌 Data Flow

Frontend → API → D1

Example:

Vue component calls /api/messages
Worker handles request via Hono
D1 returns data
UI updates reactively

🚀 Deployment
Frontend
Cloudflare Pages
Vite build system
Backend
Cloudflare Workers
Wrangler deployment

🧠 Key Design Decisions
SPA architecture for simplicity
Component-first UI design
Design system instead of page-specific styling
Lab-first mindset (experiments over content)
Cloudflare-native stack for edge performance

📌 Current Status
UI System: ✅ in progress (stable v1)
Lab system: ⚙️ active development
Backend API: ⚙️ experimental but stable
Admin dashboard: ❌ not implemented (removed from current scope)