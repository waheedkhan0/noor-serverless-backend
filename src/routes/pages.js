const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const APP_ADS_TXT = `google.com, pub-1806048559578873, DIRECT, f08c47fec0942fa0\n`;

// App Ads verification endpoints (IAB Tech Lab / AdMob / AdSense)
router.get('/app-ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(APP_ADS_TXT);
});

router.get('/ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(APP_ADS_TXT);
});

// Common styling for policy and content pages
function legalPageLayout(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Noor: Muslim Prayer & Quran</title>
  <link rel="icon" type="image/png" href="/static/logo.png">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Amiri:wght@700&display=swap');
    :root {
      --primary: #064E3B;
      --primary-light: #047857;
      --accent: #D4A017;
      --bg: #F8FAF9;
      --card: #FFFFFF;
      --text: #1F2937;
      --text-muted: #6B7280;
      --border: #E5E7EB;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
    }
    .navbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 16px 24px;
    }
    .nav-container {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      font-size: 1.25rem;
      color: var(--primary);
      text-decoration: none;
    }
    .logo img { height: 38px; width: 38px; border-radius: 10px; object-fit: contain; }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      margin-left: 20px;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--primary); }
    .nav-btn {
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: #fff !important;
      padding: 8px 18px;
      border-radius: 10px;
    }
    .header-banner {
      background: linear-gradient(135deg, #064E3B 0%, #0D6B2E 100%);
      color: white;
      text-align: center;
      padding: 60px 24px 40px;
    }
    .arabic-calligraphy {
      font-family: 'Amiri', serif;
      font-size: 38px;
      color: var(--accent);
      margin-bottom: 6px;
    }
    .header-banner h1 { font-size: 2rem; font-weight: 800; }
    .header-banner p { opacity: 0.85; margin-top: 6px; font-size: 0.95rem; }
    .content-card {
      max-width: 860px;
      margin: -20px auto 60px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 44px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.04);
    }
    h2 { color: var(--primary); font-size: 1.35rem; margin: 30px 0 12px; }
    h2:first-child { margin-top: 0; }
    p, li { color: #374151; font-size: 0.98rem; margin-bottom: 14px; }
    ul, ol { padding-left: 24px; margin-bottom: 18px; }
    li { margin-bottom: 8px; }
    a { color: var(--primary-light); font-weight: 600; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .footer {
      background: #0B1E16;
      color: #9CA3AF;
      text-align: center;
      padding: 40px 20px;
      font-size: 0.85rem;
    }
    .footer a { color: #D1D5DB; margin: 0 10px; }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="nav-container">
      <a href="/" class="logo">
        <img src="/static/logo.png" alt="Noor">
        <span>Noor</span>
      </a>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="/privacy-policy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/contact">Contact</a>
        <a href="https://play.google.com/store/apps/details?id=com.firecode.studios.noor" class="nav-btn" target="_blank" rel="noopener">Get App</a>
      </div>
    </div>
  </nav>

  <div class="header-banner">
    <div class="arabic-calligraphy">نُور</div>
    <h1>${title}</h1>
    <p>Noor: Muslim Prayer & Quran App</p>
  </div>

  <main class="content-card">
    ${content}
  </main>

  <footer class="footer">
    <p>&copy; ${new Date().getFullYear()} Noor: Muslim Prayer & Quran. All rights reserved.</p>
    <p style="margin-top: 10px;">
      <a href="/privacy-policy">Privacy Policy</a> &bull;
      <a href="/terms">Terms of Service</a> &bull;
      <a href="/about">About</a> &bull;
      <a href="/contact">Contact Support</a> &bull;
      <a href="/delete-account">Delete Account</a> &bull;
      <a href="/app-ads.txt">app-ads.txt</a>
    </p>
  </footer>
</body>
</html>`;
}

// ── Privacy Policy ──
router.get('/privacy-policy', (req, res) => {
  res.send(legalPageLayout('Privacy Policy', `
    <h2>1. Introduction</h2>
    <p>Noor: Muslim Prayer & Quran ("we", "our", or "us") operates the Noor mobile application and serverless APIs. We value your privacy and are committed to protecting your personal data in accordance with global standards and app store policies.</p>
    
    <h2>2. Information We Collect</h2>
    <ul>
      <li><strong>Location Data:</strong> Used locally on your device or via secure prayer timing endpoints solely to calculate accurate prayer timings, sunrise/sunset, and Qibla direction. We do not store, track, or share your GPS coordinates.</li>
      <li><strong>Account Details:</strong> When you register or sign in with Google/Firebase, we store your name and email address strictly to synchronize your personal bookmarks, tasbih counts, and preferences across devices.</li>
      <li><strong>Usage & Analytics:</strong> Anonymous crash reports and performance data via Firebase Crashlytics to fix bugs and improve performance.</li>
    </ul>

    <h2>3. Advertising & AdMob / AdSense</h2>
    <p>Our app displays advertisements through Google AdMob. AdMob may collect and process device identifiers, advertising IDs, and interaction data to serve personalized or contextual advertisements. You may opt out of personalized ads in your device settings.</p>
    <p>Our official publisher identity is verified via <code><a href="/app-ads.txt">app-ads.txt</a></code> (Publisher ID: <code>pub-1806048559578873</code>).</p>

    <h2>4. Data Retention and Account Deletion</h2>
    <p>You have the absolute right to delete your data at any time. You can delete your account and synchronized history directly from the app under <em>Profile &rarr; Account &rarr; Delete Account</em> or through our web portal at <a href="/delete-account">/delete-account</a>.</p>

    <h2>5. Contact Us</h2>
    <p>For questions or privacy inquiries, email us at <a href="mailto:noorsupport@googlegroups.com">noorsupport@googlegroups.com</a>.</p>
  `));
});

// ── Terms of Service ──
router.get('/terms', (req, res) => {
  res.send(legalPageLayout('Terms of Service', `
    <h2>1. Agreement to Terms</h2>
    <p>By downloading, accessing, or using Noor: Muslim Prayer & Quran, you agree to comply with and be bound by these Terms of Service.</p>
    
    <h2>2. Educational & Devotional Content</h2>
    <p>All Quranic text, translations, Tafsir commentaries, hadiths, prayer calculation methods, and Zakat calculations are provided for educational, spiritual, and personal devotional purposes. For formal legal or religious rulings (fatwas), always consult a qualified Islamic scholar.</p>

    <h2>3. Subscriptions & In-App Purchases</h2>
    <p>Noor offers optional Pro subscriptions to unlock ad-free experience, unlimited AI queries, and premium themes. Subscriptions are billed through Google Play or Apple App Store and will automatically renew unless cancelled 24 hours prior to the end of the billing period.</p>

    <h2>4. Modifications</h2>
    <p>We may update these terms from time to time. Continued use of the application indicates acceptance of the updated terms.</p>
  `));
});

// ── About ──
router.get('/about', (req, res) => {
  res.send(legalPageLayout('About Noor', `
    <h2>Our Story & Vision</h2>
    <p>Noor was built with a singular vision: to create the cleanest, most trustworthy, and distraction-free Islamic companion app for the global Muslim Ummah.</p>
    <p>We combine authentic Islamic sources with cutting-edge mobile design to deliver an inspiring experience that brings peace to your day.</p>
    
    <h2>Core Features</h2>
    <ul>
      <li><strong>Precision Prayer Times:</strong> Offline and online calculations supporting multiple conventions (MWL, ISNA, Umm al-Qura, Karachi, Tehran, Egypt, Gulf) and Hanafi/Shafi Asr juristic methods.</li>
      <li><strong>Crystal Clear Quran:</strong> Uthmani script with translations in English, Urdu, French, Indonesian, and more, alongside Ibn Kathir and Jalalayn Tafsir.</li>
      <li><strong>Prophetic Duas & Adhkar:</strong> Categorized supplications with authentic references from Bukhari, Muslim, and Abu Dawud.</li>
      <li><strong>Interactive Courses:</strong> Modular Islamic learning modules from beginner to advanced.</li>
      <li><strong>Smart AI Assistant:</strong> Respectful, source-backed answers to your Islamic inquiries.</li>
    </ul>

    <p style="margin-top: 24px;">
      <a href="https://play.google.com/store/apps/details?id=com.firecode.studios.noor" style="background:#064E3B; color:#fff; padding:12px 24px; border-radius:10px; display:inline-block; text-decoration:none;">Download on Google Play</a>
    </p>
  `));
});

// ── Contact ──
router.get('/contact', (req, res) => {
  res.send(legalPageLayout('Contact & Support', `
    <h2>We Are Here to Help</h2>
    <p>Have questions, suggestions, or encountered an issue? Our support team is eager to assist you.</p>
    
    <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; padding:20px; margin:24px 0;">
      <p style="margin-bottom:6px;"><strong>Email:</strong> <a href="mailto:noorsupport@googlegroups.com">noorsupport@googlegroups.com</a></p>
      <p style="margin-bottom:6px;"><strong>Support Hours:</strong> Monday &ndash; Friday, 9:00 AM &ndash; 6:00 PM (UTC)</p>
      <p style="margin-bottom:0;"><strong>Developer:</strong> Firecode Studios</p>
    </div>

    <p>Please include your app version, device model, and operating system when reporting technical bugs.</p>
  `));
});

// ── Refund Policy ──
router.get('/refund-policy', (req, res) => {
  res.send(legalPageLayout('Refund Policy', `
    <h2>Google Play & App Store Subscriptions</h2>
    <p>All in-app purchases and subscriptions within Noor are processed exclusively by Google Play (for Android) or Apple App Store (for iOS).</p>
    <p>As developer policies dictate, transactions are governed by the payment terms of the respective platform:</p>
    <ul>
      <li><strong>Android Users:</strong> You can request a refund within 48 hours directly on Google Play by visiting <a href="https://play.google.com/store/account/orderhistory" target="_blank" rel="noopener">Google Play Order History</a>.</li>
      <li><strong>iOS Users:</strong> You can request a refund directly via Apple by visiting <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener">reportaproblem.apple.com</a>.</li>
    </ul>
    <p>If you experience any difficulties accessing features you paid for, contact us at <a href="mailto:noorsupport@googlegroups.com">noorsupport@googlegroups.com</a> with your purchase receipt and we will gladly assist you.</p>
  `));
});

// ── Delete Account ──
router.get('/delete-account', (req, res) => {
  res.send(legalPageLayout('Account & Data Deletion', `
    <h2>Account Deletion Request</h2>
    <p>In accordance with Google Play and Apple App Store user data policies, you have full control over your personal data.</p>
    
    <h2>How to Delete Your Account</h2>
    <ol>
      <li><strong>In-App Deletion:</strong> Open the Noor app &rarr; Tap on <strong>Profile</strong> &rarr; Select <strong>Account</strong> &rarr; Tap <strong>Delete Account</strong>. This immediately removes your profile and cloud sync data.</li>
      <li><strong>Web Request:</strong> Alternatively, email our support desk at <a href="mailto:noorsupport@googlegroups.com?subject=Account%20Deletion%20Request">noorsupport@googlegroups.com</a> with the subject "Account Deletion Request" from your registered email address.</li>
    </ol>

    <h2>What Gets Deleted</h2>
    <p>When your account is deleted, the following data is permanently purged:</p>
    <ul>
      <li>User profile, email, and authentication credentials.</li>
      <li>Synchronized Quran bookmarks and reading progress.</li>
      <li>Custom Tasbih presets and recitation count history.</li>
      <li>Saved settings and prayer configuration overrides.</li>
    </ul>
  `));
});

// ── Complete, Visual Landing Page ──
router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Noor: Muslim Prayer, Quran & Daily Deen Companion</title>
  <meta name="description" content="Noor is a comprehensive Islamic companion app featuring accurate prayer times, full Quran with audio & tafsir, daily duas, hadith, 99 Names of Allah, and AI assistant.">
  <link rel="icon" type="image/png" href="/static/logo.png">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Noor: Muslim Prayer & Quran">
  <meta property="og:description" content="Your complete Islamic companion app: prayer times, Quran, duas, hadith, and AI assistant.">
  <meta property="og:type" content="website">
  <meta property="og:image" content="/static/logo.png">

  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Noor: Muslim Prayer & Quran",
    "operatingSystem": "Android",
    "applicationCategory": "LifestyleApplication",
    "identifier": "com.firecode.studios.noor",
    "logo": "/static/logo.png",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Amiri:wght@400;700&display=swap');

    :root {
      --green-900: #064E3B;
      --green-800: #065F46;
      --green-700: #047857;
      --green-600: #059669;
      --green-500: #10B981;
      --green-100: #D1FAE5;
      --green-50: #ECFDF5;
      --gold: #D4A017;
      --gold-light: #FDE68A;
      --cream: #FAF8F3;
      --text: #1F2937;
      --text-light: #4B5563;
      --text-muted: #9CA3AF;
      --bg: #FFFFFF;
      --radius: 18px;
      --shadow-sm: 0 2px 4px rgba(0,0,0,0.04);
      --shadow-md: 0 10px 30px rgba(6,78,59,0.08);
      --shadow-lg: 0 20px 60px rgba(6,78,59,0.12);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* Ambient Background Pattern */
    .bg-pattern {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.035;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23064E3B' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
    }

    /* Navbar */
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .navbar-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 74px;
    }
    .logo {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--green-900);
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .logo img { height: 40px; width: 40px; border-radius: 12px; object-fit: contain; }
    .nav-links { display: flex; gap: 28px; align-items: center; }
    .nav-links a {
      color: var(--text-light);
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--green-600); }
    .nav-download {
      background: linear-gradient(135deg, var(--green-800), var(--green-900));
      color: #fff !important;
      padding: 10px 22px;
      border-radius: 12px;
      font-weight: 700 !important;
      transition: all 0.3s ease !important;
      box-shadow: 0 4px 15px rgba(6,78,59,0.25);
    }
    .nav-download:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(6,78,59,0.35); }

    /* Hero Section */
    .hero {
      min-height: 94vh;
      display: flex;
      align-items: center;
      padding: 130px 24px 70px;
      background: linear-gradient(165deg, #F0FDF4 0%, #ECFDF5 35%, #FAF8F3 75%, #FFFBEB 100%);
      position: relative;
      overflow: hidden;
    }
    .hero-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 60px;
      align-items: center;
      width: 100%;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16,185,129,0.12);
      color: var(--green-800);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 22px;
      border: 1px solid rgba(16,185,129,0.25);
    }
    .badge-dot {
      width: 8px; height: 8px;
      background: var(--green-500);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
    .hero h1 {
      font-size: 3.4rem;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 18px;
      letter-spacing: -0.03em;
    }
    .hero h1 .highlight {
      background: linear-gradient(135deg, var(--green-700), var(--green-900));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero h1 .gold-text {
      color: var(--gold);
    }
    .hero-desc {
      font-size: 1.15rem;
      color: var(--text-light);
      margin-bottom: 32px;
      max-width: 540px;
    }
    .hero-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 40px;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, var(--green-800), #044230);
      color: #fff;
      padding: 16px 32px;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 10px 25px rgba(6,78,59,0.3);
    }
    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 35px rgba(6,78,59,0.4);
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      color: var(--text);
      padding: 16px 28px;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      border: 1px solid var(--border);
      transition: all 0.3s;
    }
    .btn-secondary:hover {
      border-color: var(--green-500);
      color: var(--green-700);
      transform: translateY(-2px);
    }
    .hero-stats {
      display: flex;
      gap: 36px;
      border-top: 1px solid rgba(0,0,0,0.08);
      padding-top: 28px;
    }
    .stat-num { font-size: 1.8rem; font-weight: 800; color: var(--green-900); }
    .stat-label { font-size: 0.82rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

    /* Phone Mockup with Screen Animation */
    .hero-mockup-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .phone-mockup {
      width: 290px;
      height: 590px;
      background: #111827;
      border-radius: 46px;
      padding: 12px;
      box-shadow: 0 35px 80px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.15);
      position: relative;
      z-index: 2;
    }
    .phone-notch {
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      width: 130px;
      height: 26px;
      background: #111827;
      border-radius: 0 0 16px 16px;
      z-index: 10;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 36px;
      overflow: hidden;
      position: relative;
      background: #0E3E2B;
    }
    .phone-screen img {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      transition: opacity 1s ease-in-out;
    }
    .phone-screen .screen-1 { opacity: 1; animation: screenCycle 16s infinite; }
    .phone-screen .screen-2 { opacity: 0; animation: screenCycle 16s infinite 4s; }
    .phone-screen .screen-3 { opacity: 0; animation: screenCycle 16s infinite 8s; }
    .phone-screen .screen-4 { opacity: 0; animation: screenCycle 16s infinite 12s; }

    @keyframes screenCycle {
      0%, 20% { opacity: 1; }
      25%, 95% { opacity: 0; }
      100% { opacity: 0; }
    }

    /* Floating Badges */
    .float-card {
      position: absolute;
      background: rgba(255,255,255,0.96);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      padding: 12px 18px;
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 3;
      border: 1px solid rgba(255,255,255,0.8);
      animation: floatMotion 4s ease-in-out infinite;
    }
    .float-1 { top: 70px; right: -30px; animation-delay: 1.5s; }
    .float-2 { bottom: 60px; left: -35px; animation-delay: 0s; }
    @keyframes floatMotion {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .float-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      background: var(--green-50);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    /* Interactive Live Widget Section */
    .section-preview {
      padding: 70px 24px;
      background: #FFFFFF;
      border-bottom: 1px solid var(--border);
    }
    .preview-container {
      max-width: 1100px;
      margin: 0 auto;
      background: linear-gradient(135deg, #064E3B, #0D6B2E);
      border-radius: 28px;
      padding: 40px;
      color: white;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: center;
      box-shadow: var(--shadow-lg);
    }
    .preview-badge {
      display: inline-block;
      background: rgba(212,160,23,0.25);
      color: var(--gold-light);
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .timings-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 18px;
    }
    .timing-item {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(8px);
      padding: 12px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .timing-name { font-size: 0.75rem; opacity: 0.8; text-transform: uppercase; }
    .timing-val { font-size: 1.1rem; font-weight: 700; color: #FFF; margin-top: 2px; }

    /* Features Section */
    .section-features {
      padding: 100px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      text-align: center;
      max-width: 650px;
      margin: 0 auto 60px;
    }
    .section-tag {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--green-600);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 10px;
    }
    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--green-900);
      margin-bottom: 16px;
    }
    .section-desc {
      font-size: 1.05rem;
      color: var(--text-light);
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 28px;
    }
    .feature-card {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px;
      transition: all 0.3s ease;
      position: relative;
    }
    .feature-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
      border-color: rgba(16,185,129,0.3);
    }
    .feature-icon {
      width: 50px; height: 50px;
      background: var(--green-50);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 20px;
    }
    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--green-900);
    }
    .feature-card p {
      color: var(--text-light);
      font-size: 0.95rem;
      line-height: 1.65;
    }

    /* Screenshots Showcase */
    .section-screenshots {
      padding: 90px 24px;
      background: var(--cream);
    }
    .screenshots-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .screenshot-item {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      border: 3px solid #FFFFFF;
      transition: all 0.4s;
      aspect-ratio: 9/19;
      background: #111827;
    }
    .screenshot-item img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s;
    }
    .screenshot-item:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: var(--shadow-lg);
    }
    .screenshot-item:hover img { transform: scale(1.05); }

    /* CTA Section */
    .cta-banner {
      background: linear-gradient(135deg, #064E3B 0%, #032A20 100%);
      color: white;
      border-radius: 28px;
      padding: 70px 40px;
      text-align: center;
      max-width: 1100px;
      margin: 60px auto 90px;
      position: relative;
      overflow: hidden;
    }
    .cta-banner h2 { font-size: 2.6rem; font-weight: 800; margin-bottom: 16px; }
    .cta-banner p { font-size: 1.15rem; opacity: 0.85; max-width: 600px; margin: 0 auto 32px; }

    /* Footer */
    footer {
      background: #0B1E16;
      color: #9CA3AF;
      padding: 70px 24px 30px;
    }
    .footer-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 40px;
      padding-bottom: 50px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .footer-brand h3 { color: #FFF; font-size: 1.35rem; margin-bottom: 12px; }
    .footer-brand p { font-size: 0.9rem; line-height: 1.7; max-width: 320px; }
    .footer-col h4 { color: #FFF; font-size: 0.9rem; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
    .footer-col ul { list-style: none; }
    .footer-col ul li { margin-bottom: 10px; }
    .footer-col ul a { color: #9CA3AF; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
    .footer-col ul a:hover { color: #FFF; }
    .footer-bottom {
      max-width: 1200px;
      margin: 24px auto 0;
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      flex-wrap: wrap;
      gap: 12px;
    }

    @media (max-width: 1024px) {
      .hero-container { grid-template-columns: 1fr; text-align: center; }
      .hero-buttons { justify-content: center; }
      .hero-stats { justify-content: center; }
      .preview-container { grid-template-columns: 1fr; }
      .screenshots-grid { grid-template-columns: repeat(2, 1fr); max-width: 600px; }
      .float-card { display: none; }
    }
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.3rem; }
      .screenshots-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .nav-links a:not(.nav-download) { display: none; }
    }
  </style>
</head>
<body>
  <div class="bg-pattern"></div>

  <!-- Navbar -->
  <nav class="navbar">
    <div class="navbar-inner">
      <a href="/" class="logo">
        <img src="/static/logo.png" alt="Noor Logo">
        <span>Noor</span>
      </a>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#preview">Prayer Times</a>
        <a href="#screenshots">Screenshots</a>
        <a href="/privacy-policy">Privacy</a>
        <a href="https://play.google.com/store/apps/details?id=com.firecode.studios.noor" class="nav-download" target="_blank" rel="noopener">Download Free</a>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="hero">
    <div class="hero-container">
      <div class="hero-left">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Official Google Play Store App
        </div>
        <h1>Your Complete <span class="highlight">Islamic Companion</span> <span class="gold-text">&amp; Guide</span></h1>
        <p class="hero-desc">Experience accurate prayer times with Azan alerts, the complete Holy Quran with authentic Tafsir, 99 Names of Allah, daily prophetic supplications, and our intelligent Islamic Assistant.</p>
        
        <div class="hero-buttons">
          <a href="https://play.google.com/store/apps/details?id=com.firecode.studios.noor" class="btn-primary" target="_blank" rel="noopener">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18l18-9L3 3z"/></svg>
            Download on Google Play
          </a>
          <a href="#features" class="btn-secondary">
            Explore Features &rarr;
          </a>
        </div>

        <div class="hero-stats">
          <div><div class="stat-num">114</div><div class="stat-label">Quran Surahs</div></div>
          <div><div class="stat-num">99</div><div class="stat-label">Names of Allah</div></div>
          <div><div class="stat-num">24/7</div><div class="stat-label">Accurate Adhan</div></div>
          <div><div class="stat-num">AI</div><div class="stat-label">Verified Assistant</div></div>
        </div>
      </div>

      <div class="hero-mockup-wrapper">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <img class="screen-1" src="/static/screens/home_screen.webp" alt="Noor Home Screen" loading="lazy">
            <img class="screen-2" src="/static/screens/prayer_times_screen.webp" alt="Prayer Times Screen" loading="lazy">
            <img class="screen-3" src="/static/screens/qibla_screen.webp" alt="Qibla Compass Screen" loading="lazy">
            <img class="screen-4" src="/static/screens/quran_screen.webp" alt="Holy Quran Screen" loading="lazy">
          </div>
        </div>

        <div class="float-card float-1">
          <div class="float-icon">&#x1F54C;</div>
          <div>
            <strong style="font-size:0.85rem; color:#1F2937;">Next Prayer: Maghrib</strong>
            <span style="font-size:0.75rem; color:#6B7280; display:block;">Adhan in 18 minutes</span>
          </div>
        </div>

        <div class="float-card float-2">
          <div class="float-icon">&#x1F4D6;</div>
          <div>
            <strong style="font-size:0.85rem; color:#1F2937;">Surah Al-Kahf</strong>
            <span style="font-size:0.75rem; color:#6B7280; display:block;">Blessed Friday Recitation</span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Live Prayer Times & Daily Deen Preview -->
  <section class="section-preview" id="preview">
    <div class="preview-container">
      <div>
        <span class="preview-badge">&#x1F30D; Live Islamic Timings</span>
        <h2 style="font-size:2rem; font-weight:800; line-height:1.2; margin-bottom:12px;">Daily Devotion, Wherever You Are</h2>
        <p style="opacity:0.9; font-size:1rem;">Noor calculates astronomical solar prayer coordinates for every city on Earth with millisecond precision, honoring both Hanafi and Shafi juristic methods.</p>
        <div class="timings-grid">
          <div class="timing-item"><div class="timing-name">Fajr</div><div class="timing-val">05:15 AM</div></div>
          <div class="timing-item"><div class="timing-name">Sunrise</div><div class="timing-val">06:35 AM</div></div>
          <div class="timing-item"><div class="timing-name">Dhuhr</div><div class="timing-val">12:45 PM</div></div>
          <div class="timing-item"><div class="timing-name">Asr</div><div class="timing-val">04:15 PM</div></div>
          <div class="timing-item"><div class="timing-name">Maghrib</div><div class="timing-val">06:55 PM</div></div>
          <div class="timing-item"><div class="timing-name">Isha</div><div class="timing-val">08:15 PM</div></div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:20px; padding:28px;">
        <span style="color:var(--gold-light); font-weight:700; font-size:0.85rem; text-transform:uppercase;">Daily Ayah of Reflection</span>
        <p style="font-family:'Amiri', serif; font-size:1.6rem; line-height:1.8; margin:16px 0 10px; color:#FFF; text-align:right;">
          إِنَّ مَعَ الْعُسْرِ يُسْرًا
        </p>
        <p style="font-size:0.95rem; opacity:0.95; font-style:italic; margin-bottom:8px;">
          "Indeed, with hardship [will be] ease."
        </p>
        <span style="font-size:0.8rem; opacity:0.75;">Surah Ash-Sharh (94:6)</span>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section class="section-features" id="features">
    <div class="section-header">
      <div class="section-tag">Comprehensive Deen Companion</div>
      <h2 class="section-title">Designed for Your Spiritual Growth</h2>
      <p class="section-desc">Everything an observant Muslim seeks in daily life, brought together in an ad-respectful, ad-light, and distraction-free mobile environment.</p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">&#x1F54C;</div>
        <h3>Accurate Prayer Times</h3>
        <p>Multiple calculation methods (MWL, ISNA, Umm al-Qura, Karachi) with automatic GPS detection or offline manual coordinates.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">&#x1F9ED;</div>
        <h3>Precision Qibla Compass</h3>
        <p>High-accuracy magnetometer navigation pointing straight to the Holy Kaaba in Makkah with degree heading readout.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">&#x1F4D6;</div>
        <h3>The Holy Quran with Tafsir</h3>
        <p>Read Arabic text with multi-language translations and comprehensive Ibn Kathir &amp; Jalalayn commentaries by verse.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">&#x2728;</div>
        <h3>99 Names of Allah</h3>
        <p>Explore Asma-ul-Husna with transliterations, spiritual meanings, deep theological explanations, and Quranic citations.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">&#x1F4FF;</div>
        <h3>Digital Tasbih Counter</h3>
        <p>Smart haptic dhikr counter with standard presets (SubhanAllah, Alhamdulillah, Allahu Akbar) and cloud-synced counts.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">&#x1F393;</div>
        <h3>Structured Islamic Courses</h3>
        <p>Progressive lessons in Aqeedah, Salah etiquette, Tajweed rules, Seerah of the Prophet ﷺ, and Fiqh of Worship.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">&#x1F916;</div>
        <h3>AI Islamic Assistant</h3>
        <p>Instant, respectful answers referencing authentic Quranic verses and Sahih Hadith collections.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">&#x1F4B0;</div>
        <h3>Zakat &amp; Inheritance Calculators</h3>
        <p>Calculate your annual Zakat with live Nisab gold/silver thresholds and Islamic estate inheritance shares.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">&#x1F54B;</div>
        <h3>Hajj &amp; Umrah Pilgrimage Guide</h3>
        <p>Step-by-step rituals from Ihram to Tawaf Al-Wada with complete categorized preparation checklists.</p>
      </div>
    </div>
  </section>

  <!-- Screenshots Showcase -->
  <section class="section-screenshots" id="screenshots">
    <div class="section-header">
      <div class="section-tag">App Preview</div>
      <h2 class="section-title">Crafted for Peace of Mind</h2>
      <p class="section-desc">Take a look inside the intuitive, distraction-free interface built for believers worldwide.</p>
    </div>

    <div class="screenshots-grid">
      <div class="screenshot-item">
        <img src="/static/screens/home_screen.webp" alt="Home Screen">
      </div>
      <div class="screenshot-item">
        <img src="/static/screens/prayer_times_screen.webp" alt="Prayer Times Screen">
      </div>
      <div class="screenshot-item">
        <img src="/static/screens/qibla_screen.webp" alt="Qibla Finder Screen">
      </div>
      <div class="screenshot-item">
        <img src="/static/screens/quran_screen.webp" alt="Quran Screen">
      </div>
    </div>
  </section>

  <!-- Download CTA Banner -->
  <section style="padding: 0 24px;">
    <div class="cta-banner">
      <h2>Begin Your Journey with Noor Today</h2>
      <p>Download the free, ad-respectful Islamic companion trusted by thousands of Muslims worldwide.</p>
      <a href="https://play.google.com/store/apps/details?id=com.firecode.studios.noor" class="btn-primary" style="background:#D4A017; color:#111827;" target="_blank" rel="noopener">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18l18-9L3 3z"/></svg>
        Get Noor on Google Play
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="footer-grid">
      <div class="footer-brand">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
          <img src="/static/logo.png" alt="Noor" style="height:36px; border-radius:10px;">
          <h3 style="margin:0;">Noor</h3>
        </div>
        <p>Complete Muslim Prayer, Quran &amp; Islamic Companion application. Authentic content, precision timings, and modern spiritual tools.</p>
      </div>

      <div class="footer-col">
        <h4>Navigation</h4>
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#preview">Prayer Times</a></li>
          <li><a href="#screenshots">Screenshots</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Legal &amp; Policy</h4>
        <ul>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/refund-policy">Refund Policy</a></li>
          <li><a href="/delete-account">Account Deletion</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Verification</h4>
        <ul>
          <li><a href="/app-ads.txt">app-ads.txt (AdMob)</a></li>
          <li><a href="/ads.txt">ads.txt (AdSense)</a></li>
          <li><a href="/health">Health Check</a></li>
          <li><a href="/contact">Support</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} Noor: Muslim Prayer &amp; Quran. All rights reserved.</span>
      <span>Publisher ID: <code>pub-1806048559578873</code> (Direct)</span>
    </div>
  </footer>
</body>
</html>`);
});

module.exports = router;
