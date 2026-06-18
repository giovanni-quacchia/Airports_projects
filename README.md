# Airport Flight Management System
 
University project for the **Web Technologies and Databases** courses (A.Y. 2024-2025).  
Built by Giovanni Quacchia & Alessandro Zuccarello.
 
The repo contains two separate implementations of the same flight booking platform, each built around a different database paradigm. Same domain, different stack — the idea was to see how the two approaches compare in practice.
 
---
 
## What's inside
 
### TAW — MEAN stack (NoSQL)
Full-stack app with Angular, Node.js/Express, and MongoDB. Uses a replica set to support multi-document transactions, JWT for auth, and Docker Compose to wire everything together.
 
### BD — Flask + PostgreSQL (SQL)
Database-heavy implementation with Angular on the frontend and a Python Flask API on the backend. Leans into PostgreSQL features: triggers, materialized views, row-level security, deferrable constraints.
 
Both projects cover the same feature set: flight search, booking, seat selection, extras, and a role-based dashboard for admins, airlines, and customers.
 
---
 
## Roles
 
- **Admin** — manages users and airlines
- **Airline** — creates routes, planes, flights, and sets prices (Economy / Business / First Class)
- **Customer** — searches flights (no login needed), books tickets and picks seats (login required)
---
 
## Running locally
 
The only hard dependency is Docker + Docker Compose.
 
```bash
# TAW (MongoDB)
cd TAW
docker compose up -d --build
# frontend → http://localhost:4200
# backend  → http://localhost:3000
 
# BD (PostgreSQL)
cd BD
docker compose up -d --build
# frontend → http://localhost:4200
# backend  → http://localhost:5001
```
 
---
 
## Test credentials
 
**Admin:** `admin@gmail.com` / `admin`  
**Customer:** `user@gmail.com` / `user`
 
Airlines are pre-loaded in both projects (Ryanair, British Airways, Air France, Emirates, and others) — credentials follow the pattern `contact@<airline>.com` / `password`.
 
---
 
## Docs
 
Both projects include a PDF with design choices and documentation (written in Italian):
- [TAW — Web Technologies report](TAW/giovanni_quacchia_900676.pdf)
- [BD — Database report](BD/Documentazione%20BD.pdf)
---
 
## Notes
 
The `.env` files are committed intentionally so the project runs out of the box. Don't use those credentials for anything beyond local testing.
 
This project is academic work, submitted as coursework only.

## Preview

https://github.com/user-attachments/assets/33111da5-4f16-445d-8984-34bd88871249
