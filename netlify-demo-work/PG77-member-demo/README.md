# Frontend Member Demo / PG77-member-demo

โปรเจกต์นี้เป็น Static Frontend Demo ของหน้า Member Home โทน PG77 โดยใช้ชื่อระบบ `PG77` และใช้ `Vanilla HTML/CSS/JS` เท่านั้น

## Local API integration v1.0.3

- Frontend ต่อเฉพาะ Local API: `http://localhost:4000/api`
- ใช้ backend `PG77-real-core` ที่เปิดด้วย `npm run dev`
- Token สมาชิกเก็บใน `localStorage` key `pg77_member_token`
- ไม่เก็บ password ใน browser storage
- ไม่มี connection string ฐานข้อมูลใน frontend
- ไม่ต่อ production API
- ไม่ยิง payment/provider/bank API จริง
- ถ้า API ใช้งานไม่ได้ หน้าเว็บยังเปิดได้และแสดง error/empty state แทน

Flow ที่เชื่อม API แล้ว:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/wallet`
- `GET /api/bank-accounts`
- `GET /api/promotions`
- `POST /api/deposits`
- `GET /api/deposits`
- `POST /api/withdrawals`
- `GET /api/withdrawals`

Flow ที่ยังเป็น mock:

- เกมและ provider launch จริง
- Payment gateway จริง
- Bank transfer จริง
- Slip OCR จริง
- TrueMoney Wallet / Gift จริง
- กงล้อ กล่องสุ่ม Ranking ร้านค้า รับยอดเสีย คอมมิชชั่น และกิจกรรมอื่น

## วิธีทดสอบกับ PG77-real-core

1. เปิด backend `PG77-real-core`
2. รัน `npm run dev`
3. ตรวจว่า `http://localhost:4000/api/health` ใช้งานได้
4. เปิดไฟล์ `index.html` ของ `PG77-member-demo` ใน browser
5. ดูสถานะ `Backend Online` บนหน้าเว็บ
6. ทดสอบสมัครสมาชิก แล้วตรวจว่าเข้าสู่ระบบและโหลด profile/wallet ได้
7. ทดสอบ login ด้วยบัญชีที่สมัครไว้
8. เปิด profile เพื่อตรวจ bank accounts
9. เปิดโปรโมชั่นเพื่อตรวจ promotions หรือ empty state
10. ทดสอบฝากเงินช่องทางฝากออโต้/ฝากทศนิยม/QR Pay/แนบสลิป แล้วดูประวัติฝาก
11. ทดสอบถอนเงิน โดยต้องมี bank account ที่ `status=approved`
12. เปิดประวัติการใช้งานเพื่อตรวจรายการฝากและถอน
13. หลัง Backoffice approve รายการฝาก ให้กลับมาที่ member แล้วกด `Refresh Wallet`
14. ใน modal โปรไฟล์ กด `Refresh Profile / Bank Accounts` เพื่อตรวจสถานะ `pending/approved/rejected`
15. ใน modal ประวัติ กด `Refresh History` เพื่อโหลดรายการฝาก/ถอนล่าสุด

## วิธีเทสต์เร็ว Member -> Backoffice -> Backend

1. เปิด backend `PG77-real-core` และรัน `npm run dev`
2. เปิด member demo จาก `index.html` หรือ localhost static server
3. สมัครสมาชิกหรือ login ผ่าน Local API
4. เปิดกระเป๋าแล้วกด `Refresh Wallet`
5. เปิดโปรไฟล์แล้วกด `Refresh Profile / Bank Accounts`
6. เปิดประวัติแล้วกด `Refresh History`
7. สร้างรายการฝากหรือถอน แล้วไป approve ใน Backoffice
8. กลับมาที่ member แล้วกด `Refresh Wallet/Profile/History` ตาม flow ที่ต้องตรวจ

หมายเหตุ: integration นี้เป็น local API เท่านั้น ไม่ใช่ production และไม่ทำธุรกรรมเงินจริง

## Demo Login

- URL: https://peppy-torrone-456285.netlify.app/
- เบอร์โทรศัพท์: 0800000000
- รหัสผ่าน: 123456
- Email สำรอง: demo@pg77.local
- ใช้สำหรับทดสอบ static demo เท่านั้น
- ต่อ Local API สำหรับ flow สมาชิกพื้นฐานแล้ว
- ยังไม่ต่อ Database
- ห้ามใช้ข้อมูลจริง

## Static mock login v1.0.2

- Demo login shortcut ยังใช้ mock state สำหรับทดสอบ UI เท่านั้น
- Login/Register หลักเรียก Local API ของ `PG77-real-core`
- เก็บ token จริงเฉพาะ key `pg77_member_token`
- ไม่เก็บ password หรือ credential ใน `localStorage`
- แถบ `Backend Offline` แสดงเมื่อ local API ใช้งานไม่ได้ แต่ไม่ทำให้หน้าเว็บแตก
- แก้ demo re-render loop แล้ว โดยให้ timer, API status และ toast update เฉพาะส่วนย่อย ไม่สร้าง Login/Register modal ใหม่ระหว่างพิมพ์
- ต่อ Local API เฉพาะ flow สมาชิกพื้นฐาน
- ยังไม่ต่อ Database

API ที่เคยเตรียมไว้สำหรับ Backend dev:

- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/wallet`
- `GET /api/points`
- `GET /api/bank-accounts`
- `GET /api/promotions`
- `POST /api/promotions/:id/claim`
- `GET /api/game/providers`
- `GET /api/game/providers/:provider/games`
- `POST /api/game/launch/mock`
- `POST /api/deposits`
- `GET /api/deposits`
- `POST /api/withdrawals`
- `GET /api/withdrawals`
- `GET /api/wallet/ledger`

สิ่งที่ยังเป็น mock:

- Payment จริง
- Bank จริง
- Slip OCR จริง
- Game Provider จริง
- SMS จริง

## สถานะเดโม่

- เป็น Static Frontend Demo ที่ใช้ mock data ในฝั่งหน้าเว็บ
- ใช้ชื่อระบบ PG77
- ต่อ Local API เฉพาะ flow สมาชิกพื้นฐาน
- ไม่มี Database
- ไม่มีธุรกรรมเงินจริง
- ไม่มีบัญชีจริง เบอร์จริง หรือรหัสผ่านจริง
- ระบบฝาก-ถอนพื้นฐานสร้างรายการผ่าน Local API และรอ admin approve
- QR PAY / TrueMoney / Slip / Gift / Confirm Deposit เป็น static mock flow เท่านั้น
- Slip / Gift / Confirm Deposit มี result ticket mock ในหน้า frontend
- ใช้สำหรับ demo UI/UX เท่านั้น

## ไฟล์หลัก

- `index.html`
- `style.css`
- `app.js`
- `README.md`

## Assets UI

- โลโก้หลักอยู่ที่ `assets/logo/demo-logo.png`
- ฟอนต์หลักใช้ `Kanit` ผ่าน Google Fonts และ fallback เป็น system font
- โลโก้ใน UI ใช้ CSS mock mark และข้อความ `PG77`

## วิธีเปิดไฟล์

1. เปิดโฟลเดอร์โปรเจกต์ปัจจุบัน
2. ดับเบิลคลิก `index.html`
3. หรือเปิด `index.html` ด้วย browser โดยตรง

## Home Redesign Prototype v2

- เปิด `index.html` แบบไม่มี query string ระบบจะแสดง Home v2 เป็นหน้า default
- เปิด `index.html?home=v2` ระบบยังแสดง Home v2 เหมือนเดิม
- เปิดหน้าเดิมได้ด้วย `index.html?home=legacy`
- Polish รอบใหม่ปรับโทน Dark Navy + Lime + Gold, header, hero, wallet mini, quick actions, game cards, right panel และ bottom nav ของ Home v2
- Home v2 แยก mobile / tablet / PC layout โดยใช้ mobile app style บนจอเล็ก และ web lobby พร้อม right panel บน PC
- ธีม Home v2 เป็น Dark Navy + Lime + Gold และ scope ด้วย class `home-v2`
- Home v2 rebrand เป็น PG77
- Hero ของ Home v2 เป็น 3-slide mock slider พร้อมปุ่ม prev/next, dots, touch swipe และ auto slide
- Announcement ของ Home v2 เป็น marquee และกดเปิด notification detail ได้
- Quick action icons เปลี่ยนเป็น SVG mock ชุดเดียวกัน
- Home v2 ยังใช้ mock สำหรับเกม/provider/payment จริง แต่ header/member wallet ใช้ Local API เมื่อ login
- Provider modal v1.1.1 ปรับให้เบาลง ใช้ provider card แบบตัวอักษร ไม่มีรูป/emoji mock และยังเป็น static mock ทั้งหมด


## UI Polish v3

- แก้ header Home v2 จาก 4 columns ให้รองรับ 5 ส่วนจริง: menu, brand, API status, search, member actions
- ปรับโทนสีเป็น Premium Dark Navy + Teal + Gold + Lime
- ปรับ hero banner, side panel, game card, provider card, wallet card, quick actions และ bottom nav ให้โค้ง/หายใจมากขึ้น
- ซ่อน search/API pill บนมือถือเพื่อลดการเบียดหัวเว็บ
- อัปเดต cache version ใน `index.html` เป็น `1.0.3-ui-polish`

## Deposit Hub / Withdraw Mock v1.1.0

- ปรับเมนูฝาก-ถอนมือถือใหม่เป็น Mobile-first / Banking style
- เพิ่ม Deposit Hub สำหรับแท็บฝากเงิน
- เพิ่มการ์ดช่องทางฝากแบบเลื่อนแนวนอน
- เพิ่มการ์ดบัญชี / Payment แบบเลื่อนแนวนอน
- เพิ่มฟอร์มฝากเงินที่เปลี่ยนตามช่องทางฝาก
- เพิ่มหน้า Withdraw mock พร้อมบัญชีถอน เงื่อนไขถอน และฟอร์มถอน
- ฝาก/ถอนพื้นฐานต่อ Local API แล้ว แต่ยังไม่ทำธุรกรรมเงินจริง
- ยังไม่ทำธุรกรรมเงินจริง

## Provider / Dropdown Polish v1.1.1

- ปรับ provider modal ให้เบาลง ลด shadow/animation และตัด mock thumbnail ออก
- เอารูป/emoji mock provider ออกจาก modal เลือกค่ายเกม
- แก้ dropdown/select contrast ให้ option อ่านได้บน native dropdown
- แก้ mobile deposit/withdraw contrast และลด horizontal overflow ใน modal
- ยังเป็น static mock ไม่ต่อ API จริง

## Auth Mobile Focus Fix v1.1.2

- แก้ mobile Login/Register input focus bug
- แก้ checkbox/label interaction
- แก้ auth modal viewport บนมือถือ
- ยังเป็น Static Mock ไม่ต่อ API จริง

## Auth Demo Shortcut v1.1.3

- เพิ่มปุ่มเข้าเดโมสมาชิกเพื่อข้าม mobile keyboard focus issue
- Auth จริงยังไม่ต่อ API
- Login/Register ยังเป็น Static Mock

## Deposit / Brand Fix v1.1.4

- แก้ brand mismatch จากชื่อเดิมให้หน้าใช้งานหลักแสดง PG77 ทั้งหมด
- แก้ deposit method click coverage ด้วยปุ่มจริงและ `data-testid` สำหรับทุกช่องทางฝาก
- แก้ Deposit modal viewport และ action footer ให้ scroll/click ได้ใน modal
- ยังเป็น Static Mock ไม่ต่อ API จริง

## วิธี deploy Netlify

1. เข้า Netlify
2. เลือก `Add new site`
3. เลือก `Deploy manually`
4. ลากทั้งโฟลเดอร์โปรเจกต์หรือไฟล์ทั้งหมดขึ้นไป
5. ไม่ต้องใช้ build command
6. ไม่ต้องติดตั้ง package เพิ่ม

## ขอบเขตของเดโม่

- หน้าแรกก่อน login
- Notification center / ศูนย์ข่าวสาร พร้อมกระดิ่ง unread
- Login modal
- Register modal
- หน้าแรกหลัง login
- Member menu ด้านขวา
- ฝาก - ถอน modal
- Wallet modal
- Settings modal
- เกม หมวดเกม และค้นหาเกม
- เลือกค่ายเกม / Provider พร้อม category tabs, search และ provider cards แบบตัวอักษร
- Responsive desktop และ mobile
- Member drawer ฝั่งขวาหลัง login
- ข้อมูลโปรไฟล์พร้อม bank cards mock
- ประวัติการใช้งานพร้อม tabs รายการเกม/ฝาก/ถอน/โบนัส
- โปรโมชันพร้อม detail modal
- รับยอดเสีย / คอมมิชชั่น
- สร้างรายได้ พร้อมแชร์ลิงก์และเมนูย่อยของรายได้
- รับเครดิตฟรี / รับเพชรฟรี
- กรอกโค้ด
- Slip / Gift / Confirm deposit result mock
- Code redeem result ใน modal
- Free credit / diamond claim state
- Shop receipt mock และ point update แบบ session
- Promotion claim state แบบ session
- กล่องสุ่ม พร้อมหน้าเปิดกล่องและประวัติ
- กงล้อ
- เช็คอิน
- Ranking
- Floating Wallet Button และ Modal กระเป๋าแบบ quick menu
- Floating Settings Button และ Modal ตั้งค่าแบบ mock
- Floating Notification Bell, announcement strip, notification filter และ detail modal
- ปรับ UI theme ใหม่ด้วย CSS variables กลาง
- ปรับ typography, button scale, modal spacing และ responsive ให้สม่ำเสมอขึ้น
- ปรับโหมดมือถือแบบ mobile-first สำหรับช่วง 320px - 430px
- ปรับ responsive mode สำหรับ mobile / tablet / PC โดยยังเป็น static mock ทั้งหมด
- Mobile mode ใช้ที่ viewport ไม่เกิน 768px พร้อม drawer/modal ที่ scroll ในจอ
- PC mode ใช้ที่ viewport ตั้งแต่ 1024px พร้อม content max-width, grid หลายคอลัมน์ และซ่อน bottom nav

## พฤติกรรมที่ยังเป็น mock

- การเข้าสู่ระบบ
- การสมัครสมาชิก
- การฝากเงิน
- การถอนเงิน
- การฝากทศนิยม
- QR PAY
- TrueMoney Wallet
- True Wallet Gift
- การอัปโหลดสลิป
- การรับโบนัส / รับเพชร พร้อมสถานะรับแล้วแบบ session
- การตรวจโค้ดพร้อม success/error result ใน modal
- Ticket result ของ Slip / Gift / Confirm Deposit
- Receipt ร้านค้าและแต้มคงเหลือแบบ session
- การรับโปรโมชั่นและ badge กำลังใช้งานแบบ session
- การเปิดกล่องสุ่ม
- การหมุนกงล้อ
- การเช็คอิน
- การอัพเลเวล Ranking
- ตัวจับโบนัส
- ร้านค้า
- เสียงเพลง / ระดับเสียง / เลือกเพลง / แชทเด้ง เป็น mock frontend state เท่านั้น
- ไม่มีการเล่นเสียงจริงและไม่มี API จริงสำหรับ modal ตั้งค่า
- การเปิด LINE และ Telegram
- การเปิดเกม
- Provider และรายการเกมใน modal เป็น static mock แบบตัวอักษร ไม่มี asset จริงจากค่ายเกม
- ยังไม่ต่อ API เกมจริงหรือ provider จริง
- ข้อมูลเครดิต แต้ม โปรโมชัน และประวัติทั้งหมด
- เมนูกิจกรรมที่ยังไม่ลงรายละเอียด

## หมายเหตุทดสอบข่าวสาร

มีตัวช่วยสำหรับเปิดศูนย์ข่าวสารเพื่อทดสอบซ้ำได้:

```js
window.resetDemoNewsPreference()
```

## วิธีเช็ค UI หลังแก้

1. เปิด `index.html` บน desktop และ mobile width
2. ตรวจ header, announcement bar, floating buttons, และ bottom nav ว่าไม่ทับกัน
3. ตรวจ modal หลักทั้งหมดว่า scroll ในตัวเองและไม่ล้นจอ
4. ตรวจโลโก้ใน header, auth modal, และ game error page
5. ตรวจฟอนต์ไทยว่าแสดงผลอ่านชัดและไม่แตก
6. ตรวจ breakpoint 320px / 360px / 375px / 390px / 414px / 430px ว่า header, card, modal, tab และ bottom nav ไม่เบียดกัน
7. Viewport แนะนำสำหรับรอบ responsive polish: 390x844, 414x896, 768x1024, 1366x768, 1920x1080

## หมายเหตุ responsive polish

- ยังไม่มีการต่อ API จริง
- ยังไม่มี payment จริง
- ยังไม่มี provider หรือเกมจริง
- ทุกยอด เครดิต แต้ม ประวัติ ticket receipt และ modal result เป็น static mock data
