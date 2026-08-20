import { useState } from 'react';
import { Search, Plus, Download, MessageCircle, Activity, Hash, Bell } from 'lucide-react';

const nav = [
  ['overview', 'نمای کلی'],
  ['feed', 'فید منشن‌ها'],
  ['topics', 'موضوعات'],
  ['accounts', 'منابع'],
  ['alerts', 'هشدارها'],
];

function Mentions({ items }) {
  if (!items.length) return <div className="empty">هنوز نتیجه‌ای وجود ندارد.</div>;
  return (
    <div className="mentions">
      {items.map((m, i) => (
        <article key={i}>
          <div className="mention-meta">
            <span>{m.platform || 'Web / News'}</span>
            <time>{m.published ? new Date(m.published).toLocaleDateString('fa-IR') : ''}</time>
          </div>
          <strong>{m.source || 'منبع وب'}</strong>
          <p>{m.title || m.text || 'بدون عنوان'}</p>
          <footer>
            <b>#{m.query || 'search'}</b>
            {m.link && <a href={m.link} target="_blank" rel="noreferrer">مشاهده منبع</a>}
          </footer>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('overview');
  const [query, setQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search(term = query) {
    const q = term.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search failed');
      setItems(data.items || []);
      setKeyword(q);
      setPage('feed');
    } catch (e) {
      setItems([]);
      setError(`جستجو انجام نشد: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const rows = [
      ['Platform', 'Source', 'Title', 'Published', 'Link'],
      ...items.map(x => [x.platform, x.source, x.title, x.published, x.link]),
    ];
    const csv = rows.map(row => row.map(v => `"${String(v || '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
    a.download = `social-listening-${keyword || 'search'}.csv`;
    a.click();
  }

  const title = nav.find(x => x[0] === page)?.[1] || 'نمای کلی';

  return (
    <div className="app" dir="rtl">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">S</div><div><b>Social Listening</b><small>OS / MVP</small></div></div>
        <button className="new-monitor" onClick={() => setPage('overview')}><Plus size={17} /> مانیتور جدید</button>
        <nav>{nav.map(([id, label]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}>{label}</button>)}</nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><small>SOCIAL LISTENING OS</small><h1>{title}</h1></div>
          <div className="monitor-pill">{keyword || 'بدون مانیتور'}</div>
        </header>

        <section className="hero">
          <div><span className="live"><i /> LIVE WEB SEARCH</span><h2>نبض گفتگو درباره «{keyword || 'کلیدواژه خودت'}»</h2><p>یک کلیدواژه وارد کن تا نتایج واقعی وب و News جمع‌آوری شود.</p></div>
        </section>

        <section className="search-box">
          <Search size={19} />
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="مثلاً صحنه، حامد جوادزاده، صداتو..." />
          <button onClick={() => search()} disabled={loading}>{loading ? 'در حال جستجو...' : 'جستجوی واقعی'}</button>
        </section>

        {error && <div className="error">{error}</div>}

        <section className="stats">
          <div className="stat"><MessageCircle size={18} /><small>نتایج</small><strong>{items.length}</strong></div>
          <div className="stat"><Activity size={18} /><small>منبع وب</small><strong>{items.length}</strong></div>
          <div className="stat"><Hash size={18} /><small>کلیدواژه</small><strong>{keyword ? 1 : 0}</strong></div>
          <div className="stat"><Bell size={18} /><small>هشدار</small><strong>0</strong></div>
        </section>

        {page === 'feed' && <section className="panel"><div className="head"><div><h3>فید نتایج</h3><small>{items.length} نتیجه برای «{keyword}»</small></div><button onClick={exportCsv}><Download size={15} /> CSV</button></div><Mentions items={items} /></section>}
        {page !== 'feed' && <section className="panel"><div className="head"><div><h3>آخرین نتایج</h3><small>{keyword ? `نتایج جستجوی «${keyword}»` : 'هنوز جستجویی انجام نشده'}</small></div></div><Mentions items={items.slice(0, 10)} /></section>}
      </main>
    </div>
  );
}
