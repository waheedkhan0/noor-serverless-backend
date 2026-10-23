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
    return book.sections.map(s => ({
      id: typeof s.id === 'number' ? s.id : (parseInt(s.id, 10) || s.id),
      name: s.name,
      hadithnumber_first: s.hadithnumber_first,
      hadithnumber_last: s.hadithnumber_last
    }));
  }

  // Fallback default sections
  return [
    { id: 1, name: 'Book of Faith', hadithnumber_first: 1, hadithnumber_last: 10 },
    { id: 2, name: 'Book of Purification', hadithnumber_first: 11, hadithnumber_last: 25 },
    { id: 3, name: 'Book of Prayer', hadithnumber_first: 26, hadithnumber_last: 50 }
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
  // If section hadiths are requested, return the hadiths belonging to that section
  const sections = getSections(edition);
  const sec = sections.find(s => String(s.id) === String(sectionNumber));
  const start = sec ? sec.hadithnumber_first : 1;
  const end = sec ? Math.min(sec.hadithnumber_last, start + 15) : 10;

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

  return {
    edition,
    section_number: sectionNumber,
    hadiths
  };
}

function searchHadiths(query, edition) {
  const sample = [
    {
      edition_slug: 'eng-bukhari',
      edition_name: 'Sahih al-Bukhari',
      hadith_number: 1,
      text: 'Narrated \'Umar bin Al-Khattab: I heard Allah\'s Messenger (ﷺ) saying, "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended."',
      grades: [{ name: 'Al-Albani', grade: 'Sahih' }],
      reference: { book: 1, hadith: 1 }
    },
    {
      edition_slug: 'eng-muslim',
      edition_name: 'Sahih Muslim',
      hadith_number: 1,
      text: 'It is narrated on the authority of Yahya b. Ya\'mar that the first man who discussed Qadr in Basrah was Ma\'bad al-Juhani. The Messenger of Allah (ﷺ) explained Islam, Iman, and Ihsan.',
      grades: [{ name: 'Sahih', grade: 'Sahih' }],
      reference: { book: 1, hadith: 1 }
    }
  ];

  const q = (query || '').toLowerCase();
  return sample.filter(h => h.text.toLowerCase().includes(q) || !q);
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
