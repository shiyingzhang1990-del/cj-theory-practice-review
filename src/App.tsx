import { useState } from 'react';
import { JournalProfile } from './components/JournalProfile';
import { ResearchPreferences } from './components/ResearchPreferences';
import { ReviewSystem } from './components/ReviewSystem';
import type { TabId } from './types';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'profile', label: '期刊画像', icon: '📋' },
  { id: 'preferences', label: '偏好研究', icon: '🎯' },
  { id: 'review', label: '模拟审稿', icon: '📝' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>《财经理论与实践》期刊模拟审稿系统</h1>
          <p className="subtitle">
            Finance and Economics: Theory and Practice — Journal Review Simulator
            <span style={{ marginLeft: 12, fontSize: '0.82rem', opacity: 0.7 }}>
              CSSCI • 北大核心 • AMI核心 • 双向匿名审稿
            </span>
          </p>
        </div>
      </header>

      <nav className="nav">
        <div className="container" style={{ display: 'flex' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="container">
        {activeTab === 'profile' && <JournalProfile />}
        {activeTab === 'preferences' && <ResearchPreferences />}
        {activeTab === 'review' && <ReviewSystem />}
      </main>

      <footer style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
        <p>《财经理论与实践》模拟审稿系统 — 仅供学术参考，审稿结果不代表期刊官方立场</p>
        <p style={{ marginTop: 4 }}>
          主管：中华人民共和国教育部 &nbsp;|&nbsp; 主办：湖南大学 &nbsp;|&nbsp; ISSN 1003-7217
        </p>
      </footer>
    </div>
  );
}
