# MERN Blog — Monorepo (Server + Client)

This repository contains a minimal MERN blog example split into two folders:
- `server/` — Express + Mongoose API
- `client/` — Vite + React front-end

This README explains how to set up and run both projects, environment variables, common commands, and troubleshooting tips.

---

## Table of contents

- Prerequisites
- Repository layout
- Environment variables
- Setup (install)
- Running (server, client, together)
- API summary (server)
- Client notes
- Development tips & troubleshooting
- Useful commands
- Optional: Top-level npm scripts

---

## Prerequisites

- Node.js v16+ and npm
- MongoDB (local or Atlas) or a reachable MongoDB connection string
- Optional: curl, jq for testing from the terminal

---

## Repository layout

- server/
  - server.js
  - routes/
  - models/
  - package.json
  - .env.example
- client/
  - src/
  - package.json
  - vite.config.js
  - .env.example
- README.md (this file)

---

## Environment variables

Create `.env` files in the appropriate directories using `.env.example` as a guide.

server/.env (example)
MONGODB_URI=mongodb://127.0.0.1:27017/mern-blog
JWT_SECRET=change_this_secret
PORT=5000
NODE_ENV=development

client/.env (example)
VITE_API_URL=http://localhost:5000

Notes:
- For MongoDB Atlas use the `mongodb+srv://` connection string and make sure your IP is permitted.
- Do not commit real secrets.

---

## Setup (install)

Install dependencies in both subprojects:

1. From repository root:
   - cd server && npm install
   - cd ../client && npm install

Or run in two terminals concurrently.

---

## Running

A. Run server only

1. Start MongoDB (if using local)
   - Linux (systemd): sudo systemctl start mongod
   - macOS (Homebrew): brew services start mongodb-community

2. From `server/`:
   - Development (auto-restart): npm run dev
   - Production/start: npm run start

B. Run client only

From `client/`:
- Development: npm run dev
- Build: npm run build
- Preview build: npm run preview

C. Run server + client together (two terminals or one command)

Option 1 — two terminals:
- Terminal 1: cd server && npm run dev
- Terminal 2: cd client && npm run dev

Option 2 — single command (add to top-level package.json or run locally):
- Install concurrently globally or as a dev dependency: npm install -g concurrently
- From repo root example:
  concurrently "npm run dev --prefix server" "npm run dev --prefix client"

Example top-level package.json scripts (optional)
```json
"scripts": {
  "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
  "start": "node server/server.js"
}
```

---

## API summary (server)

Base URL: http://localhost:5000/api

Auth
- POST /api/auth/register — Register. Body: { name, email, password } → returns { token, user }
- POST /api/auth/login — Login. Body: { email, password } → returns { token, user }

Posts
- GET /api/posts — List posts (query: page, limit, q). Returns { data, meta }
- GET /api/posts/:id — Get single post by id or slug
- POST /api/posts — Create post. Body: { title, content, author, category, ... }
  - category may be an existing ObjectId, slug, or a name string (server resolves/creates)
  - server generates a unique slug if none provided
- PUT /api/posts/:id — Update post
- DELETE /api/posts/:id — Delete post

Categories
- GET /api/categories — List categories
- POST /api/categories — Create category. Body: { name }

Error format
- Validation errors: { errors: [ { msg, param, ... } ] }
- Other errors: { error: '...', details: '...' }

---

## Client notes

- The client uses `VITE_API_URL` to determine the backend. Default in `.env.example` is `http://localhost:5000`.
- Axios instance attaches `Authorization: Bearer <token>` if `localStorage.token` exists.
- AuthContext stores `user` and `token` in localStorage.
- Creating a post expects an authenticated user (author id). The Create/Edit UI will prompt login if no user is present.

---

## Testing endpoints (curl examples)

Register a user:
```
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"secret"}' | jq
```

Create a post (replace <authorId> with real ID from register response):
```
curl -v -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test post","content":"Body","author":"<authorId>","category":"Announcements"}'
```

List posts:
```
curl http://localhost:5000/api/posts | jq
```

---

## Troubleshooting

- "The `uri` parameter ... must be a string" — MONGODB_URI is undefined. Ensure `server/.env` exists and you start the server from the server folder (or load dotenv in server.js).
- 400 when creating a post:
  - Check server response body (`Network` → Response or axios catch `err.response.data`) — it will list validation errors or Mongoose messages (e.g., missing slug, missing author).
  - Ensure `title`, `content` are present and `author` is a valid user id if required by schema.
- CORS errors:
  - The server enables CORS by default. Confirm server allows your client origin if custom settings are used.
- Import resolution errors with Vite:
  - On Linux/macOS paths are case-sensitive. Confirm `client/src/context/AuthContext.jsx` exists and named exactly.
- If using MongoDB Atlas:
  - Add your IP to Atlas Network Access or allow 0.0.0.0/0 for quick dev.
  - Use the correct connection string and credentials.

---

## Useful commands

Server
- Install: cd server && npm install
- Dev: cd server && npm run dev
- Start: cd server && npm run start

Client
- Install: cd client && npm install
- Dev: cd client && npm run dev
- Build: cd client && npm run build
- Preview: cd client && npm run preview

Repo root (optional)
- Dev both: npm run dev (if you add the `concurrently` script shown above)

---

## Next steps & tips

- Consider adding a top-level script or a small Docker Compose file to orchestrate both services and MongoDB for reproducible local development.
- For production, serve the client `dist/` from the server or deploy client separately (Netlify/Vercel) and server to a proper host (Heroku, Render, DigitalOcean, etc.).
- For security, switch from localStorage tokens to secure httpOnly cookies and implement refresh tokens.

---

If you'd like, I can:
- Add a top-level package.json with working `dev` and `start` scripts,
- Provide a Docker Compose file to run the server, client (optional), and MongoDB together,
- Or create Postman/Insomnia collection for the API endpoints.