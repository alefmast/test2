const clean = (s='') => String(s).replace(/\s+/g,' ').trim();
const host = (url='') => { try { return new URL(url).hostname.replace(/^www\./,'').toLowerCase(); } catch { return ''; } };

export const PLATFORMS = Object.freeze(['Instagram','Telegram','X','Web','YouTube','News']);

export function detectPlatform(url='') {
  const h=host(url);
  if (h.includes('instagram.com')) return 'Instagram';
  if (h==='t.me' || h.includes('telegram.me')) return 'Telegram';
  if (h==='x.com' || h.includes('twitter.com')) return 'X';
  if (h.includes('youtube.com') || h==='youtu.be') return 'YouTube';
  if (h.includes('news.google.com') || h.includes('bing.com/news')) return 'News';
  return 'Web';
}

export function normalizeResult(item={}, forcedPlatform) {
  const url=clean(item.url || item.link || '');
  const platform=forcedPlatform || item.platform || detectPlatform(url);
  return {
    id: item.id || `${platform}:${url || clean(item.title)}`,
    title: clean(item.title),
    url,
    platform,
    source: clean(item.source || item.author || host(url)),
    author: clean(item.author),
    publishedAt: item.publishedAt || item.published || null,
    text: clean(item.text || item.description),
    contentType: item.contentType || (platform==='YouTube'?'video':platform==='Web'||platform==='News'?'article':'post'),
    usageType: item.usageType || (platform==='News'?'News Coverage':platform==='Web'?'Web Mention':'Social Mention')
  };
}

export function dedupe(items=[]) {
  const seen=new Map();
  for (const item of items) {
    const n=normalizeResult(item);
    const key=n.url ? n.url.replace(/\/$/,'').toLowerCase() : `${n.platform}|${n.title.toLowerCase()}|${n.source.toLowerCase()}`;
    if (!seen.has(key)) seen.set(key,n);
  }
  return [...seen.values()];
}

export const connectors = {
  Web: { mode:'public-index', query:(q)=>q },
  News: { mode:'rss', query:(q)=>q },
  Instagram: { mode:'public-index', site:'instagram.com', query:(q)=>`site:instagram.com "${q}"` },
  Telegram: { mode:'public-index', site:'t.me', query:(q)=>`site:t.me "${q}"` },
  YouTube: { mode:'public-index', site:'youtube.com', query:(q)=>`site:youtube.com "${q}"` },
  X: { mode:'public-index', site:'x.com', query:(q)=>`site:x.com "${q}"` }
};

export function connectorStatus() {
  return Object.fromEntries(Object.entries(connectors).map(([platform,c])=>[platform,{platform,mode:c.mode,configured:true,coverage:c.mode==='rss'?'rss':'public-index'}]));
}
