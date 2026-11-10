import { journalProfile, reviewProcess } from '../../server/journal-profile';

export function JournalProfile() {
  const p = journalProfile;

  return (
    <div className="section">
      {/* Hero section */}
      <div className="profile-hero">
        <div className="card">
          <h3>期刊基本信息</h3>
          <table className="data-table">
            <tbody>
              <tr><td style={{ color: 'var(--text-muted)', width: '35%' }}>期刊名称</td><td><strong>{p.name}</strong>（{p.nameEn}）</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>国际刊号</td><td>ISSN {p.issn}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>国内刊号</td><td>{p.cn}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>创刊时间</td><td>{p.founded}年</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>出版周期</td><td>{p.cycle}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>主管单位</td><td>{p.host}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>主办单位</td><td>{p.publisher}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>主编</td><td>{p.editorInChief}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>出版地</td><td>{p.location}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>期刊级别与学术地位</h3>
          <div className="level-badges" style={{ marginBottom: 16 }}>
            {p.levels.map((l, i) => (
              <span key={i} className="level-badge">{l}</span>
            ))}
          </div>

          <h4 style={{ marginTop: 16 }}>学术影响力指标</h4>
          <div className="grid-4">
            <div className="profile-stat">
              <div className="stat-val">{p.impactFactor.composite}</div>
              <div className="stat-label">复合影响因子</div>
            </div>
            <div className="profile-stat">
              <div className="stat-val">{p.impactFactor.comprehensive}</div>
              <div className="stat-label">综合影响因子</div>
            </div>
            <div className="profile-stat">
              <div className="stat-val">{p.impactFactor.hIndex}</div>
              <div className="stat-label">H指数</div>
            </div>
            <div className="profile-stat">
              <div className="stat-val">{p.impactFactor.totalCitations.toLocaleString()}</div>
              <div className="stat-label">总被引量</div>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            引用半衰期: {p.impactFactor.citationHalfLife}年 &nbsp;|&nbsp;
            期刊他引率: {p.impactFactor.selfCitationRate} &nbsp;|&nbsp;
            平均引文率: {p.impactFactor.avgCitationRate}
          </div>
        </div>
      </div>

      {/* Review Process */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>审稿机制：{p.reviewProcess.name}</h3>
        <div className="workflow">
          {p.reviewProcess.stages.map((stage, i) => (
            <div key={i} className="workflow-step">
              <div className={`w-icon ${i === 0 ? 'active' : i < 4 ? 'waiting' : 'done'}`}>
                {stage.icon === 'search' && '🔍'}
                {stage.icon === 'users' && '👥'}
                {stage.icon === 'edit' && '✏️'}
                {stage.icon === 'gavel' && '⚖️'}
                {stage.icon === 'flag' && '🏁'}
              </div>
              <div className="w-label">{stage.name}</div>
              <div className="w-time">{stage.time}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{stage.desc}</div>
            </div>
          ))}
        </div>
        <div className="ai-policy-banner" style={{ marginTop: 12 }}>
          <span>⚠️</span>
          <div style={{ fontSize: '0.82rem' }}>
            <strong>重要提示：</strong>{p.reviewProcess.note}
          </div>
        </div>
      </div>

      {/* AI Policy */}
      <div className="card">
        <h3>学术规范与AI政策</h3>
        <div className="grid-3">
          {[
            { label: '文字复制比（查重率）', value: `< ${p.aiPolicy.plagiarismRate}%`, color: 'danger' },
            { label: '总体AI率上限', value: `≤ ${p.aiPolicy.aiRate}%`, color: 'danger' },
            { label: '局部AI率上限', value: `≤ ${p.aiPolicy.localAiRate}%`, color: 'warning' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>{item.label}</div>
              <div className={`tag tag-${item.color}`} style={{ fontSize: '1.1rem', padding: '8px 20px' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--danger)' }}>
          {p.aiPolicy.note}
        </p>
      </div>
    </div>
  );
}
