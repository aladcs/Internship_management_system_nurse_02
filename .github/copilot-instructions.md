# Copilot Instructions — Internship Management System

## 🧠 Project Context

This is a production-oriented Internship Management System built with:

* Next.js 16.2.4 (App Router only)
* React 19
* TypeScript (strict)
* Prisma 7
* PostgreSQL
* Tailwind CSS

All implementation must follow:

* docs/PRD.md → system behavior and rules
* docs/_features.md → feature roadmap
* docs/ui/*.md → UI specification per page

---

## ⚠️ Routing and Middleware Rules

This project uses Next.js 16 App Router.

* DO NOT use `middleware.ts`
* Use `proxy.ts` instead for request interception and route protection
* All authentication and RBAC checks must be implemented via `proxy.ts`

Any usage of legacy middleware patterns is strictly forbidden.

---

## ⚠️ Critical Development Rules

* DO NOT use mock data
* DO NOT invent features not in _features.md
* DO NOT rewrite the entire project
* ALWAYS implement one feature at a time
* ALWAYS keep changes minimal and focused

---

## 🔐 Role-Based Access Control (RBAC)

Roles:

* super_admin
* admin
* student

Strict rules:

* super_admin:

  * can manage admin accounts only
  * cannot access student data
* admin:

  * can manage students
  * cannot manage admins
* student:

  * can only access and edit own data

RBAC must be enforced server-side.

Never rely on UI-only checks.

---

## 🔑 Authentication Rules

* Users can login ONLY if email exists in database
* No public registration
* Accounts are created by:

  * super_admin → admin
  * admin → student
* Passwords are generated when accounts are created

---

## 📊 Internship Status Rules

Statuses:

* pending
* in_progress
* completed

Rules:

* Only admin can change status
* Student can edit only when:

  * pending
  * in_progress
* completed = read-only for student

---

## 🔔 Notification Rules

Admin receives notifications when:

* student submits form
* student edits data while status = in_progress

Notifications must be stored in database.

---

## 🧭 Development Workflow

For every task:

1. Identify feature from docs/_features.md
2. Use matching UI spec from docs/ui/*.md
3. Implement ONLY that feature
4. Connect to Prisma (real data)
5. Enforce RBAC
6. Test end-to-end
7. Do NOT modify unrelated features

---

## 🧱 Architecture Rules

* Use Next.js App Router ONLY (`src/app`)
* Prefer Server Components
* Use Client Components only when necessary
* Use Prisma for ALL data access
* Do not introduce new dependencies unless necessary

---

## 📂 Project Structure

* Routes → src/app/**
* Components → src/components/**
* Utilities / logic → src/lib/**

Use `@/` path alias.

---

## 🎨 UI Rules

* Follow UI spec from docs/ui/*.md strictly
* Do not redesign unless explicitly asked
* Maintain consistent spacing, typography, and color usage

Role-based theme:

* Admin / Super Admin → #aa74ab
* Student → #f26e2c

---

## 🧪 Implementation Constraints

* Keep TypeScript strict
* Avoid unnecessary abstraction
* Prefer simple and readable code
* Do not over-engineer

---

## 📌 Output Rules

When generating code:

* Modify only required files
* Keep code minimal and production-ready
* Do not break existing structure
* Do not remove unrelated functionality

---

## 🚫 Anti-Patterns (Do NOT do)

* Do not use mock data
* Do not bypass RBAC
* Do not hardcode user roles
* Do not mix multiple features in one change
* Do not refactor unrelated code

---

## 🧠 Final Principle

This is NOT a prototype.

This is a structured, production-oriented system.

Act accordingly.
