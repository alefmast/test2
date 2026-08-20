const PROFILES = {
  'صحنه': {
    strong: ['صحنه فیلیمو','صحنه حامد جوادزاده','صحنه فرزاد فرزین','برنامه صحنه','صحنه صد داور'],
    weak: ['فیلیمو','حامد جوادزاده','فرزاد فرزین','صد داور','داوران','رئالیتی شو','شبکه نمایش خانگی'],
    exclude: ['تصادف','جرم','قتل','تئاتر','سینما','فیلم','هواشناسی','شهرستان صحنه','شهر صحنه','کرمانشاه','سحنه','sahneh']
  }
};
const clean=s=>(s||'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').replace(/<!\[CDATA\[|\]\]>/g,'').trim();
async function googleNews(query){
 const url=`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fa&gl=IR&ceid=IR:fa`;
 const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}); if(!r.ok)return[];
 const xml=await r.text();
 return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m=>{const x=m[1],get=t=>clean(x.match(new RegExp(`<${t}>([\\s\\S]*?)<\\/${t}>`))?.[1]||'');return{title:get('title'),link:get('link'),published:get('pubDate'),source:get('source'),platform:'Web / News'};});
}
async function googleWeb(query){
 const url=`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=fa&num=20`;
 const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept-Language':'fa-IR,fa;q=0.9'}}); if(!r.ok)return[];
 const html=await r.text(); const out=[];
 for(const m of html.matchAll(/<a href="(https?:\/\/[^\"]+)"[^>]*>([\s\S]*?)<\/a>/g)){
   const link=m[1],title=clean(m[2]);
   if(!title||link.includes('google.com/search')||link.includes('accounts.google'))continue;
   out.push({title,link,source:new URL(link).hostname,platform:/t\.me|telegram/i.test(link)?'Telegram':'Web'});
 }
 return out;
}
function classify(item,q,p){
 const text=`${item.title} ${item.source} ${item.link}`.toLowerCase();
 const strong=(p?.strong||[]).filter(t=>text.includes(t.toLowerCase()));
 const weak=(p?.weak||[]).filter(t=>text.includes(t.toLowerCase()));
 const excluded=(p?.exclude||[]).filter(t=>text.includes(t.toLowerCase()));
 let score=0;
 score+=strong.length*55;
 score+=weak.filter(x=>!strong.some(s=>s.includes(x))).length*18;
 if(text.includes(q.toLowerCase()))score+=8;
 if(item.platform==='Telegram')score+=8;
 score-=excluded.length*100;
 // One strong program phrase is enough. Otherwise require two independent weak signals.
 const isRelevant=excluded.length===0 && (strong.length>0 || weak.length>=2) && score>=45;
 return {relevance:Math.max(0,Math.min(100,score)),matchedEntities:[...strong,...weak],excludedTerms:excluded,isRelevant};
}
export default async function handler(req,res){
 const q=String(req.query?.q||'').trim(); if(!q)return res.status(400).json({error:'Missing q'});
 const p=PROFILES[q];
 const queries=p?[
  'صحنه فیلیمو','صحنه حامد جوادزاده','صحنه فرزاد فرزین','صحنه صد داور',
  'برنامه صحنه موسیقی','صحنه برنامه موسیقی','صحنه رئالیتی شو','صحنه شبکه نمایش خانگی',
  '#صحنه فیلیمو','#صحنه حامد جوادزاده','صحنه داوران موسیقی'
 ]:[q,`${q} خبر`,`${q} برنامه`];
 try{
  const [newsBatches,webBatches]=await Promise.all([Promise.all(queries.map(googleNews)),Promise.all(queries.map(googleWeb))]);
  const map=new Map();
  for(const item of [...newsBatches.flat(),...webBatches.flat()]){const key=item.link||`${item.title}|${item.source}`;if(item.title&&!map.has(key))map.set(key,item);}
  const classified=[...map.values()].map(item=>({...item,...classify(item,q,p),query:q}));
  const relevant=classified.filter(x=>x.isRelevant).sort((a,b)=>b.relevance-a.relevance).slice(0,50);
  return res.status(200).json({query:q,count:relevant.length,items:relevant,rawCount:classified.length,sources:{news:newsBatches.flat().length,web:webBatches.flat().length}});
 }catch(e){return res.status(502).json({error:e.message||'Search provider unavailable'});}
}
