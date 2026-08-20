import { resolveEntity, entitySearchTerms } from '../lib/entities.js';

const clean = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/\s+/g, ' ').trim();
const norm = (s) => String(s || '').toLocaleLowerCase('fa-IR').replace(/[\u200c\u200d]/g, ' ').replace(/[إأآ]/g, 'ا').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim();
const domain = (u) => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } };
const platform = (u) => { const h = domain(u); if (h === 'instagram.com' || h.endsWith('.instagram.com')) return 'Instagram'; if (h === 't.me' || h === 'telegram.me' || h.endsWith('.telegram.me')) return 'Telegram'; if (h === 'youtube.com' || h.endsWith('.youtube.com') || h === 'youtu.be') return 'YouTube'; if (h === 'x.com' || h.endsWith('.x.com') || h === 'twitter.com' || h.endsWith('.twitter.com')) return 'X'; return 'Web'; };

const decode = (s) => clean(String(s || '').replace(/\\x26/g, '&')).replace(/\+/g, ' ');
const parseRSS = (xml) => [...String(xml || '').matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(m => { const x = m[1]; const get = (t) => clean(x.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${t}>`, 'i'))?.[1] || ''); return { title: get('title'), link: get('link'), description: get('description'), published: get('pubDate') || get('published'), source: get('source') }; }).filter(x => x.title && x.link);

async function fetchText(url, accept = 'text/html,*/*') {
  try { const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SocialIntelligence/1.0)', Accept: accept, 'Accept-Language': 'fa,en;q=0.8' }, signal: AbortSignal.timeout(7000) }); if (!r.ok) return ''; return await r.text(); } catch { return ''; }
}
const rss = async (url) => parseRSS(await fetchText(url, 'application/rss+xml,application/xml,text/xml,*/*'));
const googleNews = (q) => rss(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=fa&gl=IR&ceid=IR:fa`);
const bingNews = (q) => rss(`https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&setlang=fa-ir`);

function parseSearchHtml(html, fallbackPlatform) {
  const out = [];
  const seen = new Set();
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of String(html || '').matchAll(re)) {
    let href = decode(m[1]);
    const title = clean(m[2]);
    if (!href || !title || title.length < 3) continue;
    try {
      if (href.startsWith('/url?q=')) href = new URL(href, 'https://www.google.com').searchParams.get('q') || '';
      if (href.startsWith('/l/?')) href = new URL(href, 'https://www.bing.com').searchParams.get('u') || '';
      if (!/^https?:\/\//i.test(href)) continue;
      const d = domain(href);
      if (!d || /google\.|bing\.|microsoft\.com|facebook\.com\/sharer/i.test(href)) continue;
      const key = href.split('#')[0];
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ title, link: href, description: '', published: '', source: d, platform: platform(href) || fallbackPlatform });
    } catch {}
  }
  return out.slice(0, 50);
}

const googleWeb = async (q) => parseSearchHtml(await fetchText(`https://www.google.com/search?q=${encodeURIComponent(q)}&hl=fa`, 'text/html,*/*'), 'Web');
const bingWeb = async (q) => parseSearchHtml(await fetchText(`https://www.bing.com/search?q=${encodeURIComponent(q)}&setlang=fa`, 'text/html,*/*'), 'Web');

const positive = /عالی|موفق|رشد|برنده|مثبت|بهترین|جذاب|محبوب|پیشرفت|موفقیت|رضایت|رکورد/;
const negative = /بد|بحران|شکست|انتقاد|حاشیه|منفی|کاهش|مشکل|اعتراض|اتهام|جنجال|نارضایتی|رسوایی/;
const sentiment = (t) => { const s = norm(t), p = (s.match(new RegExp(positive.source, 'g')) || []).length, n = (s.match(new RegExp(negative.source, 'g')) || []).length; return p > n ? 'مثبت' : n > p ? 'منفی' : 'خنثی'; };
const topic = (t, q) => { const stop = new Set(['برای','درباره','این','آن','است','شد','شود','کرد','که','با','از','به','در','و','را','یک','های','خبر','گزارش','می','شده','کرده']); const ws = norm(t).replace(/[^\p{L}\p{N}]/gu, ' ').split(/\s+/).filter(x => x.length > 3 && !stop.has(x) && x !== norm(q)); return [...new Set(ws)].slice(0, 3).join(' ') || q; };

function score(item, entity) {
  const title = norm(item.title), text = norm(`${item.title} ${item.description}`), terms = entitySearchTerms(entity).map(norm).filter(Boolean);
  const titleHits = terms.filter(t => title.includes(t));
  const textHits = terms.filter(t => text.includes(t));
  const urlHit = terms.some(t => norm(item.link).includes(t.replace(/\s+/g, '_')));
  return { score: titleHits.length ? 100 : textHits.length || urlHit ? 75 : 0, hits: [...new Set([...titleHits, ...textHits])] };
}

async function discover(term) {
  const socialQueries = [
    { q: `site:instagram.com "${term}"`, platform: 'Instagram' },
    { q: `site:t.me "${term}"`, platform: 'Telegram' },
    { q: `site:youtube.com "${term}"`, platform: 'YouTube' },
    { q: `site:x.com "${term}" OR site:twitter.com "${term}"`, platform: 'X' }
  ];
  const general = [term, `"${term}"`];
  const [news, web, social] = await Promise.all([
    Promise.all([googleNews(term), bingNews(term)]).then(x => x.flat().map(r => ({ ...r, platform: 'News', searchTerm: term }))),
    Promise.all(general.map(q => Promise.all([googleWeb(q), bingWeb(q)]).then(x => x.flat()))).then(x => x.flat().map(r => ({ ...r, searchTerm: term }))),
    Promise.all(socialQueries.map(({ q, platform: p }) => Promise.all([googleWeb(q), bingWeb(q)]).then(x => x.flat().map(r => ({ ...r, platform: platform(r.link) === 'Web' ? p : platform(r.link), searchTerm: term }))))).then(x => x.flat())
  ]);
  return [...news, ...web, ...social];
}

export default async function handler(req, res) {
  const q = String(req.query?.q || '').trim();
  if (!q) return res.status(400).json({ ok: false, error: 'Missing q' });
  const started = Date.now();
  try {
    const entity = resolveEntity(q);
    const terms = entitySearchTerms(entity).filter(Boolean).slice(0, 6);
    const batches = await Promise.all(terms.map(discover));
    const raw = batches.flat();
    const map = new Map();
    for (const item of raw) { if (!item.link || !item.title) continue; const key = item.link.split('#')[0].replace(/\/$/, ''); if (!map.has(key)) map.set(key, item); }
    const scored = [...map.values()].map(item => { const s = score(item, entity); return { ...item, relevance: s.score, isRelevant: s.score >= 75, matchedEntities: s.hits, sentiment: sentiment(`${item.title} ${item.description}`), topic: topic(`${item.title} ${item.description}`, entity.name), usageType: item.platform === 'News' || item.platform === 'Web' ? 'News Coverage' : 'Social Mention' }; });
    const items = scored.filter(x => x.isRelevant).sort((a,b) => b.relevance - a.relevance).slice(0, 100);
    const platforms = { Instagram: 0, Telegram: 0, X: 0, Web: 0, YouTube: 0, News: 0 };
    items.forEach(x => platforms[x.platform] = (platforms[x.platform] || 0) + 1);
    return res.status(200).json({ ok: true, query: q, entity, searchTerms: terms, count: items.length, rawCount: raw.length, items, platforms, diagnostics: { elapsedMs: Date.now() - started, providers: terms.map((t, i) => ({ name: t, raw: batches[i].length, matched: batches[i].filter(x => score(x, entity).score >= 75).length })) } });
  } catch (e) {
    return res.status(200).json({ ok: false, query: q, count: 0, rawCount: 0, items: [], error: e?.message || 'Provider failure', diagnostics: { elapsedMs: Date.now() - started } });
  }
}
