const normalize=s=>String(s||'').toLocaleLowerCase('fa-IR').replace(/[\u200c\u200d]/g,' ').replace(/[إأآ]/g,'ا').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim();
export const entities={
  'مبین خودرو':{aliases:['مبین خودرو','مبین‌خودرو','Mobin Khodro','MobinKhodro'],hashtags:['#مبین_خودرو','#مبینخودرو'],handles:[]},
  'نوبیتکس':{aliases:['نوبیتکس','Nobitex'],hashtags:['#نوبیتکس','#Nobitex'],handles:[]},
  'صحنه':{aliases:['صحنه','Scene'],hashtags:['#صحنه','#stage'],handles:[]}
};
export function resolveEntity(name){const key=Object.keys(entities).find(k=>normalize(k)===normalize(name));const base=key?entities[key]:{aliases:[name],hashtags:[`#${name.replace(/\s+/g,'_')}`],handles:[]};return{name,key:key||null,aliases:[...new Set(base.aliases)],hashtags:[...new Set(base.hashtags)],handles:[...new Set(base.handles)]}}
export const entitySearchTerms=e=>[...new Set([...e.aliases,...e.hashtags,...e.handles])];
