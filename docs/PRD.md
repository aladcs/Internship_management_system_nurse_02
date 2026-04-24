# PRD.md — Internship Management System

## 1. Product Overview

Internship Management System คือระบบเว็บสำหรับจัดการข้อมูลนักศึกษาฝึกงาน โดยออกแบบมาเพื่อให้การเก็บข้อมูล การตรวจสอบ การติดตามสถานะ และการดูแลสิทธิ์ของผู้ใช้เป็นระบบเดียวกัน

ระบบนี้มีเป้าหมายหลัก 3 เรื่อง:

1. ให้นักศึกษาสามารถกรอกและอัปเดตข้อมูลฝึกงานของตนเองได้ง่าย
2. ให้แอดมินสามารถตรวจสอบ จัดการ และติดตามสถานะของนักศึกษาได้สะดวก
3. ให้ Super Admin ควบคุมบัญชีแอดมินได้อย่างปลอดภัยและชัดเจน

ระบบรองรับการทำงานบนเว็บแบบ responsive ใช้งานได้ทั้ง desktop และ mobile และจะใช้ Next.js + Prisma + PostgreSQL เป็นแกนหลักของระบบจริง

---

## 2. Problem Statement

ปัญหาหลักที่ระบบนี้ต้องแก้คือ:

* ข้อมูลนักศึกษาฝึกงานกระจัดกระจาย
* ขั้นตอนการส่งข้อมูลและตรวจเอกสารไม่ชัดเจน
* การติดตามว่าใครส่งแล้ว ใครยังไม่ส่ง หรือใครได้รับการอนุมัติแล้วทำได้ยาก
* การจัดการสิทธิ์ของผู้ใช้ เช่น แอดมิน นักศึกษา และผู้ดูแลระดับสูง ยังไม่แยกบทบาทชัด
* ถ้านักศึกษาแก้ไขข้อมูลหลังได้รับการอนุมัติแล้ว แอดมินอาจไม่รู้ว่ามีการเปลี่ยนแปลง

ระบบนี้จึงต้องมีทั้งการจัดการข้อมูล, workflow สถานะ, notification และ RBAC ที่ชัดเจน

---

## 3. Goals

### 3.1 Business Goals

* สร้างระบบกลางสำหรับจัดการข้อมูลฝึกงาน
* ลดงาน manual ที่กระจัดกระจาย
* เพิ่มความถูกต้องของข้อมูล
* ให้การดูแลนักศึกษาหลายคนพร้อมกันทำได้ง่ายขึ้น

### 3.2 User Goals

* นักศึกษากรอกข้อมูลได้ง่ายและไม่สับสน
* แอดมินตรวจข้อมูลและเปลี่ยนสถานะได้เร็ว
* Super Admin จัดการสิทธิ์แอดมินได้ปลอดภัย

### 3.3 Product Goals

* แยกบทบาทผู้ใช้ชัดเจน
* มี UI ที่เรียบง่าย ใช้งานง่าย และดูทันสมัย
* รองรับการขยายต่อในอนาคต เช่น email notifications, audit log, storage จริง

---

## 4. Non-Goals

สิ่งต่อไปนี้ยังไม่อยู่ในขอบเขตหลักของเวอร์ชันนี้:

* ระบบ self-registration
* ระบบเปลี่ยนรหัสผ่านแบบสมบูรณ์
* ระบบ reset password แบบส่งอีเมล
* การเชื่อมต่อ CMU Entra ID แบบใช้งานจริง
* การจัดการหลายองค์กรหรือหลายหน่วยงานในระบบเดียว
* advanced analytics
* audit log แบบเต็มรูปแบบ
* workflow อนุมัติหลายชั้น

---

## 5. User Roles

ระบบมี 3 บทบาทหลัก

### 5.1 Super Admin

มีเพียง 1 คนเท่านั้นในระบบ และถูกสร้างโดย seed database ตั้งแต่เริ่มต้น

* Email เริ่มต้น: `nupong.pr@cmu.ac.th`
* มีสิทธิ์จัดการบัญชี Admin เท่านั้น
* ไม่มีสิทธิ์จัดการข้อมูลนักศึกษา
* ไม่มี notification
* มีเมนูหลักคือ Admin List

### 5.2 Admin

ถูกสร้างโดย Super Admin

สิทธิ์:

* จัดการข้อมูลนักศึกษาได้ทั้งหมด
* สร้าง student account ได้
* ดู dashboard ได้
* ดู student list ได้
* เปิดดู student detail ได้
* แก้ไขข้อมูลนักศึกษาได้ตลอดเวลา
* เปลี่ยนสถานะฝึกงานของนักศึกษาได้
* ดู notification ได้
* ไม่มีสิทธิ์จัดการ admin คนอื่น

### 5.3 Student

ถูกสร้างโดย Admin

สิทธิ์:

* login ได้เมื่อมี email อยู่ในระบบแล้วเท่านั้น
* ดูข้อมูลของตัวเอง
* กรอกแบบฟอร์มฝึกงาน
* แก้ไขข้อมูลของตัวเองได้ตามเงื่อนไขสถานะ
* submit ข้อมูลเพื่อให้แอดมินตรวจสอบ
* ไม่มีสิทธิ์เข้าถึงข้อมูลของผู้อื่น

---

## 6. Authentication and Access Rules

### 6.1 Authentication Methods

ระบบรองรับ:

* Email/Password
* ปุ่ม CMU Account สำหรับอนาคต

หมายเหตุ:

* ปุ่ม CMU Account มีอยู่ใน UI แต่ยังไม่ต้องเชื่อม Entra ID จริงในเวอร์ชันนี้
* นักศึกษา CMU ต้องสามารถ login ด้วย email/password ได้

### 6.2 Access Gate Rule

ผู้ใช้จะ login ได้ก็ต่อเมื่อ email ของผู้ใช้นั้นมีอยู่ในฐานข้อมูลแล้ว

ผลลัพธ์:

* ไม่มี public registration
* ไม่มีการสมัครใช้งานด้วยตัวเอง
* ทุก account ต้องถูกสร้างจากคนที่มีสิทธิ์ก่อน

### 6.3 Account Creation Authority

* Super Admin เป็นผู้สร้าง Admin
* Admin เป็นผู้สร้าง Student
* Student ไม่สามารถสร้าง account เองได้

### 6.4 Password Handling

* ตอนสร้าง account ใหม่ ระบบต้อง generate password ให้
* ระบบเปลี่ยนรหัสผ่านยังไม่ถือเป็น core feature ใน version นี้
* version นี้ยังไม่บังคับให้ user เปลี่ยน password ตอน login ครั้งแรก

---

## 7. Permission Matrix

| Action                 | Super Admin | Admin |                  Student |
| ---------------------- | ----------: | ----: | -----------------------: |
| Login                  |         Yes |   Yes |                      Yes |
| Create Admin           |         Yes |    No |                       No |
| Edit Admin             |         Yes |    No |                       No |
| Delete Admin           |         Yes |    No |                       No |
| View Admin List        |         Yes |    No |                       No |
| View Dashboard         |          No |   Yes |                       No |
| View Student List      |          No |   Yes |                       No |
| Create Student         |          No |   Yes |                       No |
| Edit Student           |          No |   Yes |      Limited to own data |
| Delete Student         |          No |   Yes |                       No |
| Change Student Status  |          No |   Yes |                       No |
| View Notifications     |          No |   Yes |                       No |
| Submit Internship Form |          No |    No |                      Yes |
| Edit Own Form          |          No |    No | Yes, depending on status |

---

## 8. Core User Flows

### 8.1 Super Admin Flow

1. Super Admin login
2. เข้าสู่หน้า Admin List
3. ดูรายการแอดมินทั้งหมด
4. กด Create Admin
5. กรอกข้อมูลอย่างน้อย:

   * email
6. ระบบ generate password
7. บันทึก admin ลงฐานข้อมูล
8. เมื่อ admin เข้าสู่ระบบครั้งแรก สามารถตั้งชื่อที่แสดงได้จากเมนูบัญชีผู้ใช้
9. Super Admin สามารถ edit หรือ delete admin ได้

ข้อจำกัด:

* Super Admin ไม่สามารถดูหรือจัดการ student data ได้

### 8.2 Admin Flow

1. Admin login
2. เข้าสู่หน้า Dashboard
3. ดู summary เช่น:

   * จำนวน student ทั้งหมด
   * pending
   * in progress
   * completed
4. เข้าหน้า Student List
5. ดูรายชื่อนักศึกษา
6. filter ตามสถานะได้
7. กด Create Student เพื่อสร้าง account นักศึกษา
8. กดดู detail ของ student ได้
9. แก้ไขข้อมูล student ได้
10. เปลี่ยน status ของ student ได้
11. เปิด notification bell เพื่อดูรายการแจ้งเตือนได้

### 8.3 Student Flow

1. Student login
2. ถ้า login สำเร็จ เข้าหน้า Overview
3. ดูข้อมูลสรุปและสถานะของตัวเอง
4. เข้าหน้า Form
5. กรอกหรือแก้ไขข้อมูล
6. อัปโหลดไฟล์แนบ
7. submit แบบฟอร์ม
8. สถานะกลายเป็น pending
9. ถ้า status ยังเป็น pending หรือ in_progress สามารถกลับมาแก้ไขได้
10. ถ้า status เป็น completed จะไม่สามารถแก้ไขได้

---

## 9. Information Architecture

### 9.1 Super Admin

Navbar:

* Admin List
* User Name
* Role
* Logout

### 9.2 Admin

Navbar:

* Dashboard
* Student List
* Notification Bell
* User Name
* Role
* Logout

### 9.3 Student

Navbar:

* Overview
* User Email
* Role
* Logout

### 9.4 Shared Navbar Rules

* ซ้าย: logo `nurse.svg`
* ขวา: user info + logout
* mobile: ยุบเป็น hamburger menu
* เมื่อกด hamburger ให้เมนู slide down

---

## 10. Functional Requirements

## 10.1 Login Page

### Purpose

เป็นหน้าหลักสำหรับเข้าสู่ระบบ

### UI Elements

* email input
* password input
* login button
* CMU account button
* validation message
* error state

### Behavior

* เมื่อกรอกข้อมูลและกด login:

  * ตรวจสอบ email/password
  * ถ้า email ไม่มีในระบบ ต้องไม่อนุญาตให้เข้า
  * ถ้า login สำเร็จ redirect ตาม role

### Redirect Rules

* super_admin → Admin List
* admin → Dashboard
* student → Overview

---

## 10.2 Admin List Page

### Access

Super Admin only

### Purpose

ใช้สำหรับดูและจัดการบัญชีแอดมินทั้งหมด

### Must Have

* ตารางรายการ admin
* ปุ่ม Create Admin
* ปุ่ม Edit
* ปุ่ม Delete

### Display Fields

* name
* email
* role
* created at (optional)

### Create Admin

Fields ขั้นต่ำ:

* email

System behavior:

* generate password
* create user with role = admin

### Restrictions

* Admin ปกติไม่มีสิทธิ์เข้า
* Student ไม่มีสิทธิ์เข้า

---

## 10.3 Dashboard Page

### Access

Admin only

### Purpose

หน้า overview ของการจัดการนักศึกษา

### Must Have

Summary cards:

* total students
* pending
* in progress
* completed

Other areas:

* recent notifications
* quick access to student list
* quick access to records requiring review

### Notes

dashboard ต้องช่วยให้ admin รู้ทันทีว่ามีอะไรค้างอยู่

---

## 10.4 Student List Page

### Access

Admin only

### Purpose

ใช้แสดงรายชื่อนักศึกษาทั้งหมด

### Must Have

* table/list
* filter by status
* search (optional but recommended)
* button: Create Student
* actions: View / Edit / Delete

### Display Fields

* name
* email
* status
* updated at (optional)

### Create Student

Fields ขั้นต่ำ:

* email
* name (optional)

System behavior:

* generate password
* create user with role = student
* create related student record

---

## 10.5 Student Detail Page (Admin View)

### Access

Admin only

### Purpose

ให้ admin ดูรายละเอียดนักศึกษาหนึ่งคนแบบครบถ้วน

### Sections

* personal information
* education information
* internship details
* uploaded files
* current status
* action area for editing and changing status

### Must Have

* view all student data
* edit all student data
* change internship status
* view file list / open file / delete file (ถ้ารวมใน version นี้)

### Status Control

admin สามารถเปลี่ยนสถานะได้ทั้งหมดตาม rule ของระบบ

---

## 10.6 Student Overview Page

### Access

Student only

### Purpose

เป็นหน้า landing page ของนักศึกษา

### Must Have

* status badge
* summary of submitted info
* button to go edit form
* readonly summary view

### Notes

ต้องเข้าใจง่ายและไม่ overload

---

## 10.7 Student Form Page

### Access

Student only

### Purpose

ให้ student กรอกและส่งข้อมูลฝึกงาน

### Sections

1. Personal Info
2. Education Info
3. Internship Details
4. File Upload

### Form Behavior

* save/update own data
* submit data to system
* set status to pending when submitted
* if completed → read-only

### Validation

* required fields
* format validation
* file validation

---

## 10.8 Notification UI

### Access

Admin only

### Purpose

แจ้งเตือนแอดมินเมื่อมี event สำคัญจากนักศึกษา

### Must Have

* bell icon in navbar
* badge count
* dropdown or list page
* notification history persistence

### Trigger Events

* student submits form
* student edits data while status = in_progress

### Optional

* student edits while pending may or may not create a notification depending on implementation priority

---

## 11. Data Requirements

## 11.1 User Entity

Fields:

* id
* email
* password
* role
* name
* createdAt
* updatedAt

## 11.2 Student Entity

Fields:

* id
* userId
* internshipStatus
* createdAt
* updatedAt

## 11.3 Personal Info

Fields that should be supported:

* prefix/title
* first name
* last name
* gender
* date of birth
* phone number
* email
* address
* parent phone

## 11.4 Education Info

Fields:

* education level
* institution
* faculty
* major/branch
* co-op advisor name
* co-op advisor phone

## 11.5 Internship Details

Fields:

* internship status
* position
* start date
* end date
* department/unit
* supervisor name
* additional details

## 11.6 Files

Fields:

* id
* studentId
* fileName
* filePath or fileUrl
* mimeType (optional)
* size (optional)
* createdAt

## 11.7 Notifications

Fields:

* id
* title
* message
* type
* targetStudentId (optional)
* isRead
* createdAt

---

## 12. Status System

### 12.1 Allowed Statuses

* pending
* in_progress
* completed

### 12.2 Meaning

* pending = นักศึกษาส่งข้อมูลแล้ว รอแอดมินตรวจ
* in_progress = แอดมินตรวจแล้วและกำลังอยู่ในช่วงฝึกงาน
* completed = ฝึกเสร็จแล้ว ข้อมูลล็อก

### 12.3 Status Change Rules

* Admin only can change status
* Student cannot directly change status
* Student edit allowed only when:

  * pending
  * in_progress
* If completed:

  * student cannot edit
  * admin still can edit if needed

---

## 13. Notification Rules

### 13.1 Who Receives Notifications

* Admin only

### 13.2 Notification Triggers

Must have:

* student submits form
* student edits data while status = in_progress

Recommended:

* store notification history in database

### 13.3 Notification Behavior

* show unread count
* display latest notifications first
* clicking notification should help admin go to relevant student detail or review area

### 13.4 Super Admin

* no notifications

---

## 14. UI/UX Requirements

## 14.1 Design Principles

* modern
* clean
* minimal
* user-friendly
* readable for Thai and English content
* low cognitive load

## 14.2 Theme by Role

* Admin / Super Admin: `#aa74ab`
* Student: `#f26e2c`

## 14.3 General Styling

* light background
* clean cards
* clear visual hierarchy
* soft shadows
* rounded corners
* role-based prominent primary buttons

## 14.4 Typography

Recommended sans-serif fonts:

* Prompt
* Kanit
* Sarabun
* or equivalent clean sans-serif

## 14.5 Responsive Behavior

* mobile-first compatible
* navbar collapses on small screens
* tables should remain usable on tablet/mobile
* long forms should stack vertically on small screens

## 14.6 Form UX

* sections clearly separated
* validation messages near fields
* upload area with obvious affordance
* read-only state clearly visible when form is locked

---

## 15. Validation Requirements

### 15.1 Authentication Validation

* email must exist in system
* password must match stored credential

### 15.2 Form Validation

* required fields cannot be empty
* email format must be valid
* date ranges should be logical
* file count limit enforced
* file size/type restrictions enforced

### 15.3 Access Validation

* role-based access must be enforced on server side
* UI hiding alone is not enough

---

## 16. File Upload Requirements

### For MVP

* file upload supported in student form
* file references stored in database
* actual files may initially be stored in local storage during development

### Constraints

* max 5 files
* max 5 MB per file
* allowed types:

  * PDF
  * PNG
  * JPG / JPEG

### Future Recommendation

* move to object storage such as MinIO or S3 for production

---

## 17. Technical Requirements

### Stack

* Next.js 16 App Router
* TypeScript
* Prisma 7
* PostgreSQL
* Docker / Docker Compose
* Tailwind CSS
* existing project component system preferred

### Constraints

* avoid unnecessary new dependencies
* prefer built-in Next.js and existing repo utilities
* follow repository instruction files

---

## 18. Security Requirements

* no public signup
* role checks must be enforced server-side
* only authorized users can access their routes
* student cannot view or modify another student’s data
* admin cannot manage admin accounts
* super_admin cannot manage student data
* passwords must be stored securely, never plain text
* file uploads must be validated

---

## 19. Success Metrics

### MVP Success Indicators

* users can only login if pre-created
* super_admin can manage admin accounts
* admin can manage student accounts
* student can fill and submit form
* admin can change status
* admin receives notifications on key actions
* completed students cannot edit their form
* system works on desktop and mobile

### UX Success Indicators

* users can reach primary task in minimal steps
* forms are understandable without training
* admin can identify records needing attention quickly

---

## 20. Future Enhancements

Potential future features:

* full change password flow
* email notifications
* audit logs
* advanced filters and search
* approval comments / needs_revision status
* file storage migration to MinIO/S3
* real CMU Entra ID integration
* export/reporting

---

## 21. Release Scope Recommendation

### Phase 1

* authentication by existing email/password
* super_admin admin CRUD
* admin student CRUD
* student overview
* student form
* status system
* dashboard basic
* notifications basic

### Phase 2

* stronger upload handling
* better dashboard analytics
* improved search/filter
* better review workflow

### Phase 3

* Entra integration
* email notifications
* audit log
* storage improvements

---

## 22. Definition of Done

ระบบจะถือว่า MVP เสร็จเมื่อ:

* มี super_admin seed เริ่มต้นได้
* super_admin สร้าง admin ได้
* admin สร้าง student ได้
* ผู้ใช้ login ได้เฉพาะ email ที่มีในระบบ
* admin เห็น dashboard และ student list
* student กรอกฟอร์มและ submit ได้
* admin เปลี่ยน status ได้
* notification ทำงานตาม trigger หลัก
* completed student แก้ไขข้อมูลไม่ได้
* role restriction ถูก enforce ทั้ง UI และ backend
* responsive ใช้งานได้จริง

---

## 23. Product Principles

1. Student owns data entry
2. Admin owns validation and status control
3. Super Admin owns admin access control
4. Visibility must match responsibility
5. UI should reduce confusion, not add it

---

## 24. Final Product Statement

Internship Management System เวอร์ชันนี้เป็นระบบจัดการฝึกงานที่เน้นความชัดเจนของบทบาทผู้ใช้ ความง่ายในการกรอกและตรวจสอบข้อมูล และ workflow สถานะที่ควบคุมได้จริง เหมาะสำหรับใช้งานเป็นระบบภายในที่ค่อย ๆ พัฒนาต่อไปสู่ production system เต็มรูปแบบ
