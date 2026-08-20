const PROFILES = {
  'صحنه': {
    include: ['فیلیمو', 'حامد جوادزاده', 'فرزاد فرزین', 'صد داور', 'برنامه صحنه', 'صحنه فیلیمو'],
    exclude: ['تصادف', 'جرم', 'قتل', 'تئاتر', 'سینما', 'فیلم', 'هواشناسی', 'شهرستان صحنه', 'کرمانشاه']
  }
};

const clean = (s = '') => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/<!\[CDATA\[|\]\]>/g, '').trim();

async function googleNews(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fa&gl=IR&ceid=IR:fa`;
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error('Search provider unavailable');
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const item = m[1];
    const get = (tag) => clean(item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] || '');
    return { title: get('title'), link: get('link'), published: get('pubDate'), source: get('source'), platform: 'Web / News' };
  });
}

function score(item, q, profile) {
  const text = `${item.title} ${item.source}`.toLowerCase();
  let score = text.includes(q.toLowerCase()) ? 45 : 0;
  for (const term of profile?.include || []) if (text.includes(term.toLowerCase())) score += term.length > 8 ? 18 : 12;
  for (const term of profile?.exclude || []) if (text.includes(term.toLowerCase())) score -= 35;
  return Math.max(0, Math.min(100, score));
}

export default async function handler(req, res) {
  const q = String(req.query?.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing q' });

  const profile = PROFILES[q];
  const queries = profile
    ? [`"${q}"`, `"${q}" (${profile.include.slice(0, 4).join(' OR ')})`]
    : [`"${q}"`];

  try {
    const batches = await Promise.all(queries.map(googleNews));
    const map = new Map();
    for (const item of batches.flat()) {
      const key = item.link || `${item.title}|${item.source}`;
      if (!map.has(key)) map.set(key, item);
    }

    const items = [...map.values()]
      .map(item => ({ ...item, relevance: score(item, q, profile), query: q }))
      .filter(item => profile ? item.relevance >= 45 : item.relevance >= 45)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 50);

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    return res.status(200).json({ query: q, count: items.length, items });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Search provider unavailable' });
  }
}
