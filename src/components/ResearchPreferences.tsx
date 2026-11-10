import { columnTopics, methodPreferences, researchParadigms } from '../../server/journal-profile';

function Stars({ level }: { level: number }) {
  return (
    <span className="stars">
      {'★'.repeat(level)}{'☆'.repeat(5 - level)}
    </span>
  );
}

export function ResearchPreferences() {
  return (
    <div className="section">
      {/* Column & Topics */}
      <div className="section-title">
        <span className="num">1</span>偏好主题与栏目设置
      </div>

      <div className="grid-2">
        {columnTopics.map(col => (
          <div key={col.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>{col.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>偏好度</span>
                <Stars level={col.prefLevel} />
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {col.topics.map((t, i) => (
                <span key={i} className="tag tag-accent">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Method Preferences */}
      <div className="section-title" style={{ marginTop: 30 }}>
        <span className="num">2</span>研究方法偏好
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>方法类型</th>
              <th style={{ width: '8%' }}>偏好度</th>
              <th style={{ width: '30%' }}>关键词/特征</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {methodPreferences.map((m, i) => (
              <tr key={i}>
                <td><strong>{m.name}</strong></td>
                <td><Stars level={m.level} /></td>
                <td style={{ fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {m.keywords.slice(0, 6).map((k, j) => (
                      <span key={j} className="tag tag-info" style={{ fontSize: '0.7rem' }}>{k}</span>
                    ))}
                    {m.keywords.length > 6 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{m.keywords.length - 6}项</span>
                    )}
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem' }}>{m.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Research Paradigms */}
      <div className="section-title" style={{ marginTop: 30 }}>
        <span className="num">3</span>研究范式与学术特征
      </div>

      <div className="grid-2">
        {researchParadigms.coreFeatures.map((f, i) => (
          <div key={i} className="card">
            <h4>{f.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Format Requirements */}
      <div className="section-title" style={{ marginTop: 30 }}>
        <span className="num">4</span>写作格式规范
      </div>

      <div className="card">
        <div className="grid-2">
          {(Object.entries(researchParadigms.formatRequirements) as [string, string][]).map(([key, val]) => (
            <div key={key} style={{ padding: '8px 0', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--primary)' }}>
                {key === 'wordCount' && '正文字数'}
                {key === 'titleLimit' && '标题'}
                {key === 'abstract' && '摘要'}
                {key === 'keywords' && '关键词'}
                {key === 'references' && '参考文献'}
                {key === 'notes' && '注释'}
                {key === 'english' && '英文'}
                {key === 'bio' && '作者简介'}
                {key === 'fund' && '基金项目'}
                ：
              </strong>
              <span style={{ color: 'var(--text-muted)' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Tips */}
      <div className="section-title" style={{ marginTop: 30 }}>
        <span className="num">5</span>投稿策略建议
      </div>

      <div className="grid-2">
        {researchParadigms.submissionTips.map((tip, i) => (
          <div key={i} className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
            <h4>{tip.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tip.detail}</p>
          </div>
        ))}
      </div>

      {/* Theme Distribution */}
      <div className="section-title" style={{ marginTop: 30 }}>
        <span className="num">6</span>发文领域分布（历史数据）
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>一级领域</th>
              <th>发文量</th>
              <th>占比</th>
              <th>二级领域（TOP5）</th>
            </tr>
          </thead>
          <tbody>
            {[
              { area: '经济管理', count: 6193, sub: ['国民经济 (1,664篇)', '金融学 (1,628篇)', '企业管理 (848篇)', '财政学 (562篇)', '产业经济 (536篇)'] },
              { area: '政治法律', count: 267, sub: ['经济法', '金融法', '商法'] },
              { area: '文化科学', count: 69, sub: ['经济教育', '信息传播'] },
              { area: '社会学', count: 61, sub: ['经济社会学', '人口经济学'] },
            ].map((row, i) => (
              <tr key={i}>
                <td><strong>{row.area}</strong></td>
                <td>{row.count.toLocaleString()}篇</td>
                <td>
                  <div className="sb-track" style={{ width: 120, display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
                    <div className="sb-fill high" style={{ width: `${(row.count / 6193) * 100}%` }} />
                  </div>
                  {((row.count / 6193) * 100).toFixed(1)}%
                </td>
                <td style={{ fontSize: '0.78rem' }}>
                  {row.sub.map((s, j) => (
                    <span key={j} className="tag tag-info" style={{ margin: '2px 4px 2px 0' }}>{s}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
