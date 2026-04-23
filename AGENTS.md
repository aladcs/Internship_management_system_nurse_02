<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# 🧠 Project Context

This is an Internship Management System.

You MUST follow these files as the source of truth:

* docs/PRD.md → system behavior
* docs/_features.md → feature roadmap
* docs/ui/*.md → UI design reference
* .github/copilot-instructions.md → business rules

---

# ⚠️ Critical Development Rules

* DO NOT use mock data
* DO NOT invent new features not in _features.md
* DO NOT rewrite the whole project
* ALWAYS implement one feature at a time
* ALWAYS follow RBAC rules from PRD

---

# 🔐 RBAC (Strict)

Roles:

* super_admin
* admin
* student

Rules:

* super_admin manages admins only
* admin manages students only
* student manages own data only

NEVER violate these rules.

---

# 🧭 Development Workflow

For every task:

1. Identify feature from `_features.md`
2. Use matching UI spec from `docs/ui/*.md`
3. Implement only that feature
4. Use Prisma for data
5. Enforce RBAC
6. Do NOT modify unrelated files

---

# 🧱 Stack Rules

* Next.js 16 App Router ONLY
* React 19
* TypeScript strict mode
* Tailwind CSS

---

# 📂 Project Structure

* App routes → `src/app/**`
* Components → `src/components/**`
* Logic / utilities → `src/lib/**`

---

# ⚙️ Implementation Rules

* Prefer Server Components when possible
* Use Client Components only when needed
* Use Prisma for all data access
* No external dependencies unless necessary

---

# 🎨 UI Rules

* Follow UI spec exactly from `docs/ui/*.md`
* Do NOT redesign unless necessary
* Maintain consistency across pages

---

# 📌 Output Rules (for AI)

* Only modify necessary files
* Keep changes minimal and focused
* Do not break existing structure
* Code must be production-ready

---

# 📦 Commands

* npm run dev
* npm run build
* npm run lint
* npm run start

---

# 🧠 Key Insight

This is NOT a prototype.

This is a production-oriented system.

Act accordingly.
