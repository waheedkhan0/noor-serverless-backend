const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.deepinfra.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';

const SYSTEM_PROMPT = `You are a knowledgeable, gentle, and respectful Islamic assistant for Noor App.
Follow these rules strictly:
1. Only answer using verified Quran (Sahih International translation) and Sahih Hadith (Bukhari, Muslim, Tirmidhi, Abu Dawud).
2. Decline sectarian debates, political controversies, or non-constructive polemics with wisdom and gentleness.
3. Every response should encourage good character, piety, and remembrance of Allah.
4. If asked about complex legal fatawa, kindly advise consulting a qualified local scholar.`;

async function getResponse(messages) {
  if (AI_API_KEY) {
    try {
      const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'May Allah bless you and grant you knowledge.';
      }
    } catch (err) {
      console.warn('AI API upstream call failed:', err.message);
    }
  }

  // Fallback intelligent answers for common Islamic inquiries
  const userQuery = messages[messages.length - 1]?.content?.toLowerCase() || '';

  if (userQuery.includes('prayer') || userQuery.includes('salah') || userQuery.includes('namaz')) {
    return 'Prayer (Salah) is the second pillar of Islam and the primary connection between a servant and Allah. Allah says in the Quran: "Indeed, prayer has been decreed upon the believers a decree of specified times" (Surah An-Nisa 4:103). The Prophet (ﷺ) said: "The first matter that the slave will be brought to account for on the Day of Judgment is the prayer" (Sunan Abu Dawud). Strive to perform your five daily prayers with presence of heart and humility (Khushoo).';
  }

  if (userQuery.includes('zakat') || userQuery.includes('charity')) {
    return 'Zakat is the third pillar of Islam, purifying wealth and supporting those in need. Allah says: "And establish prayer and give Zakat and obey the Messenger that you may receive mercy" (Surah An-Nur 24:56). Zakat is 2.5% of eligible savings and assets held for a full lunar year above the Nisab threshold. In addition, voluntary charity (Sadaqah) extinguishes sin just as water extinguishes fire (Jami` at-Tirmidhi).';
  }

  if (userQuery.includes('dua') || userQuery.includes('supplication')) {
    return 'Dua is the essence of worship. Allah says in the Quran: "And your Lord says, \'Call upon Me; I will respond to you\'" (Surah Ghafir 40:60). Make dua with certainty that Allah hears you, particularly in the last third of the night, during prostration (Sujood), and between the Adhan and Iqamah.';
  }

  if (userQuery.includes('forgive') || userQuery.includes('repent') || userQuery.includes('sin') || userQuery.includes('tawbah')) {
    return 'Allah\'s mercy encompasses all things. Allah proclaims in Surah Az-Zumar (39:53): "Say, \'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.\'" Turn to Allah with sincere repentance (Tawbah Nasuha), regret the past, and resolve to do good deeds.';
  }

  if (userQuery.includes('patience') || userQuery.includes('hard') || userQuery.includes('sad') || userQuery.includes('difficulty')) {
    return 'Allah reminds us in the Quran: "Indeed, with hardship [will be] ease" (Surah Ash-Sharh 94:6) and "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient" (Surah Al-Baqarah 2:153). Remember that every trial is an opportunity for elevation in rank and purification of sins.';
  }

  return 'Assalamu Alaikum. May Allah grant you ease, wisdom, and steadfastness upon the straight path. Remember to frequently recite "Astaghfirullah" and "SubhanAllahi wa bihamdihi, SubhanAllahil Azeem". For detailed rulings and fatawa, please consult a trusted local scholar.';
}

module.exports = {
  getResponse,
  SYSTEM_PROMPT
};
