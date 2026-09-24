# MedAssist - Clinic Operations & Patient Care Portal

Full-stack MERN capstone scaffold for a role-based clinic management system.

## Structure

- `server` - Express, MongoDB/Mongoose, JWT auth, RBAC, audit logging, uploads, AI proxy endpoints, tests, seed data.
- `client` - React + Vite, React Router v6, TailwindCSS, React Query, React Hook Form + Zod.

## Quick Start

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Demo users created by `npm run seed` all use `Password123!`.

## Test

```bash
cd server && npm test
cd client && npm test
```

## Security Notes

- Access JWT is returned to the client; refresh JWT is set in an httpOnly cookie.
- Server routes use `authenticate -> authorize(...)`; patient/doctor ownership checks are implemented where self-service reads are exposed.
- Audit logs are append-only and have no update/delete routes.
- Clinical and financial mutations call `writeAuditLog`.
- AI prompts are proxied server-side and explicitly forbid adding new medical facts, diagnoses, medications, or treatment recommendations.
