const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Load static seed data
const seedDataPath = path.join(__dirname, '../../data/seed_data.json');
const coursesPath = path.join(__dirname, '../../data/courses.json');
const configPath = path.join(__dirname, '../../data/config.json');
const hadithBooksPath = path.join(__dirname, '../../data/hadith_books.json');

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

// In-memory dynamic tables
const users = new Map();
const userBookmarks = new Map();
const userTasbih = new Map();
const userSettings = new Map();
const userEnrollments = new Map(); // userId -> list of enrollments
const feedbackItems = [];
const zakatHistory = [];
const notificationsTokens = new Set();
const topicSubscriptions = new Map(); // topic -> Set of tokens
const aiUsageLogs = new Map(); // userId_date -> count

// Pre-create demo admin and user
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
  feedbackItems,
  zakatHistory,
  notificationsTokens,
  topicSubscriptions,
  aiUsageLogs,

  // Helper generators
  uuid: () => crypto.randomUUID()
};
