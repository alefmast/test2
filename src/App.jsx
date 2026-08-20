import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronDown,
  ExternalLink,
  Filter,
  Hash,
  LayoutDashboard,
  MessageCircle,
  Search,
  Settings,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

const demoMentions = [
  {
    id: 1,
    platform: "Web",
    author: "خبرگزاری هنر",
    text: "برنامه صحنه با حضور صد داور موسیقی به زودی منتشر می‌شود.",
    sentiment: "مثبت",
    topic: "صحنه",
    engagement: 842,
    time: "۱۰ دقیقه پیش",
    demo: true,
  },
  {
    id: 2,
    platform: "Instagram",
    author: "music_daily",
    text: "بالاخره جزئیات جدیدی از صحنه منتشر شد.",
    sentiment: "مثبت",
    topic: "اخبار برنامه",
    engagement: 1260,
    time: "۲۵ دقیقه پیش",
    demo: true,
  },
  {
    id: 3,
    platform: "Telegram",
    author: "Music News",
    text: "صد داور؛ ایده‌ای متفاوت برای یک برنامه موسیقی.",
    sentiment: "مثبت",
    topic: "صد داور",
    engagement: 510,
    time: "۴۲ دقیقه پیش",
    demo: true,
  },
  {
    id: 4,
    platform: "Web",
    author: "رسانه فرهنگی",
    text: "حضور فرزاد فرزین به عنوان مجری صحنه.",
    sentiment: "خنثی",
    topic: "فرزاد فرزین",
    engagement: 390,
    time: "۱ ساعت پیش",
    demo: true,
  },
  {
    id: 5,
    platform: "X",
    author: "@music_user",
    text: "همه درباره پشت صحنه صحنه صحبت می‌کنند.",
    sentiment: "منفی",
    topic: "پشت صحنه",
    engagement: 2180,
    time: "۲ ساعت پیش",
    demo: true,
  },
];

const topics = [
  { name: "صحنه", count: 1240, growth: 38 },
  { name: "صد داور", count: 870, growth: 27 },
  { name: "فرزاد فرزین", count: 610, growth: 19 },
  { name: "حامد جوادزاده", count: 480, growth: 14 },
  { name: "پشت صحنه", count: 350, growth: 9 },
];

const platforms = [
  { name: "Instagram", value: 42 },
  { name: "Web", value: 28 },
  { name: "Telegram", value: 18 },
  { name: "X", value: 12 },
];

function StatCard({ icon: Icon, label, value, change }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={19} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-change">
          <TrendingUp size={13} />
          {change}
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ value }) {
  return (
    <span className={`sentiment ${value === "مثبت" ? "positive" : value === "منفی" ? "negative" : "neutral"}`}>
      {value}
    </span>
  );
}

function App() {
  const [active, setActive] = useState("overview");
  const [keyword, setKeyword] = useState("صحنه");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [toast, setToast] = useState("");

  const filteredMentions = useMemo(() => {
    if (!search.trim()) return demoMentions;
    return demoMentions.filter(
      (item) =>
        item.text.includes(search) ||
        item.author.toLowerCase().includes(search.toLowerCase()) ||
        item.topic.includes(search)
    );
  }, [search]);

  const collectData = () => {
    setCollecting(true);
    setToast("");

    setTimeout(() => {
      setCollecting(false);
      setToast("داده جدیدی برای نمایش دریافت نشد؛ اتصال منبع واقعی هنوز فعال نیست.");
      setTimeout(() => setToast(""), 4500);
    }, 1300);
  };

  const navItems = [
    { id: "overview", label: "نمای کلی", icon: LayoutDashboard },
    { id: "feed", label: "فید زنده", icon: MessageCircle },
    { id: "topics", label: "موضوعات", icon: Hash },
    { id: "accounts", label: "اکانت‌ها", icon: Users },
    { id: "competitors", label: "رقبا", icon: BarChart3 },
    { id: "alerts", label: "هشدارها", icon: Bell },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">Social Listening</div>
            <div className="brand-sub">OS</div>
          </div>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${active === item.id ? "active" : ""}`}
                onClick={() => setActive(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={18} />
            <span>تنظیمات</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">SOCIAL LISTENING OS</div>
            <h1>{navItems.find((x) => x.id === active)?.label}</h1>
          </div>

          <div className="top-actions">
            <button className="keyword-button">
              <Hash size={16} />
              {keyword}
              <ChevronDown size={15} />
            </button>

            <button
              className="collect-button"
              onClick={collectData}
              disabled={collecting}
            >
              <Activity size={17} />
              {collecting ? "در حال جمع‌آوری..." : "جمع‌آوری داده واقعی"}
            </button>

            <button className="icon-button">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        {toast && <div className="toast">{toast}</div>}

        {active === "overview" && (
          <>
            <section className="stats-grid">
              <StatCard icon={MessageCircle} label="کل منشن‌ها" value="3,842" change="+28.4%" />
              <StatCard icon={Activity} label="Engagement" value="18.6K" change="+17.2%" />
              <StatCard icon={TrendingUp} label="مثبت" value="64.8%" change="+8.6%" />
              <StatCard icon={AlertTriangle} label="وایرال" value="47" change="+12.1%" />
            </section>

            <section className="dashboard-grid">
              <div className="panel trend-panel">
                <div className="panel-header">
                  <div>
                    <h2>روند گفتگو</h2>
                    <span>۷ روز اخیر</span>
                  </div>
                  <button className="small-select">
                    ۷ روز
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div className="chart">
                  <div className="chart-y">
                    <span>1200</span>
                    <span>900</span>
                    <span>600</span>
                    <span>300</span>
                    <span>0</span>
                  </div>
                  <div className="chart-area">
                    <div className="grid-line l1" />
                    <div className="grid-line l2" />
                    <div className="grid-line l3" />
                    <div className="grid-line l4" />
                    <svg viewBox="0 0 700 220" preserveAspectRatio="none">
                      <polyline
                        points="0,175 100,158 200,170 300,110 400,126 500,68 600,88 700,32"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                    </svg>
                    <div className="chart-x">
                      <span>شنبه</span>
                      <span>یکشنبه</span>
                      <span>دوشنبه</span>
                      <span>سه‌شنبه</span>
                      <span>چهارشنبه</span>
                      <span>پنجشنبه</span>
                      <span>جمعه</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel sentiment-panel">
                <div className="panel-header">
                  <div>
                    <h2>Sentiment</h2>
                    <span>تحلیل احساسات</span>
                  </div>
                </div>

                <div className="sentiment-circle">
                  <div className="circle-inner">
                    <strong>64.8%</strong>
                    <span>مثبت</span>
                  </div>
                </div>

                <div className="sentiment-legend">
                  <div><i className="dot positive-dot" /> مثبت <b>64.8%</b></div>
                  <div><i className="dot neutral-dot" /> خنثی <b>23.7%</b></div>
                  <div><i className="dot negative-dot" /> منفی <b>11.5%</b></div>
                </div>
              </div>
            </section>

            <section className="dashboard-grid lower">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h2>موضوعات داغ</h2>
                    <span>بر اساس حجم گفتگو</span>
                  </div>
                  <button className="text-button" onClick={() => setActive("topics")}>مشاهده همه</button>
                </div>

                <div className="topic-list">
                  {topics.map((topic, index) => (
                    <div className="topic-row" key={topic.name}>
                      <div className="topic-rank">{index + 1}</div>
                      <div className="topic-info">
                        <strong>{topic.name}</strong>
                        <div className="topic-bar">
                          <span style={{ width: `${Math.min(topic.count / 14, 100)}%` }} />
                        </div>
                      </div>
                      <div className="topic-count">{topic.count.toLocaleString("fa-IR")}</div>
                      <div className="growth">+{topic.growth}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h2>پلتفرم‌ها</h2>
                    <span>Share of Voice</span>
                  </div>
                </div>

                <div className="platform-list">
                  {platforms.map((platform) => (
                    <div className="platform-row" key={platform.name}>
                      <div className="platform-name">{platform.name}</div>
                      <div className="platform-bar">
                        <span style={{ width: `${platform.value}%` }} />
                      </div>
                      <strong>{platform.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {active === "feed" && (
          <section className="panel full-panel">
            <div className="panel-header feed-header">
              <div>
                <h2>فید زنده</h2>
                <span>آخرین گفتگوهای ثبت‌شده</span>
              </div>

              <div className="feed-tools">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="جستجو در منشن‌ها..."
                  />
                  {search && <X size={15} onClick={() => setSearch("")} />}
                </div>
                <button className="filter-button" onClick={() => setShowFilter(!showFilter)}>
                  <Filter size={16} />
                  فیلتر
                </button>
              </div>
            </div>

            {showFilter && (
              <div className="filter-box">
                <span>همه پلتفرم‌ها</span>
                <span>همه احساسات</span>
                <span>۷ روز اخیر</span>
              </div>
            )}

            <div className="mention-list">
              {filteredMentions.map((mention) => (
                <article className="mention" key={mention.id}>
                  <div className="mention-top">
                    <span className="platform-badge">{mention.platform}</span>
                    <span className="mention-time">{mention.time}</span>
                    {mention.demo && <span className="demo-badge">داده دمو</span>}
                  </div>

                  <div className="mention-author">{mention.author}</div>
                  <p>{mention.text}</p>

                  <div className="mention-bottom">
                    <SentimentBadge value={mention.sentiment} />
                    <span className="topic-tag">#{mention.topic}</span>
                    <span className="engagement">{mention.engagement.toLocaleString("fa-IR")} تعامل</span>
                    <button className="external">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {active === "topics" && (
          <section className="panel full-panel">
            <div className="panel-header">
              <div>
                <h2>موضوعات</h2>
                <span>موضوعات پرتکرار در گفتگوها</span>
              </div>
            </div>
            <div className="big-topic-grid">
              {topics.map((topic) => (
                <div className="big-topic" key={topic.name}>
                  <Hash size={18} />
                  <strong>{topic.name}</strong>
                  <span>{topic.count.toLocaleString("fa-IR")} منشن</span>
                  <b>+{topic.growth}%</b>
                </div>
              ))}
            </div>
          </section>
        )}

        {active === "accounts" && (
          <section className="panel full-panel">
            <div className="panel-header">
              <div>
                <h2>اکانت‌های تأثیرگذار</h2>
                <span>بر اساس تعامل و حجم گفتگو</span>
              </div>
            </div>
            <div className="account-list">
              {["music_daily", "Music News", "خبرگزاری هنر", "@music_user", "culture_media"].map((account, i) => (
                <div className="account-row" key={account}>
                  <div className="avatar">{account[0].toUpperCase()}</div>
                  <div className="account-name"><strong>{account}</strong><span>منبع مانیتورینگ</span></div>
                  <div><small>فالوئر</small><strong>{[128, 84, 62, 41, 35][i]}K</strong></div>
                  <div><small>تعامل</small><strong>{[12.4, 8.7, 6.1, 4.8, 3.2][i]}K</strong></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {active === "competitors" && (
          <section className="panel full-panel">
            <div className="panel-header">
              <div>
                <h2>رقبا</h2>
                <span>مقایسه سهم گفتگو</span>
              </div>
            </div>
            <div className="competitor-cards">
              {[
                ["صحنه", 46, "18.6K"],
                ["صداتو", 31, "12.2K"],
                ["کارناوال", 23, "9.1K"],
              ].map(([name, share, engagement]) => (
                <div className="competitor" key={name}>
                  <span>#{name}</span>
                  <strong>{share}%</strong>
                  <div className="competitor-bar"><i style={{ width: `${share}%` }} /></div>
                  <small>{engagement} تعامل</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {active === "alerts" && (
          <section className="panel full-panel">
            <div className="panel-header">
              <div>
                <h2>هشدارها</h2>
                <span>رویدادهای غیرعادی</span>
              </div>
            </div>
            <div className="alert-list">
              <div className="alert-item danger">
                <AlertTriangle size={19} />
                <div><strong>افزایش ناگهانی گفتگو</strong><span>منشن‌های «صحنه» در ۲ ساعت اخیر ۳۸٪ افزایش داشته.</span></div>
                <b>جدید</b>
              </div>
              <div className="alert-item warning">
                <TrendingUp size={19} />
                <div><strong>موضوع در حال رشد</strong><span>«صد داور» با رشد ۲۷٪ وارد ترند شده.</span></div>
                <b>۲ ساعت پیش</b>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
