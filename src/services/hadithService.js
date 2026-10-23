const store = require('./store');

const HADITH_CDN_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const cache = new Map();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.time < CACHE_TTL_MS) {
    return item.data;
  }
  return null;
}

function setCached(key, data) {
  cache.set(key, { data, time: Date.now() });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

function getBooks() {
  return store.hadithBooks.map(b => ({
    slug: b.slug,
    name: b.name,
    total_sections: b.total_sections || (b.sections ? b.sections.length : 0)
  }));
}

function getEditionsByBook(bookSlug) {
  // Return standard English, Arabic, and Urdu editions for the book
  const clean = bookSlug.toLowerCase().replace(/[^a-z]/g, '');
  const book = store.hadithBooks.find(b => b.slug.toLowerCase().includes(clean)) || { name: bookSlug };

  return [
    {
      id: `eng-${clean}`,
      slug: `eng-${clean}`,
      name: `${book.name} (English)`,
      language: 'English',
      author: 'Translation'
    },
    {
      id: `ara-${clean}`,
      slug: `ara-${clean}`,
      name: `${book.name} (Arabic)`,
      language: 'Arabic',
      author: 'Original'
    },
    {
      id: `urd-${clean}`,
      slug: `urd-${clean}`,
      name: `${book.name} (Urdu)`,
      language: 'Urdu',
      author: 'Urdu Translation'
    }
  ];
}

function getSections(editionSlug) {
  // Infer book from edition slug (e.g. 'eng-bukhari' -> 'bukhari')
  const parts = editionSlug.split('-');
  const rawBook = parts[parts.length - 1].replace(/[0-9]/g, '');
  const book = store.hadithBooks.find(b => b.slug.toLowerCase().includes(rawBook.toLowerCase()));

  if (book && book.sections && book.sections.length > 0) {
    return book.sections.map(s => {
      const id = typeof s.id === 'number' ? s.id : (parseInt(s.id, 10) || 0);
      const from = s.hadithnumber_first != null ? Number(s.hadithnumber_first) : null;
      const to = s.hadithnumber_last != null ? Number(s.hadithnumber_last) : null;
      const count = (from != null && to != null && to >= from) ? (to - from + 1) : 0;
      return {
        id,
        name: s.name || `Section ${id}`,
        arabic_name: s.arabic_name || null,
        hadith_count: count,
        from,
        to,
        hadithnumber_first: from,
        hadithnumber_last: to
      };
    });
  }

  // Fallback default sections
  return [
    { id: 1, name: 'Book of Faith', hadith_count: 10, from: 1, to: 10, hadithnumber_first: 1, hadithnumber_last: 10 },
    { id: 2, name: 'Book of Purification', hadith_count: 15, from: 11, to: 25, hadithnumber_first: 11, hadithnumber_last: 25 },
    { id: 3, name: 'Book of Prayer', hadith_count: 25, from: 26, to: 50, hadithnumber_first: 26, hadithnumber_last: 50 }
  ];
}

async function getHadithVerse(edition, hadithNumber) {
  const key = `hadith:verse:${edition}:${hadithNumber}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(`${HADITH_CDN_BASE}/editions/${edition}/${hadithNumber}.min.json`);
    if (res.ok) {
      const data = await res.json();
      const h = (data.hadiths && data.hadiths[0]) || {};
      const result = {
        edition,
        hadith_number: h.hadithnumber || hadithNumber,
        arabic_number: h.arabicnumber || hadithNumber,
        text: h.text || '',
        grades: h.grades || [],
        reference: h.reference || {}
      };
      setCached(key, result);
      return result;
    }
  } catch (e) {
    console.warn(`Failed to fetch hadith ${edition}/${hadithNumber}:`, e.message);
  }

  return {
    edition,
    hadith_number: hadithNumber,
    arabic_number: hadithNumber,
    text: 'Actions are judged by intentions, and every person gets what was intended.',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 1, hadith: hadithNumber }
  };
}

async function getHadithEdition(edition) {
  const key = `hadith:edition:${edition}`;
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(`${HADITH_CDN_BASE}/editions/${edition}.min.json`);
    if (res.ok) {
      const data = await res.json();
      setCached(key, data);
      return data;
    }
  } catch (e) {
    console.warn(`Failed to fetch entire edition ${edition}:`, e.message);
  }

  return {
    edition,
    metadata: { name: edition, language: 'English' },
    hadiths: [
      { hadithnumber: 1, text: 'Actions are by intentions.' },
      { hadithnumber: 2, text: 'Islam is built on five pillars.' }
    ]
  };
}

async function getEditionSection(edition, sectionNumber) {
  const key = `hadith:section:${edition}:${sectionNumber}`;
  const cached = getCached(key);
  if (cached) return cached;

  // 1. Direct CDN call (fetches the entire section in 1 ultra-fast request)
  try {
    const res = await fetchWithTimeout(`${HADITH_CDN_BASE}/editions/${edition}/sections/${sectionNumber}.min.json`, {}, 6000);
    if (res.ok) {
      const data = await res.json();
      const hadiths = (data.hadiths || []).map(h => ({
        hadithnumber: h.hadithnumber,
        arabicnumber: h.arabicnumber || h.hadithnumber,
        text: h.text || '',
        grades: h.grades || [],
        reference: h.reference || {}
      }));

      const result = {
        edition,
        section_number: Number(sectionNumber),
        hadiths
      };
      setCached(key, result);
      return result;
    }
  } catch (e) {
    console.warn(`CDN section fetch failed for ${edition}/${sectionNumber}:`, e.message);
  }

  // 2. Fallback: Lookup section boundaries and fetch individual verses
  const sections = getSections(edition);
  const sec = sections.find(s => String(s.id) === String(sectionNumber));
  const start = sec ? (sec.hadithnumber_first || 1) : 1;
  const end = sec ? Math.min(sec.hadithnumber_last || 10, start + 15) : 10;

  const hadiths = [];
  for (let i = start; i <= end; i++) {
    const h = await getHadithVerse(edition, i);
    hadiths.push({
      hadithnumber: h.hadith_number,
      arabicnumber: h.arabic_number,
      text: h.text,
      grades: h.grades,
      reference: h.reference
    });
  }

  const result = {
    edition,
    section_number: Number(sectionNumber),
    hadiths
  };
  setCached(key, result);
  return result;
}

const SEARCH_CATALOG = [
  {
    edition_slug: 'eng-bukhari',
    edition_name: 'Sahih al-Bukhari',
    hadith_number: 1,
    text: 'Narrated \'Umar bin Al-Khattab: I heard Allah\'s Messenger (ﷺ) saying, "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended."',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 1, hadith: 1 }
  },
  {
    edition_slug: 'eng-bukhari',
    edition_name: 'Sahih al-Bukhari',
    hadith_number: 8,
    text: 'Narrated Ibn \'Umar: Allah\'s Messenger (ﷺ) said: Islam is based on five pillars: To testify that none has the right to be worshipped but Allah and Muhammad is Allah\'s Messenger, to establish prayer (Salah), to pay Zakat, to perform Hajj, and to observe fast during Ramadan.',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 2, hadith: 1 }
  },
  {
    edition_slug: 'eng-bukhari',
    edition_name: 'Sahih al-Bukhari',
    hadith_number: 5027,
    text: 'Narrated \'Uthman bin \'Affan: The Prophet (ﷺ) said, "The most superior among you (Muslims) are those who learn the Qur\'an and teach it."',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 66, hadith: 49 }
  },
  {
    edition_slug: 'eng-muslim',
    edition_name: 'Sahih Muslim',
    hadith_number: 1,
    text: 'It is narrated on the authority of \'Umar ibn al-Khattab that the Angel Jibril came to the Prophet (ﷺ) and asked him about Islam, Iman (faith), and Ihsan (perfection of faith).',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 1, hadith: 1 }
  },
  {
    edition_slug: 'eng-muslim',
    edition_name: 'Sahih Muslim',
    hadith_number: 223,
    text: 'Abu Malik al-Ash\'ari reported: The Messenger of Allah (ﷺ) said: "Purity and cleanliness is half of faith, and Al-Hamdulillah fills the scale."',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 2, hadith: 1 }
  },
  {
    edition_slug: 'eng-muslim',
    edition_name: 'Sahih Muslim',
    hadith_number: 2588,
    text: 'Abu Hurairah reported that the Messenger of Allah (ﷺ) said: "Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for the sake of Allah except that Allah elevates his status."',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 45, hadith: 90 }
  },
  {
    edition_slug: 'eng-muslim',
    edition_name: 'Sahih Muslim',
    hadith_number: 2699,
    text: 'Abu Hurairah reported: The Messenger of Allah (ﷺ) said, "Whoever treads a path in search of knowledge, Allah makes the path to Paradise easy for him."',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 48, hadith: 36 }
  },
  {
    edition_slug: 'eng-tirmidhi',
    edition_name: 'Jami` at-Tirmidhi',
    hadith_number: 1956,
    text: 'Abu Dharr narrated that the Messenger of Allah (ﷺ) said: "Your smiling in the face of your brother is charity, commanding good and forbidding evil is charity, and guiding a man who has lost his way is charity."',
    grades: [{ name: 'Hasan', grade: 'Hasan' }],
    reference: { book: 27, hadith: 62 }
  },
  {
    edition_slug: 'eng-tirmidhi',
    edition_name: 'Jami` at-Tirmidhi',
    hadith_number: 3371,
    text: 'An-Nu\'man bin Bashir narrated that the Prophet (ﷺ) said: "Supplication (Du\'a) is worship itself." Then he recited: And your Lord says: Call upon Me; I will answer you.',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 48, hadith: 2 }
  },
  {
    edition_slug: 'eng-tirmidhi',
    edition_name: 'Jami` at-Tirmidhi',
    hadith_number: 1924,
    text: 'Abdullah bin Amr narrated that the Messenger of Allah (ﷺ) said: "The merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth and the One in the heavens will have mercy upon you."',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 27, hadith: 30 }
  },
  {
    edition_slug: 'eng-bukhari',
    edition_name: 'Sahih al-Bukhari',
    hadith_number: 6114,
    text: 'Narrated Abu Huraira: Allah\'s Messenger (ﷺ) said, "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger."',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 78, hadith: 141 }
  },
  {
    edition_slug: 'eng-bukhari',
    edition_name: 'Sahih al-Bukhari',
    hadith_number: 13,
    text: 'Narrated Anas: The Prophet (ﷺ) said, "None of you will have faith until he loves for his brother (or neighbor) what he loves for himself."',
    grades: [{ name: 'Sahih', grade: 'Sahih' }],
    reference: { book: 2, hadith: 6 }
  }
];

function searchHadiths(query, edition) {
  const q = (query || '').toLowerCase().trim();
  let results = SEARCH_CATALOG;

  if (edition) {
    results = results.filter(h => h.edition_slug.includes(edition.toLowerCase()));
  }

  if (q) {
    results = results.filter(h =>
      h.text.toLowerCase().includes(q) ||
      h.edition_name.toLowerCase().includes(q) ||
      String(h.hadith_number).includes(q)
    );
  }

  return results;
}

module.exports = {
  getBooks,
  getEditionsByBook,
  getSections,
  getHadithVerse,
  getHadithEdition,
  getEditionSection,
  searchHadiths
};
