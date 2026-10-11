# FIX-LOOP (ฟิกซ์-ลูป) — ระบบรายงานและติดตามปัญหาโครงสร้างเพื่อชุมชน

> **Open Civic Tech Infrastructure Platform**  
> Built with **Next.js (App Router)**, **TypeScript**, **Civic Brutalism Design System**, and **Supabase PostgreSQL**.

---

## 1. วัตถุประสงค์โครงการ (Product Objective)

Fix-Loop เป็นแพลตฟอร์มรับเรื่องร้องเรียนและติดตามปัญหาโครงสร้างพื้นฐานระดับชุมชน (เช่น ทางเท้าพัง, ไฟฟ้าดับ, ขยะล้น, ท่อระบายน้ำอุดตัน):
- **ประชาชน:** แจ้งปัญหาได้ทันทีโดยไม่ต้องสร้างบัญชีหรือลงชื่อเข้าใช้ (No Login Required) และได้รับรหัสลับเฉพาะเรื่อง (Unguessable Tracking Token) พร้อม **QR Code** สำหรับติดตามความคืบหน้า
- **เจ้าหน้าที่เขต/ชุมชน:** จัดการเรื่องร้องเรียนผ่านแดชบอร์ดเฉพาะเขตที่ตนเองได้รับมอบหมาย พร้อมระบบ **Community Isolation** ป้องกันการเข้าถึงหรือแก้ไขข้ามเขต
- **โหมดผู้สูงอายุ (Senior Mode):** เพิ่มขนาดตัวอักษร, ปุ่มกดขนาดใหญ่พิเศษ (>= 56px), คอนทราสต์สูง, และข้อความเข้าใจง่ายสำหรับคุณตาคุณยาย

---

## 2. สถานะรายงานทางการทั้ง 5 ขั้นตอน (Canonical Report Lifecycle)

ระบบใช้สถานะภาษาไทยมาตรฐาน 5 สถานะอย่างเคร่งครัดตามข้อกำหนด ไม่มีการแต่งเติมหรือสลับลำดับ:

1. **`รอตรวจสอบ`** (Pending Review) — ประชาชนส่งเรื่องเข้าระบบ เจ้าหน้าที่กำลังตรวจเช็กข้อมูล
2. **`รับเรื่องแล้ว`** (Acknowledged) — เจ้าหน้าที่ฝ่ายปกครองรับเรื่องและประสานงานฝ่ายที่เกี่ยวข้อง
3. **`กำลังดำเนินการ`** (In Progress) — ทีมช่าง/เจ้าหน้าที่ลงพื้นที่กำลังแก้ไขปัญหา
4. **`รอหน่วยงานภายนอก`** (Waiting for External Agency) — ส่งเรื่องประสานงานต่อการไฟฟ้านครหลวง, การประปา ฯลฯ
5. **`แก้ไขแล้ว`** (Resolved) — งานซ่อมแซมเสร็จสิ้น ตรวจสอบความปลอดภัยเรียบร้อยแล้ว

### กฎการบันทึกประวัติการเปลี่ยนแปลง (Audit Trail Rules):
- บันทึกความคืบหน้า (History Note) จำกัดความยาวไม่เกิน **200 ตัวอักษร**
- แสดงผลเรียงลำดับ **ล่าสุดขึ้นก่อน (Newest First)**
- บันทึกการเปลี่ยนสถานะและประวัติแบบ **Atomic Transaction** พร้อมกันเสมอ
- หากสถานะไม่มีการเปลี่ยนแปลงและไม่มีการระบุข้อความ จะไม่สร้างประวัติซ้ำซ้อน

---

## 3. สถาปัตยกรรมความปลอดภัยและฐานข้อมูล (Security Architecture)

- **PostgreSQL Row Level Security (RLS):** เปิดใช้งานบนทุกตาราง (`communities`, `reports`, `report_status_history`, `admin_community_assignments`)
- **Least-Privilege Public Tracking:** หน้าติดตามสาธารณะเข้าถึงข้อมูลผ่าน RPC Function `get_public_report_by_token` ซึ่งกรองข้อมูลส่วนตัว (เช่น เบอร์โทรผู้แจ้ง, User ID เจ้าหน้าที่, ข้อมูลภายใน) ออกโดยสิ้นเชิง
- **High-Entropy Tracking Tokens:** ใช้โทเคนสุ่มทางคริปโตกราฟี 48 ตัวอักษร (`tk_...`) ป้องกันการสุ่มหรือเดารหัส
- **Community Scoping:** เจ้าหน้าที่เขต A ไม่สามารถดูหรืออัปเดตรายงานของเขต B ได้ทั้งจาก UI, Server Action, หรือ Direct Database Queries
- **Safe Environment Variables:** แยกกุญแจลับ `SUPABASE_SERVICE_ROLE_KEY` ไว้เฉพาะฝั่ง Server เท่านั้น ห้ามส่งออก Client Bundle

---

## 4. โครงสร้างโปรเจกต์ (Project Structure)

```
fixloop/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # หน้าหลัก (Landing / Explainer) ตาม Stitch fixloop_1
│   │   ├── layout.tsx                   # Root Layout พร้อม Web Fonts & CSS
│   │   ├── globals.css                  # Civic Brutalism & Senior Mode Design System
│   │   ├── report/
│   │   │   ├── new/page.tsx             # ฟอร์มแจ้งเรื่อง 3 ขั้นตอน ตาม Stitch fixloop_7
│   │   │   └── success/page.tsx         # หน้าแจ้งสำเร็จพร้อม QR Code ตาม Stitch fixloop_3
│   │   ├── track/[token]/page.tsx       # หน้าติดตามสถานะและไทม์ไลน์ ตาม Stitch fixloop_4
│   │   └── admin/
│   │       ├── login/page.tsx           # หน้าเข้าสู่ระบบเจ้าหน้าที่
│   │       └── dashboard/page.tsx       # แดชบอร์ดเจ้าหน้าที่และตารางเคส ตาม Stitch fixloop_5
│   ├── components/
│   │   ├── Header.tsx                   # แถบนำทางพร้อมปุ่มสลับโหมดผู้สูงอายุ
│   │   ├── Footer.tsx                   # ข้อมูลติดต่อฉุกเฉินและหน่วยงาน
│   │   ├── StatusBadge.tsx              # ป้ายสถานะ 5 สีมาตรฐาน
│   │   └── QRCodeDisplay.tsx            # การสร้าง QR Code อัตโนมัติ
│   ├── lib/
│   │   ├── actions.ts                   # Next.js Server Actions (Validation & Mutations)
│   │   ├── constants.ts                 # สี ป้าย และข้อมูลประกอบสถานะ
│   │   ├── store.ts                     # ระบบจัดเก็บและจัดการข้อมูลพร้อม Community Isolation
│   │   └── supabase/                    # การเชื่อมต่อ Supabase Client & Server
│   └── types/
│       └── index.ts                     # Types & Domain Models
├── supabase/
│   ├── schema.sql                       # โครงสร้างฐานข้อมูล, RLS Policies, และ Stored Procedures
│   └── migrations/                      # ไฟล์ Migration สำหรับ Supabase CLI
├── test/
│   └── fixloop.test.mjs                 # ชุดทดสอบอัตโนมัติ 8 ข้อ (100% Pass)
├── .env.example                         # แม่แบบ Environment Variables ปลอดภัย
├── tailwind.config.ts                   # Civic Brutalism Color Palette & Tokens
└── package.json                         # Dependencies และ Scripts
```

---

## 5. บัญชีเจ้าหน้าที่สำหรับทดสอบ (Pre-configured Test Accounts)

| เจ้าหน้าที่ | อีเมล | เขตที่รับผิดชอบ |
|---|---|---|
| นายอดิศร วงศ์ไทย | `admin.prn@fixloop.org` | เขตพระนคร (กรุงเทพฯ) |
| นางสาวสุดารัตน์ พงษ์ศิริ | `admin.ptw@fixloop.org` | เขตปทุมวัน (กรุงเทพฯ) |
| นายกิตติคุณ นรินทร์ | `admin.cjc@fixloop.org` | เขตจตุจักร (กรุงเทพฯ) |
| ผู้ดูแลระบบส่วนกลาง | `superadmin@fixloop.org` | ทุกเขต (พระนคร, ปทุมวัน, จตุจักร, เชียงใหม่) |

---

## 6. คำแนะนำการติดตั้งและรันระบบ (Setup & Execution)

### ติดตั้ง Dependencies
```bash
npm install
```

### เรียกใช้ชุดทดสอบอัตโนมัติ (Automated Tests)
```bash
npm test
```
ทดสอบทั้ง 8 มิติ:
1. การแจ้งเรื่องโดยประชาชนไม่ต้องล็อกอิน
2. หน้าติดตามสาธารณะไม่เปิดเผยข้อมูลส่วนตัว
3. การปฏิเสธโทเคนที่ไม่ถูกต้อง
4. ความถูกต้องของ 5 สถานะภาษาไทย
5. การอัปเดตสถานะแบบ Atomic พร้อมบันทึกประวัติ
6. การไม่สร้างประวัติซ้ำซ้อนเมื่อไม่มีการเปลี่ยนแปลง
7. การแยกสิทธิ์ระหว่างเขต (Community Isolation)
8. การปฏิเสธสถานะที่ไม่ถูกต้องและข้อความเกิน 200 ตัวอักษร

### รันระบบในสภาพแวดล้อม Development
```bash
npm run dev
```
เปิดบราวเซอร์ที่ `http://localhost:3000`

### การเชื่อมต่อกับ Supabase Cloud (Optional)
1. นำไฟล์ `supabase/schema.sql` ไป Execute ใน Supabase SQL Editor
2. คัดลอกค่าจาก `.env.example` ไปใส่ใน `.env.local`
3. กำหนดค่า `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, และ `SUPABASE_SERVICE_ROLE_KEY`
