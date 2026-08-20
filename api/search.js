const PROFILES = {
  'صحنه': {
    include: ['فیلیمو','حامد جوادزاده','فرزاد فرزین','صد داور','داوران صحنه','برنامه صحنه','صحنه موسیقی','صحنه فیلیمو','صحنه - فیلیمو'],
    exclude: ['تصادف','جرم','قتل','تئاتر','سینما','فیلم','هواشناسی','شهرستان صحنه','شهر صحنه','کرمانشاه','سحنه','ساهنه','sahneh']
  }
};
const clean=s=>(s||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/<!\[CDATA\[|\]\]>/g,'').trim();
async function googleNews(query){
 const url=`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fa&gl=IR&ceid=IR:fa`;
 const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}); if(!r.ok) throw new Error(`Search provider returned ${r.status}`);
 const xml=await r.text(); return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m=>{const x=m[1],get=t=>clean(x.match(new RegExp(`<${t}>([\\s\\S]*?)<\\/${t}>`))?.[1]||'');return{title:get('title'),link:get('link'),published:get('pubDate'),source:get('source'),platform:'Web / News'};});
}
function classify(item,q,p){
 const text=`${item.title} ${item.source}`.toLowerCase();
 const matched=(p?.include||[]).filter(t=>text.includes(t.toLowerCase()));
 const excluded=(p?.exclude||[]).filter(t=>text.includes(t.toLowerCase()));
 const exact=text.includes(q.toLowerCase());
 let score=exact?20:0;
 score+=matched.reduce((n,t)=>n+(t.length>9?40:25),0);
 score-=excluded.length*100;
 // A bare occurrence of «صحنه» is not a mention of the TV show.
 const isRelevant=matched.length>0 && excluded.length===0 && score>=45;
 return {relevance:Math.max(0,Math.min(100,score)),matchedEntities:matched,excludedTerms:excluded,isRelevant};
}
export default async function handler(req,res){
 const q=String(req.query?.q||'').trim(); if(!q)return res.status(400).json({error:'Missing q'});
 const p=PROFILES[q];
 const queries=p?['"صحنه" فیلیمو','"صحنه" "حامد جوادزاده"','"صحنه" "فرزاد فرزین"','"صحنه" "صد داور"','"برنامه صحنه" موسیقی','"صحنه فیلیمو"','"حامد جوادزاده" "صحنه"','"فرزاد فرزین" "صحنه"']: [q,`${q} خبر`,`${q} برنامه`];
 try{
  const batches=await Promise.all(queries.map(googleNews)); const map=new Map();
  for(const item of batches.flat()){const key=item.link||`${item.title}|${item.source}`;if(item.title&&!map.has(key))map.set(key,item);}
  const classified=[...map.values()].map(item=>({...item,...classify(item,q,p),query:q}));
  const relevant=classified.filter(x=>x.isRelevant).sort((a,b)=>b.relevance-a.relevance).slice(0,50);
  return res.status(200).json({query:q,count:relevant.length,items:relevant,rawCount:classified.length});
 }catch(e){return res.status(502).json({error:e.message||'Search provider unavailable'});}
}
