const express = require('express');

const router = express.Router();

const APP_ADS_TXT = `google.com, pub-1806048559578873, DIRECT, f08c47fec0942fa0\n`;

function pageLayout(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Noor: Muslim Prayer & Quran</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@700&display=swap');
    :root {
      --primary: #0E3E2B;
      --primary-light: #165B40;
      --accent: #D4A017;
      --bg: #F8FAF9;
      --card: #FFFFFF;
      --text: #1C2520;
      --text-muted: #5A6A62;
      --border: #E2E8E5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
      padding: 0;
    }
    header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: white;
      padding: 48px 24px;
      text-align: center;
    }
    .arabic-title { font-family: 'Amiri', serif; font-size: 40px; color: var(--accent); margin-bottom: 8px; }
    header h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    header p { opacity: 0.85; margin-top: 6px; font-size: 15px; }
    main {
      max-width: 820px;
      margin: -24px auto 60px;
      padding: 0 20px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 36px;
      box-shadow: 0 10px 30px rgba(14, 62, 43, 0.04);
    }
    h2 { color: var(--primary); font-size: 20px; margin: 28px 0 12px; }
    h2:first-child { margin-top: 0; }
    p, li { color: var(--text-muted); font-size: 15px; margin-bottom: 14px; }
    ul { padding-left: 20px; margin-bottom: 18px; }
    a { color: var(--primary-light); font-weight: 600; text-decoration: none; }
    a:hover { text-decoration: underline; }
    footer {
      text-align: center;
      padding: 30px 20px;
      color: var(--text-muted);
      font-size: 13px;
      border-top: 1px solid var(--border);
    }
    .btn {
      display: inline-block;
      background: var(--accent);
      color: #1a1a1a;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      margin-top: 12px;
      text-decoration: none;
    }
    .btn:hover { text-decoration: none; opacity: 0.95; }
  </style>
</head>
<body>
  <header>
    <div class="arabic-title">نُور</div>
    <h1>${title}</h1>
    <p>Noor: Muslim Prayer, Quran & Daily Deen Companion</p>
  </header>
  <main>
    <div class="card">
      ${content}
    </div>
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} Noor App. All rights reserved.</p>
    <p style="margin-top: 8px;">
      <a href="/privacy-policy">Privacy Policy</a> &bull;
      <a href="/terms">Terms of Service</a> &bull;
      <a href="/about">About</a> &bull;
      <a href="/contact">Contact</a>
    </p>
  </footer>
</body>
</html>`;
}

router.get('/app-ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(APP_ADS_TXT);
});

router.get('/privacy-policy', (req, res) => {
  res.send(pageLayout('Privacy Policy', `
    <h2>1. Introduction</h2>
    <p>Noor: Muslim Prayer & Quran ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains our practices regarding data collection and usage.</p>
    <h2>2. Data Collection and Usage</h2>
    <p>We respect your privacy and minimize data collection:</p>
    <ul>
      <li><strong>Location Data:</strong> Used strictly on your device or in proxy requests to calculate accurate prayer times, sunrise, and Qibla direction. We do not track or sell your location.</li>
      <li><strong>Account Information:</strong> If you sign in via Google or Firebase, your email and display name are used to synchronize bookmarks, settings, and tasbih counts across devices.</li>
      <li><strong>AI Assistant Conversations:</strong> Your chat messages are processed to provide verified Islamic answers and are not sold to third parties.</li>
    </ul>
    <h2>3. Third-Party Services</h2>
    <p>We utilize trusted third-party providers including Google Firebase, RevenueCat for subscriptions, and Google AdMob. These services adhere to rigorous security standards.</p>
    <h2>4. Contact Us</h2>
    <p>If you have any questions, contact us at <a href="mailto:noorsupport@googlegroups.com">noorsupport@googlegroups.com</a>.</p>
  `));
});

router.get('/terms', (req, res) => {
  res.send(pageLayout('Terms of Service', `
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing or using Noor: Muslim Prayer & Quran, you agree to be bound by these Terms of Service.</p>
    <h2>2. Religious Content and Calculators</h2>
    <p>Prayer times and inheritance calculations are provided as educational and devotional aids. For binding legal matters and fatwas, please consult a qualified scholar.</p>
    <h2>3. Subscriptions</h2>
    <p>Subscriptions (monthly or annual) unlock premium features including ad-free access, unlimited AI chat, and cloud backup. Manage your subscription through Google Play or Apple App Store.</p>
    <h2>4. Termination</h2>
    <p>You may stop using the app at any time and request account deletion via the app or by visiting <a href="/delete-account">our deletion portal</a>.</p>
  `));
});

router.get('/about', (req, res) => {
  res.send(pageLayout('About Noor', `
    <h2>Our Mission</h2>
    <p>Noor was created to be a distraction-free, beautifully crafted Islamic companion for Muslims worldwide.</p>
    <h2>Key Highlights</h2>
    <ul>
      <li>Accurate prayer times with custom calculation methods and Hanafi/Shafi school options.</li>
      <li>Full Holy Quran recitation with verified translations and authentic Tafsir.</li>
      <li>Categorized Daily Duas, 99 Names of Allah, and digital Tasbih counter.</li>
      <li>Step-by-step Hajj and Umrah visual guides.</li>
      <li>Accurate Zakat and inheritance calculators.</li>
    </ul>
    <p><a class="btn" href="https://play.google.com/store/apps/details?id=com.firecode.studios.noor">Download on Google Play</a></p>
  `));
});

router.get('/contact', (req, res) => {
  res.send(pageLayout('Contact Support', `
    <h2>Get in Touch</h2>
    <p>We welcome your feedback, bug reports, and suggestions.</p>
    <p><strong>Email:</strong> <a href="mailto:noorsupport@googlegroups.com">noorsupport@googlegroups.com</a></p>
    <p><strong>Hours:</strong> Monday &ndash; Friday, 9:00 AM &ndash; 6:00 PM (UTC)</p>
  `));
});

router.get('/refund-policy', (req, res) => {
  res.send(pageLayout('Refund Policy', `
    <h2>In-App Purchases</h2>
    <p>All in-app purchases and subscriptions are handled directly through Google Play Store or Apple App Store.</p>
    <p>To request a refund, please follow the refund guidelines provided by your respective app store.</p>
  `));
});

router.get('/delete-account', (req, res) => {
  res.send(pageLayout('Account Deletion', `
    <h2>Delete Your Noor Account</h2>
    <p>Under Google Play and App Store data safety policies, you have the right to request permanent deletion of your account and associated synchronized data (bookmarks, tasbih presets, history).</p>
    <p>To delete your account:</p>
    <ol style="margin-left: 20px; color: var(--text-muted); margin-bottom: 20px;">
      <li>Open the Noor App &rarr; Navigate to <strong>Profile</strong> &rarr; <strong>Account</strong>.</li>
      <li>Select <strong>Delete Account</strong> and confirm your choice.</li>
      <li>Alternatively, email <a href="mailto:noorsupport@googlegroups.com">noorsupport@googlegroups.com</a> from your registered email address with the subject "Delete Noor Account".</li>
    </ol>
  `));
});

// Landing Page
router.get('/', (req, res) => {
  res.send(pageLayout('Welcome to Noor', `
    <h2>Your Daily Islamic Companion</h2>
    <p>Noor provides everything a Muslim needs on their daily journey of faith: prayer times, Quran, duas, hadith, calculators, and authentic Islamic learning.</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 24px 0;">
      <div style="padding: 16px; border: 1px solid var(--border); border-radius: 14px;">
        <h3 style="color: var(--primary); font-size: 16px; margin-bottom: 6px;">🕌 Prayer & Qibla</h3>
        <p style="font-size: 13px; margin: 0;">Accurate prayer times with offline calculation and high-precision compass.</p>
      </div>
      <div style="padding: 16px; border: 1px solid var(--border); border-radius: 14px;">
        <h3 style="color: var(--primary); font-size: 16px; margin-bottom: 6px;">📖 Holy Quran</h3>
        <p style="font-size: 13px; margin: 0;">Crystal clear Uthmani text, verified translations, and comprehensive Tafsir.</p>
      </div>
      <div style="padding: 16px; border: 1px solid var(--border); border-radius: 14px;">
        <h3 style="color: var(--primary); font-size: 16px; margin-bottom: 6px;">🤲 Duas & Asma</h3>
        <p style="font-size: 13px; margin: 0;">All 99 Names of Allah, authentic morning/evening adhkar, and digital Tasbih.</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 30px;">
      <a class="btn" href="https://play.google.com/store/apps/details?id=com.firecode.studios.noor">Get Noor on Google Play</a>
    </div>
  `));
});

module.exports = router;
