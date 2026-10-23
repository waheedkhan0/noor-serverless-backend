const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Load static seed data
const seedDataPath = path.join(__dirname, '../../data/seed_data.json');
const coursesPath = path.join(__dirname, '../../data/courses.json');
const configPath = path.join(__dirname, '../../data/config.json');
const hadithBooksPath = path.join(__dirname, '../../data/hadith_books.json');
const runtimeDbPath = path.join(__dirname, '../../data/runtime_db.json');

let seedData = {
  dua_categories: [],
  duas: [],
  tasbih_presets: [],
  asma_ul_husna: [],
  kalmas: [],
  daily_content: [],
  historical_places: [],
  hajj_steps: [],
  umrah_steps: [],
  hajj_checklist: [],
  nisab_records: [],
  subscription_plans: []
};

let courses = [];
let appConfig = {};
let hadithBooks = [];

try {
  if (fs.existsSync(seedDataPath)) {
    seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load seed_data.json:', e.message);
}

try {
  if (fs.existsSync(coursesPath)) {
    courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load courses.json:', e.message);
}

try {
  if (fs.existsSync(configPath)) {
    appConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load config.json:', e.message);
}

try {
  if (fs.existsSync(hadithBooksPath)) {
    hadithBooks = JSON.parse(fs.readFileSync(hadithBooksPath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load hadith_books.json:', e.message);
}

// ── Firebase Admin & Firestore Initialization ──
let firebaseAdmin = null;
let firestoreDb = null;

try {
  const { initializeApp, cert, getApps } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const { getAuth } = require('firebase-admin/auth');

  let cred = null;
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '../../firebase-service-account.json');

  if (saJson) {
    cred = cert(JSON.parse(saJson));
  } else if (fs.existsSync(saPath)) {
    cred = cert(require(saPath));
  }

  if (cred && !getApps().length) {
    const app = initializeApp({ credential: cred });
    const authInstance = getAuth(app);
    firestoreDb = getFirestore(app);
    firebaseAdmin = {
      app,
      auth: () => authInstance,
      firestore: () => firestoreDb
    };
    console.log('✔ Firebase Admin & Firestore initialized successfully');
  } else if (getApps().length) {
    const app = getApps()[0];
    const authInstance = getAuth(app);
    firestoreDb = getFirestore(app);
    firebaseAdmin = {
      app,
      auth: () => authInstance,
      firestore: () => firestoreDb
    };
  }
} catch (e) {
  console.warn('Firebase Admin initialization deferred / optional:', e.message);
}

// ── Runtime Data Stores ──
const users = new Map();
const userBookmarks = new Map();
const userTasbih = new Map();
const userSettings = new Map();
const userEnrollments = new Map(); // userId -> list of enrollments
let courseInquiries = [];
let feedbackItems = [];
const zakatHistory = [];
const notificationsTokens = new Set();
const topicSubscriptions = new Map(); // topic -> Set of tokens
const aiUsageLogs = new Map(); // userId_date -> count

// Load persistent runtime state from file if available
try {
  if (fs.existsSync(runtimeDbPath)) {
    const saved = JSON.parse(fs.readFileSync(runtimeDbPath, 'utf8'));
    if (Array.isArray(saved.users)) {
      saved.users.forEach(([_, u]) => {
        if (u && u.id) {
          users.set(u.id, u);
          if (u.email) users.set(u.email.toLowerCase(), u);
          if (u.firebase_uid) users.set(u.firebase_uid, u);
        }
      });
    }
    if (Array.isArray(saved.courseInquiries)) {
      courseInquiries = saved.courseInquiries;
    }
    if (Array.isArray(saved.userBookmarks)) {
      saved.userBookmarks.forEach(([k, v]) => userBookmarks.set(k, v));
    }
    if (Array.isArray(saved.userTasbih)) {
      saved.userTasbih.forEach(([k, v]) => userTasbih.set(k, v));
    }
    if (Array.isArray(saved.userSettings)) {
      saved.userSettings.forEach(([k, v]) => userSettings.set(k, v));
    }
    if (Array.isArray(saved.userEnrollments)) {
      saved.userEnrollments.forEach(([k, v]) => userEnrollments.set(k, v));
    }
    if (Array.isArray(saved.feedbackItems)) {
      feedbackItems = saved.feedbackItems;
    }
  }
} catch (err) {
  console.warn('Runtime DB state load notice:', err.message);
}

// Pre-create demo user if users map is empty
if (!users.has('00000000-0000-4000-8000-000000000001')) {
  const demoUser = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'user@noor.app',
    password_hash: bcrypt.hashSync('password', 10),
    display_name: 'Noor User',
    photo_url: null,
    is_premium: true,
    prayer_calculation_method: 3,
    prayer_school: 0,
    created_at: new Date().toISOString()
  };
  users.set(demoUser.id, demoUser);
  users.set(demoUser.email.toLowerCase(), demoUser);
}

let saveTimer = null;
function persistRuntime() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const dataToSave = {
        users: Array.from(users.entries()).filter(([k, v]) => v.id === k),
        courseInquiries,
        userBookmarks: Array.from(userBookmarks.entries()),
        userTasbih: Array.from(userTasbih.entries()),
        userSettings: Array.from(userSettings.entries()),
        userEnrollments: Array.from(userEnrollments.entries()),
        feedbackItems
      };
      fs.writeFileSync(runtimeDbPath, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (_) {
      // In read-only serverless runtimes, fail silently
    }
  }, 150);
}

// ── Course Inquiries Management (1-to-1) ──
function addCourseInquiry(inquiry) {
  const newInquiry = {
    id: crypto.randomUUID(),
    course_id: inquiry.course_id,
    course_title: inquiry.course_title || '1-on-1 Course',
    student_name: inquiry.student_name || 'Interested Student',
    email: inquiry.email || '',
    phone_or_whatsapp: inquiry.phone_or_whatsapp || inquiry.phone || '',
    preferred_days: inquiry.preferred_days || 'Flexible',
    preferred_time: inquiry.preferred_time || 'Flexible',
    student_level: inquiry.student_level || 'Beginner',
    notes: inquiry.notes || '',
    status: 'new', // new | contacted | trial_scheduled | enrolled | archived
    created_at: new Date().toISOString()
  };

  courseInquiries.unshift(newInquiry);
  persistRuntime();

  // Async Firestore backup
  if (firestoreDb) {
    firestoreDb.collection('course_inquiries').doc(newInquiry.id).set(newInquiry).catch(e => {
      console.warn('Firestore inquiry sync error:', e.message);
    });
  }

  // Console notice & notification trigger
  const cleanPhone = (newInquiry.phone_or_whatsapp || '').replace(/[^0-9]/g, '');
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '';

  console.log(`\n📢 [NEW 1-ON-1 COURSE INQUIRY]`);
  console.log(`   Course: ${newInquiry.course_title}`);
  console.log(`   Student: ${newInquiry.student_name} (${newInquiry.phone_or_whatsapp} | ${newInquiry.email})`);
  console.log(`   Preferred: ${newInquiry.preferred_days} / ${newInquiry.preferred_time}`);
  if (waLink) console.log(`   Direct WhatsApp link: ${waLink}\n`);

  // 1. Resend / Email Notification (if RESEND_API_KEY is configured in Vercel)
  if (process.env.RESEND_API_KEY) {
    const toEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'waheed@quicksol.ca';
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Noor App <onboarding@resend.dev>',
        to: [toEmail],
        subject: `🌙 New 1-on-1 Student Inquiry: ${newInquiry.student_name} (${newInquiry.course_title})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e1e4e8; border-radius: 12px;">
            <h2 style="color: #047857; margin-top: 0;">🌙 New 1-on-1 Course Lead Received!</h2>
            <p style="font-size: 15px; color: #333;">A student just requested a 1-on-1 trial class from the Noor mobile app.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;"><strong>Course:</strong></td><td style="color: #111; font-weight: bold;">${newInquiry.course_title}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Student Name:</strong></td><td style="color: #111;">${newInquiry.student_name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>WhatsApp / Phone:</strong></td><td style="color: #111;"><strong>${newInquiry.phone_or_whatsapp}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td><td style="color: #111;">${newInquiry.email || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Preferred Schedule:</strong></td><td style="color: #111;">${newInquiry.preferred_days} (${newInquiry.preferred_time})</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Level:</strong></td><td style="color: #111;">${newInquiry.student_level}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;"><strong>Notes:</strong></td><td style="color: #111;">${newInquiry.notes || 'None'}</td></tr>
            </table>

            ${waLink ? `<div style="margin: 24px 0;"><a href="${waLink}?text=${encodeURIComponent(`Assalamu Alaikum ${newInquiry.student_name}, thank you for your interest in the 1-on-1 ${newInquiry.course_title} course with Noor! When would be a good time for your free trial session?`)}" style="background-color: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">💬 Chat on WhatsApp with Student</a></div>` : ''}

            <p style="font-size: 13px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 12px;">
              Manage all leads online at: <a href="https://noor.quicksol.ca/courses/admin/dashboard" style="color: #047857;">https://noor.quicksol.ca/courses/admin/dashboard</a>
            </p>
          </div>
        `
      })
    }).catch(e => console.warn('Resend email notification failed:', e.message));
  }

  // 2. Telegram Bot Alert (if TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID are set)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const text = `🌙 *New 1-on-1 Course Lead!*

*Student:* ${newInquiry.student_name}
*Course:* ${newInquiry.course_title}
*WhatsApp:* \`${newInquiry.phone_or_whatsapp}\`
*Preferred:* ${newInquiry.preferred_days} (${newInquiry.preferred_time})
*Level:* ${newInquiry.student_level}
*Notes:* ${newInquiry.notes || 'None'}

${waLink ? `[💬 Open WhatsApp](https://wa.me/${cleanPhone})` : ''}
[📊 View Dashboard](https://noor.quicksol.ca/courses/admin/dashboard)`;

    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    }).catch(e => console.warn('Telegram notification failed:', e.message));
  }

  // 3. Webhook (Slack / Discord / Zapier)
  if (process.env.ADMIN_WEBHOOK_URL) {
    fetch(process.env.ADMIN_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🌙 **New 1-on-1 Course Lead!**\n**Student:** ${newInquiry.student_name} (${newInquiry.phone_or_whatsapp})\n**Course:** ${newInquiry.course_title}\n**Timing:** ${newInquiry.preferred_days} (${newInquiry.preferred_time})\n**Dashboard:** https://noor.quicksol.ca/courses/admin/dashboard`
      })
    }).catch(e => console.warn('Admin webhook notification failed:', e.message));
  }

  return newInquiry;
}

function getCourseInquiries(filter = {}) {
  let list = courseInquiries;
  if (filter.status && filter.status !== 'all') {
    list = list.filter(i => (i.status || '').toLowerCase() === filter.status.toLowerCase());
  }
  if (filter.course_id) {
    list = list.filter(i => i.course_id === filter.course_id);
  }
  return list;
}

function updateCourseInquiry(id, updates = {}) {
  const item = courseInquiries.find(i => i.id === id);
  if (!item) return null;

  if (updates.status) item.status = updates.status;
  if (updates.notes !== undefined) item.notes = updates.notes;
  item.updated_at = new Date().toISOString();

  persistRuntime();

  if (firestoreDb) {
    firestoreDb.collection('course_inquiries').doc(id).update(updates).catch(e => {
      console.warn('Firestore inquiry update error:', e.message);
    });
  }

  return item;
}

function saveUser(user) {
  users.set(user.id, user);
  if (user.email) users.set(user.email.toLowerCase(), user);
  if (user.firebase_uid) users.set(user.firebase_uid, user);
  persistRuntime();

  if (firestoreDb) {
    firestoreDb.collection('users').doc(user.id).set(user, { merge: true }).catch(e => {
      console.warn('Firestore user save error:', e.message);
    });
  }
}

function getUser(idOrEmailOrUid) {
  if (!idOrEmailOrUid) return null;
  return users.get(idOrEmailOrUid) || users.get(String(idOrEmailOrUid).toLowerCase());
}

module.exports = {
  // Static content
  duaCategories: seedData.dua_categories || [],
  duas: seedData.duas || [],
  tasbihPresets: seedData.tasbih_presets || [],
  asmaUlHusna: seedData.asma_ul_husna || [],
  kalmas: seedData.kalmas || [],
  dailyContent: seedData.daily_content || [],
  historicalPlaces: seedData.historical_places || [],
  hajjSteps: seedData.hajj_steps || [],
  umrahSteps: seedData.umrah_steps || [],
  hajjChecklist: seedData.hajj_checklist || [],
  nisabRecords: seedData.nisab_records || [],
  subscriptionPlans: seedData.subscription_plans || [],
  courses,
  appConfig,
  hadithBooks,

  // Dynamic stores
  users,
  userBookmarks,
  userTasbih,
  userSettings,
  userEnrollments,
  courseInquiries,
  feedbackItems,
  zakatHistory,
  notificationsTokens,
  topicSubscriptions,
  aiUsageLogs,

  // Firebase Admin & Firestore
  firebaseAdmin,
  firestoreDb,

  // Persistence helpers
  persistRuntime,
  saveUser,
  getUser,
  addCourseInquiry,
  getCourseInquiries,
  updateCourseInquiry,

  // Helper generators
  uuid: () => crypto.randomUUID()
};
