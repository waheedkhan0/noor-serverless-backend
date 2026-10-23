const assert = require('assert');
const http = require('http');
const app = require('../src/app');

const server = http.createServer(app);

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const port = address.port;
    const method = options.method || 'GET';
    const headers = options.headers || {};
    const body = options.body ? JSON.stringify(options.body) : null;

    if (body) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path,
        method,
        headers
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (_) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  server.listen(0, async () => {
    console.log('🚀 Running comprehensive Noor API test suite...\n');

    try {
      // 1. Health checks
      const h1 = await request('/healthz');
      assert.strictEqual(h1.status, 200);
      assert.strictEqual(h1.body.status, 'ok');
      console.log('✔ GET /healthz passed');

      const h2 = await request('/health');
      assert.strictEqual(h2.status, 200);
      assert.strictEqual(h2.body.database, 'connected');
      console.log('✔ GET /health passed');

      // 2. Duas
      const duasCat = await request('/duas/categories');
      assert.strictEqual(duasCat.status, 200);
      assert.ok(Array.isArray(duasCat.body));
      assert.ok(duasCat.body.length >= 10);
      console.log(`✔ GET /duas/categories passed (${duasCat.body.length} categories)`);

      const catWithDuas = await request('/duas/categories-with-duas');
      assert.strictEqual(catWithDuas.status, 200);
      assert.ok(Array.isArray(catWithDuas.body));
      console.log(`✔ GET /duas/categories-with-duas passed`);

      // 3. Tasbih
      const tasbih = await request('/tasbih/presets');
      assert.strictEqual(tasbih.status, 200);
      assert.ok(Array.isArray(tasbih.body));
      assert.ok(tasbih.body.length >= 8);
      console.log(`✔ GET /tasbih/presets passed (${tasbih.body.length} presets)`);

      // 4. Asma-ul-Husna
      const asma = await request('/asma-ul-husna');
      assert.strictEqual(asma.status, 200);
      assert.strictEqual(asma.body.length, 99);
      console.log(`✔ GET /asma-ul-husna passed (All 99 Names of Allah)`);

      const dailyName = await request('/asma-ul-husna/daily');
      assert.strictEqual(dailyName.status, 200);
      assert.ok(dailyName.body.name_arabic);
      console.log(`✔ GET /asma-ul-husna/daily passed (${dailyName.body.transliteration} - ${dailyName.body.meaning})`);

      // 5. Kalmas
      const kalmas = await request('/kalmas');
      assert.strictEqual(kalmas.status, 200);
      assert.strictEqual(kalmas.body.length, 6);
      console.log(`✔ GET /kalmas passed (All 6 Kalmas)`);

      // 6. Daily Deen
      const dailyDeen = await request('/daily-content');
      assert.strictEqual(dailyDeen.status, 200);
      assert.ok(Array.isArray(dailyDeen.body));
      console.log(`✔ GET /daily-content passed (${dailyDeen.body.length} items)`);

      // 7. Historical Places
      const hist = await request('/historical-places');
      assert.strictEqual(hist.status, 200);
      assert.ok(Array.isArray(hist.body));
      assert.ok(hist.body.length >= 5);
      console.log(`✔ GET /historical-places passed (${hist.body.length} places)`);

      // 8. Hajj & Umrah
      const hajjSteps = await request('/hajj-guide/steps');
      assert.strictEqual(hajjSteps.status, 200);
      const umrahSteps = await request('/hajj-guide/umrah/steps');
      assert.strictEqual(umrahSteps.status, 200);
      const checklist = await request('/hajj-guide/checklist');
      assert.strictEqual(checklist.status, 200);
      console.log(`✔ GET /hajj-guide (Hajj steps, Umrah steps, Checklist) passed`);

      // 9. Courses
      const courses = await request('/courses/');
      assert.strictEqual(courses.status, 200);
      assert.ok(courses.body.length >= 6);
      const course1 = await request(`/courses/${courses.body[0].id}`);
      assert.strictEqual(course1.status, 200);
      assert.ok(course1.body.lessons.length > 0);
      console.log(`✔ GET /courses and /courses/:id passed (${courses.body.length} courses)`);

      // 10. Config
      const config = await request('/config/app');
      assert.strictEqual(config.status, 200);
      assert.ok(config.body.announcement);
      console.log(`✔ GET /config/app passed`);

      // 11. Calculators
      const zakatCalc = await request('/calculators/zakat', {
        method: 'POST',
        body: { cash_and_bank: 50000, liabilities: 5000 }
      });
      assert.strictEqual(zakatCalc.status, 200);
      assert.strictEqual(zakatCalc.body.is_nisab_met, true);
      assert.ok(zakatCalc.body.zakat_due > 0);
      console.log(`✔ POST /calculators/zakat passed (Zakat due: $${zakatCalc.body.zakat_due})`);

      const inheritance = await request('/calculators/inheritance', {
        method: 'POST',
        body: { total_estate: 100000, has_spouse: true, has_sons: true }
      });
      assert.strictEqual(inheritance.status, 200);
      assert.ok(inheritance.body.shares.length >= 2);
      console.log(`✔ POST /calculators/inheritance passed`);

      // 12. Subscriptions
      const plans = await request('/subscription/plans');
      assert.strictEqual(plans.status, 200);
      assert.ok(Array.isArray(plans.body.data));
      console.log(`✔ GET /subscription/plans passed`);

      // 13. Auth flow
      const reg = await request('/auth/register', {
        method: 'POST',
        body: { email: `test_${Date.now()}@noor.app`, password: 'StrongPassword123' }
      });
      assert.strictEqual(reg.status, 201);
      assert.ok(reg.body.access_token);
      console.log(`✔ POST /auth/register passed`);

      const login = await request('/auth/login', {
        method: 'POST',
        body: { email: 'user@noor.app', password: 'password' }
      });
      assert.strictEqual(login.status, 200);
      assert.ok(login.body.access_token);
      console.log(`✔ POST /auth/login passed`);

      const token = login.body.access_token;
      const me = await request('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert.strictEqual(me.status, 200);
      assert.strictEqual(me.body.email, 'user@noor.app');
      console.log(`✔ GET /auth/me passed (${me.body.display_name})`);

      // 14. Cloud sync with auth
      const syncBookmarks = await request('/subscription/sync-bookmarks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { bookmarks: [{ type: 'verse', id: '1:1' }] }
      });
      assert.strictEqual(syncBookmarks.status, 200);
      console.log(`✔ POST /subscription/sync-bookmarks passed`);

      // 15. AI Chat
      const aiChat = await request('/ai/chat', {
        method: 'POST',
        body: { messages: [{ role: 'user', content: 'What is the importance of prayer?' }] }
      });
      assert.strictEqual(aiChat.status, 200);
      assert.ok(aiChat.body.response.length > 20);
      console.log(`✔ POST /ai/chat passed (Response preview: "${aiChat.body.response.slice(0, 60)}...")`);

      // 16. Prayer timings & Qibla
      const prayer = await request('/prayer/timings?date=23-10-2026&latitude=43.6532&longitude=-79.3832');
      assert.strictEqual(prayer.status, 200);
      assert.ok(prayer.body.data.timings.Fajr);
      console.log(`✔ GET /prayer/timings passed (Fajr: ${prayer.body.data.timings.Fajr}, Maghrib: ${prayer.body.data.timings.Maghrib})`);

      const qibla = await request('/prayer/qibla?latitude=43.6532&longitude=-79.3832');
      assert.strictEqual(qibla.status, 200);
      assert.ok(qibla.body.data.direction);
      console.log(`✔ GET /prayer/qibla passed (Direction: ${qibla.body.data.direction}°)`);

      // 17. Hadith books, sections & hadiths
      const books = await request('/hadith/books');
      assert.strictEqual(books.status, 200);
      assert.ok(books.body.data.length > 0);
      console.log(`✔ GET /hadith/books passed (${books.body.data.length} books)`);

      const hadithSections = await request('/hadith/editions/eng-bukhari/sections');
      assert.strictEqual(hadithSections.status, 200);
      assert.ok(hadithSections.body.data.length > 0);
      assert.strictEqual(hadithSections.body.data[0].id, 1);
      console.log(`✔ GET /hadith/editions/eng-bukhari/sections passed (${hadithSections.body.data.length} sections)`);

      const sectionHadiths = await request('/hadith/eng-bukhari/sections/1');
      assert.strictEqual(sectionHadiths.status, 200);
      assert.ok(sectionHadiths.body.hadiths.length > 0);
      console.log(`✔ GET /hadith/eng-bukhari/sections/1 passed (${sectionHadiths.body.hadiths.length} hadiths loaded via single CDN call)`);

      // 18. Tafsir
      const tafsir = await request('/quran/tafsir/en-tafisr-ibn-kathir/1/1');
      assert.strictEqual(tafsir.status, 200);
      assert.ok(tafsir.body.text && tafsir.body.text.length > 100);
      console.log(`✔ GET /quran/tafsir/en-tafisr-ibn-kathir/1/1 passed (Text length: ${tafsir.body.text.length})`);

      // 19. 1-to-1 Course Inquiry Flow & Admin View
      const inquiryRes = await request('/courses/c1a11111-1111-4111-8111-111111111111/inquiry', {
        method: 'POST',
        body: {
          student_name: 'Test Student',
          phone_or_whatsapp: '+14165550199',
          email: 'student@example.com',
          preferred_days: 'Weekends',
          preferred_time: 'Evening',
          student_level: 'Beginner',
          notes: 'Looking for 1-on-1 female tutor'
        }
      });
      assert.strictEqual(inquiryRes.status, 201);
      assert.ok(inquiryRes.body.inquiry.id);
      console.log(`✔ POST /courses/:id/inquiry passed (Inquiry ID: ${inquiryRes.body.inquiry.id})`);

      const adminInquiries = await request('/courses/admin/inquiries');
      assert.strictEqual(adminInquiries.status, 200);
      assert.ok(adminInquiries.body.inquiries.length > 0);
      console.log(`✔ GET /courses/admin/inquiries passed (${adminInquiries.body.inquiries.length} inquiries found)`);

      const adminDashboard = await request('/courses/admin/dashboard');
      assert.strictEqual(adminDashboard.status, 200);
      assert.ok(typeof adminDashboard.body === 'string' && adminDashboard.body.includes('Noor 1-on-1 Course Leads'));
      console.log(`✔ GET /courses/admin/dashboard passed (HTML Dashboard Rendered)`);

      // 20. Static pages & AdMob / AdSense verification
      const appAds = await request('/app-ads.txt');
      assert.strictEqual(appAds.status, 200);
      assert.ok(appAds.body.includes('pub-1806048559578873'));
      console.log(`✔ GET /app-ads.txt passed`);

      const ads = await request('/ads.txt');
      assert.strictEqual(ads.status, 200);
      assert.ok(ads.body.includes('pub-1806048559578873'));
      console.log(`✔ GET /ads.txt passed`);

      const landing = await request('/');
      assert.strictEqual(landing.status, 200);
      assert.ok(typeof landing.body === 'string' && landing.body.includes('Noor'));
      console.log(`✔ GET / (Landing Page) passed`);

      console.log('\n🎉 ALL 20 TEST SUITES PASSED FLAWLESSLY! 🎉\n');
      process.exit(0);
    } catch (err) {
      console.error('\n❌ Test failed:', err);
      process.exit(1);
    } finally {
      server.close();
    }
  });
}

runTests();
