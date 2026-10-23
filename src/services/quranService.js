const QURAN_API_BASE = process.env.QURAN_COM_API_BASE || 'https://api.quran.com/api/v4';
const TAFSIR_CDN_BASE = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';

const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

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

async function getChapters() {
  const key = 'quran:chapters';
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(`${QURAN_API_BASE}/chapters?language=en`);
    if (res.ok) {
      const data = await res.json();
      setCached(key, data);
      return data;
    }
  } catch (e) {
    console.warn('Failed to fetch chapters from quran.com:', e.message);
  }

  // Minimal fallback
  return {
    chapters: [
      { id: 1, name_simple: 'Al-Fatihah', name_arabic: 'الفاتحة', verses_count: 7, revelation_place: 'makkah' },
      { id: 2, name_simple: 'Al-Baqarah', name_arabic: 'البقرة', verses_count: 286, revelation_place: 'madinah' },
      { id: 3, name_simple: 'Ali \'Imran', name_arabic: 'آل عمران', verses_count: 200, revelation_place: 'madinah' },
      { id: 112, name_simple: 'Al-Ikhlas', name_arabic: 'الإخلاص', verses_count: 4, revelation_place: 'makkah' },
      { id: 113, name_simple: 'Al-Falaq', name_arabic: 'الفلق', verses_count: 5, revelation_place: 'makkah' },
      { id: 114, name_simple: 'An-Nas', name_arabic: 'الناس', verses_count: 6, revelation_place: 'makkah' }
    ]
  };
}

async function getVerses(chapterId, page, perPage = 10) {
  const key = `quran:verses:${chapterId}:${page}:${perPage}`;
  const cached = getCached(key);
  if (cached) return cached;

  const endpoint = page
    ? `${QURAN_API_BASE}/verses/by_page/${page}?chapter_id=${chapterId}&words=true&per_page=${perPage}&page=${page}`
    : `${QURAN_API_BASE}/quran/verses/uthmani?chapter_id=${chapterId}&words=true&per_page=${perPage}`;

  try {
    const res = await fetchWithTimeout(endpoint);
    if (res.ok) {
      const data = await res.json();
      setCached(key, data);
      return data;
    }
  } catch (e) {
    console.warn('Failed to fetch verses from quran.com:', e.message);
  }

  return { verses: [] };
}

async function searchQuran(query, language = 'en') {
  try {
    const res = await fetchWithTimeout(`${QURAN_API_BASE}/search?q=${encodeURIComponent(query)}&language=${language}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to search quran:', e.message);
  }
  return { search: { results: [], total_results: 0 } };
}

async function getTafsirEditions() {
  const key = 'quran:tafsir_editions';
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(`${TAFSIR_CDN_BASE}/editions.json`);
    if (res.ok) {
      const editions = await res.json();
      const result = { data: editions };
      setCached(key, result);
      return result;
    }
  } catch (e) {
    console.warn('Failed to fetch tafsir editions:', e.message);
  }

  return {
    data: [
      { id: 169, slug: 'en-tafisr-ibn-kathir', name: 'Tafsir Ibn Kathir', author_name: 'Ibn Kathir', language_name: 'English' },
      { id: 170, slug: 'en-al-jalalayn', name: 'Tafsir al-Jalalayn', author_name: 'Jalal al-Din al-Mahalli and Jalal al-Din al-Suyuti', language_name: 'English' },
      { id: 171, slug: 'ar-tafsir-ibn-kathir', name: 'تفسير ابن كثير', author_name: 'ابن كثير', language_name: 'Arabic' }
    ]
  };
}

async function getTafsirByChapter(slug, chapter) {
  try {
    const res = await fetchWithTimeout(`${TAFSIR_CDN_BASE}/editions/${slug}/${chapter}.json`);
    if (res.ok) {
      const data = await res.json();
      return { chapter, slug, ayahs: data.ayahs || data.verses || [] };
    }
  } catch (e) {
    console.warn(`Failed to fetch tafsir ${slug}/${chapter}:`, e.message);
  }
  return { chapter, slug, ayahs: [] };
}

async function getTafsirVerse(slug, chapter, verse) {
  const chapterData = await getTafsirByChapter(slug, chapter);
  const found = (chapterData.ayahs || []).find(
    a => (a.ayah || a.verse || a.number) === Number(verse)
  );
  if (found) {
    return {
      chapter,
      verse: Number(verse),
      slug,
      text: found.text || found.content || ''
    };
  }
  return null;
}

module.exports = {
  getChapters,
  getVerses,
  searchQuran,
  getTafsirEditions,
  getTafsirByChapter,
  getTafsirVerse
};
