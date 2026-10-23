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
  console.log(`\n📢 [NEW 1-ON-1 COURSE INQUIRY]`);
  console.log(`   Course: ${newInquiry.course_title}`);
  console.log(`   Student: ${newInquiry.student_name} (${newInquiry.phone_or_whatsapp} | ${newInquiry.email})`);
  console.log(`   Preferred: ${newInquiry.preferred_days} / ${newInquiry.preferred_time}`);
  console.log(`   Direct WhatsApp link: https://wa.me/${newInquiry.phone_or_whatsapp.replace(/[^0-9]/g, '')}\n`);

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
