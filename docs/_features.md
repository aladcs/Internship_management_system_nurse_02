# _features.md — Internship Management System

---

## 🧭 Development Strategy

* ทำทีละ feature (vertical slice)
* ทุก feature ต้อง:

  * มี route
  * มี UI
  * ต่อ Prisma
  * enforce RBAC
* ห้ามใช้ mock data ในขั้น implement จริง

---

# 🔥 PHASE 1 — Core Foundation (ต้องทำก่อน)

---

## 🔐 Authentication System

### Feature: Login Page

* [x] Route: `/login`
* [x] Email + Password input
* [x] Login button
* [x] CMU login button (UI only)
* [x] Validation message
* [x] Error state

### Logic

* [x] ตรวจสอบ email ต้องมีใน DB
* [x] ตรวจ password
* [~] Redirect ตาม role:

  * super_admin → `/intern/admins`
  * admin → `/intern/dashboard`
  * student → `/intern/overview`

---

## 🔐 RBAC (Role-Based Access Control)

### Feature: Route Protection

* [x] สร้าง middleware / guard
* [~] block route ตาม role:

| Route                  | Role        |
| ---------------------- | ----------- |
| /intern/admins         | super_admin |
| /intern/dashboard      | admin       |
| /intern/admin/students | admin       |
| /intern/overview       | student     |
| /intern/form           | student     |

---

## 🧱 Database (Prisma Setup)

* [x] User model
* [x] Student model
* [x] Internship model
* [x] File model
* [x] Notification model

---

# 🔥 PHASE 2 — Admin Core

---

## 👨‍💼 Feature: Admin List (Super Admin)

### Route

* [x] `/intern/admins`

### UI

* [x] Table:

  * name
  * email
* [x] Button: Create Admin
* [x] Actions: Edit / Delete

### Logic

* [x] super_admin only
* [x] create admin (generate password)
* [x] update admin
* [x] delete admin

---

## 🎓 Feature: Student List (Admin)

### Route

* [x] `/intern/admin/students`

### UI

* [x] Table:

  * name
  * email
  * status
* [x] Filter by status
* [x] Search (optional)
* [x] Button: Create Student

### Actions

* [x] View
* [x] Edit
* [x] Delete

### Logic

* [x] admin only
* [x] fetch from Prisma

---

## ➕ Feature: Create Student

### UI

* [x] Modal form

  * email
  * name

### Logic

* [x] create user (role=student)
* [x] generate password
* [x] create student record

---

# 🔥 PHASE 3 — Student Flow

---

## 👤 Feature: Student Overview

### Route

* [x] `/intern/overview`

### UI

* [x] Status badge
* [x] Summary card
* [x] Edit button

### Logic

* [x] student only
* [x] fetch own data

---

## 📄 Feature: Student Form

### Route

* [ ] `/intern/form`

### Sections

* [ ] Personal Info
* [ ] Education
* [ ] Internship Details
* [ ] File Upload

### UI

* [ ] Inputs
* [ ] Upload zone
* [ ] Submit button

### Logic

* [ ] save/update data
* [ ] submit → status = pending
* [ ] editable when:

  * pending
  * in_progress
* [ ] read-only when:

  * completed

---

## 📂 Feature: File Upload

### UI

* [ ] drag & drop
* [ ] file list

### Logic

* [ ] max 5 files
* [ ] max 5MB/file
* [ ] allowed types: PDF, JPG, PNG
* [ ] store file path in DB

---

# 🔥 PHASE 4 — Admin Review Flow

---

## 🔍 Feature: Student Detail (Admin View)

### Route

* [ ] `/intern/admin/students/[id]`

### UI

* [ ] Personal info
* [ ] Education info
* [ ] Internship info
* [ ] File list
* [ ] Status control

### Logic

* [~] admin only
* [ ] change status:

  * pending → in_progress
  * in_progress → completed

---

## 📊 Feature: Dashboard

### Route

* [ ] `/intern/dashboard`

### UI

* [ ] Cards:

  * total students
  * pending
  * in_progress
  * completed
* [ ] recent activity

### Logic

* [~] admin only
* [ ] aggregate Prisma data

---

# 🔥 PHASE 5 — Notification System

---

## 🔔 Feature: Notification Bell

### UI

* [ ] icon in navbar
* [ ] badge count
* [ ] dropdown list

---

## ⚙️ Notification Logic

### Trigger

* [ ] student submits form
* [ ] student edits while status = in_progress

### Behavior

* [ ] store in DB
* [ ] mark as read
* [ ] show latest first

---

# 🧪 PHASE 6 — UX & Polish

---

## 📱 Responsive UI

* [ ] mobile navbar (hamburger)
* [ ] table responsive
* [ ] form responsive

---

## 🎨 UI Consistency

* [~] Admin theme: #aa74ab
* [~] Student theme: #f26e2c
* [~] consistent spacing
* [ ] consistent components

---

# 🧠 Phase Priority Order

1. Login
2. RBAC
3. Admin List
4. Student List
5. Create Student
6. Overview
7. Form
8. Student Detail
9. Dashboard
10. Notification

---

# 🚀 Usage with AI

Use like this:

Example:

```text
Implement "Student List" feature from _features.md

Constraints:
- Next.js 16
- Prisma
- No mock data
- Admin only
```

---

# 📌 Notes

* Always follow PRD.md
* Always enforce RBAC server-side
* Never trust client-only checks
* Keep UI consistent with UI spec files
* Do not over-engineer

---

# 🎯 Definition of Completion

Each feature is complete when:

* UI is implemented
* Connected to Prisma
* RBAC enforced
* Works end-to-end
* No mock data
