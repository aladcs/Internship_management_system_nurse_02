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
* [x] Redirect ตาม role:

  * super_admin → `/intern/admins`
  * admin → `/intern/dashboard`
  * student → `/intern/overview`

---

## 🔐 RBAC (Role-Based Access Control)

### Feature: Route Protection

* [x] สร้าง middleware / guard
* [x] block route ตาม role:

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
* [x] reset admin password (super_admin only, generate temporary password)

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
* [x] reset student password (admin only, generate temporary password)

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

* [x] `/intern/form`

### Sections

* [x] Personal Info
* [x] Education
* [x] Internship Details
* [x] File Upload

### UI

* [x] Inputs
* [x] Upload zone
* [x] Submit button

### Logic

* [x] save/update data
* [x] submit → status = pending
* [x] editable when:

  * pending
  * in_progress
* [x] read-only when:

  * completed

* [ ] block admin status change before first student submit
* [ ] preserve in_progress on student edit and notify admin

---

## 📂 Feature: File Upload

### UI

* [x] drag & drop
* [x] file list

### Logic

* [x] max 5 files
* [x] max 5MB/file
* [x] allowed types: PDF, JPG, PNG
* [x] store file path in DB

---

# 🔥 PHASE 4 — Admin Review Flow

---

## 🔍 Feature: Student Detail (Admin View)

### Route

* [x] `/intern/admin/students/[id]`

### UI

* [x] Personal info
* [x] Education info
* [x] Internship info
* [x] File list
* [x] Status control

### Logic

* [x] admin only
* [x] change status:

  * pending → in_progress
  * in_progress → completed

---

## 📊 Feature: Dashboard

### Route

* [x] `/intern/dashboard`

### UI

* [x] Cards:

  * total students
  * pending
  * in_progress
  * completed
* [x] recent activity

### Logic

* [x] admin only
* [x] aggregate Prisma data

---

# 🔥 PHASE 5 — Notification System

---

## 🔔 Feature: Notification Bell

### UI

* [x] icon in navbar
* [x] badge count
* [x] dropdown list

---

## ⚙️ Notification Logic

### Trigger

* [x] student submits form
* [x] student edits while status = in_progress

### Behavior

* [x] store in DB
* [x] mark as read
* [x] show latest first

---

# 🧪 PHASE 6 — UX & Polish

---

## 📱 Responsive UI

* [x] mobile navbar (hamburger)
* [x] table responsive
* [x] form responsive

---

## 🎨 UI Consistency

* [x] Admin theme: #aa74ab
* [x] Student theme: #f26e2c
* [x] consistent spacing
* [x] consistent components

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
