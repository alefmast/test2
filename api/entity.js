const normalize=s=>String(s||'').toLocaleLowerCase('fa-IR').replace(/[\u200c\u200d]/g,' ').replace(/[إأآ]/g,'ا').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim();
const slug=s=>normalize(s).replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
const presets={
  'مبین خودرو':{aliases:['مبین خودرو','مبین‌خودرو','Mobin Khodro','MobinKhodro'],hashtags:['#مبین_خودرو','#مبینخودرو'],handles:[]},
  'نوبیتکس':{aliases:['نوبیتکس','Nobitex'],hashtags:['#نوبیتکس','#Nobitex'],handles:[]},
  'صحنه':{aliases:['صحنه','Scene'],hashtags:['#صحنه','#stage'],handles:[]}
};
export default async function handler(req,res){const name=String(req.query?.name||'').trim();if(!name)return res.status(400).json({error:'Missing entity name'});const key=Object.keys(presets).find(k=>normalize(k)===normalize(name));const base=key?presets[key]:{aliases:[name],hashtags:[`#${name.replace(/\s+/g,'_')}`],handles:[]};const aliases=[...new Set(base.aliases)];return res.status(200).json({id:slug(name),name,aliases,hashtags:base.hashtags,handles:base.handles,searchTerms:[...aliases,...base.hashtags,...base.handles]})}
