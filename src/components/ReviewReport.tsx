import type { ReviewReport as ReviewReportType } from '../types';

interface Props {
  report: ReviewReportType;
  paperText: string;
  onReset: () => void;
}

function ScoreBar({ name, weight, score, detail }: { name: string; weight: string; score: number; detail: string }) {
  const colorClass = score >= 75 ? 'high' : score >= 55 ? 'medium' : 'low';
  return (
    <div className="score-bar">
      <div className="sb-header">
        <span className="sb-name">{name}（权重 {weight}）</span>
        <span className="sb-value">{score}分</span>
      </div>
      <div className="sb-track">
        <div className={`sb-fill ${colorClass}`} style={{ width: `${score}%` }} />
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{detail}</div>
    </div>
  );
}

function TotalScoreCircle({ score }: { score: number }) {
  const colorClass = score >= 85 ? 'high' : score >= 55 ? 'medium' : 'low';
  return (
    <div className={`total-score-circle ${colorClass}`}>
      <span className="ts-num">{score}</span>
      <span className="ts-label">总分/100</span>
    </div>
  );
}

export function ReviewReport({ report, onReset }: Props) {
  const { meta, paperInfo, verdict, scores, topicAnalysis, methodAnalysis,
    abstractAnalysis, keywordsAnalysis, referencesAnalysis, paperStructure,
    sectionalComments, lineSuggestions, improvementRoadmap, summary } = report;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="section-title" style={{ marginBottom: 8 }}>
            <span className="num">✓</span>模拟审稿报告
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {meta.journalName} · {meta.reviewerType} · {meta.reviewDate}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={handlePrint}>🖨️ 打印报告</button>
          <button className="btn btn-outline btn-sm" onClick={onReset}>🔄 重新评审</button>
        </div>
      </div>

      {/* Paper Info */}
      <div className="card">
        <h3>论文信息</h3>
        <div style={{ fontSize: '0.88rem' }}>
          <div style={{ marginBottom: 6 }}><strong>标题：</strong>{paperInfo.title}</div>
          <div style={{ marginBottom: 6 }}>
            <strong>关键词：</strong>
            {paperInfo.keywords.length > 0
              ? paperInfo.keywords.map((k, i) => <span key={i} className="tag tag-primary" style={{ margin: '2px 4px' }}>{k}</span>)
              : <span style={{ color: 'var(--text-muted)' }}>未识别到关键词</span>}
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>总字数：{paperInfo.totalChineseChars.toLocaleString()}字</span>
            <span>识别章节：{paperInfo.sectionCount}个</span>
            <span>参考文献：{paperInfo.refCount}条</span>
          </div>
        </div>
      </div>

      {/* Total Score & Verdict */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          <TotalScoreCircle score={scores.total} />
          <div>
            <div style={{ marginBottom: 8 }}>
              <span className={`verdict-badge ${verdict.class}`}>{verdict.label}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {verdict.code === 'accept' && '论文质量较高，已达到该刊发表水准'}
              {verdict.code === 'minor' && '论文整体质量较好，但存在若干可改进之处'}
              {verdict.code === 'major' && '论文有一定价值，但需要实质性修改后再审'}
              {verdict.code === 'reject' && '论文与期刊要求有较大差距，需全面修改'}
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="card">
        <h3>六维度评分详情</h3>
        {scores.dimensions.map((d, i) => (
          <ScoreBar key={i} name={d.name} weight={d.weight} score={d.score} detail={d.detail} />
        ))}
      </div>

      {/* Topic Match Analysis */}
      <div className="card">
        <h3>选题匹配度分析</h3>
        {topicAnalysis.bestMatch && (
          <div style={{ marginBottom: 12 }}>
            <strong>最佳匹配栏目：</strong>
            <span className="tag tag-primary" style={{ margin: '0 6px', fontSize: '0.9rem' }}>
              {topicAnalysis.bestMatch.column}
            </span>
            匹配度 {topicAnalysis.bestMatch.score}分
          </div>
        )}
        {topicAnalysis.matchResults.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>栏目</th>
                <th>匹配度</th>
                <th>匹配关键词</th>
              </tr>
            </thead>
            <tbody>
              {topicAnalysis.matchResults.map((m, i) => (
                <tr key={i}>
                  <td><strong>{m.column}</strong></td>
                  <td>
                    <div className="sb-track" style={{ width: 100, display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
                      <div className={`sb-fill ${m.score >= 60 ? 'high' : 'medium'}`} style={{ width: `${m.score}%` }} />
                    </div>
                    {m.score}分
                  </td>
                  <td>
                    {m.matchedTopics.map((t, j) => (
                      <span key={j} className="tag tag-accent" style={{ margin: '2px 4px 2px 0', fontSize: '0.72rem' }}>{t}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
            ⚠️ 未能明确识别到与期刊栏目的关键词匹配，建议在标题和摘要中明确研究领域关键词。
          </p>
        )}
      </div>

      {/* Methodology Analysis */}
      <div className="card">
        <h3>研究方法评价</h3>
        <div style={{ marginBottom: 12 }}>
          {methodAnalysis.hasEmpirical
            ? <span className="tag tag-success">✓ 包含实证分析</span>
            : <span className="tag tag-danger">✗ 未识别实证方法</span>}
          {methodAnalysis.hasCausalInference
            ? <span className="tag tag-success" style={{ marginLeft: 8 }}>✓ 因果推断方法</span>
            : <span className="tag tag-warning" style={{ marginLeft: 8 }}>△ 缺乏因果推断</span>}
          {methodAnalysis.hasEndogeneityAnalysis
            ? <span className="tag tag-success" style={{ marginLeft: 8 }}>✓ 内生性处理</span>
            : <span className="tag tag-warning" style={{ marginLeft: 8 }}>△ 缺少内生性处理</span>}
          {methodAnalysis.hasMechanismAnalysis
            ? <span className="tag tag-success" style={{ marginLeft: 8 }}>✓ 机制检验</span>
            : <span className="tag tag-warning" style={{ marginLeft: 8 }}>△ 缺少机制检验</span>}
        </div>

        {methodAnalysis.methodsFound.length > 0 && (
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>方法类型</th>
                <th>期刊偏好</th>
                <th>置信度</th>
                <th>识别到的关键词</th>
              </tr>
            </thead>
            <tbody>
              {methodAnalysis.methodsFound.map((m, i) => (
                <tr key={i}>
                  <td><strong>{m.name}</strong></td>
                  <td><span className="stars">{'★'.repeat(m.level)}{'☆'.repeat(5 - m.level)}</span></td>
                  <td>{m.confidence}%</td>
                  <td style={{ fontSize: '0.78rem' }}>
                    {m.found.map((f, j) => (
                      <span key={j} className="tag tag-info" style={{ margin: '2px 4px 2px 0' }}>{f}</span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="ai-policy-banner" style={{ marginTop: 12, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
          <span>💡</span>
          <div style={{ fontSize: '0.85rem' }}>{methodAnalysis.recommendation}</div>
        </div>
      </div>

      {/* Abstract & Keywords & Refs */}
      <div className="grid-2">
        <div className="card">
          <h3>摘要质量</h3>
          <div style={{ marginBottom: 8 }}>
            当前字数：<strong>{abstractAnalysis.currentLength}字</strong>
            <span style={{ marginLeft: 12, color: 'var(--text-muted)' }}>（要求{abstractAnalysis.requiredLength}）</span>
          </div>
          {abstractAnalysis.issues.length > 0 ? (
            abstractAnalysis.issues.map((issue, i) => (
              <div key={i} style={{
                padding: '6px 10px', marginBottom: 6, borderRadius: 4, fontSize: '0.82rem',
                background: issue.severity === 'error' ? '#fef2f2' : issue.severity === 'warning' ? '#fefce8' : '#f0f9ff',
                borderLeft: `3px solid ${issue.severity === 'error' ? 'var(--danger)' : issue.severity === 'warning' ? 'var(--warning)' : 'var(--info)'}`
              }}>
                {issue.severity === 'error' && '❌ '}
                {issue.severity === 'warning' && '⚠️ '}
                {issue.severity === 'info' && 'ℹ️ '}
                {issue.text}
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>✓ 摘要格式基本符合要求</p>
          )}
        </div>

        <div className="card">
          <h3>参考文献评价</h3>
          <div style={{ marginBottom: 8 }}>
            当前数量：<strong>{referencesAnalysis.currentCount}条</strong>
            <span style={{ marginLeft: 12, color: 'var(--text-muted)' }}>（{referencesAnalysis.requiredCount}）</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            近年文献（2023–2026）：<strong>{referencesAnalysis.recentCount}条</strong>
          </div>
          {referencesAnalysis.issues.length > 0 ? (
            referencesAnalysis.issues.map((issue, i) => (
              <div key={i} style={{
                padding: '6px 10px', marginBottom: 6, borderRadius: 4, fontSize: '0.82rem',
                background: issue.severity === 'error' ? '#fef2f2' : issue.severity === 'warning' ? '#fefce8' : '#f0f9ff',
                borderLeft: `3px solid ${issue.severity === 'error' ? 'var(--danger)' : issue.severity === 'warning' ? 'var(--warning)' : 'var(--info)'}`
              }}>
                {issue.text}
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>✓ 参考文献基本符合要求</p>
          )}
        </div>
      </div>

      {/* Paper Structure */}
      <div className="card">
        <h3>论文结构完整性</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {paperStructure.expectedSections.map((sec, i) => {
            const found = paperStructure.sectionsFound.some(f => {
              if (sec === '文献综述/理论分析') return f.includes('文献综') || f.includes('理论');
              if (sec === '引言/绪论') return f.includes('引言') || f.includes('绪论');
              if (sec === '研究设计') return f.includes('研究设计') || f.includes('样本') || f.includes('变量');
              if (sec === '实证分析') return f.includes('实证') || f.includes('回归');
              if (sec === '结论/政策建议') return f.includes('结论') || f.includes('政策');
              return false;
            });
            return (
              <span key={i} className={`tag ${found ? 'tag-success' : 'tag-danger'}`}>
                {found ? '✓ ' : '✗ '}{sec}
              </span>
            );
          })}
        </div>
        {paperStructure.sectionsFound.length > 0 && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            已识别章节：{paperStructure.sectionsFound.join(' → ')}
          </div>
        )}
        {paperStructure.missingSections.length > 0 && (
          <div className="ai-policy-banner" style={{ marginTop: 12 }}>
            <span>⚠️</span>
            <div style={{ fontSize: '0.85rem' }}>
              缺少章节：<strong>{paperStructure.missingSections.join('、')}</strong>，建议补充完整。
            </div>
          </div>
        )}
      </div>

      {/* Sectional Comments */}
      {sectionalComments.length > 0 && (
        <div className="card">
          <h3>逐节评审意见</h3>
          {sectionalComments.map((sc, i) => (
            <div key={i} style={{
              padding: '10px 14px', marginBottom: 8, borderRadius: 4,
              background: '#fafaf8', border: '1px solid var(--border)', fontSize: '0.85rem'
            }}>
              <strong style={{ color: 'var(--primary)' }}>{sc.section}：</strong>
              {sc.comment}
            </div>
          ))}
        </div>
      )}

      {/* Line-by-Line Suggestions */}
      {lineSuggestions.length > 0 && (
        <div className="card">
          <h3>逐字逐句修改建议</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            以下为审稿引擎对论文文本的逐句分析，按优先级排列。请逐条对照修改。
          </p>
          {lineSuggestions.map((sg, i) => (
            <div key={i} className={`suggestion-card priority-${sg.priority}`}>
              <div className="sg-location">
                📍 {sg.location}
                <span className={`tag tag-${sg.priority === 'high' ? 'danger' : sg.priority === 'medium' ? 'warning' : 'info'}`} style={{ marginLeft: 8 }}>
                  {sg.priority === 'high' ? '高优先级' : sg.priority === 'medium' ? '中优先级' : '低优先级'}
                </span>
              </div>
              <div className="sg-original">
                <strong>原文：</strong>{sg.original}
              </div>
              <div className="sg-suggestion">
                <strong>修改建议：</strong>{sg.suggestion}
              </div>
              <div className="sg-reason">
                <strong>理由：</strong>{sg.reason}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="card">
        <h3>综合评审总结</h3>
        <div className="grid-2">
          <div>
            <h4 style={{ color: 'var(--success)' }}>主要优势</h4>
            <ul style={{ fontSize: '0.85rem', paddingLeft: 20, lineHeight: 2 }}>
              {summary.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--danger)' }}>主要不足</h4>
            {summary.weaknesses.length > 0 ? (
              <ul style={{ fontSize: '0.85rem', paddingLeft: 20, lineHeight: 2 }}>
                {summary.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>✓ 未发现明显短板</p>
            )}
          </div>
        </div>
      </div>

      {/* Improvement Roadmap */}
      <div className="card">
        <h3>改进路线图：达到可发表标准</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          按照以下步骤逐项修改论文，完成后论文质量将显著提升，更有可能达到发表水平。
        </p>
        {improvementRoadmap.map((step, i) => (
          <div key={i} className="roadmap-step">
            <div className={`rs-marker ${step.priority}`}>
              {step.done ? '✓' : step.phase}
            </div>
            <div className="rs-content">
              <h4>{step.action}</h4>
              <p>{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={handlePrint}>🖨️ 打印完整评审报告</button>
        <button className="btn btn-outline" onClick={onReset}>🔄 评审另一篇论文</button>
      </div>
    </div>
  );
}
