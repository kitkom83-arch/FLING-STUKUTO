
const storageKey = "demo-home-news-hidden";
const API_BASE_URL = "http://localhost:4000/api";
const AUTH_TOKEN_STORAGE_KEY = "pg77_member_token";
const DEMO_LOGIN_STORAGE_KEY = "pg77DemoLoggedIn";
const LEGACY_AUTH_STORAGE_KEYS = ["pg77_member_user"];
const DEMO_MEMBER_PROFILE = {
  username: "ima00180",
  phone: "0800000000",
  email: "demo@pg77.local",
  ranking: "นางเงือกสาว",
  rank: "นางเงือกสาว",
  points: 47,
  balance: 11.09
};
const DEMO_LOGIN_CREDENTIALS = [
  { login: "0800000000", passcode: "123456" },
  { login: "0999999999", passcode: "123456" },
  { login: "demo@pg77.local", passcode: "123456" }
];

function stripSensitiveData(value) {
  if (Array.isArray(value)) return value.map(stripSensitiveData);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "passwordHash")
      .map(([key, item]) => [key, stripSensitiveData(item)])
  );
}

function getAuthHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(method, path, body, options = {}) {
  const normalizedPath = `/${String(path || "").replace(/^\/+/, "").replace(/^api\/?/, "")}`;
  const headers = {
    Accept: "application/json",
    ...(body == null ? {} : { "Content-Type": "application/json" }),
    ...(options.auth === false ? {} : getAuthHeaders()),
    ...(options.headers || {})
  };
  let response;
  let payload = null;
  try {
    const requestOptions = { method, headers };
    if (body != null) requestOptions.body = JSON.stringify(body);
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, requestOptions);
    const contentType = response.headers.get("content-type") || "";
    payload = contentType.includes("application/json") ? await response.json() : null;
  } catch (error) {
    const networkError = new Error("Backend Offline");
    networkError.code = "BACKEND_OFFLINE";
    networkError.cause = error;
    throw networkError;
  }
  if (!response.ok || (payload && payload.success === false)) {
    const error = new Error((payload && payload.message) || `API error ${response.status}`);
    error.status = response.status;
    error.errors = payload && payload.errors;
    if (options.auth !== false && isAuthExpiredError(error)) {
      handleAuthExpired();
    }
    throw error;
  }
  return payload && Object.prototype.hasOwnProperty.call(payload, "data") ? stripSensitiveData(payload.data) : stripSensitiveData(payload);
}

function apiGet(path) { return apiRequest("GET", path); }
function apiPost(path, body) { return apiRequest("POST", path, body); }

function clearLegacyAuth() {
  LEGACY_AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

function saveAuth(token = "") {
  clearLegacyAuth();
  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    localStorage.removeItem(DEMO_LOGIN_STORAGE_KEY);
  } else {
    localStorage.setItem(DEMO_LOGIN_STORAGE_KEY, "true");
  }
}

function clearAuth() {
  localStorage.removeItem(DEMO_LOGIN_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  clearLegacyAuth();
}

function isLoggedIn() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) || localStorage.getItem(DEMO_LOGIN_STORAGE_KEY) === "true";
}

const mock = {
  user: {
    username: "ima00180",
    ranking: "นางเงือกสาว",
    level: "นางเงือกสาว",
    diamonds: 47,
    creditDisplay: 11.09,
    balance: 11.09,
    commission: 0.09,
    turnoverCurrent: 11.09,
    turnoverTarget: 20,
    promotion: "ไม่รับโปรโมชั่น"
  },
  newsText: "ประกาศ : PG77 รวมสล็อตอันดับหนึ่ง สมาชิกใหม่ฝากง่าย ถอนเร็ว ระบบ static mock ทั้งหมด",
  notifications: [
    { id: "new-member-bonus", title: "โปรสมาชิกใหม่", summary: "สมาชิกใหม่รับโบนัสเพิ่มสำหรับทดลองหน้าโปรโมชันวันนี้", date: "07/05/2026", tag: "โปรโมชั่น", type: "promotion", unread: true, broadcast: true, cover: "NEW MEMBER", body: ["สมัครสมาชิกใหม่วันนี้ รับโบนัสต้อนรับแบบ mock เพื่อทดสอบหน้าโปรโมชันและการแจ้งเตือน", "รายการนี้ไม่มีการเชื่อมต่อ payment หรือ API จริง และใช้สำหรับเดโม่ static เท่านั้น"], cta: "ไปยังโปรโมชั่น" },
    { id: "weekly-lossback", title: "คืนยอดเสียประจำสัปดาห์", summary: "คืนยอดเสียทุกวันศุกร์สำหรับสมาชิกที่มีสิทธิ์ตามเงื่อนไข mock", date: "06/05/2026", tag: "VIP", type: "promotion", unread: true, broadcast: true, cover: "LOSSBACK", body: ["ระบบคืนยอดเสียรายสัปดาห์จะแสดงตัวอย่างสิทธิ์ในหน้าเดโม่", "ยอดและสถานะทั้งหมดเป็น mock data เพื่อทดสอบ UI เท่านั้น"], cta: "ดูต่อ" },
    { id: "maintenance", title: "แจ้งปิดปรับปรุงระบบ", summary: "ปิดปรับปรุงระบบคืนนี้ 02:00-03:00 เพื่อทดสอบประกาศสำคัญ", date: "07/05/2026", tag: "ระบบ", type: "system", unread: true, broadcast: true, cover: "SYSTEM", body: ["ระบบเดโม่จะแสดงประกาศปิดปรับปรุงเป็นตัวอย่าง โดยไม่มี downtime จริง", "ผู้ใช้ยังสามารถกดดู flow mock เดิมได้ตามปกติ"], cta: "ดูต่อ" },
    { id: "friend-campaign", title: "แคมเปญชวนเพื่อน", summary: "แชร์ลิงก์แนะนำเพื่อนและดูรายได้เครือข่ายในโหมด mock", date: "05/05/2026", tag: "กิจกรรม", type: "campaign", unread: false, broadcast: false, cover: "FRIEND", body: ["ชวนเพื่อนผ่านลิงก์แนะนำแบบ mock และตรวจสอบหน้าสร้างรายได้", "ไม่มีการสร้างบัญชีหรือบันทึกข้อมูลจริง"], cta: "ดูต่อ" },
    { id: "free-code", title: "รับโค้ดเครดิตฟรี", summary: "กรอก CODE100 หรือ DIAMOND20 เพื่อทดสอบผลลัพธ์เครดิตฟรี/เพชร", date: "04/05/2026", tag: "โปรโมชั่น", type: "promotion", unread: false, broadcast: false, cover: "FREE CODE", body: ["ใช้โค้ดตัวอย่างในหน้าเดโม่เพื่อทดสอบ coupon result", "รางวัลและประวัติทั้งหมดเป็น mock data"], cta: "ไปยังโปรโมชั่น" },
    { id: "shop-wheel", title: "แจ้งกิจกรรมร้านค้า/กงล้อ", summary: "ร้านค้า กล่องสุ่ม กงล้อ และเช็คอินเปิดให้ทดสอบแบบ static mock", date: "03/05/2026", tag: "กิจกรรม", type: "campaign", unread: false, broadcast: false, cover: "WHEEL", body: ["ทดลองเมนูกิจกรรมสมาชิก เช่น ร้านค้า กล่องสุ่ม กงล้อ และเช็คอิน", "ทุก interaction อยู่ในหน้าเดโม่และไม่เชื่อมต่อ provider จริง"], cta: "ดูต่อ" }
  ],
  banners: [
    { title: "เครดิตฟรี 100", text: "สมาชิกใหม่รับโบนัส ฝากง่าย ใช้งานเดโม่ได้ครบทุกเมนู", tag: "PG77 BONUS", bg: "linear-gradient(135deg, #0f1720 0%, #23405a 42%, #d7a12b 100%)" },
    { title: "สมาชิกใหม่รับโบนัส", text: "หน้า Home โทนคาสิโนพรีเมียม พร้อม modal และ drawer ฝั่งสมาชิก", tag: "NEW MEMBER", bg: "linear-gradient(135deg, #1a1918 0%, #6f131a 38%, #d7a12b 100%)" },
    { title: "สะสมแต้ม", text: "แต้ม เครดิต และระบบสร้างรายได้ทั้งหมดใช้ mock data เท่านั้น", tag: "POINT EVENT", bg: "linear-gradient(135deg, #101419 0%, #22394f 34%, #7fe3ff 100%)" }
  ],
  categories: ["เกมโปรด", "เกมใหม่", "เกมแตก", "สล็อต", "บาคาร่า", "แทงหวย", "กีฬา", "ยิงปลา", "ป๊อกเด้ง"],
  games: [
    { name: "Fortune Sheep", category: "เกมโปรด", provider: "PG", badge: "ยอดนิยม", bg: "linear-gradient(145deg, #18222e, #2f5470)" },
    { name: "Happy Scratch", category: "เกมโปรด", provider: "JILI", badge: "มาแรง", bg: "linear-gradient(145deg, #5b1416, #c98b23)" },
    { name: "BreakBones", category: "เกมโปรด", provider: "PRAGMATIC PLAY", badge: "เกมใหม่", bg: "linear-gradient(145deg, #112338, #4d7ca0)" },
    { name: "Divine Drop", category: "เกมโปรด", provider: "FA CHAI", badge: "แตกง่าย", bg: "linear-gradient(145deg, #2d1b15, #b57422)" },
    { name: "Stormborn", category: "เกมโปรด", provider: "RED TIGER", badge: "ฮิต", bg: "linear-gradient(145deg, #1b2230, #6a8ba7)" },
    { name: "Majestic Treasures", category: "เกมโปรด", provider: "PG", badge: "สมบัติ", bg: "linear-gradient(145deg, #463112, #d0a13c)" },
    { name: "Ultimate Striker", category: "เกมโปรด", provider: "JOKER", badge: "สปอร์ต", bg: "linear-gradient(145deg, #103348, #53a7bf)" },
    { name: "Shark Hunter", category: "เกมโปรด", provider: "CQ9", badge: "ยิงปลา", bg: "linear-gradient(145deg, #0c2f46, #4388a6)" },
    { name: "Raging Wings", category: "เกมใหม่", provider: "PG", badge: "มาใหม่", bg: "linear-gradient(145deg, #20191c, #7e2026)" },
    { name: "Coins Of Alkemor", category: "เกมแตก", provider: "PLAYSTAR", badge: "แตกบ่อย", bg: "linear-gradient(145deg, #3d2c17, #d1a23e)" },
    { name: "Money Coming", category: "สล็อต", provider: "JILI", badge: "สล็อตฮิต", bg: "linear-gradient(145deg, #23211d, #ba8f29)" },
    { name: "Zombie Outbreak", category: "สล็อต", provider: "HACKSAW", badge: "แอ็กชัน", bg: "linear-gradient(145deg, #1a1f25, #6f2027)" },
    { name: "Dragon Pit Live", category: "บาคาร่า", provider: "PRAGMATIC PLAY", badge: "ไลฟ์", bg: "linear-gradient(145deg, #141820, #41586f)" },
    { name: "Lucky Draw 9", category: "แทงหวย", provider: "VPLUS", badge: "รายวัน", bg: "linear-gradient(145deg, #401d12, #c68f2d)" },
    { name: "Goal Arena", category: "กีฬา", provider: "NEXTSPIN", badge: "บอลสด", bg: "linear-gradient(145deg, #163628, #55916e)" },
    { name: "Ocean Shooter", category: "ยิงปลา", provider: "CQ9", badge: "ปลดล็อก", bg: "linear-gradient(145deg, #0d2e40, #4e8fb3)" },
    { name: "Royal Pok Deng", category: "ป๊อกเด้ง", provider: "JOKER", badge: "โต๊ะฮิต", bg: "linear-gradient(145deg, #402116, #c08a2a)" }
  ],
  depositWithdrawData: {
    balance: 11.09,
    withdrawMin: 20,
    bank: "BIO",
    promotions: ["ไม่รับโปรโมชั่น", "สมาชิกใหม่", "ฝากครั้งแรกของวัน", "1 รับ 50"],
    banks: ["BIO 2398-2612-12", "นาย สุศักดิ์ บุตรพรหม 4161-8424-54", "ธุรดี ศรีจันทร์ 0955-0959-48"],
    depositTargets: ["KBANK / test test / 123-xxx-789", "SCB / Demo Account / 999-xxx-110", "QR Payment / BIO / QR-001"],
    paymentOptions: ["QR Payment", "Payment Mock"],
    quickAmounts: ["100", "200", "300", "400", "500", "2000"],
    qrQuickAmounts: ["100", "200", "300", "400", "500"],
    walletAccount: { phone: "080-xxx-9999", name: "PG77 Wallet Mock", min: 10, max: 5000 },
    depositMethods: [
      { id: "auto", label: "ฝากเงินออโต้", icon: "🏦", badge: "ยอดนิยม", text: "ฝากไวผ่านบัญชีธนาคาร", status: "เปิดใช้งาน", accounts: ["kbank", "scb"] },
      { id: "decimal", label: "ฝากทศนิยม", icon: "💯", badge: "แม่นยำ", text: "ใช้ยอดทศนิยมตรวจฝาก", status: "เปิดใช้งาน", accounts: ["kbank", "scb"] },
      { id: "qr-pay", label: "QR PAY", icon: "▣", badge: "ฝากเร็ว 1 วิ", text: "สแกน QR แล้วรอเครดิต", status: "Mock", accounts: ["qr"] },
      { id: "truemoney-wallet", label: "TrueMoney Wallet", icon: "◉", badge: "Wallet", text: "ฝากผ่านวอลเล็ต", status: "Mock", accounts: [] },
      { id: "slip", label: "ฝากแนบสลิป", icon: "🧾", badge: "Manual", text: "ธนาคารมีปัญหาใช้ช่องทางนี้", status: "เปิดใช้งาน", accounts: ["kbank", "scb"] },
      { id: "true-wallet-gift", label: "True Wallet Gift", icon: "🎁", badge: "ซองของขวัญ", text: "วางลิงก์ซองของขวัญ", status: "Mock", accounts: [] },
      { id: "confirm-deposit", label: "ยืนยันยอดฝาก", icon: "✓", badge: "ตรวจสอบ", text: "แจ้งยอดฝากไม่เข้า", status: "เปิดใช้งาน", accounts: ["kbank", "scb"] }
    ],
    depositAccounts: [
      { id: "kbank", bank: "KBANK", owner: "test test", number: "1231231231", masked: "123-xxx-789", badge: "แนะนำ", methods: ["auto", "decimal", "slip", "confirm-deposit"] },
      { id: "scb", bank: "SCB", owner: "Demo Account", number: "9992221110", masked: "999-xxx-110", badge: "พร้อมใช้", methods: ["auto", "decimal", "slip", "confirm-deposit"] },
      { id: "truemoney", bank: "TrueMoney", owner: "Wallet Demo", number: "080xxx7950", masked: "080xxx7950", badge: "Wallet", methods: [] },
      { id: "qr", bank: "QR Payment", owner: "BIO", number: "QR-001", masked: "QR-001", badge: "QR PAY", methods: ["qr-pay"] }
    ],
    withdrawAccounts: [
      { id: "bio", bank: "BIO", owner: "BIO", masked: "2398-xxx-12", badge: "บัญชีหลัก" },
      { id: "kbank-withdraw", bank: "KBANK", owner: "test test", masked: "123-xxx-789", badge: "พร้อมใช้" },
      { id: "scb-withdraw", bank: "SCB", owner: "Demo Account", masked: "999-xxx-110", badge: "พร้อมใช้" }
    ],
    qrHistory: [],
    methods: [],
    histories: []
  },
  profileAccounts: [
    { bank: "BBL", number: "447-0-1122-0", owner: "PG77 MEMBER", status: "บัญชีหลัก" },
    { bank: "SCB", number: "889-2-7755-1", owner: "PG77 MEMBER", status: "รออนุมัติ" },
    { bank: "TRUEWALLET", number: "091-111-2299", owner: "PG77 MEMBER", status: "บัญชีหลัก" }
  ],
  history: {
    games: [
      { name: "Shark Hunter", type: "SLOT", playedAt: "30/04/2026 10:25" },
      { name: "Fortune Sheep", type: "SLOT", playedAt: "29/04/2026 21:40" }
    ],
    deposits: [
      { datetime: "07/05/2026 09:30", channel: "ฝากเงินออโต้", amount: 100, status: "สำเร็จ" },
      { datetime: "30/04/2026 10:28", channel: "QR PAY", amount: 300, status: "รอดำเนินการ" }
    ],
    withdraws: [
      { datetime: "07/05/2026 09:35", channel: "ถอนเงินธนาคาร", amount: 20, status: "รอตรวจสอบ" }
    ],
    bonus: [
      { title: "รายการโบนัส", amount: 120, date: "30/04/2026 09:15", status: "success" },
      { title: "รายการโบนัส", amount: 50, date: "29/04/2026 18:20", status: "warning" },
      { title: "รายการโบนัส", amount: 80, date: "28/04/2026 12:45", status: "success" }
    ]
  },
  promotions: [
    { id: "daily-first", title: "ฝากครั้งแรกของวัน", min: "100.00", max: "1,000.00", detail: "รับโบนัสฝากครั้งแรกของวันแบบ mock", image: "PROMO A", badge: "Hot", tone: "gold", bonus: "รับโบนัส 20%", turnover: "ทำเทิร์น 3 เท่า", withdraw: "ถอนได้สูงสุด 1,000.00" },
    { id: "new-member", title: "สมาชิกใหม่", min: "10.00", max: "100.00", detail: "โบนัสต้อนรับสมาชิกใหม่สำหรับหน้าเดโม่", image: "PROMO B", badge: "New", tone: "pink", bonus: "รับโบนัส 100%", turnover: "ทำเทิร์น 5 เท่า", withdraw: "ถอนได้สูงสุด 500.00" },
    { id: "one-get-50", title: "1 รับ 50", min: "39.00", max: "39.99", detail: "ฝากตามเงื่อนไขเพื่อรับเครดิตฟรีแบบ mock", image: "PROMO C", badge: "Limited", tone: "blue", bonus: "รับ 50 เครดิต", turnover: "ทำเทิร์น 2 เท่า", withdraw: "ถอนได้สูงสุด 300.00" }
  ],
  rebates: {
    lossbackItems: [
      { game: "สล็อต", reward: "คืนยอดเสีย 10%" },
      { game: "บาคาร่า", reward: "คืนยอดเสีย 0.5%" },
      { game: "ยิงปลา", reward: "คืนยอดเสีย 0%" }
    ],
    commissionSummary: { total: 0, today: 0, month: 0 },
    commissionGames: [
      { id: "bac", name: "บาคาร่า", detail: "คอมมิชชั่นบาคาร่า mock 0.30%" },
      { id: "slot", name: "สล็อต", detail: "คอมมิชชั่นสล็อต mock 0.10%" },
      { id: "fish", name: "ยิงปลา", detail: "คอมมิชชั่นยิงปลา mock 0.00%" }
    ]
  },
  revenue: {
    link: "https://demo.example/register?ref=ima00180",
    shareOptions: ["SMS", "LINE", "Facebook", "Twitter", "Email"],
    network: { level1: 0, level2: 0 },
    totals: { income: 0, minBank: 100, maxBank: 5000 },
    cards: ["ยอดเล่น", "ยอดเสีย", "ยอดฝาก", "รับเครดิตฟรี", "สมาชิกแนะนำ"]
  },
  walletQuickMenu: {
    balance: 11.09,
    diamond: 47,
    promotionStatus: "ไม่รับโปร",
    turnoverCurrent: 11.09,
    turnoverTarget: 20,
    menuItems: [
      { id: "freeCredit", label: "เครดิตฟรี", icon: "🎁" },
      { id: "promotion", label: "โปรโมชั่น", icon: "🎉" },
      { id: "freeDiamond", label: "รับเพชรฟรี", icon: "💎", badge: "2" },
      { id: "couponCode", label: "กรอกโค้ด", icon: "🎟️" },
      { id: "randomBox", label: "กล่องสุ่ม", icon: "📦" },
      { id: "wheel", label: "กงล้อ", icon: "🎡" },
      { id: "ranking", label: "Ranking", icon: "🧜‍♀️" },
      { id: "income", label: "สร้างรายได้", icon: "💼" },
      { id: "cashback", label: "รับยอดเสีย", icon: "🪙" },
      { id: "checkin", label: "เช็คอิน", icon: "📅" },
      { id: "bonusTracker", label: "ตัวจับโบนัส", icon: "🎯" },
      { id: "shop", label: "ร้านค้า", icon: "🛍️" }
    ]
  },
  shop: {
    pointBalance: 47,
    rewards: [
      { id: "credit-10", title: "เครดิตฟรี 10", points: 30, icon: "🎁", tone: "pink" },
      { id: "credit-100", title: "เครดิตฟรี 100", points: 100, icon: "💎", tone: "blue" },
      { id: "credit-500", title: "เครดิตฟรี 500", points: 500, icon: "🪙", tone: "gold" },
      { id: "coupon-bonus", title: "Coupon Bonus", points: 45, icon: "🎟️", tone: "mint" },
      { id: "mystery-gift", title: "Mystery Gift", points: 250, icon: "✨", tone: "violet" },
      { id: "trophy-reward", title: "Trophy Reward", points: 1000, icon: "🏆", tone: "amber" }
    ],
    histories: [
      { datetime: "28/04/2026 13:49", reward: "10.00 เครดิต", status: "สำเร็จ" },
      { datetime: "28/04/2026 13:48", reward: "500.00 เครดิต", status: "สำเร็จ" },
      { datetime: "18/04/2026 10:46", reward: "500.00 เครดิต", status: "สำเร็จ" }
    ]
  },
  providers: [
    { id: "pg", name: "PG", category: "สล็อต" },
    { id: "jili", name: "JILI", category: "สล็อต" },
    { id: "fa-chai", name: "FA CHAI", category: "สล็อต" },
    { id: "pragmatic-play", name: "PRAGMATIC PLAY", category: "สล็อต" },
    { id: "joker", name: "JOKER", category: "สล็อต" },
    { id: "ygr", name: "YGR", category: "สล็อต" },
    { id: "fastspin", name: "FASTSPIN", category: "สล็อต" },
    { id: "amb-slot", name: "AMB SLOT", category: "สล็อต" },
    { id: "nextspin", name: "NEXTSPIN", category: "สล็อต" },
    { id: "relax", name: "RELAX", category: "สล็อต" },
    { id: "red-tiger", name: "RED TIGER", category: "สล็อต" },
    { id: "blueprint", name: "BLUEPRINT", category: "สล็อต" },
    { id: "hacksaw", name: "HACKSAW", category: "สล็อต" },
    { id: "play-n-go", name: "PLAY'N GO", category: "สล็อต" },
    { id: "cq9", name: "CQ9", category: "สล็อต" },
    { id: "spadegaming", name: "SPADEGAMING", category: "สล็อต" },
    { id: "sexy-baccarat", name: "SEXY BACCARAT", category: "คาสิโน" },
    { id: "sa-gaming", name: "SA GAMING", category: "คาสิโน" },
    { id: "evolution", name: "EVOLUTION", category: "คาสิโน" },
    { id: "pragmatic-live", name: "PRAGMATIC LIVE", category: "คาสิโน" },
    { id: "wm-casino", name: "WM CASINO", category: "คาสิโน" },
    { id: "dream-gaming", name: "DREAM GAMING", category: "คาสิโน" },
    { id: "jili-fishing", name: "JILI FISHING", category: "ยิงปลา" },
    { id: "ka-fishing", name: "KA FISHING", category: "ยิงปลา" },
    { id: "joker-fishing", name: "JOKER FISHING", category: "ยิงปลา" },
    { id: "cq9-fishing", name: "CQ9 FISHING", category: "ยิงปลา" },
    { id: "sbobet", name: "SBOBET", category: "กีฬา" },
    { id: "ibc", name: "IBC", category: "กีฬา" },
    { id: "bti", name: "BTI", category: "กีฬา" },
    { id: "cmd368", name: "CMD368", category: "กีฬา" },
    { id: "aviator", name: "AVIATOR", category: "กราฟ" },
    { id: "spaceman", name: "SPACEMAN", category: "กราฟ" },
    { id: "crash", name: "CRASH", category: "กราฟ" }
  ],
  providerGames: [
    { name: "Fortune Sheep", category: "สล็อต" },
    { name: "Happy Scratch", category: "สล็อต" },
    { name: "BreakBones", category: "สล็อต" },
    { name: "Divine Drop", category: "สล็อต" },
    { name: "Stormborn", category: "สล็อต" },
    { name: "Majestic Treasures", category: "สล็อต" },
    { name: "Ultimate Striker", category: "กีฬา" },
    { name: "Golden Mermaid", category: "ยิงปลา" },
    { name: "Lucky Pharaoh", category: "สล็อต" },
    { name: "Dragon Gems", category: "สล็อต" },
    { name: "Ocean King", category: "ยิงปลา" },
    { name: "Royal Baccarat", category: "คาสิโน" }
  ],
  memberRewards: {
    credits: [
      { title: "รับฟรี! 500.00 เครดิต", expires: "ใช้งานก่อน 01/05/2026" },
      { title: "รับฟรี! 100.00 เครดิต", expires: "ใช้งานก่อน 01/05/2026" }
    ],
    diamonds: [
      { title: "รับเพชรฟรี! 20.00 เพชร", expires: "ใช้งานก่อน 30/11/2026" },
      { title: "รับเพชรฟรี! 5.00 เพชร", expires: "ใช้งานก่อน 30/11/2026" }
    ]
  },
  couponCode: {
    sampleValidCode: "PG77FREE100"
  },
  randomBoxes: {
    pointBalance: 1000,
    boxes: [
      { id: "box-2", title: "กล่องสุ่ม2", points: 952, tone: "gold" },
      { id: "box-1", title: "กล่องสุ่ม", points: 27, tone: "blue" }
    ],
    rewards: ["100.00 เครดิต", "500.00 เครดิต"],
    histories: [
      { datetime: "28/04/2026 13:47", reward: "500.00 เครดิต", type: "เครดิตฟรี", status: "สำเร็จ" },
      { datetime: "28/04/2026 13:47", reward: "100.00 เครดิต", type: "เครดิตฟรี", status: "สำเร็จ" },
      { datetime: "28/04/2026 13:17", reward: "500.00 เครดิต", type: "เครดิตฟรี", status: "สำเร็จ" }
    ]
  },
  wheel: {
    balance: 47,
    costPerSpin: 10,
    credit: 0,
    prizes: ["ได้รับเครดิตฟรี 20.00", "ได้รับเครดิตฟรี 50.00", "ได้รับเพชร 5.00", "ได้รับคูปองโบนัส", "ได้รับฝาหอยเพิ่ม", "ได้รับ Mystery Gift"],
    histories: [
      { datetime: "28/04/2026 13:52", reward: "ได้รับเครดิตฟรี 20.00", status: "สำเร็จ" },
      { datetime: "22/04/2026 09:18", reward: "ได้รับเพชร 5.00", status: "สำเร็จ" },
      { datetime: "18/04/2026 10:44", reward: "ได้รับคูปองโบนัส", status: "สำเร็จ" }
    ]
  },
  checkin: {
    checkedInCount: 1,
    totalDays: 30,
    todayReward: "10 เครดิต",
    legends: [
      "ฝากเงินเพื่อรับรางวัล",
      "ฝากของโบนัส, รับรางวัล",
      "รับรางวัลไปแล้ว",
      "ไม่ผ่านเงื่อนไขรับรางวัลฟรี",
      "ไม่ได้รับรางวัลภายในวันนี้",
      "กิจกรรมยังไม่ถึงวันที่กำหนด"
    ]
  },
  ranking: {
    levels: ["นางเงือกน้อย", "นางเงือกสาว", "นางเงือกราชินี"],
    currentLevel: "นางเงือกสาว",
    nextLevel: "นางเงือกราชินี",
    progress: [
      { label: "ฝากสะสมตลอดชีพ", current: 100, target: 1000 },
      { label: "ยอดเล่นสะสมตลอดชีพ", current: 100, target: 1000 },
      { label: "ฝากสะสม 1 เดือน", current: 0, target: 500 },
      { label: "ยอดเล่นสะสม 1 เดือน", current: 0, target: 500 }
    ]
  },
  settingsState: {
    musicEnabled: true,
    volume: 80,
    musicType: "chill",
    chatPopupEnabled: false
  }
};

const state = {
  loggedIn: isLoggedIn(),
  apiStatus: "checking",
  apiMessage: "กำลังตรวจ Backend...",
  loading: {},
  member: isLoggedIn() ? { ...DEMO_MEMBER_PROFILE } : {},
  walletLedger: [],
  bankAccounts: [],
  promotionsLoaded: false,
  providersLoaded: false,
  gamesByProvider: {},
  playMessage: "",
  playUrl: "",
  drawerOpen: false,
  activeModal: "",
  search: "",
  activeCategory: "เกมโปรด",
  activeBanner: 0,
  quickMenuOpen: false,
  newsOpen: false,
  suppressNews: false,
  notificationFilter: "all",
  selectedNotificationId: "",
  notificationRead: {},
  toasts: [],
  sharePopupOpen: false,
  promotionDetailId: "",
  commissionDetailId: "",
  lastDeposit: null,
  lastDepositTicket: null,
  lastGiftDeposit: null,
  lastWithdraw: null,
  depositHistory: [],
  withdrawHistory: [],
  bonusHistory: [],
  shopHistories: [],
  qrPaymentRef: "",
  depositEntry: "page",
  revenueView: "main",
  revenueMetricType: "deposit",
  selectedPromotionId: "",
  selectedDepositMethod: "auto",
  selectedDepositAccount: "kbank",
  selectedWithdrawAccount: "bio",
  promotionClaimResult: null,
  claimedRewards: { credits: {}, diamonds: {} },
  rewardClaimResult: null,
  couponResult: null,
  giftCheckResult: null,
  shopPointBalance: mock.shop.pointBalance,
  shopReceipt: null,
  modalTabs: { auth: "login", deposit: "deposit", depositView: "main", history: "games", historyDeposit: "bank", historyWithdraw: "bank", rebate: "lossback", revenueMetric: "overview", freebies: "credits", shop: "rewards", provider: "ทั้งหมด" },
  registerStep: 1,
  registerMethod: "",
  registerLineConnected: false,
  registerTelegramConnected: false,
  selectedProviderId: "",
  activeBoxId: "box-2",
  selectedBoxReward: "",
  boxOpening: false,
  boxResult: null,
  couponSubmitted: false,
  wheelSubmitted: false,
  wheelSpinning: false,
  wheelResult: null,
  form: {
    loginPhone: "", loginPassword: "", loginRemember: true, loginReveal: false,
    registerPhone: "", registerEmail: "", registerPassword: "", registerConfirmPassword: "", registerReveal: false, registerBank: "", registerAccount: "", registerName: "", registerSource: "", registerBonus: "รับโบนัส", registerAccepted: false,
    depositPromo: "ไม่รับโปรโมชั่น", promotionSelect: "ไม่รับโปรโมชั่น", depositAmount: "", walletAmount: "", qrPayment: "", qrAccount: "", qrAmount: "", giftCode: "", slipOwnBank: "", slipTargetBank: "", slipAmount: "", slipUploaded: false, confirmOwnBank: "", confirmTargetBank: "", confirmAmount: "", confirmDate: "2026-04-30", withdrawAccount: "BIO", withdrawAmount: "", withdrawNote: "", withdrawDemoPass: false,
    revenueWithdrawAmount: "", couponCode: "", wheelExchangeAmount: "", shopSearch: "", shopHistorySearch: "", shopCreditPoints: "", shopCreditAmount: "", shopCashPoints: "", shopCashAmount: "", providerSearch: "", musicEnabled: mock.settingsState.musicEnabled, volume: mock.settingsState.volume, musicType: mock.settingsState.musicType, chatPopupEnabled: mock.settingsState.chatPopupEnabled
  },
  errors: { login: {}, register: {}, depositAmount: "", walletAmount: "", qr: "", slip: {}, gift: "", confirm: {}, withdraw: "", coupon: "", shopCredit: "", shopCash: "", shopReward: "" }
};

window.resetDemoNewsPreference = () => { state.newsOpen = true; state.activeModal = "notifications"; state.suppressNews = false; render(); };

function readNewsPreference() { return false; }
function saveNewsPreference() { return; }
function text(value) { return String(value == null ? "" : value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function money(value) { const parsed = Number(value); return (Number.isFinite(parsed) ? parsed : 0).toFixed(2); }
function brandLogoHtml(className = "site-logo") { return `<span class="brand-logo ${text(className)}"><span class="brand-logo-fallback">T78</span></span>`; }
function focusedFormControl() {
  const element = document.activeElement;
  return Boolean(element && element.matches && element.matches("input, textarea, select"));
}
function skipNonEssentialAutoRefresh() {
  return focusedFormControl() || Boolean(state.activeModal || document.querySelector(".modal-wrap"));
}
function renderToasts() {
  const stack = document.querySelector("#overlay-root .toast-stack");
  if (!stack) return false;
  stack.innerHTML = state.toasts.map((item) => `<div class="toast">${text(item.message)}</div>`).join("");
  return true;
}
function addToast(message) {
  const id = Date.now() + Math.random();
  state.toasts.push({ id, message: message || "ไม่มีข้อมูล" });
  if (!renderToasts()) render();
  window.setTimeout(() => {
    state.toasts = state.toasts.filter((item) => item.id !== id);
    if (!renderToasts() && !skipNonEssentialAutoRefresh()) render();
  }, 2400);
}
function showToast(message) { addToast(message); }
function apiStatusLabel() {
  if (state.apiStatus === "online") return "Backend Online";
  if (state.apiStatus === "offline") return "Backend Offline";
  return "Backend Checking";
}
function apiStatusPillHtml() {
  return `<span class="api-status-pill ${text(state.apiStatus)}" title="${text(state.apiMessage)}">${text(apiStatusLabel())}</span>`;
}
function updateApiStatusPills() {
  document.querySelectorAll(".api-status-pill").forEach((pill) => {
    pill.className = `api-status-pill ${state.apiStatus}`;
    pill.title = state.apiMessage;
    pill.textContent = apiStatusLabel();
  });
}
function apiErrorMessage(error) {
  if (!error) return "เกิดข้อผิดพลาด";
  if (error.code === "BACKEND_OFFLINE") return "Backend Offline";
  if (String(error.message || "").toLowerCase().includes("authentication required")) return "กรุณาเข้าสู่ระบบใหม่";
  if (error.errors) {
    const first = Array.isArray(error.errors) ? error.errors[0] : Object.values(error.errors).flat().find(Boolean);
    if (first) return typeof first === "string" ? first : "ข้อมูลไม่ถูกต้อง";
  }
  return error.message || "เกิดข้อผิดพลาด";
}
function isAuthExpiredError(error) {
  const message = String(error && error.message || "").toLowerCase();
  return error && (error.status === 401 || error.status === 403 || message.includes("authentication required") || message.includes("unauthorized"));
}
function handleAuthExpired() {
  clearAuth();
  state.loggedIn = false;
  state.member = {};
  state.bankAccounts = [];
  state.walletLedger = [];
  state.depositHistory = [];
  state.withdrawHistory = [];
  state.drawerOpen = false;
  state.activeModal = "";
  addToast("กรุณาเข้าสู่ระบบใหม่");
  render();
}
function extractAuthToken(data = {}) {
  return data.token || data.accessToken || data.access_token || data.jwt || data.authToken || (data.auth && (data.auth.token || data.auth.accessToken)) || "";
}
function extractUserData(data = {}) {
  return data.user || data.member || data.profile || data;
}
function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.items)) return value.items;
  if (value && Array.isArray(value.rows)) return value.rows;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
}
function displayDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (date.getTime() !== date.getTime()) return String(value);
  const pad = (item) => String(item).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function pickAmount(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function normalizeStatus(value) {
  const map = { pending: "รอตรวจสอบ", approved: "สำเร็จ", rejected: "ไม่สำเร็จ", paid: "จ่ายแล้ว", active: "เปิดใช้งาน", claimed: "รับแล้ว" };
  return map[value] || value || "-";
}
function statusPillClass(status) {
  const value = String(status || "").toLowerCase();
  if (["approved", "success", "paid", "completed", "สำเร็จ", "พร้อมใช้", "เปิดใช้งาน"].some((item) => value.includes(item.toLowerCase()))) return "success";
  if (["rejected", "failed", "cancelled", "error", "ไม่สำเร็จ"].some((item) => value.includes(item.toLowerCase()))) return "danger";
  return "warning";
}
function bankStatusLabel(status) {
  const value = String(status || "").toLowerCase();
  if (value === "approved") return "approved";
  if (value === "rejected") return "rejected";
  if (value === "pending") return "pending";
  return status || "-";
}
function promotionLabel(item) {
  if (!item) return "ไม่รับโปรโมชั่น";
  return item.title || item.name || item.code || "โปรโมชั่น";
}
function promotionIdFromSelection() {
  const label = state.form.depositPromo || state.form.promotionSelect || "";
  const promotion = mock.promotions.find((item) => item.id === state.selectedPromotionId || item.title === label);
  return promotion ? promotion.id : "";
}
function syncMemberToMock(data = {}) {
  const user = stripSensitiveData(data.user || data.member || data);
  const wallet = data.wallet || data.walletAccount || {};
  const points = data.points || data.point || {};
  if (user && typeof user === "object") {
    state.member = { ...state.member, ...user };
    mock.user.username = user.username || user.phone || mock.user.username || "สมาชิก";
    mock.user.phone = user.phone || mock.user.phone || "";
    mock.user.ranking = user.rank || user.ranking || mock.user.ranking || "-";
    mock.user.level = user.rank || user.level || mock.user.level || "-";
  }
  const balance = wallet.balance ?? user.walletBalance ?? user.balance ?? mock.user.balance;
  const pointBalance = points.balance ?? wallet.points ?? wallet.pointBalance ?? user.points ?? user.pointBalance ?? mock.user.diamonds;
  mock.user.balance = pickAmount(balance);
  mock.user.creditDisplay = pickAmount(balance);
  mock.walletQuickMenu.balance = pickAmount(balance);
  mock.depositWithdrawData.balance = pickAmount(balance);
  mock.walletQuickMenu.turnoverCurrent = pickAmount(mock.user.turnoverCurrent);
  mock.user.diamonds = pickAmount(pointBalance);
  mock.shop.pointBalance = pickAmount(pointBalance);
  mock.randomBoxes.pointBalance = pickAmount(pointBalance);
  mock.wheel.balance = pickAmount(pointBalance);
  state.shopPointBalance = pickAmount(pointBalance);
}
function normalizeBankAccount(item) {
  return {
    id: item.id || item.user_bank_account_id || item.userBankAccountId || "",
    bank: item.bankCode || item.bank_code || item.bank || "-",
    owner: item.accountName || item.bank_account_name || item.owner || "-",
    number: item.accountNumber || item.bank_account_number || item.number || "-",
    masked: item.accountNumber || item.bank_account_number || item.masked || "-",
    status: item.status || "-",
    rawStatus: item.status || "",
    badge: item.status === "approved" ? "พร้อมใช้" : normalizeStatus(item.status)
  };
}
function syncBankAccounts(data) {
  state.bankAccounts = asArray(data).map(normalizeBankAccount);
  mock.profileAccounts = state.bankAccounts.map((account) => ({ bank: account.bank, owner: account.owner, number: account.number, status: bankStatusLabel(account.rawStatus || account.status), rawStatus: account.rawStatus }));
  const approved = state.bankAccounts.filter((account) => account.rawStatus === "approved");
  mock.depositWithdrawData.withdrawAccounts = approved.map((account) => ({
    id: account.id,
    bank: account.bank,
    owner: account.owner,
    masked: account.masked,
    badge: account.badge
  }));
  if (mock.depositWithdrawData.withdrawAccounts[0]) {
    state.selectedWithdrawAccount = mock.depositWithdrawData.withdrawAccounts[0].id;
  } else {
    state.selectedWithdrawAccount = "";
  }
}
function normalizePromotion(item, index) {
  const min = item.minDeposit ?? item.min_deposit ?? item.min ?? "0.00";
  const max = item.maxBonus ?? item.max_bonus ?? item.max ?? "-";
  const bonus = item.bonusType === "percent" ? `รับโบนัส ${money(item.bonusValue).replace(".00", "")}%` : item.bonusValue ? `รับโบนัส ${money(item.bonusValue)}` : "ตามเงื่อนไข";
  return {
    id: item.id || item.code || `promotion-${index}`,
    title: item.title || item.name || `โปรโมชั่น ${index + 1}`,
    min: money(min),
    max: max === "-" ? "-" : money(max),
    detail: item.description || item.detail || item.conditions || "ไม่มีรายละเอียดเพิ่มเติม",
    image: item.code || `PROMO ${index + 1}`,
    badge: normalizeStatus(item.status || "active"),
    tone: ["gold", "pink", "blue", "mint"][index % 4],
    bonus,
    turnover: item.turnoverMultiplier ? `ทำเทิร์น ${money(item.turnoverMultiplier).replace(".00", "")} เท่า` : "ตามเงื่อนไข",
    withdraw: item.maxWithdraw ? `ถอนได้สูงสุด ${money(item.maxWithdraw)}` : "ตามเงื่อนไข",
    status: normalizeStatus(item.status || "active")
  };
}
function syncPromotions(data) {
  mock.promotions = asArray(data).map(normalizePromotion);
  mock.depositWithdrawData.promotions = ["ไม่รับโปรโมชั่น", ...mock.promotions.map((item) => item.title)];
  state.promotionsLoaded = true;
}
function normalizeDeposit(item) {
  return {
    id: item.id || item.transactionId || "",
    datetime: displayDate(item.createdAt || item.created_at || item.datetime),
    channel: item.channel || "ฝากเงิน",
    amount: pickAmount(item.amount),
    promo: promotionLabel(item.promotion),
    status: item.status || normalizeStatus(item.status)
  };
}
function normalizeWithdraw(item) {
  const account = item.userBankAccount || item.bankAccount || {};
  const bankCode = account.bankCode || account.bank_code || account.bank || "";
  const accountName = account.accountName || account.bank_account_name || account.owner || "-";
  const accountNumber = account.accountNumber || account.bank_account_number || account.number || "-";
  return {
    id: item.id || item.transactionId || "",
    datetime: displayDate(item.createdAt || item.created_at || item.datetime),
    channel: "ถอนเงินธนาคาร",
    account: bankCode ? `${bankCode} / ${accountName} / ${accountNumber}` : "-",
    amount: pickAmount(item.amount),
    status: item.status || normalizeStatus(item.status),
    note: item.note || ""
  };
}
function normalizeProvider(item) {
  return { id: item.code || item.id || item.name, code: item.code || item.id || item.name, name: item.name || item.code || item.id || "-", category: item.category || "สล็อต" };
}
function syncProviders(data) {
  mock.providers = asArray(data).map(normalizeProvider);
  state.providersLoaded = true;
}
function normalizeGame(item, provider) {
  return {
    code: item.code || item.game_code || item.id || item.name,
    name: item.name || item.code || "-",
    category: item.category || "slot",
    provider: provider.code || provider.id || provider.name,
    bg: "linear-gradient(145deg, #18222e, #2f5470)"
  };
}
function syncProviderGames(providerCode, data) {
  state.gamesByProvider[providerCode] = asArray(data).map((item) => normalizeGame(item, { code: providerCode }));
}
function overlayVisible() { return state.drawerOpen || Boolean(state.activeModal) || state.newsOpen; }
function currentGames() { const query = state.search.trim().toLowerCase(); return mock.games.filter((game) => game.category === state.activeCategory && (!query || `${game.name} ${game.provider}`.toLowerCase().includes(query))); }
function nowText() { const now = new Date(); const pad = (value) => String(value).padStart(2, "0"); return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`; }
function transactionRef(prefix) { return `${prefix}-${Date.now().toString().slice(-6)}`; }
function decimalTransferAmount(value) { const amount = Number(value || "0"); return Number.isFinite(amount) && amount > 0 ? (amount + 0.23).toFixed(2) : "0.00"; }
function fieldError(map, key) { return map[key] ? '<div class="validation">กรุณากรอกข้อมูล</div>' : ""; }
function validationText(message) { return message ? `<div class="validation">${text(message)}</div>` : ""; }
function resultCardHtml(title, rows, options = {}) {
  const tone = options.tone || "success";
  const message = options.message ? `<div class="helper-text result-message">${text(options.message)}</div>` : "";
  return `<div class="result-card ${text(tone)}"><div class="result-card-head"><div class="success-icon small">${tone === "error" ? "!" : "✓"}</div><div><div class="menu-title">${text(title)}</div>${message}</div></div>${transactionSummaryRows(null, rows)}</div>`;
}
function loginErrors() {
  return !state.form.loginPhone.trim() || !state.form.loginPassword.trim() ? { api: "กรุณากรอกข้อมูล" } : {};
}

function isDemoLoginCredential(login, passcode) {
  const normalizedLogin = String(login || "").trim().toLowerCase();
  const normalizedPasscode = String(passcode || "").trim();
  return DEMO_LOGIN_CREDENTIALS.some((item) => item.login.toLowerCase() === normalizedLogin && item.passcode === normalizedPasscode);
}

function applyDemoMemberState() {
  state.member = { ...DEMO_MEMBER_PROFILE };
  mock.user.username = DEMO_MEMBER_PROFILE.username;
  mock.user.ranking = DEMO_MEMBER_PROFILE.ranking;
  mock.user.level = DEMO_MEMBER_PROFILE.ranking;
  mock.user.balance = DEMO_MEMBER_PROFILE.balance;
  mock.user.creditDisplay = DEMO_MEMBER_PROFILE.balance;
  mock.user.turnoverCurrent = DEMO_MEMBER_PROFILE.balance;
  mock.user.diamonds = DEMO_MEMBER_PROFILE.points;
  mock.walletQuickMenu.balance = DEMO_MEMBER_PROFILE.balance;
  mock.walletQuickMenu.diamond = DEMO_MEMBER_PROFILE.points;
  mock.walletQuickMenu.turnoverCurrent = DEMO_MEMBER_PROFILE.balance;
  mock.depositWithdrawData.balance = DEMO_MEMBER_PROFILE.balance;
  mock.shop.pointBalance = DEMO_MEMBER_PROFILE.points;
  mock.randomBoxes.pointBalance = DEMO_MEMBER_PROFILE.points;
  mock.wheel.balance = DEMO_MEMBER_PROFILE.points;
  state.shopPointBalance = DEMO_MEMBER_PROFILE.points;
  state.depositHistory = [...mock.history.deposits];
  state.withdrawHistory = [...mock.history.withdraws];
  state.bonusHistory = [...mock.history.bonus];
}

function completeDemoLogin(message = "เข้าสู่ระบบสำเร็จ") {
  saveAuth();
  state.loggedIn = true;
  applyDemoMemberState();
  state.drawerOpen = false;
  state.activeModal = "";
  state.errors.login = {};
  state.form.loginPassword = "";
  addToast(message);
  render();
}
function registerMethodLabel(method = state.registerMethod) {
  return ({ phone: "เบอร์โทรศัพท์", line: "LINE", telegram: "Telegram", email: "Email" })[method] || "ยังไม่ได้เลือก";
}
function registerIdentityValue() {
  if (state.registerMethod === "phone") return state.form.registerPhone.trim();
  if (state.registerMethod === "email") return state.form.registerEmail.trim();
  if (state.registerMethod === "line") return state.registerLineConnected ? "LINE mock connected" : "";
  if (state.registerMethod === "telegram") return state.registerTelegramConnected ? "Telegram mock connected" : "";
  return "";
}
function registerStepErrors(step = state.registerStep) {
  const errors = {};
  if (step === 1) {
    if (!state.registerMethod) errors.method = "กรุณาเลือกวิธีสมัคร";
  }
  if (step === 2) {
    if (state.registerMethod === "phone" && !state.form.registerPhone.trim()) errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    if (state.registerMethod === "email") {
      const email = state.form.registerEmail.trim();
      if (!email) errors.email = "กรุณากรอก Email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "รูปแบบ Email ไม่ถูกต้อง";
    }
    if (state.registerMethod === "line" && !state.registerLineConnected) errors.line = "กรุณาเชื่อมต่อ LINE mock";
    if (state.registerMethod === "telegram" && !state.registerTelegramConnected) errors.telegram = "กรุณาเชื่อมต่อ Telegram mock";
    if (!state.form.registerPassword.trim()) errors.password = "กรุณากรอกรหัสผ่าน";
    if (!state.form.registerConfirmPassword.trim()) errors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    else if (state.form.registerPassword !== state.form.registerConfirmPassword) errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
  }
  if (step === 3) {
    if (!state.form.registerBank.trim()) errors.bank = "กรุณาเลือกธนาคาร";
    if (!state.form.registerAccount.trim()) errors.account = "กรุณากรอกเลขบัญชีธนาคาร";
    if (!state.form.registerName.trim()) errors.name = "กรุณากรอกชื่อ - นามสกุล";
    if (!state.form.registerSource.trim()) errors.source = "กรุณาเลือกช่องทางที่รู้จักเรา";
    if (!state.form.registerAccepted) errors.accepted = "กรุณายอมรับเงื่อนไข";
  }
  return errors;
}
function registerErrors() { return { ...registerStepErrors(1), ...registerStepErrors(2), ...registerStepErrors(3) }; }
function resetRegisterWizard() { state.registerStep = 1; state.registerMethod = ""; state.registerLineConnected = false; state.registerTelegramConnected = false; state.errors.register = {}; }
function setModal(name) { state.activeModal = name; render(); }
function closeModal() { state.activeModal = ""; state.newsOpen = false; state.sharePopupOpen = false; state.promotionDetailId = ""; state.commissionDetailId = ""; state.selectedNotificationId = ""; state.revenueView = "main"; state.revenueMetricType = "deposit"; state.modalTabs.revenueMetric = "overview"; state.modalTabs.depositView = "main"; state.modalTabs.freebies = "credits"; state.modalTabs.shop = "rewards"; state.modalTabs.provider = "ทั้งหมด"; state.selectedProviderId = ""; state.selectedBoxReward = ""; state.boxOpening = false; state.couponSubmitted = false; state.wheelSubmitted = false; state.wheelSpinning = false; state.form.slipUploaded = false; state.errors.shopCredit = ""; state.errors.shopCash = ""; render(); }
function closeDrawer() { state.drawerOpen = false; render(); }
function openAuth(tab) { state.drawerOpen = false; state.modalTabs.auth = tab; if (tab === "register" && state.activeModal !== "auth") resetRegisterWizard(); setModal("auth"); }
function requireLogin(action) { if (state.loggedIn) { action(); return; } addToast("กรุณาเข้าสู่ระบบก่อน"); openAuth("login"); }
function requireLoginModal(name, beforeOpen) {
  requireLogin(() => {
    if (beforeOpen) beforeOpen();
    setModal(name);
  });
}
async function checkApiHealth(silent = false) {
  state.apiStatus = "checking";
  state.apiMessage = "กำลังตรวจ Backend...";
  if (!silent && !skipNonEssentialAutoRefresh()) render();
  else updateApiStatusPills();
  try {
    await apiRequest("GET", "/health", null, { auth: false });
    state.apiStatus = "online";
    state.apiMessage = "Backend พร้อมใช้งาน";
  } catch (error) {
    state.apiStatus = "offline";
    state.apiMessage = apiErrorMessage(error);
  }
  updateApiStatusPills();
}
async function loadPromotions(silent = false) {
  state.loading.promotions = true;
  if (!silent) render();
  try {
    const data = await apiGet("/promotions");
    syncPromotions(data);
  } catch (error) {
    state.apiMessage = apiErrorMessage(error);
    syncPromotions([]);
    if (!silent) addToast(state.apiMessage);
  }
  state.loading.promotions = false;
  if (!silent) render();
}
async function loadProviders() {
  state.providersLoaded = true;
  render();
}
async function loadProviderGames(providerCode) {
  if (!state.loggedIn || !providerCode) return;
  state.loading.providerGames = false;
  render();
}
async function loadDeposits(silent = false) {
  if (!state.loggedIn) return false;
  state.loading.deposits = true;
  if (!silent) render();
  try {
    const data = await apiGet("/deposits");
    state.depositHistory = asArray(data).map(normalizeDeposit);
    state.loading.deposits = false;
    if (!silent) render();
    return true;
  } catch (error) {
    state.apiMessage = apiErrorMessage(error);
    if (!isAuthExpiredError(error) && !silent) addToast(state.apiMessage);
    state.depositHistory = [];
  }
  state.loading.deposits = false;
  if (!silent) render();
  return false;
}
async function loadWithdrawals(silent = false) {
  if (!state.loggedIn) return false;
  state.loading.withdrawals = true;
  if (!silent) render();
  try {
    const data = await apiGet("/withdrawals");
    state.withdrawHistory = asArray(data).map(normalizeWithdraw);
    state.loading.withdrawals = false;
    if (!silent) render();
    return true;
  } catch (error) {
    state.apiMessage = apiErrorMessage(error);
    if (!isAuthExpiredError(error) && !silent) addToast(state.apiMessage);
    state.withdrawHistory = [];
  }
  state.loading.withdrawals = false;
  if (!silent) render();
  return false;
}
async function loadCurrentUser() {
  if (!state.loggedIn) return;
  const data = await apiGet("/me");
  syncMemberToMock({ user: extractUserData(data) });
}
async function loadWallet() {
  if (!state.loggedIn) return;
  const data = await apiGet("/wallet");
  syncMemberToMock({ wallet: data.wallet || data });
}
async function loadBankAccounts(silent = false) {
  if (!state.loggedIn) return false;
  if (!silent) { state.loading.bankAccounts = true; render(); }
  try {
    const data = await apiGet("/bank-accounts");
    syncBankAccounts(data);
    state.loading.bankAccounts = false;
    if (!silent) render();
    return true;
  } catch (error) {
    state.apiMessage = apiErrorMessage(error);
    if (!isAuthExpiredError(error) && !silent) addToast(state.apiMessage);
    syncBankAccounts([]);
  }
  state.loading.bankAccounts = false;
  if (!silent) render();
  return false;
}
async function loadMemberData(silent = false) {
  if (!state.loggedIn) return;
  if (!silent) { state.loading.member = true; render(); }
  if (localStorage.getItem(DEMO_LOGIN_STORAGE_KEY) === "true" && !localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) {
    applyDemoMemberState();
    state.loading.member = false;
    if (!silent) render();
    return;
  }
  try {
    await Promise.all([loadCurrentUser(), loadWallet(), loadBankAccounts(true)]);
  } catch (error) {
    state.apiMessage = apiErrorMessage(error);
    if (!isAuthExpiredError(error)) addToast(state.apiMessage);
  }
  state.loading.member = false;
  if (!silent) render();
}
async function refreshWallet() {
  if (!state.loggedIn || state.loading.walletRefresh) return;
  state.loading.walletRefresh = true;
  render();
  try {
    await loadWallet();
    addToast("รีเฟรชกระเป๋าสำเร็จ");
  } catch (error) {
    state.apiMessage = apiErrorMessage(error);
    if (!isAuthExpiredError(error)) addToast(state.apiMessage);
  }
  state.loading.walletRefresh = false;
  render();
}
async function refreshProfileBankAccounts() {
  if (!state.loggedIn || state.loading.profileRefresh) return;
  state.loading.profileRefresh = true;
  render();
  const [userResult, bankResult] = await Promise.allSettled([loadCurrentUser(), loadBankAccounts(true)]);
  if (userResult.status === "fulfilled" && bankResult.status === "fulfilled" && bankResult.value) {
    addToast("รีเฟรชโปรไฟล์สำเร็จ");
  } else {
    const error = userResult.status === "rejected" ? userResult.reason : null;
    if (error) state.apiMessage = apiErrorMessage(error);
    if (!error || !isAuthExpiredError(error)) addToast(state.apiMessage || "โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
  }
  state.loading.profileRefresh = false;
  render();
}
async function refreshHistory() {
  if (!state.loggedIn || state.loading.historyRefresh) return;
  state.loading.historyRefresh = true;
  render();
  const [depositsOk, withdrawalsOk] = await Promise.all([loadDeposits(true), loadWithdrawals(true)]);
  state.loading.historyRefresh = false;
  if (depositsOk && withdrawalsOk) addToast("รีเฟรชประวัติสำเร็จ");
  else addToast(state.apiMessage || "โหลดประวัติไม่สำเร็จ");
  render();
}
function copyTextToClipboard(value, message) {
  const textValue = String(value || "").trim();
  if (!textValue || textValue === "-") {
    addToast("ไม่มีข้อมูลให้คัดลอก");
    return;
  }
  if (navigator.clipboard) navigator.clipboard.writeText(textValue).catch(() => {});
  addToast(message);
}
async function submitLogin(phone, password) {
  if (state.loading.login) return;
  state.loading.login = true;
  state.errors.login = {};
  render();
  if (!String(phone || "").trim() || !String(password || "").trim()) {
    state.errors.login = { api: "กรุณากรอกข้อมูล" };
    state.loading.login = false;
    render();
    return;
  }
  try {
    const data = await apiRequest("POST", "/auth/login", { phone: String(phone).trim(), password }, { auth: false });
    const token = extractAuthToken(data);
    if (!token) throw new Error("API ไม่ได้ส่ง token กลับมา");
    saveAuth(token);
    state.loggedIn = true;
    syncMemberToMock({ user: extractUserData(data), wallet: data.wallet || {} });
    await Promise.all([loadCurrentUser(), loadWallet(), loadBankAccounts(true)]);
    state.drawerOpen = false;
    state.activeModal = "";
    state.errors.login = {};
    state.form.loginPassword = "";
    addToast("เข้าสู่ระบบสำเร็จ");
  } catch (error) {
    clearAuth();
    state.loggedIn = false;
    state.errors.login = { api: apiErrorMessage(error) };
  }
  state.loading.login = false;
  render();
}
async function submitRegisterMember() {
  if (state.loading.register) return;
  state.loading.register = true;
  state.errors.register = {};
  render();
  const phone = state.form.registerPhone.trim();
  const payload = {
    phone,
    username: phone || state.form.registerEmail.trim(),
    password: state.form.registerPassword,
    bank_code: state.form.registerBank.trim(),
    bank_account_number: state.form.registerAccount.trim(),
    bank_account_name: state.form.registerName.trim(),
    referral_source: state.form.registerSource.trim(),
    accept_bonus: state.form.registerBonus !== "ไม่รับโบนัส",
    accept_terms: Boolean(state.form.registerAccepted)
  };
  try {
    const data = await apiRequest("POST", "/auth/register", payload, { auth: false });
    const token = extractAuthToken(data);
    if (!token) throw new Error("API ไม่ได้ส่ง token กลับมา");
    saveAuth(token);
    state.loggedIn = true;
    syncMemberToMock({ user: extractUserData(data), wallet: data.wallet || {} });
    await Promise.all([loadCurrentUser(), loadWallet(), loadBankAccounts(true)]);
    state.drawerOpen = false;
    state.activeModal = "";
    state.form.registerPassword = "";
    state.form.registerConfirmPassword = "";
    state.loading.register = false;
    addToast("สมัครสมาชิกสำเร็จ");
    render();
  } catch (error) {
    state.errors.register = { api: apiErrorMessage(error) };
    state.loading.register = false;
    render();
  }
}
function logoutMember() {
  clearAuth();
  state.loggedIn = false;
  state.member = {};
  state.bankAccounts = [];
  state.walletLedger = [];
  state.depositHistory = [];
  state.withdrawHistory = [];
  state.drawerOpen = false;
  state.activeModal = "";
  addToast("ออกจากระบบแล้ว");
  render();
}
async function loginDemoMember() {
  state.form.loginPhone = "0800000000";
  state.form.loginPassword = "";
  completeDemoLogin("เข้าสู่ระบบเดโม่สำเร็จ");
}
if (state.member && Object.keys(state.member).length) {
  applyDemoMemberState();
}
function openDeposit(entry) { requireLogin(() => { state.drawerOpen = false; state.depositEntry = entry || "page"; state.modalTabs.deposit = "deposit"; state.modalTabs.depositView = "main"; setModal("deposit"); }); }
function depositData() { return mock.depositWithdrawData; }
function apiDepositChannel(channel) {
  if (channel === "ฝากแนบสลิป") return "slip_upload_mock";
  if (channel === "QR PAY") return "qr_pay_mock";
  return "bank_transfer";
}
async function createDepositRequest(channel, amount, note = "") {
  const data = await apiPost("/deposits", { amount, channel: apiDepositChannel(channel), note });
  return normalizeDeposit(data.deposit || data.transaction || data);
}
function turnoverBar() { const data = depositData(); return `<div class="turnover-bar">ทำเทิร์น ${money(data.balance)} / ${money(data.withdrawMin)} ถอนสูงสุด</div>`; }
function modalParent(name) { if (name === "promotion-detail") return "promotions"; if (name === "commission-detail") return "rebates"; if (name === "revenue-detail") return "revenue"; if (name === "notification-detail") return "notifications"; if (name === "random-box-open" || name === "random-box-history" || name === "random-box-result") return "random-box"; if (name === "wheel-result" || name === "wheel-history" || name === "wheel-rules") return "wheel"; return ""; }
function hasModalParent() { return (state.activeModal === "deposit" && state.modalTabs.depositView !== "main") || modalParent(state.activeModal) !== ""; }
function overlayCloseAction() { if (state.drawerOpen) { closeDrawer(); return; } if (state.newsOpen && !state.activeModal) { state.newsOpen = false; render(); return; } if (state.activeModal && !hasModalParent()) closeModal(); }
function modalShell(title, body, options = {}) { const backButton = options.backAction ? `<button class="icon-btn" data-action="${text(options.backAction)}">←</button>` : '<span class="modal-spacer"></span>'; const panelClass = options.panelClass ? ` ${text(options.panelClass)}` : ""; return `<div class="modal-wrap"><div class="modal-panel${panelClass}"><div class="modal-head">${backButton}<h3 class="modal-title">${text(title)}</h3><button class="icon-btn" data-action="close-modal">✕</button></div><div class="modal-content">${body}</div></div></div>`; }
function notificationIsRead(item) { return Object.prototype.hasOwnProperty.call(state.notificationRead, item.id) ? state.notificationRead[item.id] : !item.unread; }
function unreadCount() { return mock.notifications.filter((item) => !notificationIsRead(item)).length; }
function bellHtml(className = "") { const count = unreadCount(); return `<button class="notification-bell ${count > 0 ? "unread" : "read"} ${text(className)}" data-action="open-notifications" aria-label="ศูนย์ข่าวสาร"><span class="bell-icon">🔔</span>${count > 0 ? `<span class="bell-badge">${count}</span>` : ""}</button>`; }
function homeV2Icon(name) {
  const icons = {
    menu: '<svg viewBox="0 0 24 24"><path d="M5 7.5h14M5 12h14M5 16.5h14"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m16 16 3.5 3.5"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M18 10.6a6 6 0 0 0-12 0c0 4.5-1.4 6.2-2.5 7h17c-1.1-.8-2.5-2.5-2.5-7Z"/><path d="M9.6 20a2.6 2.6 0 0 0 4.8 0"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.2" r="3.7"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg>',
    credit: '<svg viewBox="0 0 24 24"><rect x="3.5" y="6.4" width="17" height="11.2" rx="3"/><path d="M3.5 10.2h17"/><path d="M7.2 14.1h4.6"/></svg>',
    diamond: '<svg viewBox="0 0 24 24"><path d="M6.7 4.8h10.6L21 9.2 12 20 3 9.2l3.7-4.4Z"/><path d="M8 9.2h8M9.2 4.8 12 20l2.8-15.2"/></svg>',
    ticket: '<svg viewBox="0 0 24 24"><path d="M4.5 8.2V6.8c0-1 .8-1.8 1.8-1.8h11.4c1 0 1.8.8 1.8 1.8v1.4a2.8 2.8 0 0 0 0 5.6v1.4c0 1-.8 1.8-1.8 1.8H6.3c-1 0-1.8-.8-1.8-1.8v-1.4a2.8 2.8 0 0 0 0-5.6Z"/><path d="M9 8h6M9 12h4.2M16 5v14"/></svg>',
    coin: '<svg viewBox="0 0 24 24"><circle cx="11" cy="12" r="6.5"/><path d="M11 8.2v7.6M8.8 10.1c.5-.8 1.3-1.2 2.3-1.2 1.3 0 2.1.6 2.1 1.5 0 2-4.4.8-4.4 3 0 1 .9 1.7 2.3 1.7 1.1 0 2-.4 2.6-1.2"/><path d="m17 5 1-2 1 2 2 .9-2 .9-1 2-1-2-2-.9 2-.9Z"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M5 9.5 12 6l7 3.5v8.2L12 21l-7-3.3V9.5Z"/><path d="m5 9.5 7 3.4 7-3.4M12 12.9V21"/><path d="M8.5 7.2c-.9-1.6.2-3.1 1.7-2.4.8.4 1.3 1.2 1.8 2.2.5-1 1-1.8 1.8-2.2 1.5-.7 2.6.8 1.7 2.4"/></svg>',
    wheel: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.2"/><circle cx="12" cy="12" r="2.1"/><path d="M12 4.8V10m0 4v5.2M4.8 12H10m4 0h5.2M7 7l3.6 3.6M13.4 13.4 17 17M17 7l-3.6 3.6M10.6 13.4 7 17"/></svg>',
    checkin: '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2.4"/><path d="M8 3.8v3.4M16 3.8v3.4M4 9.5h16M8.2 14l2.2 2.2 5-5"/></svg>',
    shop: '<svg viewBox="0 0 24 24"><path d="M6.5 8.5h11l1.1 11H5.4l1.1-11Z"/><path d="M9 8.5a3 3 0 0 1 6 0"/><path d="M8.5 12.5h7"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24"><path d="M15 5.5 8.5 12 15 18.5"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24"><path d="m9 5.5 6.5 6.5L9 18.5"/></svg>'
  };
  return `<span class="home-v2-icon home-v2-icon-${text(name)}" aria-hidden="true">${icons[name] || icons.search}</span>`;
}
function homeV2BellHtml() { const count = unreadCount(); return `<button class="notification-bell ${count > 0 ? "unread" : "read"} home-v2-bell" data-action="open-notifications" aria-label="ศูนย์ข่าวสาร"><span class="bell-icon">${homeV2Icon("bell")}</span>${count > 0 ? `<span class="bell-badge">${count}</span>` : ""}</button>`; }
function homeV2MetricPillHtml(type, label, value) {
  return `<div class="home-v2-pill ${text(type)}">${homeV2Icon(type)}<span>${text(label)}</span><strong>${money(value)}</strong></div>`;
}
function announcementItems() { return mock.notifications.filter((item) => item.broadcast); }
function announcementHtml() { const items = announcementItems(); const clickable = items.length ? items.map((item) => `<button class="announcement-item" data-action="open-announcement-detail" data-id="${text(item.id)}">${text(item.summary)}</button>`).join("<span class=\"announcement-dot\">•</span>") : `<span class="announcement-empty">${text(mock.newsText)}</span>`; const repeat = items.length ? items.map((item) => `<span class="announcement-item ghost">${text(item.summary)}</span>`).join("<span class=\"announcement-dot\">•</span>") : ""; return `<section class="announcement-strip"><div class="announcement-label">ประกาศ</div><div class="announcement-marquee"><div class="announcement-track">${clickable}<span class="announcement-dot">•</span>${repeat}</div></div></section>`; }
function isLegacyHome() { return new URLSearchParams(location.search).get("home") === "legacy"; }
function isHomeV2() { return !isLegacyHome(); }
function homeV2ModeClass() {
  const width = window.innerWidth || document.documentElement.clientWidth || 1024;
  if (width <= 768) return "home-v2-mobile";
  if (width >= 1024) return "home-v2-desktop";
  return "home-v2-tablet";
}
function homeV2Categories() { return ["เกมโปรด", "เกมใหม่", "เกมแตก", "สล็อต", "คาสิโน", "กีฬา", "ยิงปลา", "หวย", "โต๊ะ"]; }
function homeV2Banners() {
  return [
    { eyebrow: "PG77 BONUS", title: "เครดิตฟรี 100", text: "หน้าเดโมโทนพรีเมียม สมัครง่าย ดูโปรชัด เล่นต่อได้ไว", primaryLabel: "เริ่มใช้งาน", primaryAction: state.loggedIn ? "home-v2-focus-games" : "open-register", secondaryLabel: "ดูโปร", secondaryAction: "open-promotions", tone: "bonus", accent: "#f4c85d", bg: "linear-gradient(135deg, #071018 0%, #0f3b4e 46%, #b98522 100%)" },
    { eyebrow: "PG77 MEMBER", title: "ฝาก ถอน กระเป๋า", text: "จัดเมนูสมาชิกให้กดง่าย มองยอดเงินและแต้มได้ทันที", primaryLabel: "ฝากเงิน", primaryAction: state.loggedIn ? "open-deposit-page" : "open-login", secondaryLabel: "กระเป๋า", secondaryAction: state.loggedIn ? "open-wallet" : "open-register", tone: "wallet", accent: "#39d5c8", bg: "linear-gradient(135deg, #050d16 0%, #0e3448 48%, #239f9a 112%)" },
    { eyebrow: "PG77 GAME LOBBY", title: "รวมค่ายเกมยอดนิยม", text: "จัดหมวดเกม ค่ายเกม และการค้นหาให้อยู่เป็นสัดส่วน", primaryLabel: "ดูค่ายเกม", primaryAction: "open-provider", secondaryLabel: "เล่นเกม", secondaryAction: "home-v2-focus-games", tone: "lobby", accent: "#64d6ff", bg: "linear-gradient(135deg, #06101a 0%, #163d55 50%, #c49736 100%)" }
  ];
}
function bannerCount() { return isHomeV2() ? homeV2Banners().length : mock.banners.length; }
function setActiveBanner(index) {
  const count = bannerCount();
  const parsed = Number(index);
  state.activeBanner = count ? ((Number.isFinite(parsed) ? parsed : 0) % count + count) % count : 0;
  if (updateActiveBannerDom()) return;
  if (!skipNonEssentialAutoRefresh()) render();
}
function updateActiveBannerDom() {
  if (!isHomeV2()) return false;
  const slider = document.querySelector(".home-v2-slider");
  if (!slider) return false;
  const slides = slider.querySelectorAll(".home-v2-slide");
  if (!slides.length) return false;
  const activeIndex = state.activeBanner % slides.length;
  slider.style.setProperty("--active-index", activeIndex);
  slides.forEach((slide, index) => {
    const active = index === activeIndex;
    slide.classList.toggle("active", active);
    slide.setAttribute("aria-hidden", active ? "false" : "true");
  });
  slider.querySelectorAll(".home-v2-dots button").forEach((dot, index) => {
    dot.classList.toggle("active", index === activeIndex);
  });
  return true;
}
function homeV2CategoryMatches(category, game) {
  const map = {
    "คาสิโน": ["คาสิโน", "บาคาร่า"],
    "หวย": ["หวย", "แทงหวย"],
    "โต๊ะ": ["โต๊ะ", "ป๊อกเด้ง", "บาคาร่า"],
    "ยิงปลา": ["ยิงปลา"],
    "กีฬา": ["กีฬา"]
  };
  const accepted = map[category] || [category];
  return accepted.includes(game.category);
}
function homeV2GamesFor(category = state.activeCategory, limit = 12) {
  const query = state.search.trim().toLowerCase();
  const list = mock.games.filter((game) => homeV2CategoryMatches(category, game) && (!query || `${game.name} ${game.provider}`.toLowerCase().includes(query)));
  if (list.length) return list.slice(0, limit);
  if (query) return [];
  return mock.games.slice(0, limit);
}
function homeV2SearchHtml(extraClass = "") {
  return `<div class="home-v2-search ${text(extraClass)}"><span class="home-v2-search-icon">${homeV2Icon("search")}</span><input data-field="search" value="${text(state.search)}" placeholder="ค้นหาเกมหรือค่ายเกม"><button data-action="clear-search" aria-label="clear-search">${homeV2Icon("close")}</button></div>`;
}
function homeV2HeaderHtml() {
  if (state.loggedIn) {
    return `<header class="home-v2-header"><div class="home-v2-header-inner"><button class="home-v2-icon-btn" data-action="toggle-drawer" aria-label="menu">${homeV2Icon("menu")}</button><div class="home-v2-brand">${brandLogoHtml("home-v2-logo")}<span>PG77</span></div>${apiStatusPillHtml()}${homeV2SearchHtml("home-v2-header-search")}<div class="home-v2-head-actions">${homeV2MetricPillHtml("credit", "เครดิต", mock.user.balance)}${homeV2MetricPillHtml("diamond", "แต้ม", mock.user.diamonds)}<button class="home-v2-icon-btn" data-action="refresh-wallet" aria-label="refresh wallet" ${state.loading.walletRefresh ? "disabled" : ""}>↻</button>${homeV2BellHtml()}<button class="home-v2-profile" data-action="open-profile" aria-label="profile">${homeV2Icon("user")}</button></div></div><div class="home-v2-member-strip">${homeV2MetricPillHtml("credit", "เครดิต", mock.user.balance)}${homeV2MetricPillHtml("diamond", "แต้ม", mock.user.diamonds)}</div></header>`;
  }
  return `<header class="home-v2-header"><div class="home-v2-header-inner"><button class="home-v2-icon-btn" data-action="toggle-drawer" aria-label="menu">${homeV2Icon("menu")}</button><div class="home-v2-brand">${brandLogoHtml("home-v2-logo")}<span>PG77</span></div>${apiStatusPillHtml()}${homeV2SearchHtml("home-v2-header-search")}<div class="home-v2-head-actions guest"><button class="home-v2-login-btn" data-action="open-login">เข้าสู่ระบบ</button><button class="home-v2-register-btn" data-action="open-register">สมัคร</button>${homeV2BellHtml()}</div></div></header>`;
}
function homeV2AnnouncementHtml() {
  const items = [
    ["new-member-bonus", "สมาชิกใหม่รับโบนัสเพิ่มวันนี้"],
    ["weekly-lossback", "คืนยอดเสียทุกวันศุกร์"],
    ["maintenance", "แจ้งปิดปรับปรุงระบบคืนนี้ 02:00-03:00"],
    ["shop-wheel", "โปรโมชันใหม่อัปเดตแล้วที่ PG77"]
  ];
  const row = items.map(([id, label]) => `<button data-action="open-announcement-detail" data-id="${text(id)}">${text(label)}</button>`).join('<span class="home-v2-announcement-dot">•</span>');
  return `<section class="home-v2-announcement" data-action="open-announcement-detail" data-id="${text(items[0][0])}"><span>ประกาศ</span><div class="home-v2-announcement-marquee"><div class="home-v2-announcement-track">${row}<span class="home-v2-announcement-dot">•</span>${row}</div></div></section>`;
}
function homeV2HeroHtml() {
  const banners = homeV2Banners();
  const activeIndex = ((state.activeBanner % banners.length) + banners.length) % banners.length;
  const slides = banners.map((banner, index) => `<div class="home-v2-slide home-v2-slide-${text(banner.tone)} ${index === activeIndex ? "active" : ""}" style="--banner-bg:${text(banner.bg)};--banner-accent:${text(banner.accent)}" aria-hidden="${index === activeIndex ? "false" : "true"}"><div class="home-v2-slide-art" aria-hidden="true"><span></span><i></i><b></b></div><div class="home-v2-hero-copy"><span>${text(banner.eyebrow)}</span><h1>${text(banner.title)}</h1><p>${text(banner.text)}</p></div><div class="home-v2-hero-actions"><button data-action="${text(banner.primaryAction)}">${text(banner.primaryLabel)}</button><button data-action="${text(banner.secondaryAction)}"${banner.detailId ? ` data-id="${text(banner.detailId)}"` : ""}>${text(banner.secondaryLabel)}</button></div></div>`).join("");
  return `<section class="home-v2-hero"><article class="home-v2-hero-main home-v2-slider" style="--active-index:${activeIndex}"><div class="home-v2-slider-track">${slides}</div><button class="home-v2-hero-nav prev" data-action="banner-prev" aria-label="previous banner">${homeV2Icon("arrowLeft")}</button><button class="home-v2-hero-nav next" data-action="banner-next" aria-label="next banner">${homeV2Icon("arrowRight")}</button><div class="home-v2-dots">${banners.map((banner, index) => `<button class="${index === activeIndex ? "active" : ""}" data-action="banner-${index}" aria-label="home-v2-banner-${index + 1}"></button>`).join("")}</div></article><article class="home-v2-hero-side"><span>PG77 LOBBY</span><strong>ค่ายยอดนิยม</strong><p>PG, JILI, PRAGMATIC, CQ9</p><div class="home-v2-hero-side-grid"><button data-action="open-provider">ดูค่ายเกม</button><button data-action="home-v2-focus-games">เล่นเกม</button></div></article></section>`;
}
function homeV2CategoryHtml() {
  return `<section class="home-v2-category"><div class="home-v2-scroll-row">${homeV2Categories().map((item) => `<button class="${item === state.activeCategory ? "active" : ""}" data-action="category-${text(item)}">${text(item)}</button>`).join("")}</div>${homeV2SearchHtml()}</section>`;
}
function homeV2ProviderHtml() {
  return `<section class="home-v2-section home-v2-provider-section"><div class="home-v2-section-head"><div><h2>ค่ายยอดนิยม</h2><p>ค่ายเกมแนะนำ</p></div><button data-action="open-provider">ทั้งหมด</button></div><div class="home-v2-provider-row">${mock.providers.slice(0, 10).map((provider) => `<button class="home-v2-provider-chip" data-action="open-provider"><strong>${text(provider.name)}</strong><span>${text(provider.category)}</span></button>`).join("")}</div></section>`;
}
function homeV2GameCardHtml(game, index) {
  const badge = game.badge || (index % 3 === 0 ? "HOT" : index % 3 === 1 ? "NEW" : "แตกบ่อย");
  return `<article class="home-v2-card" data-action="home-v2-play-game"><div class="home-v2-card-art" style="background:${text(game.bg)}"><span>${text(badge)}</span><strong>${String(index + 1).padStart(2, "0")}</strong><em>${text(game.provider)}</em></div><div class="home-v2-card-body"><h3>${text(game.name)}</h3><p>${text(game.provider)}</p><button data-action="home-v2-play-game">เล่น</button></div></article>`;
}
function homeV2GameSectionHtml(title, subtitle, games, sectionId = "") {
  const list = games.length ? games : [];
  const idAttr = sectionId ? ` id="${text(sectionId)}"` : "";
  return `<section class="home-v2-section"${idAttr}><div class="home-v2-section-head"><div><h2>${text(title)}</h2><p>${text(subtitle)}</p></div></div>${list.length ? `<div class="home-v2-grid">${list.map(homeV2GameCardHtml).join("")}</div>` : `<div class="home-v2-empty"><strong>ไม่พบเกม</strong><span>ลองเปลี่ยนหมวดหรือค้นหาด้วยชื่อค่ายเกม</span></div>`}</section>`;
}
function homeV2WalletHtml() {
  return `<section class="home-v2-wallet"><div class="home-v2-wallet-head"><span>Wallet</span><strong>${money(mock.user.balance)}</strong><button class="mini-refresh-btn" data-action="refresh-wallet" ${state.loading.walletRefresh ? "disabled" : ""}>${state.loading.walletRefresh ? "..." : "รีเฟรช"}</button></div><div class="home-v2-wallet-grid"><div><span>เครดิต</span><strong>${money(mock.user.balance)}</strong></div><div><span>แต้ม</span><strong>${money(mock.user.diamonds)}</strong></div><div><span>โปรโมชั่น</span><strong>${text(mock.user.promotion)}</strong></div><div><span>เทิร์น</span><strong>${money(mock.user.turnoverCurrent)} / ${money(mock.user.turnoverTarget)}</strong></div></div><div class="home-v2-wallet-actions"><button data-action="open-deposit-page">ฝากเงิน</button><button data-action="home-v2-open-withdraw">ถอนเงิน</button><button data-action="open-wallet">กระเป๋า</button></div></section>`;
}
function homeV2QuickActionsHtml() {
  const actions = [
    ["โปรโมชั่น", "open-promotions", "ticket"],
    ["เครดิตฟรี", "home-v2-free-credit", "coin"],
    ["กล่องสุ่ม", "home-v2-random-box", "box"],
    ["กงล้อ", "home-v2-wheel", "wheel"],
    ["เช็คอิน", "home-v2-checkin", "checkin"],
    ["ร้านค้า", "home-v2-shop", "shop"]
  ];
  return `<section class="home-v2-actions"><div class="home-v2-section-head"><div><h2>เมนูด่วน</h2><p>เมนูสมาชิกใช้งานบ่อย</p></div></div><div class="home-v2-actions-grid">${actions.map(([label, action, icon]) => `<button data-action="${text(action)}"><span class="home-v2-action-icon">${homeV2Icon(icon)}</span><strong>${text(label)}</strong></button>`).join("")}</div></section>`;
}
function homeV2GuestCtaHtml() {
  return `<section class="home-v2-guest-cta"><h2>สมัครสมาชิกเพื่อรับโบนัส</h2><p>เข้าสู่ระบบหรือสมัครสมาชิกเพื่อใช้งานเมนูสมาชิก ฝาก ถอน และกระเป๋า</p><div><button data-action="open-login">เข้าสู่ระบบ</button><button data-action="open-register">สมัครสมาชิก</button></div></section>`;
}
function homeV2RightPanelHtml() {
  if (state.loggedIn) {
    const news = mock.notifications.slice(0, 3).map((item) => `<button data-action="open-notification-detail" data-id="${text(item.id)}"><strong>${text(item.title)}</strong><span>${text(item.summary)}</span></button>`).join("");
    return `<aside class="home-v2-right-panel">${homeV2WalletHtml()}${homeV2QuickActionsHtml()}<section class="home-v2-mini-list"><h2>ข่าวสาร</h2>${news}</section><section class="home-v2-contact"><span>CONTACT MOCK</span><strong>บริการสมาชิก 24 ชั่วโมง</strong><button data-action="open-contact">ติดต่อเรา</button></section></aside>`;
  }
  return `<aside class="home-v2-right-panel"><section class="home-v2-guest-panel"><h2>สมัครสมาชิกเพื่อรับโบนัส</h2><p>รับโบนัสและเปิดเมนูสมาชิกในโหมดเดโม่</p><button data-action="open-register">สมัครสมาชิก</button><button data-action="open-login">เข้าสู่ระบบ</button></section><section class="home-v2-mini-list"><h2>ข่าวสารล่าสุด</h2>${mock.notifications.slice(0, 3).map((item) => `<button data-action="open-notification-detail" data-id="${text(item.id)}"><strong>${text(item.title)}</strong><span>${text(item.summary)}</span></button>`).join("")}</section><section class="home-v2-guest-panel muted"><h2>โปรโมชั่นเด่น</h2><button data-action="open-promotions">ดูโปรโมชั่น</button></section></aside>`;
}
function homeV2ProviderShowcaseHtml() {
  return `<section class="home-v2-bottom-section home-v2-provider-showcase"><div class="home-v2-bottom-head"><div><h2>ค่ายเกมยอดนิยม</h2><p>รวมค่ายเกมสำหรับหน้าเดโม</p></div><button data-action="open-provider">ดูทั้งหมด</button></div><div class="home-v2-provider-showcase-grid">${mock.providers.slice(0, 12).map((provider) => `<button class="home-v2-provider-card" data-action="open-provider"><span>${text(providerInitials(provider.name))}</span><strong>${text(provider.name)}</strong><em>${text(provider.category)}</em></button>`).join("")}</div></section>`;
}
function homeV2PromoNewsHtml() {
  const promos = mock.promotions.slice(0, 3).map((promo) => `<button class="home-v2-promo-card" data-action="open-promotion-detail" data-id="${text(promo.id)}"><span>${text(promo.image)}</span><strong>${text(promo.title)}</strong><p>${text(promo.detail)}</p><em>ฝากขั้นต่ำ ${text(promo.min)}</em></button>`).join("");
  const news = mock.notifications.slice(0, 3).map((item) => `<button class="home-v2-news-card ${notificationIsRead(item) ? "read" : "unread"}" data-action="open-notification-detail" data-id="${text(item.id)}"><div><strong>${text(item.title)}</strong><span>${notificationIsRead(item) ? "read" : "unread"}</span></div><p>${text(item.summary)}</p><em>${text(item.date)}</em></button>`).join("");
  return `<section class="home-v2-bottom-split"><div class="home-v2-bottom-section"><div class="home-v2-bottom-head"><div><h2>โปรโมชั่นเด่น</h2><p>โปรโมชันเด่นจัดไว้ให้เห็นง่าย</p></div><button data-action="open-promotions">ดูโปรโมชั่น</button></div><div class="home-v2-promo-grid">${promos}</div></div><div class="home-v2-bottom-section"><div class="home-v2-bottom-head"><div><h2>ข่าวสารล่าสุด</h2><p>ข่าวสารสำคัญของสมาชิก</p></div><button data-action="open-notifications">ข่าวสาร</button></div><div class="home-v2-news-list">${news}</div></div></section>`;
}
function homeV2HelpStripHtml() {
  const items = [
    ["บริการ 24 ชม.", "service-toast"],
    ["วิธีสมัครสมาชิก", "footer-guide-register"],
    ["วิธีฝากถอน", "footer-guide-deposit"],
    ["ติดต่อแอดมิน", "open-contact"],
    ["LINE", "line-toast"],
    ["Telegram", "tg-toast"]
  ];
  return `<section class="home-v2-help-strip">${items.map(([label, action]) => `<button data-action="${text(action)}"><strong>${text(label)}</strong><span>${action.includes("toast") || action.includes("guide") ? "mock" : "modal"}</span></button>`).join("")}</section>`;
}
function homeV2BottomSectionsHtml() {
  return `<div class="home-v2-bottom-sections">${homeV2ProviderShowcaseHtml()}${homeV2PromoNewsHtml()}${homeV2HelpStripHtml()}</div>`;
}
function homeV2FooterLink(label, action) {
  return `<button data-action="${text(action)}">${text(label)}</button>`;
}
function homeV2FooterHtml() {
  return `<footer class="home-v2-footer"><div class="home-v2-footer-inner"><div class="home-v2-footer-brand">${brandLogoHtml("home-v2-footer-logo")}<strong>PG77</strong><p>Member frontend demo</p><div class="home-v2-footer-badges"><span>18+</span><span>Responsible play mock</span></div></div><div class="home-v2-footer-col"><h3>เมนูหลัก</h3>${homeV2FooterLink("หน้าแรก", "bottom-home")}${homeV2FooterLink("โปรโมชั่น", "open-promotions")}${homeV2FooterLink("ฝากเงิน", "open-deposit-page")}${homeV2FooterLink("ถอนเงิน", "home-v2-open-withdraw")}${homeV2FooterLink("ร้านค้า", "home-v2-shop")}${homeV2FooterLink("ข่าวสาร", "open-notifications")}</div><div class="home-v2-footer-col"><h3>ช่วยเหลือ</h3>${homeV2FooterLink("วิธีสมัครสมาชิก", "footer-guide-register")}${homeV2FooterLink("วิธีฝากถอน", "footer-guide-deposit")}${homeV2FooterLink("ติดต่อเรา", "open-contact")}${homeV2FooterLink("FAQ", "footer-faq")}${homeV2FooterLink("กฎและเงื่อนไข", "rules-toast")}</div><div class="home-v2-footer-col home-v2-footer-contact"><h3>ติดต่อ / Social</h3>${homeV2FooterLink("LINE", "line-toast")}${homeV2FooterLink("Telegram", "tg-toast")}${homeV2FooterLink("Email mock", "footer-email")}${homeV2FooterLink("เวลาให้บริการ 24 ชม.", "service-toast")}<button class="home-v2-footer-admin" data-action="open-contact">ติดต่อแอดมิน</button></div></div><div class="home-v2-footer-bottom"><span>© 2026 PG77</span><span>Static mock only</span><span>หน้าเดโมสำหรับทดสอบ UI</span></div></footer>`;
}
function homeV2MobileBottomNavHtml() {
  return `<nav class="home-v2-bottom-nav"><button class="active" data-action="bottom-home"><span>⌂</span><strong>หน้าหลัก</strong></button><button data-action="open-deposit-page"><span>＋</span><strong>ฝากเงิน</strong></button><button class="home-v2-center-nav" data-action="home-v2-focus-games"><span>▶</span><strong>เล่นเกม</strong></button><button data-action="home-v2-open-withdraw"><span>↧</span><strong>ถอนเงิน</strong></button><button data-action="open-wallet"><span>◇</span><strong>กระเป๋า</strong></button></nav>`;
}
function homeV2MainHtml() {
  const recommended = homeV2GamesFor(state.activeCategory, 12);
  const slots = mock.games.filter((game) => game.category === "สล็อต").slice(0, 6);
  const newest = mock.games.filter((game) => game.category === "เกมใหม่").slice(0, 6);
  return `<main class="home-v2-main"><div class="home-v2-content"><div class="home-v2-left">${homeV2AnnouncementHtml()}${homeV2HeroHtml()}${homeV2CategoryHtml()}${state.loggedIn ? `<div class="home-v2-member-mobile">${homeV2WalletHtml()}${homeV2QuickActionsHtml()}</div>` : `${homeV2GuestCtaHtml()}${homeV2QuickActionsHtml()}`}${homeV2GameSectionHtml("เกมแนะนำ", `${recommended.length ? `พบ ${recommended.length} เกม` : "ไม่พบเกม"}`, recommended, "home-v2-games")}${homeV2GameSectionHtml("สล็อตยอดนิยม", "เกมสล็อต mock", slots)}${homeV2GameSectionHtml("เกมใหม่", "รายการใหม่ใน lobby", newest)}${homeV2ProviderHtml()}</div>${homeV2RightPanelHtml()}</div>${homeV2BottomSectionsHtml()}${homeV2FooterHtml()}</main>`;
}
function homeV2PageHtml() {
  return `<div class="home-v2 home-v2-shell ${homeV2ModeClass()} ${state.loggedIn ? "home-v2-member" : "home-v2-guest"}">${homeV2HeaderHtml()}${homeV2MainHtml()}${homeV2MobileBottomNavHtml()}${drawerHtml()}</div>`;
}
function quickMenuHtml() {
  const memberItems = state.loggedIn
    ? `<button class="quick-menu-chip" data-action="open-profile">สมาชิก</button><button class="quick-menu-chip" data-action="open-wallet">กระเป๋า</button><button class="quick-menu-chip" data-action="open-promotions">โปรโมชั่น</button><button class="quick-menu-chip" data-action="service-toast">บริการ 24 ชม.</button>`
    : `<button class="quick-menu-chip" data-action="open-promotions">โปรโมชั่น</button><button class="quick-menu-chip" data-action="open-contact">ติดต่อเรา</button><button class="quick-menu-chip" data-action="service-toast">บริการ 24 ชม.</button>`;
  return `<div class="quick-menu ${state.quickMenuOpen ? "open" : ""}"><div class="quick-menu-inner">${memberItems}</div></div>`;
}
function headerHtml() {
  const menuLabel = state.quickMenuOpen ? "ย่อเมนูด่วน" : "ดูเมนูด่วน";
  if (state.loggedIn) {
    return `<header class="topbar"><div class="topbar-inner"><div class="topbar-card compact-header"><div class="top-row member-top-row"><button class="icon-btn" data-action="toggle-drawer">☰</button><div class="logo-pill">${brandLogoHtml("site-logo")}<span class="logo-wordmark">PG77</span></div>${apiStatusPillHtml()}<div class="member-mini"><span>${text(mock.user.username)}</span><strong>${money(mock.user.balance)}</strong></div><button class="icon-btn" data-action="refresh-wallet" ${state.loading.walletRefresh ? "disabled" : ""}>↻</button>${bellHtml("top-bell")}</div><div class="header-status-row"><div class="balance-box"><span class="balance-label">เพชร / แต้ม</span><span class="balance-value">${money(mock.user.diamonds)}</span></div><div class="balance-box"><span class="balance-label">เครดิต</span><span class="balance-value">${money(mock.user.creditDisplay)}</span></div><button class="quick-toggle" data-action="toggle-quick-menu">${text(menuLabel)} <span>${state.quickMenuOpen ? "⌃" : "⌄"}</span></button></div>${quickMenuHtml()}</div></div></header>`;
  }
  return `<header class="topbar"><div class="topbar-inner"><div class="topbar-card compact-header"><div class="top-row guest-top-row"><button class="icon-btn" data-action="toggle-drawer">☰</button><div class="logo-pill">${brandLogoHtml("site-logo")}<span class="logo-wordmark">PG77</span></div>${apiStatusPillHtml()}<button class="secondary-btn" data-action="open-login">เข้าสู่ระบบ</button><button class="primary-btn" data-action="open-register">สมัครสมาชิก</button>${bellHtml("top-bell")}</div><div class="header-status-row guest-status-row"><div class="guest-state-pill">ผู้เยี่ยมชม</div><button class="quick-toggle" data-action="toggle-quick-menu">${text(menuLabel)} <span>${state.quickMenuOpen ? "⌃" : "⌄"}</span></button></div>${quickMenuHtml()}</div></div></header>`;
}

function bannerHtml() { const item = mock.banners[state.activeBanner]; return `<section class="section"><div class="banner-stage"><div class="banner-slide" style="background:${item.bg}"><div class="banner-content"><div class="banner-tag">${text(item.tag)}</div><h1 class="banner-title">${text(item.title)}</h1><p class="banner-text">${text(item.text)}</p></div><div class="banner-meta"><div class="banner-dots">${mock.banners.map((banner, index) => `<button class="dot-btn ${index === state.activeBanner ? "active" : ""}" data-action="banner-${index}" aria-label="banner-${index + 1}"></button>`).join("")}</div><div class="carousel-nav"><button class="banner-arrow" data-action="banner-prev">←</button><button class="banner-arrow" data-action="banner-next">→</button></div></div></div></div></section>`; }

function categoriesHtml() { return `<section class="section section-card"><div class="section-head"><div><h2 class="section-title">หมวดเกม</h2><div class="section-subtitle">ค้นหาเกมหรือค่ายเกมจาก mock data</div></div></div><div class="category-row">${mock.categories.map((item) => `<button class="category-btn ${item === state.activeCategory ? "active" : ""}" data-action="category-${item}">${text(item)}</button>`).join("")}</div><div class="search-row"><div class="search-shell"><input class="search-input" data-field="search" value="${text(state.search)}" placeholder="ค้นหาเกมหรือค่ายเกม"></div><button class="mini-btn" data-action="clear-search" aria-label="clear-search">✕</button></div></section>`; }

function gamesHtml() { const games = currentGames(); return `<section class="section section-card"><div class="section-head"><div><h2 class="section-title">รายการเกม</h2><div class="section-subtitle">${games.length > 0 ? `พบ ${games.length} เกม` : "ไม่พบข้อมูล"}</div></div></div>${games.length > 0 ? `<div class="games-grid">${games.map((game, index) => `<article class="game-card"><div class="game-rank">${index + 1}</div><div class="game-thumb" style="--thumb-bg:${game.bg}"><div class="game-provider">${text(game.provider)}</div><div class="game-badge">${text(game.badge)}</div></div><div class="game-name">${text(game.name)}</div><div class="helper-text">โหมดเดโม่</div><div class="game-actions"><button class="secondary-btn" data-action="mock-toast">รายการโปรด</button><button class="primary-btn" data-action="play-game">เล่นเกม</button></div></article>`).join("")}</div>` : '<div class="empty-box">ไม่พบข้อมูล</div>'}</section>`; }

function guestPanelsHtml() { return `<section class="section section-card guest-home-panel"><div class="section-head"><div><h2 class="section-title">เข้าสู่ PG77 แบบผู้เยี่ยมชม</h2><div class="section-subtitle">ดู lobby เกม โปรโมชัน และข่าวสารได้โดยไม่ต้องเข้าสู่ระบบ</div></div></div><div class="guest-action-grid"><button class="primary-btn" data-action="open-register">สมัครสมาชิก</button><button class="secondary-btn" data-action="open-login">เข้าสู่ระบบ</button><button class="secondary-btn" data-action="open-promotions">ดูโปรโมชั่น</button></div></section>`; }
function memberPanelsHtml() { return `<div class="page-grid"><section class="section section-card"><div class="section-head"><div><h2 class="section-title">เมนูสมาชิก</h2><div class="section-subtitle">ทุกปุ่มที่ยังไม่ทำงานจริงจะใช้ toast หรือ modal mock</div></div></div><div class="menu-grid"><button class="menu-card" data-action="open-wallet"><div class="menu-title">กระเป๋า</div><div class="menu-desc">ดูเครดิต โปร และเมนูกิจกรรม</div></button><button class="menu-card" data-action="open-settings"><div class="menu-title">ตั้งค่า</div><div class="menu-desc">เสียงเพลง แอนิเมชัน และระดับเสียง</div></button><button class="menu-card" data-action="open-deposit-page"><div class="menu-title">ฝาก - ถอน</div><div class="menu-desc">เปิด flow ฝากเงินและถอนเงิน</div></button><button class="menu-card" data-action="open-promotions"><div class="menu-title">โปรโมชั่น</div><div class="menu-desc">รายการโปรโมชันตัวอย่าง</div></button><button class="menu-card" data-action="open-rebates"><div class="menu-title">รับยอดเสีย / คอมมิชชั่น</div><div class="menu-desc">ดูสิทธิ์รับยอดเสียและคอมมิชชั่น</div></button><button class="menu-card" data-action="open-revenue"><div class="menu-title">สร้างรายได้</div><div class="menu-desc">ลิงก์แนะนำเพื่อนและรายได้เครือข่าย</div></button></div></section><section class="section section-card"><div class="section-head"><div><h2 class="section-title">สถานะสมาชิก PG77</h2><div class="section-subtitle">ทุกข้อมูลเป็น mock data</div></div></div><div class="wallet-grid"><div class="stat-card"><div class="menu-title">Username</div><div class="menu-desc">${text(mock.user.username)}</div></div><div class="stat-card"><div class="menu-title">Ranking</div><div class="menu-desc">${text(mock.user.ranking)}</div></div><div class="stat-card"><div class="menu-title">เครดิต</div><div class="menu-desc">${money(mock.user.creditDisplay)}</div></div><div class="stat-card"><div class="menu-title">ยอดเงินคงเหลือ</div><div class="menu-desc">${money(mock.user.balance)}</div></div></div></section></div>`; }
function quickPanelsHtml() { return state.loggedIn ? memberPanelsHtml() : guestPanelsHtml(); }

function floatingHtml() { return `<div class="float-stack">${bellHtml("floating-bell")}<button class="float-btn" data-action="line-toast"><div class="float-label">LINE</div></button><button class="float-btn" data-action="tg-toast"><div class="float-label">TG</div></button>${state.loggedIn ? `<button class="float-btn wallet-float-btn" data-action="open-wallet"><div class="float-icon">👛</div><div class="float-label">กระเป๋า</div></button><button class="float-btn settings-float-btn" data-action="open-settings"><div class="float-icon">⚙️</div><div class="float-label">ตั้งค่า</div></button>` : ""}</div>`; }
function bottomHtml() { if (!state.loggedIn) return `<div class="bottom-dock guest-bottom"><div class="bottom-nav"><button class="bottom-btn active" data-action="bottom-home">หน้าหลัก</button><button class="bottom-btn" data-action="open-promotions">โปรโมชั่น</button><button class="bottom-btn center active" data-action="game-center">🎮</button><button class="bottom-btn" data-action="open-contact">ติดต่อ</button><button class="bottom-btn" data-action="open-login">Login</button></div></div>`; return `<div class="bottom-dock"><div class="bottom-nav"><button class="bottom-btn active" data-action="bottom-home">หน้าหลัก</button><button class="bottom-btn" data-action="open-deposit-bottom">ฝากเงิน</button><button class="bottom-btn center active" data-action="game-center">🎮</button><button class="bottom-btn" data-action="open-deposit-bottom">ถอนเงิน</button><button class="bottom-btn" data-action="open-wallet">กระเป๋า</button></div></div>`; }
function homePageHtml() { return `<div class="app-shell ${state.loggedIn ? "member-state" : "guest-state"} ${state.quickMenuOpen ? "quick-open" : ""}">${headerHtml()}<main class="page-wrap">${announcementHtml()}${bannerHtml()}${categoriesHtml()}${gamesHtml()}${quickPanelsHtml()}</main>${floatingHtml()}${bottomHtml()}${drawerHtml()}</div>`; }
function drawerIcon(label) {
  const icons = {
    "ฝาก - ถอน": "💳",
    "ข้อมูลโปรไฟล์": "👤",
    "ประวัติการใช้งาน": "🕘",
    "โปรโมชั่น": "🎁",
    "รับยอดเสีย": "🪙",
    "สร้างรายได้": "💼",
    "รับเครดิตฟรี": "🎁",
    "กรอกโค้ด": "🎟️",
    "กล่องสุ่ม": "📦",
    "กงล้อ": "🎡",
    "เช็คอิน": "📅",
    Ranking: "👑",
    "ร้านค้า": "🛍️",
    "ติดต่อเรา": "🎧",
    "เปลี่ยนภาษา": "🌐",
    "คู่มือ": "📘",
    "คู่มือการดาวน์โหลด": "⬇️",
    "ออกจากระบบ": "🚪",
    "เข้าสู่ระบบ": "🔐",
    "สมัครสมาชิก": "📝",
    "ติดต่อบริการ 24 ชั่วโมง": "🛟"
  };
  return icons[label] || "•";
}
function drawerLinkHtml(item) { return `<button class="side-link" data-action="drawer-item" data-item="${text(item)}"><span class="side-link-icon">${text(drawerIcon(item))}</span><span class="side-link-text">${text(item)}</span></button>`; }
function drawerSection(title, items) { return `<div class="side-section"><h3 class="side-title">${text(title)}</h3><div class="side-list">${items.map(drawerLinkHtml).join("")}</div></div>`; }

function drawerHtml() {
  if (!state.loggedIn) {
    return `<aside class="drawer ${state.drawerOpen ? "open" : ""}"><div class="drawer-panel"><div class="drawer-head"><div class="drawer-title">PG77 MENU</div><button class="icon-btn" data-action="close-drawer">✕</button></div><div class="drawer-card guest-drawer-card">${brandLogoHtml("modal-logo")}<div class="menu-title">ยังไม่ได้เข้าสู่ระบบ</div><div class="menu-desc">กดเข้าสู่ระบบหรือสมัครสมาชิกเพื่อดูเมนูสมาชิกเต็มรูปแบบ</div></div><div class="side-section"><div class="side-list"><button class="side-link" data-action="open-login"><span class="side-link-icon">🔐</span><span class="side-link-text">เข้าสู่ระบบ</span></button><button class="side-link" data-action="open-register"><span class="side-link-icon">📝</span><span class="side-link-text">สมัครสมาชิก</span></button><button class="side-link" data-action="service-toast"><span class="side-link-icon">🛟</span><span class="side-link-text">ติดต่อบริการ 24 ชั่วโมง</span></button></div></div></div></aside>`;
  }
  return `<aside class="drawer ${state.drawerOpen ? "open" : ""}"><div class="drawer-panel"><div class="drawer-head"><div class="drawer-title">PG77 MEMBER</div><button class="icon-btn" data-action="close-drawer">✕</button></div><div class="drawer-card member-drawer-card">${brandLogoHtml("modal-logo")}<div class="drawer-user"><div class="avatar-badge">👤</div><div><div class="menu-title">${text(mock.user.username)}</div><div class="menu-desc member-subline">Ranking: ${text(mock.user.ranking)}</div></div></div><div class="drawer-stats"><div class="drawer-stat"><span>ระดับ</span><strong>${text(mock.user.level)}</strong></div><div class="drawer-stat"><span>เครดิต</span><strong>${money(mock.user.creditDisplay)}</strong></div><div class="drawer-stat"><span>ยอดเงิน</span><strong>${money(mock.user.balance)}</strong></div><div class="drawer-stat"><span>เพชร/แต้ม</span><strong>${money(mock.user.diamonds)}</strong></div></div></div>${drawerSection("เมนูหลัก", ["ฝาก - ถอน", "ข้อมูลโปรไฟล์", "ประวัติการใช้งาน", "โปรโมชั่น"])}${drawerSection("รับรายได้", ["รับยอดเสีย", "สร้างรายได้"])}${drawerSection("กิจกรรมรับโชค", ["รับเครดิตฟรี", "กรอกโค้ด", "กล่องสุ่ม", "กงล้อ", "เช็คอิน", "Ranking", "ร้านค้า"])}${drawerSection("เพิ่มเติม", ["ติดต่อเรา", "เปลี่ยนภาษา", "คู่มือ", "คู่มือการดาวน์โหลด", "ออกจากระบบ"])}</div></aside>`;
}

function authTabsHtml() { return `<div class="auth-tabs"><button class="auth-toggle ${state.modalTabs.auth === "login" ? "active" : ""}" data-action="auth-login">เข้าสู่ระบบ</button><button class="auth-toggle ${state.modalTabs.auth === "register" ? "active" : ""}" data-action="auth-register">สมัครสมาชิก</button></div>`; }
function authIcon(name) {
  const icons = {
    phone: '<svg viewBox="0 0 24 24"><path d="M8 3.8h8a2 2 0 0 1 2 2v12.4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5.8a2 2 0 0 1 2-2Z"/><path d="M10 17.4h4"/></svg>',
    line: '<svg viewBox="0 0 24 24"><path d="M4 11.2C4 7.3 7.6 4.5 12 4.5s8 2.8 8 6.7-3.6 6.7-8 6.7h-.7L7.5 20v-3.3C5.4 15.5 4 13.5 4 11.2Z"/><path d="M8 10.2v3M11 10.2v3M14 10.2h2M14 13.2h2"/></svg>',
    telegram: '<svg viewBox="0 0 24 24"><path d="M20.5 4.5 3.7 11.1c-.7.3-.7 1.3.1 1.5l4.3 1.3 1.7 4.7c.2.7 1.1.8 1.5.2l2.4-3.2 4.2 3c.6.4 1.3.1 1.4-.6l2.3-12.5c.1-.7-.5-1.2-1.1-1Z"/><path d="m8.2 13.8 8.5-5.2-6.9 7.1"/></svg>',
    email: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m5 8 7 5 7-5"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 4.2 4.2L19 6.8"/></svg>'
  };
  return `<span class="auth-icon auth-icon-${text(name)}" aria-hidden="true">${icons[name] || icons.phone}</span>`;
}
function registerField(label, key, value, error) { const id = `${key}Input`; return `<div><label class="field-label" for="${text(id)}">${text(label)}</label><div class="field-shell"><input id="${text(id)}" class="field-input" data-field="${key}" value="${text(value)}" placeholder="${text(label)}"></div>${error ? `<div class="validation">${text(typeof error === "string" ? error : "กรุณากรอกข้อมูล")}</div>` : ""}</div>`; }
function registerPasswordField(key = "registerPassword", label = "รหัสผ่าน", error = state.errors.register.password) { const id = `${key}Input`; return `<div><label class="field-label" for="${text(id)}">${text(label)}</label><div class="field-shell field-input-wrap"><input id="${text(id)}" class="field-input" type="${state.form.registerReveal ? "text" : "password"}" data-field="${text(key)}" value="${text(state.form[key])}" placeholder="${text(label)}"><button class="field-toggle" type="button" data-action="toggle-register-reveal">${state.form.registerReveal ? "ซ่อน" : "แสดง"}</button></div>${validationText(error)}</div>`; }
function selectField(label, key, value, options, error) { const id = `${key}Input`; return `<div><label class="field-label" for="${text(id)}">${text(label)}</label><div class="select-shell"><select id="${text(id)}" class="select-input" data-field="${key}"><option value="">${text(label)}</option>${options.map((item) => `<option value="${text(item)}" ${item === value ? "selected" : ""}>${text(item)}</option>`).join("")}</select></div>${error ? `<div class="validation">${text(typeof error === "string" ? error : "กรุณากรอกข้อมูล")}</div>` : ""}</div>`; }
function amountInputField(label, key, value) { return `<div><label class="field-label">${text(label)}</label><div class="field-shell field-input-wrap"><input class="field-input" inputmode="numeric" data-field="${key}" value="${text(value)}" placeholder="${text(label)}"><span class="input-suffix">บาท</span></div></div>`; }
function amountButtons(field) { const values = field === "qrAmount" ? depositData().qrQuickAmounts : depositData().quickAmounts; return `<div class="amount-grid">${values.map((item) => `<button class="amount-btn ${state.form[field] === item ? "active" : ""}" data-action="amount-pick" data-field-key="${field}" data-value="${item}">${Number(item).toLocaleString("en-US")}</button>`).join("")}</div>`; }
function depositAmountBlock(field, label, error) { return `${amountInputField(label, field, state.form[field])}${error ? `<div class="validation">${text(error)}</div>` : ""}${amountButtons(field)}`; }
function authErrorSummary(errors) {
  const messages = Object.values(errors || {}).filter(Boolean).map((item) => typeof item === "string" ? item : "กรุณากรอกข้อมูลให้ครบ");
  return messages.length ? `<div class="auth-error-summary"><strong>ตรวจสอบข้อมูล</strong><span>${text(messages[0])}${messages.length > 1 ? ` และอีก ${messages.length - 1} รายการ` : ""}</span></div>` : "";
}
function authSocialButtonsHtml(prefix = "login-social") {
  return `<div class="auth-social-row"><button class="auth-social-button" data-action="${text(prefix)}" data-method="line">${authIcon("line")}<span>LINE</span></button><button class="auth-social-button" data-action="${text(prefix)}" data-method="telegram">${authIcon("telegram")}<span>Telegram</span></button><button class="auth-social-button" data-action="${text(prefix)}" data-method="email">${authIcon("email")}<span>Email</span></button></div>`;
}
function registerStepperHtml() {
  const steps = [["1", "วิธีสมัคร"], ["2", "ข้อมูลบัญชี"], ["3", "ยืนยัน"]];
  return `<div class="auth-stepper">${steps.map(([index, label]) => `<div class="auth-step ${state.registerStep === Number(index) ? "active" : ""} ${state.registerStep > Number(index) ? "done" : ""}"><span>${text(index)}</span><strong>${text(label)}</strong></div>`).join("")}</div>`;
}
function registerMethodsHtml() {
  const methods = [
    ["phone", "สมัครด้วยเบอร์โทรศัพท์", "ใช้เบอร์โทรและตั้งรหัสผ่าน", "phone"],
    ["line", "สมัครด้วย LINE", "เชื่อมต่อ LINE mock", "line"],
    ["telegram", "สมัครด้วย Telegram", "เชื่อมต่อ Telegram mock", "telegram"],
    ["email", "สมัครด้วย Email", "ใช้อีเมลและตั้งรหัสผ่าน", "email"]
  ];
  return `<div class="auth-method-grid">${methods.map(([id, title, desc, icon]) => `<button class="auth-method-card ${state.registerMethod === id ? "active" : ""}" data-action="register-method" data-method="${text(id)}">${authIcon(icon)}<strong>${text(title)}</strong><span>${text(desc)}</span></button>`).join("")}</div>`;
}
function registerConnectBox(method, connected) {
  const label = method === "line" ? "LINE" : "Telegram";
  return `<div class="auth-connect-card ${connected ? "connected" : ""}"><div>${authIcon(method)}<div><strong>เชื่อมต่อ ${text(label)} mock</strong><span>${connected ? "เชื่อมต่อ mock แล้ว" : "กดปุ่มเพื่อจำลองการเชื่อมต่อ"}</span></div></div><button class="${connected ? "secondary-btn" : "primary-btn"}" data-action="register-connect-${text(method)}">${connected ? "เชื่อมต่อแล้ว" : `เชื่อมต่อ ${text(label)}`}</button>${validationText(state.errors.register[method])}</div>`;
}
function registerStepOneHtml() {
  return `<div class="auth-wizard-body">${authErrorSummary(state.errors.register)}<div class="auth-step-title"><h4>เลือกวิธีสมัคร</h4><p>ทุกช่องทางเป็น mock สำหรับเดโม่เท่านั้น</p></div>${registerMethodsHtml()}</div>`;
}
function registerStepTwoHtml() {
  const errors = state.errors.register;
  const identity = state.registerMethod === "email"
    ? registerField("Email *", "registerEmail", state.form.registerEmail, errors.email)
    : state.registerMethod === "line"
      ? registerConnectBox("line", state.registerLineConnected)
      : state.registerMethod === "telegram"
        ? registerConnectBox("telegram", state.registerTelegramConnected)
        : registerField("เบอร์โทรศัพท์ *", "registerPhone", state.form.registerPhone, errors.phone);
  return `<div class="auth-wizard-body">${authErrorSummary(errors)}<div class="auth-step-title"><h4>ข้อมูลบัญชี</h4><p>ช่องทาง: ${text(registerMethodLabel())}</p></div><div class="auth-form-grid compact">${identity}${registerPasswordField("registerPassword", "รหัสผ่าน *", errors.password)}${registerPasswordField("registerConfirmPassword", "ยืนยันรหัสผ่าน *", errors.confirmPassword)}</div></div>`;
}
function registerStepThreeHtml() {
  const errors = state.errors.register;
  const reviewRows = [
    ["ช่องทางสมัคร", registerMethodLabel()],
    ["ข้อมูลติดต่อ", registerIdentityValue() || "-"],
    ["ธนาคาร", state.form.registerBank || "-"],
    ["ชื่อบัญชี", state.form.registerName || "-"],
    ["โบนัส", state.form.registerBonus || "-"]
  ];
  return `<div class="auth-wizard-body">${authErrorSummary(errors)}<div class="auth-step-title"><h4>บัญชีธนาคาร + ยืนยัน</h4><p>ตรวจสอบข้อมูลก่อนสมัครสมาชิก</p></div><div class="auth-form-grid">${selectField("เลือกธนาคารของคุณ *", "registerBank", state.form.registerBank, depositData().banks.map((item) => item.split(" ")[0]), errors.bank)}${registerField("เลขบัญชีธนาคาร *", "registerAccount", state.form.registerAccount, errors.account)}${registerField("ชื่อ - นามสกุล *", "registerName", state.form.registerName, errors.name)}${selectField("รู้จักเราจากช่องทางไหน *", "registerSource", state.form.registerSource, ["YOUTUBE", "เพื่อนแนะนำมา", "ป้ายโฆษณาตามเว็บ", "FACEBOOK", "GOOGLE"], errors.source)}<div><label class="field-label">รับโบนัส</label><div class="radio-row"><label class="radio-chip ${state.form.registerBonus === "รับโบนัส" ? "active" : ""}"><input type="radio" name="registerBonus" data-field="registerBonus" value="รับโบนัส" ${state.form.registerBonus === "รับโบนัส" ? "checked" : ""}> รับโบนัส</label><label class="radio-chip ${state.form.registerBonus === "ไม่รับโบนัส" ? "active" : ""}"><input type="radio" name="registerBonus" data-field="registerBonus" value="ไม่รับโบนัส" ${state.form.registerBonus === "ไม่รับโบนัส" ? "checked" : ""}> ไม่รับโบนัส</label></div></div><div class="auth-accept-row"><div class="auth-check-line"><input id="registerAccepted" type="checkbox" data-field="registerAccepted" ${state.form.registerAccepted ? "checked" : ""}><label for="registerAccepted">ยอมรับเงื่อนไขในการสมัครสมาชิก *</label></div>${validationText(errors.accepted)}</div></div><div class="auth-review-card"><h4>Review summary</h4>${reviewRows.map(([label, value]) => `<div><span>${text(label)}</span><strong>${text(value)}</strong></div>`).join("")}</div></div>`;
}
function registerWizardHtml() {
  const body = state.registerStep === 1 ? registerStepOneHtml() : state.registerStep === 2 ? registerStepTwoHtml() : registerStepThreeHtml();
  const back = state.registerStep > 1 ? `<button class="secondary-btn" data-action="register-back">ย้อนกลับ</button>` : "";
  const next = state.registerStep < 3 ? `<button class="auth-submit" data-action="register-next">ถัดไป</button>` : `<button class="${state.loading.register ? "disabled-btn" : "auth-submit"}" data-action="submit-register" ${state.loading.register ? "disabled" : ""}>${state.loading.register ? "กำลังสมัคร..." : "ยืนยันสมัครสมาชิก"}</button>`;
  return `<div class="auth-wizard">${registerStepperHtml()}${body}<div class="auth-wizard-footer">${back}${next}</div></div>`;
}
function authModalHtml() {
  const tabs = authTabsHtml();
  if (state.modalTabs.auth === "login") {
    return modalShell("เข้าสู่ระบบ", `${tabs}<div class="auth-brand">${brandLogoHtml("modal-logo")}<div class="auth-title">PG77</div></div><div class="auth-panel field-stack">${authErrorSummary(state.errors.login)}<div><label class="field-label" for="loginPhoneInput">เบอร์โทรศัพท์ / Email</label><div class="field-shell"><input id="loginPhoneInput" class="field-input" data-field="loginPhone" value="${text(state.form.loginPhone)}" placeholder="กรอกเบอร์โทรศัพท์หรือ Email"></div>${fieldError(state.errors.login, "phone")}</div><div><label class="field-label" for="loginPasswordInput">รหัสผ่าน</label><div class="field-shell field-input-wrap"><input id="loginPasswordInput" class="field-input" type="${state.form.loginReveal ? "text" : "password"}" data-field="loginPassword" value="${text(state.form.loginPassword)}" placeholder="กรอกรหัสผ่าน"><button class="field-toggle" type="button" data-action="toggle-login-reveal">${state.form.loginReveal ? "ซ่อน" : "แสดง"}</button></div>${fieldError(state.errors.login, "password")}</div><div class="checkbox-row"><div class="auth-check-line"><input id="loginRemember" type="checkbox" data-field="loginRemember" ${state.form.loginRemember ? "checked" : ""}><label for="loginRemember">จดจำฉันไว้ในระบบ</label></div><button class="link-btn" type="button" data-action="forgot-password">ลืมรหัสผ่าน?</button></div><button class="${state.loading.login ? "disabled-btn" : "auth-submit"}" data-action="submit-login" ${state.loading.login ? "disabled" : ""}>${state.loading.login ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button><button class="secondary-btn demo-login-btn" type="button" data-action="demo-member-login">เข้าสู่ระบบเดโม่</button><div class="demo-login-hint">Demo: 0800000000 / 123456</div><div class="auth-divider"><span>ช่องทางอื่นยังเป็น mock</span></div>${authSocialButtonsHtml("login-social")}<div class="helper-text">พบปัญหา ติดต่อฝ่ายบริการลูกค้า</div></div>`, { panelClass: "auth-modal-panel" });
  }
  return modalShell("สมัครสมาชิก", `${tabs}<div class="auth-brand auth-brand-compact">${brandLogoHtml("modal-logo")}<div><div class="auth-title">PG77</div><div class="helper-text">Register Wizard mock</div></div></div>${registerWizardHtml()}`, { panelClass: "auth-modal-panel auth-register-panel" });
}

function depositTabsHtml() { return `<div class="deposit-top-tabs"><button class="auth-toggle ${state.modalTabs.deposit === "deposit" ? "active" : ""}" data-action="deposit-tab">ฝากเงิน</button><button class="auth-toggle ${state.modalTabs.deposit === "withdraw" ? "active" : ""}" data-action="withdraw-tab">ถอนเงิน</button></div>`; }
function depositPromoField() { const options = [...depositData().promotions]; if (state.selectedPromotionId && !options.includes(state.form.depositPromo)) options.push(state.form.depositPromo); return selectField("โปรโมชั่น", "depositPromo", state.form.depositPromo, options, false); }
function depositBackAction() { return state.depositEntry === "drawer" ? "deposit-back-drawer" : "close-modal"; }
function depositMethodTestId(id) { return `deposit-method-${text(id)}`; }
function normalizeDepositMethodId(id) {
  const aliases = { qr: "qr-pay", wallet: "truemoney-wallet", gift: "true-wallet-gift", confirm: "confirm-deposit" };
  return aliases[id] || id || "auto";
}
function currentDepositMethod() { const methodId = normalizeDepositMethodId(state.selectedDepositMethod); return depositData().depositMethods.find((item) => item.id === methodId) || depositData().depositMethods[0]; }
function depositAccountsForMethod(methodId = state.selectedDepositMethod) { const normalized = normalizeDepositMethodId(methodId); return depositData().depositAccounts.filter((account) => account.methods.includes(normalized)); }
function selectedDepositAccount() { return depositData().depositAccounts.find((account) => account.id === state.selectedDepositAccount) || depositAccountsForMethod()[0] || null; }
function sectionTitle(label, sub = "") { return `<div class="deposit-section-head"><h4>${text(label)}</h4>${sub ? `<span>${text(sub)}</span>` : ""}</div>`; }

function amountButtons(field) {
  const values = field === "qrAmount" ? depositData().qrQuickAmounts : depositData().quickAmounts;
  return `<div class="amount-chip-row">${values.map((item) => `<button class="amount-chip ${state.form[field] === item ? "active" : ""}" data-action="amount-pick" data-field-key="${field}" data-value="${text(item)}">${Number(item).toLocaleString("en-US")}</button>`).join("")}</div>`;
}

function depositAmountBlock(field, label, error) { return `${amountInputField(label, field, state.form[field])}${error ? `<div class="validation">${text(error)}</div>` : ""}${amountButtons(field)}`; }

function depositMethodCarouselHtml() {
  const items = depositData().depositMethods;
  return `<section class="deposit-section">${sectionTitle("ช่องทางแนะนำ", "เลื่อนเพื่อเลือกช่องทาง")}<div class="method-carousel" data-testid="deposit-method-list">${items.map((item) => `<button type="button" class="method-card ${state.selectedDepositMethod === item.id ? "active" : ""}" data-action="select-deposit-method" data-method="${text(item.id)}" data-testid="${depositMethodTestId(item.id)}" aria-pressed="${state.selectedDepositMethod === item.id ? "true" : "false"}"><div class="method-card-top"><span class="method-icon">${text(item.icon)}</span><span class="method-badge">${text(item.badge)}</span></div><strong>${text(item.label)}</strong><p>${text(item.text)}</p><div class="method-status ${item.status === "เปิดใช้งาน" ? "success" : "mock"}">${text(item.status)}</div></button>`).join("")}</div></section>`;
}

function depositAccountCarouselHtml() {
  const accounts = depositAccountsForMethod();
  if (!accounts.length) return `<section class="deposit-section">${sectionTitle("บัญชี / Payment ที่สะดวกที่สุด", "ตามช่องทางที่เลือก")}<div class="notice-alert danger">ไม่มีบัญชีที่สามารถทำรายการได้ในตอนนี้</div></section>`;
  return `<section class="deposit-section">${sectionTitle("บัญชี / Payment ที่สะดวกที่สุด", "เลือกบัญชีรับฝาก mock")}<div class="account-carousel">${accounts.map((account) => `<article class="account-card ${state.selectedDepositAccount === account.id ? "active" : ""}"><div class="account-card-head"><div><span>${text(account.bank)}</span><strong>${text(account.owner)}</strong></div><em>${text(account.badge)}</em></div><div class="account-number">${text(account.masked)}</div><div class="account-actions"><button class="secondary-btn" data-action="copy-deposit-account" data-account="${text(account.id)}">คัดลอก</button><button class="primary-btn" data-action="select-deposit-account" data-account="${text(account.id)}">เลือกบัญชีนี้</button></div></article>`).join("")}</div></section>`;
}

function depositAutoFormHtml(method) {
  const amount = Number(state.form.depositAmount || "0");
  const canSubmit = Number.isFinite(amount) && amount > 0;
  const action = method.id === "decimal" ? "submit-decimal" : "submit-auto-deposit";
  const decimalNote = method.id === "decimal" ? `<div class="info-strip decimal-preview"><strong>ยอดโอนทศนิยม mock: ${decimalTransferAmount(state.form.depositAmount)}</strong><span>ใช้ยอดนี้สำหรับตรวจฝากแบบ mock</span></div>` : "";
  const enabled = canSubmit && !state.loading.depositSubmit;
  return `${depositPromoField()}${turnoverBar()}${depositAmountBlock("depositAmount", "จำนวนเงิน", state.errors.depositAmount)}<div class="deposit-limit-text">ฝากขั้นต่ำ 1.00 บาท ฝากสูงสุด 2,000.00 บาท</div>${decimalNote}<button class="${enabled ? "auth-submit" : "disabled-btn"}" data-action="${action}" ${enabled ? "" : "disabled"}>${state.loading.depositSubmit ? "กำลังสร้างรายการ..." : "ยืนยันฝากเงิน"}</button>`;
}

function qrHistoryHtml() {
  const rows = depositData().qrHistory;
  return `<div class="qr-history-card"><div class="menu-title">ประวัติการฝาก QR PAY</div>${rows.length ? rows.map((item) => `<div class="table-row"><span>${text(item.datetime)}</span><strong>${money(item.amount)}</strong></div>`).join("") : '<div class="empty-box">ไม่มีข้อมูล</div>'}</div>`;
}

function depositQrFormHtml() {
  const amount = Number(state.form.qrAmount || "0");
  const canSubmit = state.form.qrPayment && state.form.qrAccount && Number.isFinite(amount) && amount > 0 && !state.loading.depositSubmit;
  return `${depositPromoField()}${selectField("เลือก Payment", "qrPayment", state.form.qrPayment, depositData().paymentOptions, false)}${selectField("เลือกบัญชี", "qrAccount", state.form.qrAccount, ["BIO"], false)}${amountInputField("จำนวนเงิน", "qrAmount", state.form.qrAmount)}${amountButtons("qrAmount")}${state.errors.qr ? `<div class="validation">${text(state.errors.qr)}</div>` : ""}<button class="${canSubmit ? "auth-submit" : "disabled-btn"}" data-action="submit-qr" ${canSubmit ? "" : "disabled"}>ไปยัง PAYMENT เพื่อสแกน</button>${qrHistoryHtml()}`;
}

function walletUnavailableFormHtml() {
  return `${depositPromoField()}<div class="notice-alert danger">ไม่มีบัญชีที่สามารถทำรายการได้ในตอนนี้</div><button class="line-btn" data-action="line-bot-toast">ไลน์บอทแจ้งเตือน</button><button class="link-btn" data-action="mock-toast">ฟีเจอร์นี้เป็น mock</button><button class="link-btn" data-action="rules-toast">อ่านกฎกติกา</button>`;
}

function giftFormHtml() {
  const hasGift = state.form.giftCode.trim().length > 0;
  return `${depositPromoField()}<div><label class="field-label">ซองของขวัญ</label><div class="field-shell"><input class="field-input" data-field="giftCode" value="${text(state.form.giftCode)}" placeholder="วางลิงก์ซองของขวัญ"></div>${validationText(state.errors.gift)}</div><button class="${hasGift ? "auth-submit" : "disabled-btn"}" data-action="submit-gift" ${hasGift ? "" : "disabled"}>ยืนยันรับยอด</button>`;
}

function slipFormHtml() {
  return `<div class="notice-alert warning">ใช้ในกรณีที่ธนาคารมีปัญหาหรือยอดฝากไม่เข้า</div><div>${selectField("เลือกบัญชีธนาคารของท่าน", "slipOwnBank", state.form.slipOwnBank, depositData().banks, false)}${validationText(state.errors.slip.ownBank)}</div><div>${selectField("เลือกบัญชีธนาคารที่ฝากเงินเข้า", "slipTargetBank", state.form.slipTargetBank, depositData().depositTargets, false)}${validationText(state.errors.slip.targetBank)}</div>${depositAmountBlock("slipAmount", "จำนวนเงิน", state.errors.slip.amount)}<div><label class="field-label">อัปโหลดสลิป</label><div class="upload-shell">อัปโหลดสลิป mock ${state.form.slipUploaded ? "<br>อัปโหลดแล้ว" : ""}</div>${validationText(state.errors.slip.file)}</div><div class="inline-actions"><button class="secondary-btn" data-action="upload-slip">อัปโหลดสลิป</button><button class="${state.loading.depositSubmit ? "disabled-btn" : "auth-submit"}" data-action="submit-slip" ${state.loading.depositSubmit ? "disabled" : ""}>${state.loading.depositSubmit ? "กำลังสร้างรายการ..." : "ยืนยันยอดฝาก"}</button></div>`;
}

function confirmFormHtml() {
  return `<div class="notice-alert warning">ใช้ในกรณีที่ธนาคารมีปัญหาหรือยอดฝากไม่เข้า</div><div>${selectField("เลือกบัญชีธนาคารของท่าน", "confirmOwnBank", state.form.confirmOwnBank, depositData().banks, false)}${validationText(state.errors.confirm.ownBank)}</div><div>${selectField("เลือกบัญชีธนาคารที่ฝากเงินเข้า", "confirmTargetBank", state.form.confirmTargetBank, depositData().depositTargets, false)}${validationText(state.errors.confirm.targetBank)}</div>${amountInputField("จำนวนเงินตามสลิป", "confirmAmount", state.form.confirmAmount)}${validationText(state.errors.confirm.amount)}<div><label class="field-label">วันที่ทำรายการฝาก</label><div class="select-shell"><input class="date-input" type="date" data-field="confirmDate" value="${text(state.form.confirmDate)}"></div>${validationText(state.errors.confirm.date)}</div><button class="auth-submit" data-action="submit-confirm">ยืนยันยอดฝาก</button><button class="link-btn" data-action="rules-toast">อ่านกฎกติกา</button>`;
}

function depositFormPanelHtml() {
  const method = currentDepositMethod();
  const form = method.id === "qr-pay" ? depositQrFormHtml() : method.id === "truemoney-wallet" ? walletUnavailableFormHtml() : method.id === "true-wallet-gift" ? giftFormHtml() : method.id === "slip" ? slipFormHtml() : method.id === "confirm-deposit" ? confirmFormHtml() : depositAutoFormHtml(method);
  return `<section class="deposit-section">${sectionTitle(`ฟอร์มฝากเงิน: ${method.label}`, method.text)}<div class="deposit-form-panel field-stack">${form}<div class="deposit-action-footer"><button class="link-btn" type="button" data-action="mock-toast">ฟีเจอร์นี้เป็น mock</button></div></div></section>`;
}

function depositMainHtml() {
  return `${depositTabsHtml()}<div class="deposit-hub">${depositMethodCarouselHtml()}${depositAccountCarouselHtml()}${depositFormPanelHtml()}</div>`;
}

function updateDepositModalBody() {
  const panel = document.querySelector(".deposit-modal-panel");
  const content = panel ? panel.querySelector(".modal-content") : null;
  if (!content) { render(); return; }
  content.innerHTML = state.modalTabs.deposit === "withdraw" ? withdrawHtml() : depositMainHtml();
}

function selectDepositMethod(element) {
  const methodId = normalizeDepositMethodId(element.getAttribute("data-method"));
  state.modalTabs.deposit = "deposit";
  state.modalTabs.depositView = "main";
  state.selectedDepositMethod = methodId;
  const account = depositAccountsForMethod(methodId)[0];
  state.selectedDepositAccount = account ? account.id : "";
  state.errors.depositAmount = "";
  state.errors.walletAmount = "";
  state.errors.qr = "";
  state.errors.slip = {};
  state.errors.gift = "";
  state.errors.confirm = {};
  updateDepositModalBody();
  const next = document.querySelector(`[data-testid="${depositMethodTestId(methodId)}"]`);
  if (next) {
    next.setAttribute("aria-pressed", "true");
    next.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
  }
}

function depositMethodFromCarouselPoint(carousel, clientX) {
  const x = clientX - carousel.getBoundingClientRect().left + carousel.scrollLeft;
  return Array.from(carousel.querySelectorAll("[data-action='select-deposit-method']")).find((button) => {
    const left = button.offsetLeft;
    return x >= left && x <= left + button.offsetWidth;
  }) || null;
}

function withdrawAccountCarouselHtml() {
  if (!depositData().withdrawAccounts.length) return `<section class="deposit-section">${sectionTitle("บัญชีถอนของคุณ", "เลือกบัญชีปลายทาง")}<div class="empty-box">ไม่พบข้อมูล</div></section>`;
  return `<section class="deposit-section">${sectionTitle("บัญชีถอนของคุณ", "เลือกบัญชีปลายทาง")}<div class="account-carousel withdraw-account-carousel">${depositData().withdrawAccounts.map((account) => `<button class="account-card withdraw-account-card ${state.selectedWithdrawAccount === account.id ? "active" : ""}" data-action="select-withdraw-account" data-account="${text(account.id)}"><div class="account-card-head"><div><span>${text(account.bank)}</span><strong>${text(account.owner)}</strong></div><em>${text(account.badge)}</em></div><div class="account-number">${text(account.masked)}</div></button>`).join("")}</div></section>`;
}

function withdrawHtml() {
  const canWithdraw = mock.user.balance >= depositData().withdrawMin;
  const selected = depositData().withdrawAccounts.find((account) => account.id === state.selectedWithdrawAccount) || depositData().withdrawAccounts[0];
  const options = depositData().withdrawAccounts.map((account) => `${account.bank} / ${account.owner} / ${account.masked}`);
  if (selected) state.form.withdrawAccount = `${selected.bank} / ${selected.owner} / ${selected.masked}`;
  const amount = Number(state.form.withdrawAmount || "0");
  const amountOverWallet = state.form.withdrawAmount.trim() && Number.isFinite(amount) && amount > mock.user.balance;
  const canSubmit = canWithdraw && Boolean(selected) && !state.loading.withdrawSubmit && !amountOverWallet;
  const noApprovedMessage = "ยังไม่มีบัญชีธนาคารที่อนุมัติ กรุณาให้ Backoffice อนุมัติก่อน";
  const bankError = selected ? "" : `<div class="validation">${noApprovedMessage}</div>`;
  const validation = state.errors.withdraw || (amountOverWallet ? "จำนวนเงินมากกว่าเครดิต" : "");
  const accountSelect = `<div><label class="field-label" for="withdrawAccountInput">ถอนเข้าบัญชี</label><div class="select-shell"><select id="withdrawAccountInput" class="select-input" data-field="withdrawAccount" ${selected ? "" : "disabled"}><option value="">ถอนเข้าบัญชี</option>${options.map((item) => `<option value="${text(item)}" ${item === state.form.withdrawAccount ? "selected" : ""}>${text(item)}</option>`).join("")}</select></div></div>`;
  return `${depositTabsHtml()}<div class="withdraw-hub">${withdrawAccountCarouselHtml()}<section class="deposit-section"><div class="withdraw-condition-card field-stack">${turnoverBar()}${!selected ? `<div class="notice-alert danger">${noApprovedMessage}</div>` : canWithdraw ? '<div class="notice-alert success">พร้อมส่งคำขอถอนเงินผ่าน Backend dev</div>' : '<div class="notice-alert danger">คุณไม่ผ่านเงื่อนไขการถอนเงิน ต้องมีเครดิตมากกว่า 20.00 บาท</div>'}<div class="withdraw-balance-grid"><div><span>ยอดถอนได้</span><strong>${money(canWithdraw ? mock.user.balance : 0)}</strong></div><div><span>เครดิตคงเหลือ</span><strong>${money(mock.user.balance)}</strong></div></div></div></section><section class="deposit-section">${sectionTitle("ฟอร์มถอน", "Backend dev")}<div class="deposit-form-panel field-stack">${accountSelect}${bankError}<div><label class="field-label">จำนวนเงินถอน</label><div class="field-shell field-input-wrap"><input class="field-input" inputmode="numeric" data-field="withdrawAmount" value="${text(state.form.withdrawAmount)}" placeholder="จำนวนเงินถอน" ${selected && !state.loading.withdrawSubmit ? "" : "disabled"}><span class="input-suffix">บาท</span></div></div><div><label class="field-label">หมายเหตุ</label><div class="field-shell"><input class="field-input" data-field="withdrawNote" value="${text(state.form.withdrawNote)}" placeholder="หมายเหตุ" ${selected && !state.loading.withdrawSubmit ? "" : "disabled"}></div></div>${validation ? `<div class="validation">${text(validation)}</div>` : ""}<button class="${canSubmit ? "auth-submit" : "disabled-btn"}" data-action="submit-withdraw" ${canSubmit ? "" : "disabled"}>${state.loading.withdrawSubmit ? "กำลังส่งคำขอ..." : "ส่งคำขอถอนเงิน"}</button><button class="link-btn" data-action="rules-toast">อ่านกฎกติกา</button></div></section></div>`;
}

function depositModalHtml() { return modalShell("ฝาก - ถอน", state.modalTabs.deposit === "withdraw" ? withdrawHtml() : depositMainHtml(), { backAction: depositBackAction(), panelClass: "mobile-sheet deposit-modal-panel" }); }
function transactionSummaryRows(item, rows) { return `<div class="success-summary">${rows.map(([label, value, status]) => `<div class="success-row"><span>${text(label)}</span><strong class="${status ? "status-pill success" : ""}">${text(value)}</strong></div>`).join("")}</div>`; }
function depositSuccessModalHtml() { const item = state.lastDeposit || { channel: "ฝากเงินออโต้", amount: 0, promo: state.form.depositPromo, datetime: nowText(), status: "pending" }; const note = String(item.status || "").includes("mock") ? "รายการนี้เป็น mock" : "รอแอดมินอนุมัติ"; return modalShell("สร้างรายการฝากสำเร็จ", `<div class="modal-block field-stack success-modal-card"><div class="success-icon">✓</div>${transactionSummaryRows(item, [["ช่องทาง", item.channel], ["จำนวนเงิน", money(item.amount)], ["โปรโมชั่นที่เลือก", item.promo || "ไม่รับโปรโมชั่น"], ["วันที่ทำรายการ", item.datetime], ["สถานะ", item.status, true], ["หมายเหตุ", note]])}<div class="inline-actions"><button class="secondary-btn" data-action="close-modal">ปิด</button><button class="primary-btn" data-action="view-deposit-history">ดูประวัติฝาก</button></div></div>`); }
function depositTicketModalHtml() { const item = state.lastDepositTicket || { ref: "SLIP-20260507-001", title: "ส่งรายการฝากแนบสลิปสำเร็จ mock", channel: "ฝากแนบสลิป", customerAccount: "-", targetAccount: "-", amount: 0, datetime: nowText(), status: "รอตรวจสอบ", message: "แอดมินจะตรวจสอบรายการจากสลิป" }; return modalShell(item.title, `<div class="modal-block field-stack success-modal-card"><div class="success-icon">✓</div>${transactionSummaryRows(item, [["เลขที่รายการ", item.ref], ["ช่องทาง", item.channel], ["บัญชีลูกค้า", item.customerAccount], ["บัญชีที่ฝากเข้า", item.targetAccount], ["จำนวนเงิน", money(item.amount)], ["สถานะ", item.status, true], ["วันที่ทำรายการ", item.datetime], ["ข้อความ", item.message]])}<div class="inline-actions"><button class="secondary-btn" data-action="close-modal">ปิด</button><button class="primary-btn" data-action="view-deposit-history">ดูประวัติฝาก</button></div></div>`); }
function giftSuccessModalHtml() { const item = state.lastGiftDeposit || { ref: "GIFT-20260507-001", amount: 100, datetime: nowText(), status: "สำเร็จ mock" }; return modalShell("รับยอดจาก True Wallet Gift สำเร็จ mock", `<div class="modal-block field-stack success-modal-card"><div class="success-icon">✓</div>${transactionSummaryRows(item, [["เลขที่รายการ", item.ref], ["ช่องทาง", "True Wallet Gift"], ["จำนวนเงิน", money(item.amount)], ["สถานะ", item.status, true], ["วันที่ทำรายการ", item.datetime]])}<div class="inline-actions"><button class="secondary-btn" data-action="close-modal">ปิด</button><button class="primary-btn" data-action="view-deposit-history">ดูประวัติฝาก</button></div></div>`); }
function withdrawSuccessModalHtml() { const item = state.lastWithdraw || { account: depositData().bank, amount: 0, datetime: nowText(), status: "รอตรวจสอบ" }; return modalShell("สร้างรายการถอนสำเร็จ", `<div class="modal-block field-stack success-modal-card"><div class="success-icon">✓</div>${transactionSummaryRows(item, [["จำนวนเงิน", money(item.amount)], ["บัญชีถอน", item.account], ["สถานะ", item.status, true], ["วันที่ทำรายการ", item.datetime]])}<div class="inline-actions"><button class="secondary-btn" data-action="close-modal">ปิด</button><button class="primary-btn" data-action="view-withdraw-history">ดูประวัติถอน</button></div></div>`); }
function qrPaymentModalHtml() { const amount = Number(state.form.qrAmount || "0"); return modalShell("QR PAY mock", `<div class="modal-block field-stack qr-modal-card"><div class="qr-placeholder">QR<br>MOCK</div>${transactionSummaryRows(null, [["จำนวนเงิน", money(amount)], ["หมายเลขรายการ", state.qrPaymentRef || "QR-MOCK"], ["เวลาหมดอายุ", "10 นาที"]])}<div class="inline-actions"><button class="${state.loading.depositSubmit ? "disabled-btn" : "primary-btn"}" data-action="simulate-qr-paid" ${state.loading.depositSubmit ? "disabled" : ""}>${state.loading.depositSubmit ? "กำลังสร้างรายการ..." : "จำลองชำระสำเร็จ"}</button><button class="secondary-btn" data-action="close-modal">ปิด</button></div></div>`); }

function bankCardHtml(account) { const status = bankStatusLabel(account.rawStatus || account.status); return `<div class="bank-card"><div class="bank-card-head"><div class="menu-title">${text(account.bank)}</div><span class="status-pill ${statusPillClass(status)}">${text(status)}</span></div><div class="menu-desc">${text(account.owner)}</div><div class="helper-text">${text(account.number || account.masked)}</div></div>`; }
function isLocalDebugHost() {
  return ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
}
function localDebugInfoHtml() {
  if (!isLocalDebugHost()) return "";
  const phone = state.member.phone || mock.user.phone || "-";
  const username = state.member.username || mock.user.username || "-";
  const userId = state.member.id || state.member.user_id || state.member.userId || "-";
  const bankStatus = state.bankAccounts.length ? state.bankAccounts.map((account) => bankStatusLabel(account.rawStatus || account.status)).join(", ") : "-";
  return `<div class="local-debug-panel"><div class="menu-title">Local Debug Info</div><div class="debug-grid"><span>phone</span><strong>${text(phone)}</strong><span>username</span><strong>${text(username)}</strong><span>user id</span><strong>${text(userId)}</strong><span>bank status</span><strong>${text(bankStatus)}</strong><span>wallet balance</span><strong>${money(mock.user.balance)}</strong></div><div class="inline-actions"><button class="secondary-btn" data-action="copy-debug-phone" ${phone === "-" ? "disabled" : ""}>Copy phone</button><button class="secondary-btn" data-action="copy-debug-user-id" ${userId === "-" ? "disabled" : ""}>Copy user id</button></div></div>`;
}
function profileModalHtml() {
  const phone = state.member.phone || "-";
  const bankList = state.loading.member || state.loading.bankAccounts ? '<div class="empty-box">กำลังโหลด...</div>' : mock.profileAccounts.length ? mock.profileAccounts.map(bankCardHtml).join("") : '<div class="empty-box">ไม่พบบัญชีธนาคาร</div>';
  return modalShell("ข้อมูลโปรไฟล์", `<div class="modal-block field-stack"><div class="drawer-user"><div class="avatar-badge">DM</div><div><div class="menu-title">${text(mock.user.username)}</div><div class="helper-text">โทรศัพท์: ${text(phone)}</div></div></div><button class="${state.loading.profileRefresh ? "disabled-btn" : "secondary-btn"}" data-action="refresh-profile-bank" ${state.loading.profileRefresh ? "disabled" : ""}>${state.loading.profileRefresh ? "กำลังรีเฟรช..." : "Refresh Profile / Bank Accounts"}</button><div class="wallet-grid"><div class="stat-card"><div class="menu-title">แต้มของคุณ</div><div class="menu-desc">${money(mock.user.diamonds)}</div></div><div class="stat-card"><div class="menu-title">ยอดเงินคงเหลือ</div><div class="menu-desc">${money(mock.user.balance)}</div></div><div class="stat-card"><div class="menu-title">Ranking</div><div class="menu-desc">${text(mock.user.ranking)}</div></div></div><div class="menu-title">รายการบัญชีธนาคาร</div><div class="bank-list">${bankList}</div><button class="secondary-btn" data-action="mock-add-bank">เพิ่มบัญชี</button>${localDebugInfoHtml()}</div>`);
}

function historyTabsHtml() { const tab = state.modalTabs.history; return `<div class="auth-tabs"><button class="auth-toggle ${tab === "games" ? "active" : ""}" data-action="history-games">รายการเกม</button><button class="auth-toggle ${tab === "deposits" ? "active" : ""}" data-action="history-deposits">รายการฝาก</button><button class="auth-toggle ${tab === "withdraws" ? "active" : ""}" data-action="history-withdraws">รายการถอน</button><button class="auth-toggle ${tab === "bonus" ? "active" : ""}" data-action="history-bonus">รายการโบนัส</button></div>`; }
function depositHistoryRows() {
  if (state.loading.deposits) return '<div class="empty-box">กำลังโหลด...</div>';
  const rows = state.loggedIn ? state.depositHistory : [...state.depositHistory, ...mock.history.deposits];
  return rows.length ? rows.map((item) => `<div class="table-row"><div><div class="helper-text">${text(item.datetime)}</div><div class="menu-title">${text(item.channel)}</div><div class="helper-text">จำนวนเงิน ${money(item.amount)}</div></div><span class="status-pill ${statusPillClass(item.status)}">${text(item.status)}</span></div>`).join("") : '<div class="empty-box">ไม่พบข้อมูล</div>';
}
function withdrawHistoryRows() {
  if (state.loading.withdrawals) return '<div class="empty-box">กำลังโหลด...</div>';
  const rows = state.loggedIn ? state.withdrawHistory : [...state.withdrawHistory, ...mock.history.withdraws];
  return rows.length ? rows.map((item) => `<div class="table-row"><div><div class="helper-text">${text(item.datetime)}</div><div class="menu-title">${text(item.channel)}</div><div class="helper-text">จำนวนเงิน ${money(item.amount)}</div></div><span class="status-pill ${statusPillClass(item.status)}">${text(item.status)}</span></div>`).join("") : '<div class="empty-box">ไม่พบข้อมูล</div>';
}
function historyModalHtml() { const tab = state.modalTabs.history; let content = ""; const refreshButton = `<div class="history-refresh-row"><button class="${state.loading.historyRefresh ? "disabled-btn" : "secondary-btn"}" data-action="refresh-history" ${state.loading.historyRefresh ? "disabled" : ""}>${state.loading.historyRefresh ? "กำลังรีเฟรช..." : "Refresh History"}</button></div>`; if (tab === "games") content = `<div class="modal-block field-stack"><div class="date-filter">ช่วงวันที่ mock: 01/04/2026 - 30/04/2026</div><div class="table-list">${mock.history.games.map((item) => `<div class="table-row"><div class="menu-title">${text(item.name)}</div><div class="helper-text">ประเภท ${text(item.type)}</div><div class="helper-text">เวลาเล่นล่าสุด ${text(item.playedAt)}</div><button class="secondary-btn" data-action="play-game">เล่นอีกรอบ</button></div>`).join("")}</div></div>`; if (tab === "deposits") content = `<div class="modal-block field-stack"><div class="auth-tabs"><button class="auth-toggle ${state.modalTabs.historyDeposit === "bank" ? "active" : ""}" data-action="history-deposit-bank">ฝากเงินธนาคาร</button><button class="auth-toggle ${state.modalTabs.historyDeposit === "peer" ? "active" : ""}" data-action="history-deposit-peer">ฝากเงิน Peer2Pay</button></div><div class="table-list">${depositHistoryRows()}</div></div>`; if (tab === "withdraws") content = `<div class="modal-block field-stack"><div class="auth-tabs"><button class="auth-toggle ${state.modalTabs.historyWithdraw === "bank" ? "active" : ""}" data-action="history-withdraw-bank">ถอนเงินธนาคาร</button><button class="auth-toggle ${state.modalTabs.historyWithdraw === "peer" ? "active" : ""}" data-action="history-withdraw-peer">ถอนเงิน Peer2Pay</button></div><div class="table-list">${withdrawHistoryRows()}</div></div>`; if (tab === "bonus") { const bonusRows = [...state.bonusHistory, ...mock.history.bonus]; content = `<div class="modal-block field-stack"><div class="table-list">${bonusRows.map((item) => `<div class="table-row bonus-row"><div><div class="menu-title">${text(item.title)}</div><div class="helper-text">${text(item.date)}</div></div><div class="bonus-side"><div class="menu-title">${money(item.amount)}</div><span class="status-pill ${item.status === "success" ? "success" : "warning"}">${item.status === "success" ? "สำเร็จ" : "รอตรวจสอบ"}</span></div></div>`).join("")}</div><div class="pagination-mock">หน้า 1 / 1</div></div>`; } return modalShell("ประวัติการใช้งาน", `${historyTabsHtml()}${refreshButton}${content}`); }
function promotionResultHtml() { const item = state.promotionClaimResult; return item ? resultCardHtml("รับโปรโมชั่นสำเร็จ mock", [["ชื่อโปรโมชั่น", item.title], ["ฝากขั้นต่ำ", item.min], ["โบนัส", item.detail], ["สถานะ", item.status, true]]) : ""; }
function promotionOptions() { return ["ไม่รับโปรโมชั่น", ...mock.promotions.map((item) => item.title)]; }
function promotionDropdownHtml() {
  const value = state.form.promotionSelect || state.form.depositPromo || "ไม่รับโปรโมชั่น";
  return `<div class="promotion-select-card"><label class="field-label">โปรโมชั่น</label><div class="select-shell promotion-select-shell"><select class="select-input" data-field="promotionSelect">${promotionOptions().map((item) => `<option value="${text(item)}" ${item === value ? "selected" : ""}>${text(item)}</option>`).join("")}</select></div></div>`;
}
function promoThumbHtml(item, size = "") {
  return `<div class="promo-thumb-large promo-mock-thumb ${text(item.tone || "gold")} ${text(size)}"><span>${text(item.badge || "Promo")}</span><strong>${text(item.title)}</strong></div>`;
}
function promotionCardHtml(item) {
  const selected = state.selectedPromotionId === item.id;
  return `<article class="promo-card promotion-card ${selected ? "active" : ""}">${promoThumbHtml(item)}<div class="promotion-card-body"><div class="promotion-card-title"><div class="menu-title">${text(item.title)}</div><span class="status-pill primary">${text(item.badge || "Promo")}</span></div><div class="helper-text">ฝากขั้นต่ำ ${text(item.min)} / สูงสุดไม่เกิน ${text(item.max)}</div>${selected ? '<span class="status-pill success">เลือกแล้ว</span>' : ""}<div class="promotion-card-actions"><button class="secondary-btn" data-action="open-promotion-detail" data-id="${text(item.id)}">ดูเพิ่มเติม</button><button class="${selected ? "disabled-btn" : "primary-btn"}" data-action="claim-promotion" data-id="${text(item.id)}" ${selected ? "disabled" : ""}>${selected ? "เลือกแล้ว" : "รับโปรโมชั่น"}</button></div></div></article>`;
}
function promotionsModalHtml() {
  const cards = state.loading.promotions ? '<div class="empty-box promotion-empty">กำลังโหลด...</div>' : mock.promotions.length ? `<div class="promotion-grid">${mock.promotions.map(promotionCardHtml).join("")}</div>` : '<div class="empty-box promotion-empty"><div class="promotion-empty-icon">🎁</div><div>ยังไม่มีโปรโมชั่น</div></div>';
  return modalShell("โปรโมชันที่เลือก", `<div class="promotions-modal field-stack"><div class="modal-block field-stack promotion-shell-card">${promotionDropdownHtml()}${cards}</div></div>`, { panelClass: "modal-panel-wide promotion-modal-panel" });
}
function promotionDetailModalHtml() {
  const promotion = mock.promotions.find((item) => item.id === state.promotionDetailId) || mock.promotions[0];
  if (!promotion) return modalShell("รายละเอียดโปรโมชัน", '<div class="empty-box promotion-empty">ยังไม่มีโปรโมชั่น</div>', { backAction: "back-promotions", panelClass: "modal-panel-wide promotion-modal-panel promotion-detail-panel" });
  const selected = state.selectedPromotionId === promotion.id;
  const conditions = [["ฝากขั้นต่ำ", promotion.min], ["รับโบนัส", promotion.bonus], ["เทิร์น", promotion.turnover], ["ถอนสูงสุด", promotion.withdraw]];
  return modalShell("รายละเอียดโปรโมชัน", `<div class="promotions-modal field-stack"><div class="modal-block field-stack promotion-detail-card">${promoThumbHtml(promotion, "large")}<div class="promotion-detail-head"><div><div class="menu-title">${text(promotion.title)}</div><div class="helper-text">${text(promotion.detail)}</div></div><span class="status-pill primary">${text(promotion.badge || "Promo")}</span></div><div class="promotion-condition-grid">${conditions.map(([label, value]) => `<div class="promotion-condition-card"><span>${text(label)}</span><strong>${text(value)}</strong></div>`).join("")}</div>${selected ? '<span class="status-pill success">เลือกแล้ว</span>' : ""}<div class="promotion-detail-actions"><button class="secondary-btn" data-action="back-promotions">ย้อนกลับ</button><button class="${selected ? "disabled-btn" : "primary-btn"}" data-action="claim-promotion" data-id="${text(promotion.id)}" ${selected ? "disabled" : ""}>${selected ? "เลือกแล้ว" : "รับโปรโมชั่น"}</button></div></div></div>`, { backAction: "back-promotions", panelClass: "modal-panel-wide promotion-modal-panel promotion-detail-panel" });
}

function rebatesTabsHtml() { const tab = state.modalTabs.rebate; return `<div class="auth-tabs"><button class="auth-toggle ${tab === "lossback" ? "active" : ""}" data-action="rebate-lossback">รับยอดเสีย</button><button class="auth-toggle ${tab === "commission" ? "active" : ""}" data-action="rebate-commission">คอมมิชชั่น</button></div>`; }
function rebatesModalHtml() { const tab = state.modalTabs.rebate; const body = tab === "lossback" ? `<div class="modal-block field-stack"><div class="empty-box">ประเภทข้อมูลเคสไม่ถูกต้อง</div><div class="menu-title">ตารางประวัติการรับยอดเสีย</div><div class="empty-box">ไม่มีข้อมูล</div><div class="table-list">${mock.rebates.lossbackItems.map((item) => `<div class="table-row"><div><div class="menu-title">${text(item.game)}</div><div class="helper-text">${text(item.reward)}</div></div><button class="secondary-btn" data-action="mock-toast">รับ</button></div>`).join("")}</div></div>` : `<div class="modal-block field-stack"><div class="wallet-grid"><div class="stat-card"><div class="menu-title">คอมมิชชั่นทั้งหมด</div><div class="menu-desc">${money(mock.rebates.commissionSummary.total)}</div></div><div class="stat-card"><div class="menu-title">วันนี้</div><div class="menu-desc">${money(mock.rebates.commissionSummary.today)}</div></div><div class="stat-card"><div class="menu-title">เดือนนี้</div><div class="menu-desc">${money(mock.rebates.commissionSummary.month)}</div></div></div><div class="inline-actions"><button class="secondary-btn" data-action="commission-credit">ถอนเข้าเครดิต</button><button class="primary-btn" data-action="commission-cash">ถอนเป็นเงินสด</button></div><div class="table-list">${mock.rebates.commissionGames.map((item) => `<button class="table-row table-button" data-action="open-commission-detail" data-id="${text(item.id)}"><div class="menu-title">${text(item.name)}</div><div class="helper-text">${text(item.detail)}</div></button>`).join("")}</div><div class="empty-box">ไม่พบประวัติการรับคอมมิชชั่น</div></div>`; return modalShell(tab === "lossback" ? "คืนยอดเสีย" : "คอมมิชชั่น", `${rebatesTabsHtml()}${body}`); }
function commissionDetailModalHtml() { const detail = mock.rebates.commissionGames.find((item) => item.id === state.commissionDetailId) || mock.rebates.commissionGames[0]; return modalShell("รายละเอียดคอมมิชชั่น", `<div class="modal-block field-stack"><div class="menu-title">${text(detail.name)}</div><div class="helper-text">${text(detail.detail)}</div><div class="table-list"><div class="table-row"><strong>รูปแบบการคำนวณ:</strong> mock detail</div><div class="table-row"><strong>สถานะ:</strong> ไม่มีข้อมูล</div></div></div>`, { backAction: "back-rebates" }); }

function revenueCardButton(label) { const map = { "ยอดเล่น": "turnover", "ยอดเสีย": "loss", "ยอดฝาก": "deposit", "รับเครดิตฟรี": "freebies", "สมาชิกแนะนำ": "members" }; const target = map[label] || "deposit"; return `<button class="menu-card" data-action="open-revenue-detail" data-target="${text(target)}"><div class="menu-title">${text(label)}</div><div class="menu-desc">ดูรายละเอียด mock</div></button>`; }
function revenueSharePopupHtml() { return `<div class="share-popup"><div class="share-popup-head"><div class="menu-title">แชร์ลิงก์แนะนำเพื่อน</div><button class="icon-btn" data-action="close-share-popup">✕</button></div><div class="share-grid-box">${mock.revenue.shareOptions.map((item) => `<button class="secondary-btn" data-action="share-option" data-label="${text(item)}">${text(item)}</button>`).join("")}</div></div>`; }
function revenueMetricTabsHtml() { const tab = state.modalTabs.revenueMetric; return `<div class="auth-tabs"><button class="auth-toggle ${tab === "overview" ? "active" : ""}" data-action="revenue-metric-overview">ภาพรวม</button><button class="auth-toggle ${tab === "income" ? "active" : ""}" data-action="revenue-metric-income">รายได้</button><button class="auth-toggle ${tab === "withdraw" ? "active" : ""}" data-action="revenue-metric-withdraw">ถอนรายได้</button></div>`; }
function revenueMetricModalHtml() { const labelMap = { deposit: "ยอดฝาก", loss: "ยอดเสีย", turnover: "ยอดเล่น" }; const current = labelMap[state.revenueMetricType] || "ยอดฝาก"; let content = ""; if (state.modalTabs.revenueMetric === "overview") content = `<div class="wallet-grid"><div class="stat-card"><div class="menu-title">ยอดรวมทั้งหมด</div><div class="menu-desc">${money(0)}</div></div><div class="stat-card"><div class="menu-title">รายได้วันนี้</div><div class="menu-desc">${money(0)}</div></div><div class="stat-card"><div class="menu-title">รายได้ทั้งหมด</div><div class="menu-desc">${money(0)}</div></div><div class="stat-card"><div class="menu-title">สมาชิกเครือข่าย ชั้น 1 / 2</div><div class="menu-desc">${mock.revenue.network.level1} / ${mock.revenue.network.level2}</div></div></div>`; if (state.modalTabs.revenueMetric === "income") content = `<div class="field-stack"><div class="date-filter">ช่วงวันที่ mock: 01/04/2026 - 30/04/2026</div><div class="empty-box">ไม่พบข้อมูล</div></div>`; if (state.modalTabs.revenueMetric === "withdraw") content = `<div class="field-stack"><div class="date-filter">ช่วงวันที่ mock: 01/04/2026 - 30/04/2026</div><div class="empty-box">ไม่พบข้อมูล</div></div>`; return modalShell(current, `${revenueMetricTabsHtml()}<div class="modal-block field-stack">${content}</div>`, { backAction: "back-revenue" }); }
function revenueMembersModalHtml() { return modalShell("แนะนำเพื่อน", `<div class="modal-block field-stack"><div class="table-shell"><div class="table-header-row"><div class="table-header-cell">วันที่/เวลา</div><div class="table-header-cell">ยูสเซอร์</div><div class="table-header-cell">ระดับชั้น</div></div><div class="empty-box">ไม่พบข้อมูล</div></div></div>`, { backAction: "back-revenue" }); }
function revenueFreebiesModalHtml() { return modalShell("รับเครดิตฟรี", `<div class="modal-block field-stack"><div class="table-shell"><div class="table-header-row"><div class="table-header-cell">ยูสเซอร์</div><div class="table-header-cell">ชั้นที่ชวน</div><div class="table-header-cell">ยอดฝาก</div><div class="table-header-cell">ชั้นที่ 1</div><div class="table-header-cell">ชั้นที่ 2</div></div><div class="empty-box">ไม่พบข้อมูล</div></div></div>`, { backAction: "back-revenue" }); }
function revenueModalHtml() { return modalShell("สร้างรายได้", `<div class="modal-block field-stack revenue-panel"><div class="menu-title">ลิงก์แนะนำเพื่อน</div><div class="referral-hero"><div class="qr-mock-box">QR MOCK</div><div class="field-stack"><div class="field-shell"><input class="field-input" value="${text(mock.revenue.link)}" readonly></div><div class="inline-actions"><button class="secondary-btn" data-action="copy-link">คัดลอกลิงก์</button><button class="primary-btn" data-action="open-share-popup">แชร์</button></div></div></div><div class="wallet-grid"><div class="stat-card"><div class="menu-title">รายได้จากการแนะนำเพื่อน</div><div class="menu-desc">${money(mock.revenue.totals.income)}</div></div></div>${amountInputField("จำนวนเงินที่ต้องการถอน", "revenueWithdrawAmount", state.form.revenueWithdrawAmount)}<div class="inline-actions"><button class="secondary-btn" data-action="revenue-bank">ถอนเข้าบัญชี</button><button class="primary-btn" data-action="revenue-credit">ถอนเข้าเครดิต</button></div><div class="helper-text">ขั้นต่ำ ${money(mock.revenue.totals.minBank)} / สูงสุด ${money(mock.revenue.totals.maxBank)} บาท</div><div class="menu-grid">${mock.revenue.cards.map(revenueCardButton).join("")}</div>${state.sharePopupOpen ? revenueSharePopupHtml() : ""}</div>`); }

function shopTabsHtml() {
  const tabs = [["rewards", "แลกรางวัล"], ["credit", "แลกเครดิต"], ["cash", "แลกเงินสด"], ["history", "ประวัติการแลก"]];
  return `<div class="auth-tabs shop-tabs" role="tablist">${tabs.map(([id, label]) => `<button class="auth-toggle ${state.modalTabs.shop === id ? "active" : ""}" data-action="shop-tab" data-tab="${text(id)}" role="tab">${text(label)}</button>`).join("")}</div>`;
}
function shopHeroHtml() {
  return `<div class="shop-hero"><div class="shop-hero-copy"><div class="banner-tag">Monthly Bonus</div><div class="shop-hero-title">โปรประจำเดือน</div><div class="helper-text">แลกรางวัล เครดิต และเงินสดด้วยแต้ม mock สำหรับหน้าเดโม่</div></div><div class="shop-hero-watermark">💎</div><div class="shop-points-card"><span>ยอดแต้มคงเหลือ</span><strong>${money(state.shopPointBalance)}</strong><button class="mini-btn shop-points-refresh" data-action="refresh-shop" aria-label="รีเฟรชยอดแต้ม">↻</button></div></div>`;
}
function shopSearchField(key, label) {
  return `<div class="search-row"><div class="search-shell"><input class="search-input" data-field="${text(key)}" value="${text(state.form[key])}" placeholder="${text(label)}"></div></div>`;
}
function shopRewardsHtml() {
  const query = state.form.shopSearch.trim().toLowerCase();
  const rewards = mock.shop.rewards.filter((item) => !query || `${item.title} ${item.points}`.toLowerCase().includes(query));
  return `<div class="field-stack shop-tab-panel">${shopSearchField("shopSearch", "ค้นหารางวัล")}${validationText(state.errors.shopReward)}${rewards.length ? `<div class="shop-reward-grid">${rewards.map((item) => { const enough = state.shopPointBalance >= item.points; return `<div class="shop-reward-card"><div class="shop-reward-cover ${text(item.tone || "gold")}"><span>${text(item.icon)}</span></div><div class="shop-reward-body"><div class="menu-title">${text(item.title)}</div><div class="shop-reward-meta"><span>ใช้ ${money(item.points)} แต้ม</span><span class="status-pill ${enough ? "success" : "warning"}">${enough ? "พร้อมแลก" : "แต้มไม่พอ"}</span></div></div><button class="${enough ? "primary-btn" : "disabled-btn"}" data-action="redeem-shop-reward" data-id="${text(item.id)}" ${enough ? "" : "disabled"}>แลกรางวัล</button></div>`; }).join("")}</div>` : '<div class="empty-box">ไม่พบข้อมูล</div>'}</div>`;
}
function shopExchangeHtml(type) {
  const isCredit = type === "credit";
  const pointKey = isCredit ? "shopCreditPoints" : "shopCashPoints";
  const amountKey = isCredit ? "shopCreditAmount" : "shopCashAmount";
  const points = Number(state.form[pointKey] || "0");
  const amount = Number.isFinite(points) && points > 0 ? (isCredit ? points / 10 : points / 10) : 0;
  const title = isCredit ? "เครดิต" : "เงินสด";
  const unit = isCredit ? "เครดิต" : "บาท";
  const rate = isCredit ? "100 แต้ม = 10 เครดิต" : "100 แต้ม = 10 บาท";
  const limitText = isCredit ? "คำนวณจากแต้มที่กรอกแบบ mock" : "ขั้นต่ำ 100 แต้ม / สูงสุด 5,000 แต้ม";
  const error = isCredit ? state.errors.shopCredit : state.errors.shopCash;
  const canSubmit = state.form[pointKey].trim() && Number.isFinite(points) && points > 0;
  return `<div class="modal-block field-stack shop-exchange-card"><div class="shop-exchange-head"><div><div class="menu-title">แลก${text(title)} mock</div><div class="helper-text">${text(limitText)}</div></div><div class="shop-rate-badge">${text(rate)}</div></div><div class="shop-form-grid"><div><label class="field-label">แต้ม</label><div class="field-shell field-input-wrap"><input class="field-input" inputmode="numeric" data-field="${pointKey}" value="${text(state.form[pointKey])}" placeholder="กรอกแต้ม"><span class="input-suffix">แต้ม</span></div></div><div><label class="field-label">${text(title)}</label><div class="field-shell field-input-wrap"><input class="field-input" data-field="${amountKey}" value="${money(amount)}" readonly><span class="input-suffix">${text(unit)}</span></div></div></div>${error ? `<div class="validation">${text(error)}</div>` : ""}<button class="${canSubmit ? "auth-submit" : "disabled-btn shop-submit-disabled"}" data-action="${isCredit ? "submit-shop-credit" : "submit-shop-cash"}" ${canSubmit ? "" : "disabled"}>แลก${text(title)}</button></div>`;
}
function shopHistoryHtml() {
  const query = state.form.shopHistorySearch.trim().toLowerCase();
  const histories = [...state.shopHistories, ...mock.shop.histories].filter((item) => !query || `${item.datetime} ${item.reward} ${item.status}`.toLowerCase().includes(query));
  return `<div class="field-stack shop-tab-panel">${shopSearchField("shopHistorySearch", "ค้นหาประวัติการแลก")}${histories.length ? `<div class="table-list shop-history-list">${histories.map((item) => `<div class="table-row shop-history-row"><div><div class="helper-text">${text(item.datetime)}</div><div class="menu-title">${text(item.reward)}</div></div><span class="status-pill success">${text(item.status)}</span></div>`).join("")}</div>` : '<div class="empty-box shop-empty-state">ไม่พบข้อมูล</div>'}</div>`;
}
function shopReceiptHtml() { const receipt = state.shopReceipt; return receipt ? resultCardHtml("แลกรางวัลสำเร็จ mock", [["ชื่อรางวัล", receipt.title], ["แต้มที่ใช้", money(receipt.points)], ["แต้มก่อนแลก", money(receipt.before)], ["แต้มหลังแลก", money(receipt.after)], ["วันที่แลก", receipt.datetime], ["สถานะ", receipt.status, true]]) : ""; }
function shopModalHtml() {
  const tab = state.modalTabs.shop;
  const body = tab === "credit" ? shopExchangeHtml("credit") : tab === "cash" ? shopExchangeHtml("cash") : tab === "history" ? shopHistoryHtml() : shopRewardsHtml();
  return modalShell("ร้านค้า", `<div class="shop-modal field-stack">${shopHeroHtml()}${shopReceiptHtml()}${shopTabsHtml()}${body}</div>`, { panelClass: "modal-panel-wide shop-modal-panel" });
}
function bonusTrackerModalHtml() {
  return modalShell("ติดตามโบนัส", `<div class="modal-block field-stack bonus-tracker-card"><div class="wallet-grid"><div class="stat-card"><div class="menu-title">โปรโมชันปัจจุบัน</div><div class="menu-desc">${text(mock.user.promotion)}</div></div><div class="stat-card"><div class="menu-title">เทิร์น</div><div class="menu-desc">${money(mock.user.turnoverCurrent)} / ${money(mock.user.turnoverTarget)}</div></div><div class="stat-card"><div class="menu-title">ถอนสูงสุด</div><div class="menu-desc">${money(0)}</div></div><div class="stat-card"><div class="menu-title">สถานะ</div><div class="menu-desc">ยังไม่ผ่านเงื่อนไข</div></div></div></div>`);
}
function providerTabsHtml() {
  const tabs = ["ทั้งหมด", "สล็อต", "คาสิโน", "ยิงปลา", "กีฬา", "หวย", "เกมโต๊ะ", "กราฟ"];
  return `<div class="auth-tabs provider-tabs">${tabs.map((item) => `<button class="auth-toggle ${state.modalTabs.provider === item ? "active" : ""}" data-action="provider-tab" data-tab="${text(item)}">${text(item)}</button>`).join("")}</div>`;
}
function providerInitials(name) {
  return name.split(/[\s'-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
function filteredProviders() {
  const query = state.form.providerSearch.trim().toLowerCase();
  return mock.providers.filter((item) => (state.modalTabs.provider === "ทั้งหมด" || item.category === state.modalTabs.provider) && (!query || `${item.name} ${item.category}`.toLowerCase().includes(query)));
}
function providerCardHtml(item) {
  return `<article class="provider-card ${state.selectedProviderId === item.id ? "active" : ""}" data-action="select-provider" data-provider="${text(item.id)}"><div class="provider-card-top"><div class="provider-logo-mock">${text(providerInitials(item.name))}</div><span class="provider-category-badge">${text(item.category)}</span></div><div class="provider-card-copy"><div class="menu-title">${text(item.name)}</div><div class="menu-desc">${text(item.category)} mock provider</div></div><div class="provider-actions"><button class="secondary-btn" data-action="select-provider" data-provider="${text(item.id)}">ดูเกม</button><button class="primary-btn" data-action="play-game" data-provider="${text(item.id)}">เข้าเล่น</button></div></article>`;
}
function providerGameRowHtml(game, provider) {
  return `<article class="provider-game-row"><div><div class="game-name">${text(game.name)}</div><div class="helper-text">${text(game.category)} / ${text(provider.name)} backend dev</div></div><div class="provider-game-actions"><button class="secondary-btn" data-action="demo-play-game" data-game="${text(game.code || game.name)}">ดูเกม</button><button class="primary-btn" data-action="play-game" data-provider="${text(provider.code || provider.id)}" data-game="${text(game.code || game.name)}">เข้าเล่น</button></div></article>`;
}
function providerGamesHtml(provider) {
  if (!provider) return "";
  const providerCode = provider.code || provider.id;
  const games = state.gamesByProvider[providerCode] || state.gamesByProvider[provider.id] || [];
  const rows = state.loading.providerGames ? '<div class="empty-box provider-empty">กำลังโหลด...</div>' : games.length ? `<div class="provider-game-list">${games.map((game) => providerGameRowHtml(game, provider)).join("")}</div>` : '<div class="empty-box provider-empty">ไม่พบข้อมูล</div>';
  return `<div class="provider-games-panel"><div class="section-head"><div><h4 class="section-title">เกมในค่าย ${text(provider.name)}</h4><div class="section-subtitle">รายการเกมจาก Backend dev</div></div><span class="provider-games-count">${games.length} เกม</span></div>${rows}</div>`;
}
function providerModalHtml() {
  const providers = filteredProviders();
  const selected = mock.providers.find((item) => item.id === state.selectedProviderId);
  const providerBody = state.loading.providers ? '<div class="empty-box provider-empty">กำลังโหลด...</div>' : providers.length ? `<div class="provider-grid">${providers.map(providerCardHtml).join("")}</div>` : '<div class="empty-box provider-empty">ไม่พบค่ายเกม</div>';
  return modalShell("เลือกค่ายเกม", `<div class="provider-modal field-stack"><div class="provider-control-card">${shopSearchField("providerSearch", "ค้นหาค่ายเกม")}${providerTabsHtml()}</div>${providerBody}${providerGamesHtml(selected)}</div>`, { panelClass: "modal-panel-wide provider-modal-panel" });
}

function walletQuickCard(item) {
  return `<button class="wallet-quick-card" data-action="wallet-item" data-item="${text(item.id)}"><span class="wallet-quick-icon">${text(item.icon)}</span>${item.badge ? `<span class="wallet-quick-badge">${text(item.badge)}</span>` : ""}<span class="wallet-quick-label">${text(item.label)}</span></button>`;
}
function walletModalHtml() {
  const wallet = mock.walletQuickMenu;
  return modalShell("กระเป๋า", `<div class="wallet-summary wallet-summary-hero"><div class="wallet-balance-card"><div class="wallet-balance-head"><span class="menu-title">เครดิตคงเหลือ</span><span class="wallet-coin">🪙</span></div><div class="wallet-balance-value">${money(wallet.balance)}</div><button class="${state.loading.walletRefresh ? "disabled-btn" : "secondary-btn"} wallet-refresh-btn" data-action="refresh-wallet" ${state.loading.walletRefresh ? "disabled" : ""}>${state.loading.walletRefresh ? "กำลังรีเฟรช..." : "Refresh Wallet"}</button></div><div class="wallet-status-card"><div class="helper-text">สถานะโปร</div><div class="menu-title">${text(wallet.promotionStatus)}</div><div class="helper-text">ติดเทิร์น</div><div class="menu-desc">${money(wallet.turnoverCurrent)}/${money(wallet.turnoverTarget)}</div></div></div><div class="wallet-quick-grid">${wallet.menuItems.map(walletQuickCard).join("")}</div>`, { panelClass: "wallet-modal-panel" });
}
function rewardAmountFromTitle(title) { const match = String(title || "").match(/(\d+(?:\.\d+)?)/); return match ? Number(match[1]) : 0; }
function freebiesResultHtml() { const item = state.rewardClaimResult; return item ? resultCardHtml(item.type === "diamonds" ? "รับเพชรสำเร็จ mock" : "รับเครดิตฟรีสำเร็จ mock", [["จำนวน", money(item.amount)], ["วันที่รับ", item.datetime], ["สถานะ", "สำเร็จ", true]]) : ""; }
function freebiesTabsHtml(tab) {
  return `<div class="auth-tabs freebies-tabs"><button class="auth-toggle ${tab === "credits" ? "active" : ""}" data-action="freebies-credits">เครดิตฟรี</button><button class="auth-toggle ${tab === "diamonds" ? "active" : ""}" data-action="freebies-diamonds">รับเพชรฟรี</button></div>`;
}
function freebiesRewardCard(item, index, type) {
  const claimed = Boolean(state.claimedRewards[type][index]);
  const isDiamond = type === "diamonds";
  return `<article class="freebies-reward-card ${isDiamond ? "diamond" : "credit"}"><div class="freebies-reward-icon">${isDiamond ? "💎" : "🪙"}</div><div class="freebies-reward-body"><div class="menu-title">${text(item.title)}</div><div class="helper-text">${text(item.expires)}</div><span class="status-pill ${claimed ? "claimed" : "success"}">${claimed ? "รับแล้ว" : "พร้อมรับ"}</span></div><button class="${claimed ? "disabled-btn" : "primary-btn"} freebies-claim-btn" data-action="${isDiamond ? "claim-free-diamond" : "claim-free-credit"}" data-index="${index}" ${claimed ? "disabled" : ""}>${claimed ? "รับแล้ว" : isDiamond ? "รับเพชร" : "รับโบนัส"}</button></article>`;
}
function freebiesModalHtml() {
  const tab = state.modalTabs.freebies;
  const list = tab === "credits" ? mock.memberRewards.credits : mock.memberRewards.diamonds;
  const title = tab === "credits" ? "เครดิตฟรี" : "รับเพชรฟรี";
  const balance = tab === "diamonds" ? `<div class="diamond-pill freebies-balance">💎 เพชรคงเหลือ ${money(mock.user.diamonds)}</div>` : "";
  const cards = list.length ? `<div class="freebies-reward-grid">${list.map((item, index) => freebiesRewardCard(item, index, tab)).join("")}</div>` : '<div class="empty-box freebies-empty">ไม่พบข้อมูล</div>';
  return modalShell(title, `<div class="freebies-modal field-stack"><div class="modal-block field-stack freebies-shell-card"><div class="reward-head freebies-head">${freebiesTabsHtml(tab)}${balance}</div>${cards}</div></div>`, { panelClass: "modal-panel-wide freebies-modal-panel" });
}
function couponResultHtml() { const result = state.couponResult; if (!result) return ""; if (result.status === "error") return resultCardHtml("ไม่พบโค้ด หรือโค้ดหมดอายุ", [["สถานะ", "ไม่สำเร็จ"]], { tone: "error" }); return resultCardHtml(result.type === "diamond" ? "ได้รับเพชร 20.00" : "ได้รับเครดิตฟรี 100.00", [["จำนวน", money(result.amount)], ["สถานะ", "สำเร็จ", true]]); }
function couponModalHtml() { const success = state.couponResult && state.couponResult.status === "success"; return modalShell("กรอกโค้ด", `<div class="modal-block coupon-shell"><div class="coupon-icon">🎟️</div><div class="field-stack"><div><label class="field-label">กรอกโค้ด</label><div class="field-shell"><input class="field-input" data-field="couponCode" value="${text(state.form.couponCode)}" placeholder="กรุณากรอกโค้ด"></div>${validationText(state.errors.coupon)}</div>${couponResultHtml()}<button class="${success ? "disabled-btn" : "auth-submit"}" data-action="submit-coupon" ${success ? "disabled" : ""}>${success ? "รับแล้ว" : "ยืนยัน"}</button>${success ? '<button class="secondary-btn" data-action="close-modal">ปิด</button>' : ""}</div></div>`); }
function randomBoxHistoryRows() {
  const resultRow = state.boxResult ? [{ datetime: state.boxResult.datetime, reward: state.boxResult.reward, type: "เครดิตฟรี", status: state.boxResult.status }] : [];
  return [...resultRow, ...mock.randomBoxes.histories];
}
function randomBoxHistoryModalHtml() {
  const box = mock.randomBoxes.boxes.find((item) => item.id === state.activeBoxId) || mock.randomBoxes.boxes[0];
  const rows = randomBoxHistoryRows();
  const content = rows.length ? `<div class="table-shell random-box-history-table"><div class="table-header-row"><div class="table-header-cell">วันที่/เวลา</div><div class="table-header-cell">รางวัล</div><div class="table-header-cell">ประเภท</div><div class="table-header-cell">สถานะ</div></div>${rows.map((row) => `<div class="table-row random-box-history-row"><div class="helper-text">${text(row.datetime)}</div><div class="menu-title">${text(row.reward)}</div><div class="helper-text">${text(row.type)}</div><span class="status-pill success">${text(row.status)}</span></div>`).join("")}</div>` : '<div class="empty-box random-box-empty">ไม่พบข้อมูล</div>';
  return modalShell(`ประวัติการเปิด${box.title}`, `<div class="modal-block field-stack random-box-history-card">${content}</div>`, { backAction: "back-box-main", panelClass: "random-box-modal-panel random-box-history-panel" });
}
function randomBoxOpenModalHtml() {
  const box = mock.randomBoxes.boxes.find((item) => item.id === state.activeBoxId) || mock.randomBoxes.boxes[0];
  return modalShell("เปิดกล่องสุ่ม", `<div class="modal-block box-open-shell"><div class="box-open-head">กำลังเปิด ${text(box.title)}</div><div class="random-box-opening-stage"><div class="random-box-opening-glow"></div><div class="random-box-opening-gift ${state.boxOpening ? "opening" : ""}">🎁</div></div><div class="helper-text">ระบบกำลังสุ่มรางวัล mock</div></div>`, { backAction: "back-box-main", panelClass: "random-box-modal-panel random-box-open-panel" });
}
function randomBoxResultModalHtml() {
  const result = state.boxResult || { reward: "100.00 เครดิต", datetime: nowText(), status: "สำเร็จ" };
  return modalShell("ผลรางวัลกล่องสุ่ม", `<div class="modal-block field-stack random-box-result-card"><div class="random-box-result-icon">🎁</div><div class="menu-title">ยินดีด้วย</div><div class="random-box-result-prize">ได้รับ ${text(result.reward)}</div><div class="table-list"><div class="table-row"><span>วันที่/เวลา</span><strong>${text(result.datetime)}</strong></div><div class="table-row"><span>สถานะ</span><span class="status-pill success">${text(result.status)}</span></div></div><button class="primary-btn" data-action="confirm-box-reward">ตกลง</button></div>`, { backAction: "back-box-main", panelClass: "random-box-modal-panel random-box-result-panel" });
}
function randomBoxCardHtml(box) {
  return `<article class="random-box-card ${text(box.tone || "gold")}"><div class="random-box-thumb"><span>🎁</span></div><div class="random-box-card-body"><div><div class="menu-title">${text(box.title)}</div><div class="helper-text">กล่องรางวัล mock สำหรับเดโม่</div></div><span class="status-pill primary">แต้มเปิด ${money(box.points)}</span><div class="random-box-card-actions"><button class="primary-btn" data-action="open-box-board" data-box="${text(box.id)}">เปิดกล่องสุ่ม</button><button class="secondary-btn" data-action="open-box-history" data-box="${text(box.id)}">ประวัติการเปิด</button></div></div></article>`;
}
function randomBoxModalHtml() {
  const cards = mock.randomBoxes.boxes.length ? `<div class="random-box-grid">${mock.randomBoxes.boxes.map(randomBoxCardHtml).join("")}</div>` : '<div class="empty-box random-box-empty">ไม่พบข้อมูล</div>';
  return modalShell("กิจกรรมกล่องสุ่ม", `<div class="random-box-modal field-stack"><div class="modal-block field-stack random-box-shell-card"><div class="random-box-summary"><div><div class="menu-title">กล่องสุ่มรางวัล</div><div class="helper-text">แต้มคงเหลือ mock: ${money(mock.randomBoxes.pointBalance)}</div></div><span class="status-pill primary">Mock Reward Box</span></div>${cards}</div></div>`, { panelClass: "modal-panel-wide random-box-modal-panel" });
}
function wheelPrizeIndex() { return Math.abs((state.form.wheelExchangeAmount || "").length + String(state.form.depositAmount || "").length + 1) % mock.wheel.prizes.length; }
function wheelModalHtml() {
  const amount = Number(state.form.wheelExchangeAmount || "0");
  const showError = state.wheelSubmitted && state.form.wheelExchangeAmount && amount < 1;
  const canExchange = state.form.wheelExchangeAmount.trim() && Number.isFinite(amount) && amount >= 1;
  const canSpin = mock.wheel.balance >= mock.wheel.costPerSpin && !state.wheelSpinning;
  return modalShell("กงล้อ", `<div class="wheel-modal field-stack"><div class="modal-block field-stack wheel-shell-card"><div class="wheel-stage"><div class="wheel-pointer"></div><div class="wheel-mock ${state.wheelSpinning ? "spinning" : ""}"><span class="wheel-center-icon">🎡</span></div></div><div class="wheel-info-grid"><div class="wheel-info-card"><span>แต้มปัจจุบัน</span><strong>${money(mock.wheel.balance)}</strong></div><div class="wheel-info-card"><span>ค่าใช้จ่ายต่อครั้ง</span><strong>${money(mock.wheel.costPerSpin).replace(".00", "")} ฝาหอย</strong></div><div class="wheel-info-card"><span>เครดิตกงล้อ</span><strong>${money(mock.wheel.credit)}</strong></div><div class="wheel-info-card"><span>ขั้นต่ำแลกเครดิต</span><strong>${money(1)}</strong></div></div><div class="helper-text wheel-cost-note">ใช้ ${money(mock.wheel.costPerSpin).replace(".00", "")} ฝาหอย เพื่อหมุนกงล้อ 1 ครั้ง</div><button class="${canSpin ? "primary-btn" : "disabled-btn"} wheel-spin-btn" data-action="spin-wheel" ${canSpin ? "" : "disabled"}>${state.wheelSpinning ? "กำลังหมุน..." : "หมุนกงล้อ"}</button><div class="wheel-exchange-panel"><div><div class="menu-title">แลกเงินเข้าเครดิต</div><div class="helper-text">ขั้นต่ำ ${money(1)} / เครดิตกงล้อ ${money(mock.wheel.credit)}</div></div><div class="wheel-exchange-grid"><div><label class="field-label">กรอกเงิน</label><div class="field-shell field-input-wrap"><input class="field-input" inputmode="decimal" data-field="wheelExchangeAmount" value="${text(state.form.wheelExchangeAmount)}" placeholder="0.00"><span class="input-suffix">บาท</span></div>${showError ? '<div class="validation">ขั้นต่ำ 1.00</div>' : ""}</div><button class="${canExchange ? "secondary-btn" : "disabled-btn"} wheel-exchange-btn" data-action="exchange-wheel-credit" ${canExchange ? "" : "disabled"}>แลกเงินเข้าเครดิต</button></div></div><div class="wheel-mini-actions"><button class="secondary-btn" data-action="open-wheel-history">ประวัติการหมุน</button><button class="link-btn" data-action="open-wheel-rules">อ่านกฎกติกา</button></div></div></div>`, { panelClass: "modal-panel-wide wheel-modal-panel" });
}
function wheelResultModalHtml() {
  const result = state.wheelResult || { reward: mock.wheel.prizes[0], datetime: nowText(), status: "สำเร็จ" };
  return modalShell("ผลรางวัลกงล้อ", `<div class="modal-block field-stack wheel-result-card"><div class="wheel-result-icon">🎉</div><div class="menu-title">ยินดีด้วย</div><div class="wheel-result-prize">${text(result.reward)}</div><div class="table-list"><div class="table-row"><span>วันที่/เวลา</span><strong>${text(result.datetime)}</strong></div><div class="table-row"><span>สถานะ</span><span class="status-pill success">${text(result.status)}</span></div></div><button class="primary-btn" data-action="back-wheel">กลับไปกงล้อ</button></div>`, { backAction: "back-wheel", panelClass: "wheel-modal-panel wheel-result-panel" });
}
function wheelHistoryModalHtml() {
  const rows = state.wheelResult ? [{ datetime: state.wheelResult.datetime, reward: state.wheelResult.reward, status: state.wheelResult.status }, ...mock.wheel.histories] : mock.wheel.histories;
  return modalShell("ประวัติการหมุน", `<div class="modal-block field-stack wheel-history-card"><div class="table-shell wheel-history-table"><div class="table-header-row"><div class="table-header-cell">วันที่/เวลา</div><div class="table-header-cell">รางวัล</div><div class="table-header-cell">สถานะ</div></div>${rows.map((row) => `<div class="table-row wheel-history-row"><div class="helper-text">${text(row.datetime)}</div><div class="menu-title">${text(row.reward)}</div><span class="status-pill success">${text(row.status)}</span></div>`).join("")}</div></div>`, { backAction: "back-wheel", panelClass: "wheel-modal-panel wheel-history-panel" });
}
function wheelRulesModalHtml() {
  const rules = ["ใช้ 10 แต้มต่อการหมุน 1 ครั้ง", "รางวัลเป็น mock", "ระบบยังไม่ต่อ API"];
  return modalShell("กฎกติกากงล้อ", `<div class="modal-block field-stack wheel-rules-card">${rules.map((item, index) => `<div class="table-row wheel-rule-row"><span class="wheel-rule-index">${index + 1}</span><div class="menu-title">${text(item)}</div></div>`).join("")}<button class="primary-btn" data-action="back-wheel">กลับไปกงล้อ</button></div>`, { backAction: "back-wheel", panelClass: "wheel-modal-panel wheel-rules-panel" });
}
function checkinTodayDay() { const day = new Date().getDate(); return Math.min(mock.checkin.totalDays, Math.max(1, Number.isFinite(day) ? day : 1)); }
function checkinCellState(day) {
  const today = checkinTodayDay();
  if (day === 1) return { status: "claimed", icon: "🎁", label: "รับแล้ว", action: "checkin-claimed" };
  if (day === 29) return { status: "ready", icon: "🪙", label: "พร้อมรับ", action: "checkin-reward" };
  if (day === 30) return { status: "next", icon: "•", label: "กิจกรรมถัดไป", action: "checkin-next" };
  if (day <= today) return { status: "denied", icon: "✕", label: day === today ? "วันนี้" : "ไม่ผ่าน", action: "checkin-denied" };
  return { status: "future", icon: "•", label: "ยังไม่ถึงวัน", action: "checkin-future" };
}
function checkinCell(day) {
  const cell = checkinCellState(day);
  const current = day === checkinTodayDay() ? " current" : "";
  return `<button class="calendar-card checkin-day-card checkin-status-${text(cell.status)}${current}" data-action="${text(cell.action)}" data-day="${day}"><span class="checkin-day-number">${day}</span><span class="calendar-icon">${text(cell.icon)}</span><span class="calendar-label">${text(cell.label)}</span></button>`;
}
function checkinSummaryHtml() {
  return `<div class="checkin-summary-grid"><div class="checkin-summary-card"><span>เช็คอินเดือนนี้</span><strong>${money(mock.checkin.checkedInCount).replace(".00", "")}/${money(mock.checkin.totalDays).replace(".00", "")} วัน</strong></div><div class="checkin-summary-card"><span>รางวัลวันนี้</span><strong>${text(mock.checkin.todayReward)}</strong></div></div>`;
}
function checkinLegendHtml() {
  return `<div class="checkin-legend-grid">${mock.checkin.legends.map((item, index) => `<div class="legend-row-demo checkin-legend-card"><span class="legend-dot legend-dot-${index + 1}"></span><span>${text(item)}</span></div>`).join("")}</div>`;
}
function checkinModalHtml() {
  return modalShell("เช็คอิน", `<div class="checkin-modal field-stack"><div class="modal-block field-stack checkin-shell-card">${checkinSummaryHtml()}<div class="calendar-grid-box checkin-calendar-grid">${Array.from({ length: mock.checkin.totalDays }, (_, index) => checkinCell(index + 1)).join("")}</div>${checkinLegendHtml()}<div class="checkin-actions"><button class="primary-btn checkin-deposit-btn" data-action="checkin-open-deposit">ฝากเงินเพื่อรับรางวัล</button><button class="link-btn checkin-rule-link" data-action="open-checkin-rules">อ่านกฎกติกา</button></div></div></div>`, { panelClass: "modal-panel-wide checkin-modal-panel" });
}
function checkinRulesModalHtml() {
  const rules = ["ฝากขั้นต่ำ 100 บาทต่อวัน", "เช็คอินได้ตามวันที่กำหนด", "รับรางวัลได้เมื่อผ่านเงื่อนไข", "ระบบนี้เป็น mock ยังไม่ต่อ API"];
  return modalShell("กฎกติกาเช็คอิน", `<div class="modal-block field-stack checkin-rules-card">${rules.map((item, index) => `<div class="table-row checkin-rule-row"><span class="checkin-rule-index">${index + 1}</span><div class="menu-title">${text(item)}</div></div>`).join("")}<button class="primary-btn" data-action="back-checkin">กลับไปเช็คอิน</button></div>`, { panelClass: "checkin-modal-panel checkin-rules-panel" });
}
function progressRow(item) { const percent = item.target > 0 ? Math.min(100, Math.round((item.current / item.target) * 100)) : 0; return `<div class="progress-row"><div class="progress-meta"><span>${text(item.label)}</span><strong>${money(item.current)} / ${money(item.target)}</strong></div><div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div></div>`; }
function rankingModalHtml() { return modalShell("Ranking", `<div class="modal-block field-stack ranking-modal-wide"><div class="promo-thumb-large">PG77 RANKING BANNER</div><div class="wallet-grid ranking-level-grid">${mock.ranking.levels.map((level, index) => `<div class="stat-card"><div class="menu-title">${index + 1}. ${text(level)}</div></div>`).join("")}</div><div class="ranking-stage"><div class="ranking-column"><div class="helper-text">ระดับปัจจุบัน</div><div class="ranking-icon silver">🧜‍♀️</div><div class="menu-title">${text(mock.ranking.currentLevel)}</div><button class="secondary-btn" data-action="level-up">อัพเลเวล</button><div class="helper-text">แต้ม/เหรียญ: 0</div></div><div class="ranking-column"><div class="helper-text">ระดับถัดไป</div><div class="ranking-icon gold">🧜‍♀️</div><div class="menu-title">${text(mock.ranking.nextLevel)}</div></div></div><div class="field-stack">${mock.ranking.progress.map(progressRow).join("")}</div><div class="wallet-grid">${mock.ranking.progress.map((item) => `<div class="stat-card"><div class="menu-title">${text(item.label)}</div><div class="menu-desc">${money(item.current)}</div></div>`).join("")}</div></div>`, { panelClass: "modal-panel-wide" }); }
function settingsModalHtml() { return modalShell("ตั้งค่า", `<div class="settings-block field-stack settings-panel"><div class="settings-row"><div class="settings-meta"><span class="settings-icon">🎵</span><span>เสียงเพลง</span></div><button class="switch-btn ${state.form.musicEnabled ? "on" : ""}" data-action="toggle-music"></button></div><div class="field-stack"><label class="field-label settings-inline-label"><span class="settings-meta"><span class="settings-icon">🔊</span><span>ระดับเสียง</span></span><strong>${text(state.form.volume)}%</strong></label><input class="settings-slider accent" type="range" min="0" max="100" data-field="volume" value="${text(state.form.volume)}"></div><div class="field-stack"><label class="field-label settings-meta"><span class="settings-icon">🎼</span><span>เพลง</span></label><div class="field-shell select-shell"><select class="field-input select-input" data-field="musicType"><option value="chill" ${state.form.musicType === "chill" ? "selected" : ""}>chill</option><option value="fun" ${state.form.musicType === "fun" ? "selected" : ""}>fun</option><option value="casino" ${state.form.musicType === "casino" ? "selected" : ""}>casino</option><option value="relax" ${state.form.musicType === "relax" ? "selected" : ""}>relax</option></select></div></div><div class="settings-row"><div class="settings-meta"><span class="settings-icon">💬</span><span>แชทเด้ง</span></div><button class="switch-btn ${state.form.chatPopupEnabled ? "on" : ""}" data-action="toggle-chat-popup"></button></div><button class="settings-submit-btn" data-action="save-settings">ยืนยัน</button></div>`, { panelClass: "settings-modal-panel" }); }
function contactModalHtml() { return modalShell("ติดต่อเรา", `<div class="modal-block field-stack"><button class="secondary-btn" data-action="line-toast">LINE</button><button class="secondary-btn" data-action="tg-toast">Telegram</button></div>`); }
function languageModalHtml() { return modalShell("เปลี่ยนภาษา", `<div class="modal-block field-stack"><button class="secondary-btn" data-action="language-toast" data-label="ภาษาไทย">ภาษาไทย</button><button class="secondary-btn" data-action="language-toast" data-label="English">English</button></div>`); }
function guideModalHtml(titleText, bodyText) { return modalShell(titleText, `<div class="modal-block"><div class="helper-text">${text(bodyText)}</div></div>`); }
function notificationTabsHtml() {
  const tabs = [
    ["all", "ทั้งหมด"],
    ["unread", "ยังไม่อ่าน"],
    ["promotion", "โปรโมชั่น"],
    ["system", "ระบบ"]
  ];
  return `<div class="notification-tabs">${tabs.map(([id, label]) => `<button class="notification-tab ${state.notificationFilter === id ? "active" : ""}" data-action="notification-filter" data-filter="${id}">${text(label)}</button>`).join("")}</div>`;
}
function filteredNotifications() {
  const filter = state.notificationFilter;
  return mock.notifications.filter((item) => {
    if (filter === "unread") return !notificationIsRead(item);
    if (filter === "promotion") return item.tag === "โปรโมชั่น" || item.tag === "VIP";
    if (filter === "system") return item.tag === "ระบบ";
    return true;
  });
}
function notificationCardHtml(item) {
  const read = notificationIsRead(item);
  return `<article class="notification-card ${read ? "read" : "unread"}"><button class="notification-card-main" data-action="open-notification-detail" data-id="${text(item.id)}"><div class="notification-cover">${text(item.cover)}</div><div class="notification-copy"><div class="notification-card-head"><span class="status-pill ${read ? "primary" : "warning"}">${read ? "อ่านแล้ว" : "ใหม่"}</span><span class="notification-tag">${text(item.tag)}</span></div><h4>${text(item.title)}</h4><p>${text(item.summary)}</p><div class="helper-text">${text(item.date)}</div></div></button><button class="link-btn notification-more" data-action="open-notification-detail" data-id="${text(item.id)}">ดูเพิ่มเติม</button></article>`;
}
function notificationsModalHtml() {
  const list = filteredNotifications();
  const count = unreadCount();
  const body = `<div class="notification-center"><div class="notification-summary"><div><div class="menu-title">ข่าวสาร</div><div class="helper-text">แจ้งเตือนจากระบบและโปรโมชัน mock</div></div><button class="${count > 0 ? "primary-btn" : "disabled-btn"}" data-action="read-all-notifications" ${count > 0 ? "" : "disabled"}>อ่านทั้งหมด</button></div>${notificationTabsHtml()}${list.length ? `<div class="notification-list">${list.map(notificationCardHtml).join("")}</div>` : `<div class="empty-box notification-empty"><div class="empty-icon">🔔</div><div class="menu-title">ไม่มีข่าวในหมวดนี้</div><div class="helper-text">ลองเปลี่ยน filter หรือกลับมาดูใหม่ภายหลัง</div></div>`}</div>`;
  return modalShell("ศูนย์ข่าวสาร", body, { panelClass: "notification-panel" });
}
function notificationDetailModalHtml() {
  const item = mock.notifications.find((news) => news.id === state.selectedNotificationId) || mock.notifications[0];
  const detailBody = `<div class="notification-detail"><div class="notification-hero">${text(item.cover)}</div><div class="notification-detail-meta"><span class="notification-tag">${text(item.tag)}</span><span>${text(item.date)}</span></div><h3>${text(item.title)}</h3>${item.body.map((line) => `<p>${text(line)}</p>`).join("")}<div class="inline-actions"><button class="secondary-btn" data-action="close-modal">ปิด</button><button class="primary-btn" data-action="${item.cta === "ไปยังโปรโมชั่น" ? "open-promotions" : "back-notifications"}">${text(item.cta || "ดูต่อ")}</button></div></div>`;
  return modalShell("รายละเอียดข่าวสาร", detailBody, { backAction: "back-notifications", panelClass: "notification-detail-panel" });
}
function newsModalHtml() { return notificationsModalHtml(); }

function activeModalHtml() {
  if (state.newsOpen && !state.activeModal) return newsModalHtml();
  if (!state.activeModal) return "";
  if (state.activeModal === "notifications") return notificationsModalHtml();
  if (state.activeModal === "notification-detail") return notificationDetailModalHtml();
  if (state.activeModal === "auth") return authModalHtml();
  if (state.activeModal === "deposit") return depositModalHtml();
  if (state.activeModal === "deposit-success") return depositSuccessModalHtml();
  if (state.activeModal === "deposit-ticket") return depositTicketModalHtml();
  if (state.activeModal === "gift-success") return giftSuccessModalHtml();
  if (state.activeModal === "qr-payment") return qrPaymentModalHtml();
  if (state.activeModal === "withdraw-success") return withdrawSuccessModalHtml();
  if (state.activeModal === "profile") return profileModalHtml();
  if (state.activeModal === "history") return historyModalHtml();
  if (state.activeModal === "promotions") return promotionsModalHtml();
  if (state.activeModal === "promotion-detail") return promotionDetailModalHtml();
  if (state.activeModal === "rebates") return rebatesModalHtml();
  if (state.activeModal === "commission-detail") return commissionDetailModalHtml();
  if (state.activeModal === "revenue") return revenueModalHtml();
  if (state.activeModal === "revenue-detail") { if (state.revenueView === "members") return revenueMembersModalHtml(); if (state.revenueView === "freebies") return revenueFreebiesModalHtml(); return revenueMetricModalHtml(); }
  if (state.activeModal === "wallet") return walletModalHtml();
  if (state.activeModal === "shop") return shopModalHtml();
  if (state.activeModal === "provider") return providerModalHtml();
  if (state.activeModal === "bonus-tracker") return bonusTrackerModalHtml();
  if (state.activeModal === "freebies") return freebiesModalHtml();
  if (state.activeModal === "coupon") return couponModalHtml();
  if (state.activeModal === "random-box") return randomBoxModalHtml();
  if (state.activeModal === "random-box-open") return randomBoxOpenModalHtml();
  if (state.activeModal === "random-box-result") return randomBoxResultModalHtml();
  if (state.activeModal === "random-box-history") return randomBoxHistoryModalHtml();
  if (state.activeModal === "wheel") return wheelModalHtml();
  if (state.activeModal === "wheel-result") return wheelResultModalHtml();
  if (state.activeModal === "wheel-history") return wheelHistoryModalHtml();
  if (state.activeModal === "wheel-rules") return wheelRulesModalHtml();
  if (state.activeModal === "checkin") return checkinModalHtml();
  if (state.activeModal === "checkin-rules") return checkinRulesModalHtml();
  if (state.activeModal === "ranking") return rankingModalHtml();
  if (state.activeModal === "settings") return settingsModalHtml();
  if (state.activeModal === "contact") return contactModalHtml();
  if (state.activeModal === "language") return languageModalHtml();
  if (state.activeModal === "guide") return guideModalHtml("คู่มือ", "คู่มือการใช้งานใน PG77 เป็น mock ทั้งหมด");
  if (state.activeModal === "download") return guideModalHtml("คู่มือการดาวน์โหลด", "คู่มือการดาวน์โหลดใน PG77 เป็น mock ทั้งหมด");
  return guideModalHtml("PG77", "เมนูนี้เป็น mock");
}

function playPageHtml() {
  const success = Boolean(state.playMessage);
  return `<div class="play-page"><div class="play-wrap"><div class="topbar-card"><div class="top-row"><button class="icon-btn" data-action="back-home">←</button><div class="logo-pill">${brandLogoHtml("site-logo")}<span class="logo-wordmark">PG77</span></div><button class="icon-btn" data-action="open-contact">?</button></div></div><div class="play-panel"><div class="play-card">${brandLogoHtml("error-logo")}<div class="play-icon">${success ? "✓" : "!"}</div><h2>${success ? "Launch mock สำเร็จ" : "มีบางอย่างผิดพลาด ไม่สามารถเชื่อมต่อได้"}</h2><p>${text(state.playMessage || "เกมทั้งหมดในระบบนี้เป็น mock data และไม่มีการเชื่อมต่อออกเว็บจริง")}</p>${state.playUrl ? `<div class="helper-text">${text(state.playUrl)}</div>` : ""}<button class="auth-submit" data-action="back-home">กลับหน้าแรก</button></div></div></div></div>`;
}
function render() { const app = document.getElementById("app"); const overlayRoot = document.getElementById("overlay-root"); const inPlay = location.hash === "#/playgame"; document.body.classList.toggle("home-v2-active", isHomeV2() && !inPlay); app.innerHTML = inPlay ? playPageHtml() : (isHomeV2() ? homeV2PageHtml() : homePageHtml()); overlayRoot.innerHTML = `<div class="overlay ${overlayVisible() ? "show" : ""}" data-action="overlay-close"></div>${inPlay ? "" : activeModalHtml()}<div class="toast-stack">${state.toasts.map((item) => `<div class="toast">${text(item.message)}</div>`).join("")}</div>`; }
function openRevenueDetail(target) { state.activeModal = "revenue-detail"; if (target === "members") state.revenueView = "members"; else if (target === "freebies") state.revenueView = "freebies"; else { state.revenueView = "metric"; state.revenueMetricType = target; state.modalTabs.revenueMetric = "overview"; } render(); }
function handleDrawerItem(item) {
  state.drawerOpen = false;
  if (item === "ฝาก - ถอน") { openDeposit("drawer"); return; }
  if (item === "ข้อมูลโปรไฟล์") { requireLoginModal("profile", () => loadMemberData(true)); return; }
  if (item === "ประวัติการใช้งาน") { requireLoginModal("history", () => { loadDeposits(); loadWithdrawals(); }); return; }
  if (item === "โปรโมชั่น") { requireLoginModal("promotions", () => loadPromotions()); return; }
  if (item === "รับยอดเสีย") { requireLogin(() => { state.modalTabs.rebate = "lossback"; setModal("rebates"); }); return; }
  if (item === "สร้างรายได้") { requireLogin(() => { state.revenueView = "main"; setModal("revenue"); }); return; }
  if (item === "รับเครดิตฟรี") { requireLoginModal("freebies"); return; }
  if (item === "กรอกโค้ด") { requireLoginModal("coupon"); return; }
  if (item === "กล่องสุ่ม") { requireLoginModal("random-box"); return; }
  if (item === "กงล้อ") { requireLoginModal("wheel"); return; }
  if (item === "เช็คอิน") { requireLoginModal("checkin"); return; }
  if (item === "Ranking") { requireLoginModal("ranking"); return; }
  if (item === "ร้านค้า") { requireLoginModal("shop"); return; }
  if (item === "ติดต่อเรา") { setModal("contact"); return; }
  if (item === "เปลี่ยนภาษา") { setModal("language"); return; }
  if (item === "คู่มือ") { setModal("guide"); return; }
  if (item === "คู่มือการดาวน์โหลด") { setModal("download"); return; }
  if (item === "ออกจากระบบ") { logoutMember(); return; }
  addToast("เมนูนี้เป็น mock");
}

function openWalletTarget(item) {
  state.activeModal = "";
  if (item === "freeCredit") { state.modalTabs.freebies = "credits"; state.activeModal = "freebies"; render(); return; }
  if (item === "promotion") { state.activeModal = "promotions"; render(); return; }
  if (item === "freeDiamond") { state.modalTabs.freebies = "diamonds"; state.activeModal = "freebies"; render(); return; }
  if (item === "couponCode") { state.activeModal = "coupon"; render(); return; }
  if (item === "randomBox") { state.activeModal = "random-box"; render(); return; }
  if (item === "wheel") { state.activeModal = "wheel"; render(); return; }
  if (item === "ranking") { state.activeModal = "ranking"; render(); return; }
  if (item === "income") { state.revenueView = "main"; state.activeModal = "revenue"; render(); return; }
  if (item === "cashback") { state.modalTabs.rebate = "lossback"; state.activeModal = "rebates"; render(); return; }
  if (item === "checkin") { state.activeModal = "checkin"; render(); return; }
  if (item === "bonusTracker") { state.activeModal = "bonus-tracker"; render(); return; }
  if (item === "shop") { state.activeModal = "shop"; render(); return; }
  addToast("เมนูนี้เป็น mock");
  render();
}

async function launchGameMock(element) {
  requireLogin(async () => {
    const providerAttr = element.getAttribute("data-provider") || state.selectedProviderId || "";
    const gameAttr = element.getAttribute("data-game") || "";
    const provider = mock.providers.find((item) => item.id === providerAttr || item.code === providerAttr) || mock.providers[0] || { code: "PG", id: "PG", name: "PG" };
    const providerCode = provider.code || provider.id || "PG";
    const games = state.gamesByProvider[providerCode] || state.gamesByProvider[provider.id] || [];
    const game = games.find((item) => item.code === gameAttr || item.name === gameAttr) || games[0] || { code: gameAttr || "fortune_tiger", name: gameAttr || "Fortune Tiger" };
    state.loading.launchGame = true;
    render();
    state.playUrl = "";
    state.playMessage = `Launch mock สำเร็จ: ${providerCode} / ${game.code || game.name}`;
    addToast("launch mock สำเร็จ");
    state.activeModal = "";
    location.hash = "#/playgame";
    state.loading.launchGame = false;
    render();
  });
}

async function submitDepositSuccess(channel, amountValue, status = "pending") {
  if (state.loading.depositSubmit) return;
  const amount = Number(amountValue || "0");
  if (!Number.isFinite(amount) || amount <= 0) { state.errors.depositAmount = "กรุณากรอกจำนวนเงิน"; render(); return; }
  state.loading.depositSubmit = true;
  render();
  try {
    const note = `member-demo: ${channel}; promotion=${state.form.depositPromo || "ไม่รับโปรโมชั่น"}`;
    const item = await createDepositRequest(channel, amount, note);
    state.lastDeposit = { ...item, channel, amount, promo: state.form.depositPromo || "ไม่รับโปรโมชั่น", status: item.status || "pending" };
    state.depositHistory.unshift(state.lastDeposit);
    state.errors.depositAmount = "";
    state.errors.walletAmount = "";
    state.errors.qr = "";
    state.activeModal = "deposit-success";
    await loadDeposits(true);
    addToast("รายการฝากรอแอดมินอนุมัติ");
  } catch (error) {
    state.errors.depositAmount = apiErrorMessage(error);
    if (!isAuthExpiredError(error)) addToast(state.errors.depositAmount);
  }
  state.loading.depositSubmit = false;
  render();
}

function submitWalletDeposit() {
  const wallet = depositData().walletAccount;
  const amount = Number(state.form.walletAmount || "0");
  state.errors.walletAmount = !state.form.walletAmount.trim() || !Number.isFinite(amount) || amount <= 0 ? "กรุณากรอกจำนวนเงิน" : amount < wallet.min ? `ฝากขั้นต่ำ ${money(wallet.min)}` : amount > wallet.max ? `ฝากสูงสุด ${money(wallet.max)}` : "";
  if (state.errors.walletAmount) { render(); return; }
  const item = { id: transactionRef("WALLET"), datetime: nowText(), channel: "TrueMoney Wallet", amount, promo: state.form.depositPromo || "ไม่รับโปรโมชั่น", status: "สำเร็จ mock" };
  state.lastDeposit = item;
  state.depositHistory.unshift(item);
  state.activeModal = "deposit-success";
  addToast("TrueMoney Wallet ยังเป็น mock");
  render();
}

function submitQrPayment() {
  const amount = Number(state.form.qrAmount || "0");
  state.errors.qr = !state.form.qrPayment ? "กรุณาเลือก Payment" : !state.form.qrAccount ? "กรุณาเลือกบัญชี" : !state.form.qrAmount.trim() || !Number.isFinite(amount) || amount <= 0 ? "กรุณากรอกจำนวนเงิน" : "";
  if (state.errors.qr) { render(); return; }
  state.qrPaymentRef = transactionRef("QR");
  state.activeModal = "qr-payment";
  render();
}

function simulateQrPaid() {
  if (state.loading.depositSubmit) return;
  const amount = Number(state.form.qrAmount || "0");
  if (!Number.isFinite(amount) || amount <= 0) { state.errors.qr = "กรุณากรอกจำนวนเงิน"; render(); return; }
  state.loading.depositSubmit = true;
  render();
  createDepositRequest("QR PAY", amount, `member-demo: QR PAY mock; ref=${state.qrPaymentRef || "-"}`)
    .then(async (item) => {
      state.lastDeposit = { ...item, channel: "QR PAY", amount, promo: state.form.depositPromo || "ไม่รับโปรโมชั่น", status: item.status || "pending" };
      state.depositHistory.unshift(state.lastDeposit);
      state.activeModal = "deposit-success";
      await loadDeposits(true);
      addToast("รายการฝากรอแอดมินอนุมัติ");
    })
    .catch((error) => {
      state.errors.qr = apiErrorMessage(error);
      if (!isAuthExpiredError(error)) addToast(state.errors.qr);
    })
    .finally(() => {
      state.loading.depositSubmit = false;
      render();
    });
}

async function submitSlipDeposit() {
  if (state.loading.depositSubmit) return;
  const amount = Number(state.form.slipAmount || "0");
  state.errors.slip = {
    ownBank: state.form.slipOwnBank ? "" : "กรุณาเลือกบัญชีลูกค้า",
    targetBank: state.form.slipTargetBank ? "" : "กรุณาเลือกบัญชีที่ฝากเข้า",
    amount: !state.form.slipAmount.trim() || !Number.isFinite(amount) || amount <= 0 ? "กรุณากรอกจำนวนเงิน" : "",
    file: state.form.slipUploaded ? "" : "กรุณาอัปโหลดสลิป mock"
  };
  if (Object.values(state.errors.slip).some(Boolean)) { render(); return; }
  state.loading.depositSubmit = true;
  render();
  try {
    const created = await createDepositRequest("ฝากแนบสลิป", amount, `member-demo: slip_upload_mock; from=${state.form.slipOwnBank}; to=${state.form.slipTargetBank}`);
    const item = { ref: created.id || transactionRef("SLIP"), title: "ส่งรายการฝากแนบสลิปสำเร็จ", datetime: created.datetime || nowText(), channel: "ฝากแนบสลิป", customerAccount: state.form.slipOwnBank, targetAccount: state.form.slipTargetBank, amount, status: created.status || "pending", message: "รอแอดมินอนุมัติ" };
    state.lastDepositTicket = item;
    state.depositHistory.unshift({ datetime: item.datetime, channel: item.channel, amount: item.amount, status: item.status });
    state.activeModal = "deposit-ticket";
    await loadDeposits(true);
    addToast("รายการฝากรอแอดมินอนุมัติ");
  } catch (error) {
    state.errors.slip.amount = apiErrorMessage(error);
    if (!isAuthExpiredError(error)) addToast(state.errors.slip.amount);
  }
  state.loading.depositSubmit = false;
  render();
}

function checkGiftLink() {
  const link = state.form.giftCode.trim();
  state.giftCheckResult = null;
  state.errors.gift = !link ? "กรุณากรอกลิงก์ซองของขวัญ" : !link.startsWith("https://gift.truemoney.com/") ? "รูปแบบลิงก์ซองของขวัญไม่ถูกต้อง" : "";
  if (!state.errors.gift) state.giftCheckResult = { amount: 100, status: "พร้อมทำรายการ" };
  render();
}

function submitGiftDeposit() {
  const link = state.form.giftCode.trim();
  state.errors.gift = link ? "" : "กรุณากรอกซองของขวัญ";
  if (state.errors.gift) { render(); return; }
  const amount = state.giftCheckResult ? state.giftCheckResult.amount : 100;
  const item = { ref: "GIFT-20260507-001", datetime: nowText(), channel: "True Wallet Gift", amount, status: "สำเร็จ mock" };
  state.lastGiftDeposit = item;
  state.depositHistory.unshift({ datetime: item.datetime, channel: item.channel, amount: item.amount, status: item.status });
  state.activeModal = "gift-success";
  render();
}

function submitConfirmDeposit() {
  const amount = Number(state.form.confirmAmount || "0");
  state.errors.confirm = {
    ownBank: state.form.confirmOwnBank ? "" : "กรุณาเลือกบัญชีลูกค้า",
    targetBank: state.form.confirmTargetBank ? "" : "กรุณาเลือกบัญชีที่ฝากเข้า",
    amount: !state.form.confirmAmount.trim() || !Number.isFinite(amount) || amount <= 0 ? "กรุณากรอกจำนวนเงินมากกว่า 0" : "",
    date: state.form.confirmDate ? "" : "กรุณาเลือกวันที่ทำรายการฝาก"
  };
  if (Object.values(state.errors.confirm).some(Boolean)) { render(); return; }
  const item = { ref: "CONFIRM-20260507-001", title: "ส่งคำขอยืนยันยอดฝากสำเร็จ mock", datetime: nowText(), channel: "ยืนยันยอดฝาก", customerAccount: state.form.confirmOwnBank, targetAccount: state.form.confirmTargetBank, amount, status: "รอตรวจสอบ", message: "ระบบรับคำขอยืนยันยอดฝากไว้แล้ว" };
  state.lastDepositTicket = item;
  state.depositHistory.unshift({ datetime: item.datetime, channel: item.channel, amount: item.amount, status: item.status });
  state.activeModal = "deposit-ticket";
  render();
}

async function submitWithdrawRequest() {
  if (state.loading.withdrawSubmit) return;
  const amount = Number(state.form.withdrawAmount || "0");
  const canWithdraw = mock.user.balance >= depositData().withdrawMin;
  const account = depositData().withdrawAccounts.find((item) => item.id === state.selectedWithdrawAccount);
  state.errors.withdraw = !account ? "ยังไม่มีบัญชีธนาคารที่อนุมัติ กรุณาให้ Backoffice อนุมัติก่อน" : !canWithdraw ? "คุณไม่ผ่านเงื่อนไขการถอนเงิน" : !state.form.withdrawAmount.trim() || !Number.isFinite(amount) || amount <= 0 ? "กรุณากรอกจำนวนเงิน" : amount > mock.user.balance ? "จำนวนเงินมากกว่าเครดิต" : "";
  if (state.errors.withdraw) { render(); return; }
  state.loading.withdrawSubmit = true;
  render();
  try {
    const data = await apiPost("/withdrawals", {
      user_bank_account_id: account.id,
      amount,
      note: state.form.withdrawNote || "member-demo withdrawal"
    });
    const item = normalizeWithdraw(data.withdrawal || data.transaction || data);
    state.lastWithdraw = {
      ...item,
      account: state.form.withdrawAccount || `${account.bank} / ${account.owner} / ${account.masked}`,
      amount,
      status: item.status || "pending"
    };
    state.withdrawHistory.unshift(state.lastWithdraw);
    state.activeModal = "withdraw-success";
    await Promise.allSettled([loadWithdrawals(true), loadWallet()]);
    addToast("รายการถอนอยู่ในสถานะ pending");
  } catch (error) {
    state.errors.withdraw = apiErrorMessage(error);
    if (!isAuthExpiredError(error)) addToast(state.errors.withdraw);
  }
  state.loading.withdrawSubmit = false;
  render();
}

async function claimPromotion(id) {
  if (!state.loggedIn) {
    requireLogin(() => {});
    return;
  }
  const promotion = mock.promotions.find((item) => item.id === id) || mock.promotions[0];
  if (!promotion) return;
  state.loading.promotionClaim = true;
  render();
  state.selectedPromotionId = promotion.id;
  state.form.depositPromo = promotion.title;
  state.form.promotionSelect = promotion.title;
  state.promotionClaimResult = { title: promotion.title, min: promotion.min, detail: promotion.detail, status: "รับแล้ว" };
  state.loading.promotionClaim = false;
  addToast("รับโปรโมชั่นสำเร็จ");
  render();
}

function selectPromotionMock(value, showToast = true) {
  const selected = value || "ไม่รับโปรโมชั่น";
  const promo = mock.promotions.find((item) => item.title === selected);
  const nextId = promo ? promo.id : "";
  const unchanged = state.form.promotionSelect === selected && state.form.depositPromo === selected && state.selectedPromotionId === nextId;
  state.form.promotionSelect = selected;
  state.form.depositPromo = selected;
  state.selectedPromotionId = nextId;
  state.promotionClaimResult = null;
  if (showToast && !unchanged) addToast("เลือกโปรโมชั่นแล้ว");
}

function submitCouponCode() {
  const code = state.form.couponCode.trim().toUpperCase();
  state.couponSubmitted = true;
  state.couponResult = null;
  state.errors.coupon = !code ? "กรุณากรอกโค้ด" : "";
  if (state.errors.coupon) { render(); return; }
  if (code === "CODE100") {
    state.couponResult = { status: "success", type: "credit", amount: 100 };
    state.bonusHistory.unshift({ title: "กรอกโค้ด CODE100", amount: 100, date: nowText(), status: "success" });
  } else if (code === "DIAMOND20") {
    state.couponResult = { status: "success", type: "diamond", amount: 20 };
    state.bonusHistory.unshift({ title: "กรอกโค้ด DIAMOND20", amount: 20, date: nowText(), status: "success" });
  } else {
    state.couponResult = { status: "error" };
  }
  render();
}

function claimMemberReward(type, indexValue) {
  const index = Number(indexValue || "0");
  const list = type === "diamonds" ? mock.memberRewards.diamonds : mock.memberRewards.credits;
  const item = list[index] || list[0];
  if (!item || state.claimedRewards[type][index]) return;
  const amount = rewardAmountFromTitle(item.title);
  state.claimedRewards[type][index] = true;
  state.rewardClaimResult = { type, amount, datetime: nowText() };
  state.bonusHistory.unshift({ title: type === "diamonds" ? "รับเพชรฟรี" : "รับเครดิตฟรี", amount, date: state.rewardClaimResult.datetime, status: "success" });
  addToast(type === "diamonds" ? "รับเพชร mock สำเร็จ" : "รับโบนัส mock สำเร็จ");
  render();
}

function setShopReceipt(title, points, before, after) {
  const receipt = { title, points, before, after, datetime: nowText(), status: "สำเร็จ" };
  state.shopReceipt = receipt;
  state.shopHistories.unshift({ datetime: receipt.datetime, reward: title, status: receipt.status });
}

function redeemShopReward(id) {
  const reward = mock.shop.rewards.find((item) => item.id === id);
  if (!reward) return;
  if (state.shopPointBalance < reward.points) {
    state.errors.shopReward = "แต้มไม่เพียงพอ";
    render();
    return;
  }
  const before = state.shopPointBalance;
  state.shopPointBalance = before - reward.points;
  state.errors.shopReward = "";
  setShopReceipt(reward.title, reward.points, before, state.shopPointBalance);
  render();
}

function submitShopExchange(type) {
  const isCredit = type === "credit";
  const pointKey = isCredit ? "shopCreditPoints" : "shopCashPoints";
  const errorKey = isCredit ? "shopCredit" : "shopCash";
  const points = Number(state.form[pointKey] || "0");
  state.errors[errorKey] = !state.form[pointKey].trim() || !Number.isFinite(points) || points <= 0 ? "กรุณากรอกแต้ม" : points > state.shopPointBalance ? "แต้มไม่เพียงพอ" : "";
  if (state.errors[errorKey]) { render(); return; }
  const before = state.shopPointBalance;
  state.shopPointBalance = before - points;
  const amount = points / 10;
  setShopReceipt(isCredit ? `แลกเครดิต ${money(amount)}` : `แลกเงินสด ${money(amount)}`, points, before, state.shopPointBalance);
  addToast(isCredit ? "แลกเครดิต mock สำเร็จ" : "แลกเงินสด mock สำเร็จ");
  render();
}

function spinWheelMock() {
  if (mock.wheel.balance < mock.wheel.costPerSpin) {
    addToast("แต้มไม่พอสำหรับหมุนกงล้อ");
    return;
  }
  if (state.wheelSpinning) return;
  state.wheelSpinning = true;
  state.wheelResult = null;
  render();
  window.setTimeout(() => {
    if (state.activeModal !== "wheel") return;
    const reward = mock.wheel.prizes[0] || "ได้รับเครดิตฟรี 20.00";
    state.wheelSpinning = false;
    state.wheelResult = { reward, datetime: nowText(), status: "สำเร็จ" };
    state.activeModal = "wheel-result";
    render();
  }, 1400);
}

function openRandomBoxMock(id) {
  const box = mock.randomBoxes.boxes.find((item) => item.id === id) || mock.randomBoxes.boxes[0];
  if (!box) return;
  if (mock.randomBoxes.pointBalance < box.points) {
    addToast("แต้มไม่พอสำหรับเปิดกล่องสุ่ม");
    return;
  }
  state.activeBoxId = box.id;
  state.selectedBoxReward = "";
  state.boxResult = null;
  state.boxOpening = true;
  state.activeModal = "random-box-open";
  render();
  window.setTimeout(() => {
    if (state.activeModal !== "random-box-open") return;
    const reward = box.id === "box-2" ? "500.00 เครดิต" : "100.00 เครดิต";
    state.boxOpening = false;
    state.boxResult = { reward, datetime: nowText(), status: "สำเร็จ" };
    state.activeModal = "random-box-result";
    render();
  }, 1200);
}

function toggleAuthPasswordReveal(formKey, fieldKeys, button) {
  state.form[formKey] = !state.form[formKey];
  const show = state.form[formKey];
  const scope = button.closest(".auth-modal-panel") || document;
  fieldKeys.forEach((key) => {
    const input = scope.querySelector(`[data-field="${key}"]`);
    if (input) input.type = show ? "text" : "password";
  });
  button.textContent = show ? "ซ่อน" : "แสดง";
}

function updateAuthRadioState(target) {
  const row = target.closest(".radio-row");
  if (!row) return;
  row.querySelectorAll(".radio-chip").forEach((chip) => {
    const input = chip.querySelector('input[type="radio"]');
    chip.classList.toggle("active", Boolean(input && input.checked));
  });
}

function handleAction(action, element) {
  if (!action) return;
  if (action === "overlay-close") { overlayCloseAction(); return; }
  if (action.startsWith("category-")) { state.activeCategory = action.slice(9); if (isHomeV2()) state.search = ""; render(); return; }
  if (/^banner-\d+$/.test(action)) { setActiveBanner(action.split("-")[1]); return; }
  const actions = {
    "toggle-drawer": () => { state.drawerOpen = !state.drawerOpen; render(); },
    "toggle-quick-menu": () => { state.quickMenuOpen = !state.quickMenuOpen; render(); },
    "close-drawer": closeDrawer,
    "close-modal": closeModal,
    "open-login": () => openAuth("login"),
    "open-register": () => openAuth("register"),
    "guest-deposit": () => openDeposit("page"),
    "service-toast": () => addToast("เปิดบริการ 24 ชั่วโมง mock"),
    "open-news": () => { state.activeModal = "notifications"; render(); },
    "open-notifications": () => { state.notificationFilter = "all"; state.activeModal = "notifications"; state.newsOpen = false; render(); },
    "notification-filter": () => { state.notificationFilter = element.getAttribute("data-filter") || "all"; render(); },
    "open-notification-detail": () => { const id = element.getAttribute("data-id") || ""; state.selectedNotificationId = id; if (id) state.notificationRead[id] = true; state.activeModal = "notification-detail"; state.newsOpen = false; render(); },
    "open-announcement-detail": () => { const id = element.getAttribute("data-id") || ""; state.selectedNotificationId = id; if (id) state.notificationRead[id] = true; state.activeModal = "notification-detail"; render(); },
    "back-notifications": () => { state.selectedNotificationId = ""; state.activeModal = "notifications"; render(); },
    "read-all-notifications": () => { mock.notifications.forEach((item) => { state.notificationRead[item.id] = true; }); render(); },
    "confirm-news": () => { if (state.suppressNews) saveNewsPreference(); state.newsOpen = false; state.activeModal = ""; render(); },
    "toggle-suppress-news": () => { state.suppressNews = !state.suppressNews; render(); },
    "refresh-credit": refreshWallet,
    "refresh-wallet": refreshWallet,
    "refresh-profile-bank": refreshProfileBankAccounts,
    "refresh-history": refreshHistory,
    "banner-prev": () => setActiveBanner(state.activeBanner - 1),
    "banner-next": () => setActiveBanner(state.activeBanner + 1),
    "clear-search": () => { state.search = ""; render(); },
    "open-wallet": () => requireLoginModal("wallet", () => loadMemberData(true)),
    "open-settings": () => setModal("settings"),
    "open-profile": () => requireLoginModal("profile", () => loadMemberData(true)),
    "open-promotions": () => requireLoginModal("promotions", () => loadPromotions()),
    "open-rebates": () => requireLogin(() => { state.modalTabs.rebate = "lossback"; setModal("rebates"); }),
    "open-revenue": () => requireLogin(() => { state.revenueView = "main"; setModal("revenue"); }),
    "open-deposit-page": () => openDeposit("page"),
    "open-deposit-bottom": () => openDeposit("page"),
    "line-toast": () => addToast("เปิด LINE mock"),
    "tg-toast": () => addToast("เปิด Telegram mock"),
    "bottom-home": () => { window.scrollTo({ top: 0, behavior: "smooth" }); addToast("อยู่หน้าหลักแล้ว"); },
    "game-center": () => { setModal("provider"); loadProviders(); },
    "open-provider": () => { setModal("provider"); loadProviders(); },
    "play-game": () => launchGameMock(element),
    "home-v2-play-game": () => { requireLogin(() => launchGameMock(element)); },
    "home-v2-focus-games": () => { const target = document.getElementById("home-v2-games"); if (target) target.scrollIntoView({ behavior: "smooth", block: "start" }); },
    "home-v2-open-withdraw": () => requireLogin(() => { state.drawerOpen = false; state.depositEntry = "page"; state.modalTabs.deposit = "withdraw"; state.modalTabs.depositView = "main"; setModal("deposit"); }),
    "home-v2-free-credit": () => requireLogin(() => { state.modalTabs.freebies = "credits"; setModal("freebies"); }),
    "home-v2-random-box": () => requireLoginModal("random-box"),
    "home-v2-wheel": () => requireLoginModal("wheel"),
    "home-v2-checkin": () => requireLoginModal("checkin"),
    "home-v2-shop": () => requireLoginModal("shop"),
    "footer-guide-register": () => addToast("เปิดคู่มือสมัครสมาชิกแบบ mock"),
    "footer-guide-deposit": () => addToast("เปิดคู่มือฝากถอนแบบ mock"),
    "footer-faq": () => addToast("เปิด FAQ แบบ mock"),
    "footer-email": () => addToast("เปิด Email mock"),
    "auth-login": () => { state.modalTabs.auth = "login"; render(); },
    "auth-register": () => { state.modalTabs.auth = "register"; resetRegisterWizard(); render(); },
    "toggle-login-reveal": () => toggleAuthPasswordReveal("loginReveal", ["loginPassword"], element),
    "toggle-register-reveal": () => toggleAuthPasswordReveal("registerReveal", ["registerPassword", "registerConfirmPassword"], element),
    "toggle-login-remember": () => { state.form.loginRemember = !state.form.loginRemember; },
    "toggle-register-accepted": () => { state.form.registerAccepted = !state.form.registerAccepted; state.errors.register.accepted = ""; },
    "forgot-password": () => addToast("เมนูนี้เป็น mock"),
    "demo-member-login": loginDemoMember,
    "submit-login": () => { state.errors.login = loginErrors(); if (Object.values(state.errors.login).some(Boolean)) { render(); return; } submitLogin(state.form.loginPhone.trim(), state.form.loginPassword); },
    "login-social": () => { const method = element.getAttribute("data-method") || "social"; completeDemoLogin(`เข้าสู่ระบบด้วย ${registerMethodLabel(method)} mock สำเร็จ`); },
    "register-method": () => { state.registerMethod = element.getAttribute("data-method") || ""; state.registerStep = 2; state.errors.register = {}; render(); },
    "register-connect-line": () => { state.registerLineConnected = true; state.errors.register.line = ""; addToast("เชื่อมต่อ LINE mock แล้ว"); render(); },
    "register-connect-telegram": () => { state.registerTelegramConnected = true; state.errors.register.telegram = ""; addToast("เชื่อมต่อ Telegram mock แล้ว"); render(); },
    "register-back": () => { state.registerStep = Math.max(1, state.registerStep - 1); state.errors.register = {}; render(); },
    "register-next": () => { const errors = registerStepErrors(state.registerStep); state.errors.register = errors; if (Object.values(errors).some(Boolean)) { render(); return; } state.registerStep = Math.min(3, state.registerStep + 1); state.errors.register = {}; render(); },
    "bonus-yes": () => { state.form.registerBonus = "รับโบนัส"; },
    "bonus-no": () => { state.form.registerBonus = "ไม่รับโบนัส"; },
    "submit-register": () => { state.errors.register = registerErrors(); if (Object.values(state.errors.register).some(Boolean)) { state.registerStep = Object.values(registerStepErrors(1)).some(Boolean) ? 1 : Object.values(registerStepErrors(2)).some(Boolean) ? 2 : 3; render(); return; } submitRegisterMember(); },
    "deposit-tab": () => { state.modalTabs.deposit = "deposit"; state.modalTabs.depositView = "main"; render(); },
    "withdraw-tab": () => { state.modalTabs.deposit = "withdraw"; state.modalTabs.depositView = "main"; render(); },
    "deposit-method": () => selectDepositMethod(element),
    "deposit-method-select": () => selectDepositMethod(element),
    "select-deposit-method": () => selectDepositMethod(element),
    "select-deposit-account": () => {
      state.selectedDepositAccount = element.getAttribute("data-account") || "";
      addToast("เลือกบัญชีแล้ว");
    },
    "copy-deposit-account": () => {
      const accountId = element.getAttribute("data-account") || state.selectedDepositAccount;
      const account = depositData().depositAccounts.find((item) => item.id === accountId);
      if (account && navigator.clipboard) navigator.clipboard.writeText(account.number).catch(() => {});
      addToast(account ? "คัดลอกเลขบัญชีแล้ว" : "ไม่มีบัญชีที่สามารถทำรายการได้ในตอนนี้");
    },
    "deposit-back-main": () => { state.modalTabs.depositView = "main"; render(); },
    "deposit-back-drawer": () => { closeModal(); state.drawerOpen = true; render(); },
    "amount-pick": () => { const key = element.getAttribute("data-field-key") || "depositAmount"; state.form[key] = element.getAttribute("data-value") || ""; state.errors.depositAmount = ""; state.errors.walletAmount = ""; state.errors.qr = ""; render(); },
    "submit-auto-deposit": () => submitDepositSuccess("ฝากเงินออโต้", state.form.depositAmount, "รอดำเนินการ"),
    "submit-decimal": () => submitDepositSuccess("ฝากทศนิยม", decimalTransferAmount(state.form.depositAmount), "รอดำเนินการ"),
    "submit-wallet-deposit": submitWalletDeposit,
    "submit-qr": submitQrPayment,
    "simulate-qr-paid": simulateQrPaid,
    "view-deposit-history": () => { state.modalTabs.history = "deposits"; state.activeModal = "history"; render(); loadDeposits(); },
    "view-withdraw-history": () => { state.modalTabs.history = "withdraws"; state.activeModal = "history"; render(); loadWithdrawals(); },
    "toggle-withdraw-demo-pass": () => { state.form.withdrawDemoPass = !state.form.withdrawDemoPass; state.errors.withdraw = ""; render(); },
    "select-withdraw-account": () => {
      state.selectedWithdrawAccount = element.getAttribute("data-account") || "bio";
      const account = depositData().withdrawAccounts.find((item) => item.id === state.selectedWithdrawAccount);
      state.form.withdrawAccount = account ? `${account.bank} / ${account.owner} / ${account.masked}` : "BIO";
      addToast("เลือกบัญชีแล้ว");
    },
    "submit-withdraw": submitWithdrawRequest,
    "check-gift": checkGiftLink,
    "submit-gift": submitGiftDeposit,
    "upload-slip": () => { state.form.slipUploaded = true; state.errors.slip.file = ""; render(); },
    "submit-slip": submitSlipDeposit,
    "submit-confirm": submitConfirmDeposit,
    "line-bot-toast": () => addToast("เปิดไลน์บอทแจ้งเตือนแบบ mock"),
    "rules-toast": () => addToast("เปิดกฎกติกาแบบ mock"),
    "history-games": () => { state.modalTabs.history = "games"; render(); },
    "history-deposits": () => { state.modalTabs.history = "deposits"; render(); loadDeposits(); },
    "history-withdraws": () => { state.modalTabs.history = "withdraws"; render(); loadWithdrawals(); },
    "history-bonus": () => { state.modalTabs.history = "bonus"; render(); },
    "history-deposit-bank": () => { state.modalTabs.historyDeposit = "bank"; render(); },
    "history-deposit-peer": () => { state.modalTabs.historyDeposit = "peer"; render(); },
    "history-withdraw-bank": () => { state.modalTabs.historyWithdraw = "bank"; render(); },
    "history-withdraw-peer": () => { state.modalTabs.historyWithdraw = "peer"; render(); },
    "claim-promotion": () => claimPromotion(element.getAttribute("data-id") || state.promotionDetailId),
    "freebies-credits": () => { state.modalTabs.freebies = "credits"; render(); },
    "freebies-diamonds": () => { state.modalTabs.freebies = "diamonds"; render(); },
    "claim-free-credit": () => claimMemberReward("credits", element.getAttribute("data-index") || "0"),
    "claim-free-diamond": () => claimMemberReward("diamonds", element.getAttribute("data-index") || "0"),
    "shop-tab": () => { state.modalTabs.shop = element.getAttribute("data-tab") || "rewards"; state.errors.shopCredit = ""; state.errors.shopCash = ""; render(); },
    "refresh-shop": () => addToast("รีเฟรชยอดแต้ม mock แล้ว"),
    "redeem-shop-reward": () => redeemShopReward(element.getAttribute("data-id") || ""),
    "submit-shop-credit": () => submitShopExchange("credit"),
    "submit-shop-cash": () => submitShopExchange("cash"),
    "provider-tab": () => { state.modalTabs.provider = element.getAttribute("data-tab") || "ทั้งหมด"; state.selectedProviderId = ""; render(); },
    "select-provider": () => { const provider = element.getAttribute("data-provider") || ""; state.selectedProviderId = provider; render(); loadProviderGames(provider); },
    "demo-play-game": () => addToast("ดูเกม mock"),
    "submit-coupon": submitCouponCode,
    "open-promotion-detail": () => { state.promotionDetailId = element.getAttribute("data-id") || ""; setModal("promotion-detail"); },
    "back-promotions": () => setModal("promotions"),
    "rebate-lossback": () => { state.modalTabs.rebate = "lossback"; render(); },
    "rebate-commission": () => { state.modalTabs.rebate = "commission"; render(); },
    "open-commission-detail": () => { state.commissionDetailId = element.getAttribute("data-id") || ""; setModal("commission-detail"); },
    "back-rebates": () => setModal("rebates"),
    "commission-credit": () => addToast("ถอนคอมมิชชั่นเข้าเครดิตแบบ mock แล้ว"),
    "commission-cash": () => addToast("ถอนคอมมิชชั่นเป็นเงินสดแบบ mock แล้ว"),
    "open-box-board": () => openRandomBoxMock(element.getAttribute("data-box") || "box-2"),
    "open-box-history": () => { state.activeBoxId = element.getAttribute("data-box") || "box-2"; state.selectedBoxReward = ""; setModal("random-box-history"); },
    "back-box-main": () => { state.selectedBoxReward = ""; state.boxOpening = false; setModal("random-box"); },
    "pick-box-reward": () => { const index = Number(element.getAttribute("data-index") || "0"); state.selectedBoxReward = text(mock.randomBoxes.rewards[index % mock.randomBoxes.rewards.length] || "500.00 เครดิต"); render(); },
    "confirm-box-reward": () => { state.selectedBoxReward = ""; state.boxOpening = false; addToast("รับรางวัลกล่องสุ่ม mock แล้ว"); setModal("random-box"); },
    "spin-wheel": spinWheelMock,
    "exchange-wheel-credit": () => { state.wheelSubmitted = true; const amount = Number(state.form.wheelExchangeAmount || "0"); if (!state.form.wheelExchangeAmount) { render(); return; } if (!Number.isFinite(amount) || amount < 1) { render(); addToast("ขั้นต่ำ 1.00"); return; } addToast("แลกเงินเข้าเครดิต mock สำเร็จ"); render(); },
    "open-wheel-history": () => setModal("wheel-history"),
    "open-wheel-rules": () => setModal("wheel-rules"),
    "back-wheel": () => setModal("wheel"),
    "checkin-open-deposit": () => openDeposit("page"),
    "open-checkin-rules": () => setModal("checkin-rules"),
    "back-checkin": () => setModal("checkin"),
    "checkin-reward": () => addToast("เช็คอิน mock สำเร็จ"),
    "checkin-claimed": () => addToast("รับรางวัลเช็คอิน mock ไปแล้ว"),
    "checkin-next": () => addToast("กิจกรรมถัดไปเป็น mock"),
    "checkin-future": () => addToast("กิจกรรมยังไม่ถึงวันที่กำหนด"),
    "checkin-denied": () => addToast("ยังไม่ผ่านเงื่อนไขรับรางวัล"),
    "level-up": () => addToast("ยังไม่ผ่านเงื่อนไขอัพเลเวล"),
    "copy-link": () => addToast("คัดลอกลิงก์แล้ว"),
    "open-share-popup": () => { state.sharePopupOpen = true; render(); },
    "close-share-popup": () => { state.sharePopupOpen = false; render(); },
    "share-option": () => addToast(`แชร์ผ่าน ${element.getAttribute("data-label") || "SMS"} แบบ mock`),
    "revenue-bank": () => addToast("ส่งคำขอถอนเข้าบัญชีแบบ mock แล้ว"),
    "revenue-credit": () => addToast("ส่งคำขอถอนเข้าเครดิตแบบ mock แล้ว"),
    "open-revenue-detail": () => openRevenueDetail(element.getAttribute("data-target") || "deposit"),
    "back-revenue": () => { state.revenueView = "main"; state.revenueMetricType = "deposit"; state.modalTabs.revenueMetric = "overview"; setModal("revenue"); },
    "revenue-metric-overview": () => { state.modalTabs.revenueMetric = "overview"; render(); },
    "revenue-metric-income": () => { state.modalTabs.revenueMetric = "income"; render(); },
    "revenue-metric-withdraw": () => { state.modalTabs.revenueMetric = "withdraw"; render(); },
    "wallet-item": () => openWalletTarget(element.getAttribute("data-item") || ""),
    "toggle-music": () => { state.form.musicEnabled = !state.form.musicEnabled; addToast(state.form.musicEnabled ? "เปิดเสียงเพลงแล้ว" : "ปิดเสียงเพลงแล้ว"); render(); },
    "toggle-chat-popup": () => { state.form.chatPopupEnabled = !state.form.chatPopupEnabled; addToast(state.form.chatPopupEnabled ? "เปิดแชทเด้งแล้ว" : "ปิดแชทเด้งแล้ว"); render(); },
    "save-settings": () => { closeModal(); addToast("บันทึกการตั้งค่าแล้ว"); },
    "language-toast": () => addToast(`เปลี่ยนภาษาเป็น ${element.getAttribute("data-label") || "ภาษาไทย"} แบบ mock แล้ว`),
    "mock-add-bank": () => addToast("เพิ่มบัญชีแบบ mock"),
    "copy-debug-phone": () => copyTextToClipboard(state.member.phone || mock.user.phone || "", "คัดลอก phone แล้ว"),
    "copy-debug-user-id": () => copyTextToClipboard(state.member.id || state.member.user_id || state.member.userId || "", "คัดลอก user id แล้ว"),
    "mock-toast": () => addToast("เมนูนี้เป็น mock"),
    "back-home": () => { location.hash = ""; },
    "open-contact": () => setModal("contact"),
    "drawer-item": () => handleDrawerItem(element.getAttribute("data-item") || "")
  };
  const fn = actions[action];
  if (fn) { fn(); return; }
  addToast("เมนูนี้เป็น mock");
}

let homeV2TouchStartX = 0;

setInterval(() => {
  if (!isHomeV2() || location.hash === "#/playgame" || document.hidden || skipNonEssentialAutoRefresh()) return;
  setActiveBanner(state.activeBanner + 1);
}, 5000);

document.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".auth-modal-panel .field-toggle")) event.preventDefault();
});
document.addEventListener("submit", (event) => { event.preventDefault(); });
document.addEventListener("click", (event) => {
  const depositMethodButton = event.target.closest(".deposit-modal-panel [data-action='select-deposit-method']");
  if (depositMethodButton && !depositMethodButton.disabled) {
    selectDepositMethod(depositMethodButton);
    return;
  }
  const depositMethodCarousel = event.target.closest(".deposit-modal-panel .method-carousel");
  if (depositMethodCarousel) {
    const hitButton = depositMethodFromCarouselPoint(depositMethodCarousel, event.clientX);
    if (hitButton && !hitButton.disabled) {
      selectDepositMethod(hitButton);
      return;
    }
  }
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const action = button.getAttribute("data-action");
  if (action === "overlay-close" && event.target !== button) return;
  handleAction(action, button);
});
document.addEventListener("touchstart", (event) => { if (event.target.closest("input, textarea, select, option, label, button")) return; if (!event.target.closest(".home-v2-hero-main")) return; homeV2TouchStartX = event.changedTouches[0]?.clientX || 0; }, { passive: true });
document.addEventListener("touchend", (event) => { if (event.target.closest("input, textarea, select, option, label, button")) return; if (!event.target.closest(".home-v2-hero-main")) return; const endX = event.changedTouches[0]?.clientX || 0; const delta = endX - homeV2TouchStartX; if (Math.abs(delta) < 44) return; setActiveBanner(state.activeBanner + (delta < 0 ? 1 : -1)); }, { passive: true });
const numericFieldKeys = new Set(["depositAmount", "walletAmount", "qrAmount", "slipAmount", "confirmAmount", "withdrawAmount", "shopCreditPoints", "shopCashPoints", "shopCreditAmount", "shopCashAmount", "revenueWithdrawAmount", "wheelExchangeAmount"]);
const authFieldKeys = new Set(["loginPhone", "loginPassword", "loginRemember", "registerPhone", "registerEmail", "registerPassword", "registerConfirmPassword", "registerBank", "registerAccount", "registerName", "registerSource", "registerBonus", "registerAccepted"]);
function sanitizeAmountValue(value) { const clean = String(value || "").replace(/[^\d.]/g, ""); const parts = clean.split("."); return parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : clean; }
function fieldValue(target, key) {
  if (target.type === "checkbox") return target.checked;
  if (target.type === "radio") return target.value;
  const value = numericFieldKeys.has(key) ? sanitizeAmountValue(target.value) : target.value;
  if (value !== target.value) target.value = value;
  return value;
}
function clearFieldValidation(target) {
  const fieldBlock = target.closest(".auth-form-grid > div, .auth-panel > div, .auth-accept-row");
  if (fieldBlock) fieldBlock.querySelectorAll(".validation").forEach((item) => item.remove());
  const panel = target.closest(".auth-modal-panel");
  if (panel) panel.querySelectorAll(".auth-error-summary").forEach((item) => item.remove());
}
function clearFieldError(key) {
  const registerMap = { registerPhone: "phone", registerEmail: "email", registerPassword: "password", registerConfirmPassword: "confirmPassword", registerBank: "bank", registerAccount: "account", registerName: "name", registerSource: "source", registerAccepted: "accepted" };
  const loginMap = { loginPhone: "phone", loginPassword: "password" };
  if (registerMap[key]) state.errors.register[registerMap[key]] = "";
  if (loginMap[key]) { state.errors.login[loginMap[key]] = ""; state.errors.login.api = ""; }
  if (key === "depositAmount") state.errors.depositAmount = "";
  if (key === "walletAmount") state.errors.walletAmount = "";
  if (key === "qrPayment" || key === "qrAccount" || key === "qrAmount") state.errors.qr = "";
  if (key === "slipAmount") state.errors.slip.amount = "";
  if (key === "giftCode") { state.errors.gift = ""; state.giftCheckResult = null; }
  if (key === "confirmAmount") state.errors.confirm.amount = "";
  if (key === "couponCode") { state.errors.coupon = ""; state.couponResult = null; }
  if (key === "withdrawAmount" || key === "withdrawNote") state.errors.withdraw = "";
  if (key === "shopCreditPoints") state.errors.shopCredit = "";
  if (key === "shopCashPoints") state.errors.shopCash = "";
}
function updateFieldFromEvent(target, key) {
  const value = fieldValue(target, key);
  if (key === "search") state.search = value;
  else state.form[key] = value;
  if (key === "registerBonus") updateAuthRadioState(target);
  if (key === "promotionSelect") selectPromotionMock(value);
  if (key === "withdrawAccount") {
    const account = depositData().withdrawAccounts.find((item) => `${item.bank} / ${item.owner} / ${item.masked}` === value);
    if (account) state.selectedWithdrawAccount = account.id;
  }
  clearFieldError(key);
  if (authFieldKeys.has(key)) clearFieldValidation(target);
  return value;
}
document.addEventListener("input", (event) => {
  const target = event.target;
  const key = target.getAttribute("data-field");
  if (!key) return;
  const value = updateFieldFromEvent(target, key);
  if (key === "musicType") addToast(`เปลี่ยนเพลงเป็น ${value}`);
  if (!authFieldKeys.has(key)) render();
});
document.addEventListener("change", (event) => {
  const target = event.target;
  const key = target.getAttribute("data-field");
  if (!key) return;
  updateFieldFromEvent(target, key);
  if (key === "slipOwnBank") state.errors.slip.ownBank = "";
  if (key === "slipTargetBank") state.errors.slip.targetBank = "";
  if (key === "confirmOwnBank") state.errors.confirm.ownBank = "";
  if (key === "confirmTargetBank") state.errors.confirm.targetBank = "";
  if (key === "confirmDate") state.errors.confirm.date = "";
  if (!authFieldKeys.has(key)) render();
});
document.addEventListener("keydown", (event) => { if (event.key !== "Escape") return; if (state.sharePopupOpen) { state.sharePopupOpen = false; render(); return; } if (state.drawerOpen) { closeDrawer(); return; } if (state.activeModal) { if (hasModalParent()) return; closeModal(); return; } if (state.newsOpen) { state.newsOpen = false; render(); } });
window.addEventListener("hashchange", render);
window.addEventListener("resize", () => { if (isHomeV2() && !skipNonEssentialAutoRefresh()) render(); });
async function initApp() {
  render();
  await checkApiHealth(true);
  if (state.loggedIn) loadMemberData(true);
  loadPromotions(true);
}
initApp();
