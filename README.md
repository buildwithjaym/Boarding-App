# Boarding App (MVP)
A two-role web app that helps tenants find a boarding house, apply in one tap, and schedule a viewing—while helping owners/housekeepers track applications, appointments, occupancy, and rent due status.

Roles
- Tenant: browse/search boarding houses → apply (name/age/course) → receive appointment → track application status
- Owner/Housekeeper: post listing + rooms/capacity + photos → receive notifications of applicants → propose appointment → approve + mark move-in → track occupancy + due tenants

---

✨ Core MVP Features
Tenant
- Browse/search listings
- View listing details (photos, price, rules, availability)
- Apply via modal form (name, age, course, contact)
- See application status: `PENDING` → `APPOINTMENT_SENT` → `ACCEPTED/REJECTED` → `MOVED_IN`
- Warning if already moved-in at a boarding house (cannot apply elsewhere)

 Owner / Housekeeper
- Create 1 boarding house listing (MVP constraint)
- Add rooms with capacity
- Upload listing photos (Supabase Storage)
- View applications and send an appointment proposal
- Mark tenant as moved-in (auto updates room capacity)
- Dashboard KPIs (MVP):
  - total tenants (active)
  - occupancy count and % (per room + overall)
  - pending applications
  - appointments today / upcoming
  - due tenants this month

 Rent Due Tracking (MVP-lite)
- Monthly rent due status: `PAID / DUE / OVERDUE`
- Simple due list on owner dashboard (no payments in-app)

---

🧱 Tech Stack
Frontend
- HTML / CSS / Vanilla JS
- Mobile-first responsive UI (works on phone + desktop)
Backend
- Node.js + Express (optional / can be serverless on Vercel)

Database / Auth / Storage
- Supabase (Postgres + Auth + Storage)

Hosting
- Vercel (Frontend + optional API routes/serverless)

---

🎨 UI Theme
Primary colors:
- Blue: `#1D4ED8`
- Yellow accent: `#FBBF24`

Goal: high contrast + friendly, trustworthy look.

---

📁 Monorepo Structure
