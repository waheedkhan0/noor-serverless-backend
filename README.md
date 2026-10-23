# Noor Serverless Backend 🌙

A high-performance, zero-maintenance serverless API for the **Noor: Muslim Prayer & Quran** Flutter application. Designed specifically for free-tier hosting on **Vercel** and **Netlify**, with 100% test coverage and full offline content bundled out of the box.

---

## ✨ Features & Capabilities

- ⚡ **Zero Cold Starts & Instant Responses**: Built with modern lightweight Node.js/Express, eliminating heavy database overhead.
- 📦 **Preloaded Authentic Content**:
  - **Asma-ul-Husna**: All 99 Names of Allah with Arabic, transliterations, meanings, explanations, and Quranic references.
  - **Kalmas**: All 6 Kalmas with Arabic, English, and Urdu translations.
  - **Duas**: 12 Categories and 28+ essential daily supplications (Adhkar, Salah, Travel, Morning/Evening).
  - **Tasbih**: Presets with customizable targets.
  - **Daily Deen**: Rotating verses, hadiths, quotes, and sunnahs for every day of the year.
  - **Hajj & Umrah**: Complete step-by-step visual guides and 26-item categorized checklist.
  - **Historical Places**: Sacred Islamic heritage sites (Kaaba, Masjid an-Nabawi, Masjid al-Aqsa, Cave Hira, Mount Uhud, etc.) with coordinates and significance.
  - **Islamic Courses**: 6 structured multi-lesson courses covering Aqeedah, Salah, Tajweed, Seerah, Fiqh, and Usul al-Fiqh.
- 🕌 **Prayer & Qibla**: Live AlAdhan API proxy with automatic astronomical fallback calculation.
- 📖 **Quran & Tafsir**: Full Quran.com v4 API integration + CDN Tafsir (Ibn Kathir, Al-Jalalayn).
- 📜 **Hadith**: Complete Hadith books metadata, chapters, and CDN hadith retrieval.
- 🤖 **AI Islamic Assistant**: SSE streaming & non-streaming support. Works with DeepSeek / DeepInfra / OpenAI or provides authentic Islamic knowledge base answers out of the box.
- 💳 **RevenueCat & Subscriptions**: Tiered monthly and yearly plans, user linking, and webhook processing.
- 🔒 **Authentication & Cloud Sync**: JWT token issuing, Firebase ID token support, and user bookmark/settings/tasbih synchronization.
- ⚖️ **Calculators**: Zakat calculator with Nisab thresholds and Islamic Inheritance calculator.
- 📄 **Static & Legal Pages**: Modern landing page (`/`), Privacy Policy (`/privacy-policy`), Terms (`/terms`), About (`/about`), Contact (`/contact`), Account Deletion (`/delete-account`), and Google AdMob `app-ads.txt`.

---

## 🚀 Free Deployment Guide

### Option 1: Deploy to Vercel (Recommended - 2 Minutes)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Noor serverless backend"
   gh repo create noor-serverless-backend --public --source=. --push
   ```
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with GitHub.
   - Click **Add New...** &rarr; **Project**.
   - Select `noor-serverless-backend` repository.
   - Leave Framework Preset as **Other** (Vercel automatically detects `vercel.json` and `api/index.js`).
   - Click **Deploy**!
3. Your API is live at `https://your-project.vercel.app`!

### Option 2: Deploy to Netlify

1. In Netlify Dashboard, click **Add new site** &rarr; **Import an existing project**.
2. Select your GitHub repository.
3. Build command: *(leave blank or `npm run build`)*
4. Publish directory: *(leave blank, `netlify.toml` handles routing)*
5. Click **Deploy Site**!

---

## ⚙️ Environment Variables (Optional)

All endpoints work out-of-the-box with sensible defaults. To customize, set these variables in your Vercel or Netlify dashboard:

| Variable | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | `noor-secret-key-...` | Secret for signing access and refresh tokens |
| `AI_API_KEY` | *(empty)* | Optional DeepSeek / DeepInfra API key for live AI answers |
| `AI_BASE_URL` | `https://api.deepinfra.com/v1` | OpenAI-compatible endpoint |
| `AI_MODEL` | `deepseek-ai/DeepSeek-V4-Flash` | AI model name |
| `REVENUECAT_API_KEY` | *(empty)* | RevenueCat v2 secret key |
| `PORT` | `8000` | Port for local development |

---

## 🛠 Local Development & Testing

```bash
# Install dependencies
npm install

# Start local server (port 8000)
npm start

# Run comprehensive test suite (18 test suites)
npm test
```

---

## 📱 Connecting with Noor Flutter App

In `noor_flutter`, the app can be pointed to your deployed URL in any of these ways:

1. **Compile-time definition**:
   ```bash
   flutter run --dart-define=BACKEND_URL=https://your-vercel-domain.vercel.app
   ```
2. **Default URL**:
   Updated in `lib/services/api_client.dart`:
   ```dart
   static const String defaultBaseUrl = 'https://your-vercel-domain.vercel.app';
   ```
3. **Runtime in SharedPreferences**:
   Call `appService.setCustomBackendUrl('https://your-vercel-domain.vercel.app')`.

---

## 📋 API Endpoints Reference

### Health & Information
- `GET /health` - System health and service status
- `GET /healthz` - Lightweight liveness probe
- `GET /app-ads.txt` - AdMob app verification (`pub-1806048559578873`)
- `GET /ads.txt` - AdSense verification (`pub-1806048559578873`)
- `GET /` - Visual emerald-gold landing page with phone mockup and live prayer clock
- `GET /docs` - Interactive Swagger/OpenAPI style endpoint explorer
- `GET /privacy-policy` - Google Play store compliant privacy policy
- `GET /terms` - Terms of Service
- `GET /delete-account` - Google Play compliant user account deletion request page

---

## 📢 Google AdMob & AdSense Setup (`app-ads.txt`)

This backend automatically serves your AdMob verification string at both root paths:
- `/app-ads.txt`
- `/ads.txt`

Snippet served:
```text
google.com, pub-1806048559578873, DIRECT, f08c47fec0942fa0
```

### Steps to verify in AdMob:
1. Deploy this backend to Vercel/Netlify or link your custom domain (e.g., `quicksol.ca` or `noor.quicksol.ca` or `your-subdomain.vercel.app`).
2. Update your **Developer Website** in the **Google Play Console** (under **Store presence &rarr; Store settings &rarr; Website**) to point to your deployed URL.
3. Verify that `https://yourdomain.com/app-ads.txt` opens and returns the exact snippet as `text/plain`.
4. Wait 24 hours for Google AdMob crawlers to index the file. Check status in your Google AdMob dashboard under **Apps &rarr; View all apps &rarr; app-ads.txt**.

### Prayer & Calendar
- `GET /prayer/timings?date=DD-MM-YYYY&latitude=LAT&longitude=LNG&method=3&school=0`
- `GET /prayer/qibla?latitude=LAT&longitude=LNG`
- `GET /prayer/hijri-calendar?year=YYYY&month=MM&latitude=LAT&longitude=LNG`
- `GET /prayer/date-convert?date=DD-MM-YYYY`

### Content & Learning
- `GET /asma-ul-husna` (optional `?query=...`)
- `GET /asma-ul-husna/daily`
- `GET /asma-ul-husna/:id`
- `GET /kalmas`
- `GET /kalmas/:id`
- `GET /duas/categories`
- `GET /duas/categories-with-duas`
- `GET /duas` (optional `?category_id=...`)
- `GET /duas/:id`
- `GET /tasbih/presets`
- `GET /daily-content` (optional `?dt=YYYY-MM-DD`)
- `GET /historical-places` (optional `?category=...`)
- `GET /historical-places/categories`
- `GET /historical-places/:id`
- `GET /hajj-guide/steps`
- `GET /hajj-guide/umrah/steps`
- `GET /hajj-guide/checklist` (optional `?category=...`)
- `GET /courses/` (optional `?difficulty=Beginner`)
- `GET /courses/:id`
- `POST /courses/:id/enroll` *(Auth required)*
- `GET /courses/enrollments/me` *(Auth required)*
- `PATCH /courses/:id/progress` *(Auth required)*

### Quran & Hadith
- `GET /quran/chapters`
- `GET /quran/verses?chapter_id=1&page=1`
- `GET /quran/search?query=peace`
- `GET /quran/tafsir-editions`
- `GET /quran/tafsir/:slug/:chapter`
- `GET /hadith/books`
- `GET /hadith/books/:slug`
- `GET /hadith/editions`
- `GET /hadith/editions/:slug/sections`
- `GET /hadith/:edition`
- `GET /hadith/:edition/:hadith_number`
- `GET /hadith/:edition/sections/:section_number`
- `GET /hadith/search?query=...`

### Calculators
- `POST /calculators/zakat`
- `POST /calculators/inheritance`
- `GET /zakat/nisab`
- `POST /zakat/calculate`
- `GET /zakat/history`

### AI & Assistant
- `POST /ai/chat` (body: `{ messages: [...], stream: false }`)

### Auth & User Sync
- `POST /auth/register` (body: `{ email, password, display_name }`)
- `POST /auth/login` (body: `{ email, password }`)
- `POST /auth/firebase` (body: `{ id_token }`)
- `POST /auth/refresh` (body: `{ refresh_token }`)
- `GET /auth/me` *(Auth required)*
- `POST /subscription/sync-bookmarks` *(Auth required)*
- `GET /subscription/sync-bookmarks` *(Auth required)*
- `POST /subscription/sync-tasbih` *(Auth required)*
- `GET /subscription/sync-tasbih` *(Auth required)*
- `POST /subscription/sync-settings` *(Auth required)*
- `GET /subscription/sync-settings` *(Auth required)*
- `POST /feedback`
- `GET /feedback` *(Auth required)*
