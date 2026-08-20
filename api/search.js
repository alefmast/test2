const PROFILES = {
  'صحنه': {
    include: ['فیلیمو', 'حامد جوادزاده', 'فرزاد فرزین', 'صد داور', 'داوران صحنه', 'برنامه صحنه', 'صحنه موسیقی', 'صحنه فیلیمو'],
    exclude: ['تصادف', 'جرم', 'قتل', 'تئاتر', 'سینما', 'فیلم', 'هواشناسی', 'شهرستان صحنه', 'شهر صحنه', 'کرمانشاه', 'سحنه']
  }
};

const clean = (s = '') => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/<!\[CDATA\[|\]\]>/g, '').trim();

async function googleNews(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fa&gl=IR&ceid=IR:fa`;
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`Search provider returned ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const item = m[1];
    const get = (tag) => clean(item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] || '');
    return { title: get('title'), link: get('link'), published: get('pubDate'), source: get('source'), platform: 'Web / News' };
  });
}

function score(item, q, profile) {
  const text = `${item.title} ${item.source}`.toLowerCase();
  let value = text.includes(q.toLowerCase()) ? 25 : 0;
  let matched = [];
  for (const term of profile?.include || []) if (text.includes(term.toLowerCase())) { matched.push(term); value += term.length >= 10 ? 35 : 25; }
  for (const term of profile?.exclude || []) if (text.includes(term.toLowerCase())) value -= 70;
  return { relevance: Math.max(0, Math.min(100, value)), matched };
}

export default async function handler(req, res) {
  const q = String(req.query?.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing q' });
  const profile = PROFILES[q];
  const queries = profile ? [
    'صحنه فیلیمو','صحنه حامد جوادزاده','صحنه فرزاد فرزین','صحنه صد داور',
    'صحنه داوران موسیقی','برنامه صحنه موسیقی','حامد جوادزاده صحنه','فرزاد فرزین صحنه'
  ] : [`${q}`, `${q} خبر`, `${q} برنامه`];
  try {
    const batches = await Promise.all(queries.map(googleNews));
    const map = new Map();
    for (const item of batches.flat()) {
      const key = item.link || `${item.title}|${item.source}`;
      if (item.title && !map.has(key)) map.set(key, item);
    }
    const ranked = [...map.values()].map(item => {
      const s = score(item, q, profile);
      return { ...item, relevance: s.relevance, query: q, matchedEntities: s.matched };
    }).sort((a,b) => b.relevance - a.relevance).slice(0, 50);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ query: q, count: ranked.length, items: ranked, note: profile ? 'Results are ranked by relevance; review low-score items before treating them as mentions.' : undefined });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Search provider unavailable' });
  }
}
