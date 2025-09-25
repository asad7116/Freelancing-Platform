#AI Freelancing Platform

This repo contains a React frontend and a Node/Express/Prisma backend with PostgreSQL.
Users can sign up/sign in as Buyer (client) or Seller (freelancer) and are redirected to role-specific dashboards at /client/overview or /freelancer/overview. The dashboard shell (sidebar + topbar) is shared; the sidebar menu adapts by role.

🚀 Quick Start
1) Prerequisites

Node.js ≥ 18.18 (or 20.x) and npm

PostgreSQL running locally (Windows installer is fine)

Git

Check versions:

node -v
npm -v
psql --version

2) PostgreSQL setup (one time)

Open psql and create a DB + app user:

-- connect as postgres superuser
-- Windows: open "SQL Shell (psql)" or use PowerShell: psql -U postgres -h localhost -p 5432

CREATE ROLE app WITH LOGIN PASSWORD 'app_password';
CREATE DATABASE fyp OWNER app;
GRANT ALL PRIVILEGES ON DATABASE fyp TO app;

-- (optional) allow app to create shadow DBs for Prisma migrate
ALTER ROLE app CREATEDB;

3) Backend env + install
cd backend
# .env (create this file)


backend/.env

DATABASE_URL="postgresql://app:app_password@localhost:5432/fyp?schema=public"
JWT_SECRET="dev_super_secret_change_me"
FRONTEND_ORIGIN="http://localhost:3000"


Then:

npm i
npx prisma migrate dev --name init
npx prisma generate
npm run dev


Expected: API listening on http://localhost:4000

4) Frontend install + run
cd ../frontend
npm i
npm start


App runs at http://localhost:3000.

5) Test the flow

Go to Sign Up → choose Buyer (client) or Seller (freelancer) via the toggle.

On success, you’ll be redirected to:

Buyer → /client/overview

Seller → /freelancer/overview

Sidebar shows different menus per role.

Use the Sign out icon in the top-right to log out.

🧭 Project Structure
Ai-Enhanced Freelancing platform/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Express app, CORS, cookie parser, routes mount
│   │   ├── prisma.js                 # Prisma client
│   │   ├── routes/
│   │   │   └── auth.routes.js        # /api/auth (signup/signin/signout/me)
│   │   └── lib/
│   │       ├── jwt.js                # sign/verify JWT + cookie options
│   │       └── validators.js         # zod schemas for inputs
│   ├── prisma/
│   │   ├── schema.prisma             # User model + Role enum
│   │   └── migrations/…              # initial migration
│   ├── .env                          # DATABASE_URL, JWT_SECRET, FRONTEND_ORIGIN
│   └── package.json                  # dev/start/prisma scripts
└── frontend/
    ├── src/
    │   ├── App.js                    # routes: /client/* and /freelancer/*
    │   ├── layouts/DashboardLayout.jsx
    │   ├── components/
    │   │   ├── Dashboard_sidebar.jsx # role-aware menu (Lucide icons)
    │   │   ├── DashboardTopbar.jsx   # actions + Sign out
    │   │   └── Login_Toggle.jsx      # controlled Buyer/Seller toggle
    │   ├── lib/api.js                # fetch helper (credentials: 'include')
    │   ├── pages/
    │   │   ├── Client/Overview.jsx   # uses shared dashboard component
    │   │   ├── Freelancer/Overview.jsx
    │   │   ├── Signin.jsx
    │   │   └── signUp.jsx
    │   └── styles/…                  # your existing CSS
    └── package.json




