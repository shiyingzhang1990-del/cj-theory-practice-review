import { useState, useRef, useCallback } from 'react';
import { ReviewReport } from './ReviewReport';
import { uploadAndReview, reviewText } from '../utils/api';
import { getFileTypeLabel } from '../utils/fileParser';
import type { ReviewReport as ReviewReportType } from '../types';

type InputMode = 'upload' | 'paste';

const SAMPLE_PAPER = `数字金融对中小企业融资约束的影响研究

摘要：本文基于2011-2020年中国A股中小板上市公司数据，采用面板固定效应模型，实证检验了数字金融发展对中小企业融资约束的缓解效应及其作用机制。研究发现，数字金融发展显著缓解了中小企业的融资约束程度，这一结论在替换核心变量、改变样本区间以及使用工具变量法处理内生性后依然稳健。机制检验表明，数字金融主要通过降低信息不对称程度和优化信贷资源配置效率两条路径缓解中小企业融资约束。异质性分析显示，数字金融的融资约束缓解效应在民营企业、制造业企业以及金融发展水平较低地区的企业中更为显著。本文的研究为理解数字金融服务实体经济的微观机制提供了新的经验证据，对推进数字金融发展与缓解中小企业融资困境具有重要的政策启示。

关键词：数字金融；中小企业；融资约束；信息不对称；信贷资源配置

一、引言

中小企业在促进经济增长、推动技术创新和保障就业方面发挥着不可替代的重要作用。然而，融资难、融资贵问题长期困扰着中小企业的发展。世界银行调查数据显示，中国中小企业面临严重融资约束的比例高达41%，远高于发达国家的平均水平。传统金融体系由于信息不对称和交易成本过高等问题，难以有效满足中小企业的融资需求。

近年来，随着大数据、云计算、人工智能等信息技术与金融业的深度融合，数字金融作为一种新型金融业态蓬勃兴起。以移动支付、网络借贷、互联网银行为代表的数字金融模式，正在深刻改变传统金融的服务方式和运行逻辑。数字金融通过降低金融服务成本、拓展服务覆盖范围、提升风险管理能力，为破解中小企业融资困境提供了新的可能。

已有研究对数字金融的经济效应进行了较为丰富的探讨。在宏观层面，现有文献发现数字金融能够促进经济增长、缩小城乡收入差距、促进创新创业。在微观层面，部分研究开始关注数字金融对企业行为的影响，包括企业技术创新、全要素生产率等。然而，关于数字金融如何影响中小企业融资约束，现有研究仍存在以下不足：第一，对作用机制的探讨不够深入，多停留在相关性分析层面；第二，对异质性效应的分析不够充分；第三，对内生性问题的处理有待加强。

本文的边际贡献主要体现在以下三个方面：第一，构建了数字金融影响中小企业融资约束的理论分析框架，深入揭示了信息不对称缓解和信贷资源配置优化两条作用渠道；第二，采用多种因果识别策略处理内生性问题，包括工具变量法和替代变量法，增强了研究结论的可靠性；第三，从企业所有制、行业属性和地区金融发展水平三个维度进行了全面的异质性分析，为制定差异化的政策提供了依据。

二、理论分析与研究假设

（一）数字金融缓解中小企业融资约束的直接效应

信息不对称是导致中小企业融资约束的根本原因。中小企业的信息透明度较低，财务制度不够健全，传统金融机构难以准确评估其信用状况和还款能力。数字金融的发展为缓解信息不对称提供了新的技术手段。首先，大数据技术能够整合企业的交易流水、纳税记录、社保缴纳等多维数据，构建更加全面的企业信用画像，降低金融机构的信息搜寻成本。其次，区块链技术的应用能够确保交易数据的真实性和不可篡改性，增强银企之间的信任基础。再次，人工智能算法能够实现更加精准的风险定价和信贷决策，提高金融资源配置效率。

据此，本文提出研究假设H1：数字金融发展能够显著缓解中小企业的融资约束程度。

（二）数字金融缓解中小企业融资约束的间接机制

除直接效应外，数字金融还可能通过优化信贷资源配置效率间接缓解中小企业融资约束。传统金融体系存在明显的信贷歧视现象，大量信贷资源流向国有企业和大型企业，而中小企业获得的信贷支持严重不足。数字金融的市场化定价机制和竞争性服务模式有助于打破传统金融机构的垄断格局，引导信贷资源向更具发展潜力的中小企业流动。同时，数字金融平台通过对企业经营数据的实时监测和分析，能够动态评估和管控信贷风险，提高信贷决策的科学性和精准度。

据此，本文提出研究假设H2：数字金融通过降低信息不对称程度缓解中小企业融资约束。

据此，本文提出研究假设H3：数字金融通过优化信贷资源配置效率缓解中小企业融资约束。

三、研究设计

（一）样本选择与数据来源

本文选取2011-2020年中国A股中小板上市公司作为研究样本。在初始样本的基础上，本文按照以下标准进行筛选：（1）剔除金融类上市公司；（2）剔除ST和*ST公司；（3）剔除主要变量缺失的样本；（4）对所有连续变量在1%和99%分位上进行缩尾处理。最终获得包含896家企业的8,420个企业-年度观测值。

企业财务数据来源于CSMAR数据库和Wind数据库，数字金融发展数据采用北京大学数字金融研究中心编制的"中国数字普惠金融指数"，该指数从覆盖广度、使用深度和数字化程度三个维度刻画了中国各地区的数字金融发展水平。

（二）变量定义

1. 被解释变量：融资约束。本文采用SA指数作为融资约束的度量指标，该指数由企业规模和年龄两个外生性较强的变量构成，能够有效避免内生性问题。SA指数的绝对值越大，表示融资约束程度越高。同时，在稳健性检验中采用KZ指数作为替代指标。

2. 核心解释变量：数字金融发展水平。本文采用北京大学数字普惠金融指数的省级层面数据，并取自然对数处理。

3. 控制变量：参考已有文献，本文控制了以下变量：企业规模（Size）、资产负债率（Lev）、盈利能力（ROA）、成长能力（Growth）、企业年龄（Age）、固定资产比率（Tang）、现金流比率（CF）、股权集中度（Top1）、董事会规模（Board）、独立董事比例（Indep）、两职合一（Dual）。

（三）模型设定

为检验数字金融发展对中小企业融资约束的影响，本文构建如下基准回归模型：

SA_{it} = β0 + β1 * DF_{it} + γ * Controls_{it} + μ_i + λ_t + ε_{it}

其中，SA_{it}表示企业i在第t年的融资约束程度，DF_{it}表示企业所在省份的数字金融发展水平，Controls_{it}为控制变量向量，μ_i和λ_t分别表示个体固定效应和时间固定效应，ε_{it}为随机扰动项。

四、实证分析

（一）描述性统计

主要变量的描述性统计结果显示，SA指数的均值为-3.765，标准差为0.248，表明样本企业间的融资约束程度存在较大差异。数字金融指数的均值为5.312，标准差为0.432，反映了各地区数字金融发展水平的不均衡性。各控制变量的分布特征与已有研究基本一致，不存在异常值问题。

（二）基准回归结果

基准回归结果显示，数字金融发展水平（DF）的回归系数为-0.152，在1%的水平上显著，表明数字金融发展每提高1个百分点，中小企业的融资约束程度（SA指数）下降0.152个单位。这一结果在经济意义和统计意义上均具有显著性，支持了研究假设H1。控制变量的回归结果与已有研究基本一致，企业规模、盈利能力和成长能力与融资约束程度显著负相关，而资产负债率与融资约束程度显著正相关。

（三）内生性处理

基准回归可能存在内生性问题：一方面，数字金融发展水平与中小企业融资约束之间可能存在反向因果关系；另一方面，可能存在遗漏变量问题。本文采用工具变量法处理内生性：选取1984年各省份每万人固定电话数量作为数字金融发展水平的工具变量。这一工具变量的合理性在于：历史上的通信基础设施水平反映了该地区的信息化发展基础，与当前的数字金融发展水平高度相关；而历史上的电话普及率通过当前的信息化基础设施以外的渠道影响中小企业融资约束的可能性较小，满足排他性约束。

两阶段最小二乘法（2SLS）的回归结果显示，第一阶段F统计量为168.5，远大于10的经验临界值，排除了弱工具变量问题。第二阶段回归中，数字金融发展水平的系数仍然在1%的水平上显著为负，进一步支持了基准回归的结论。

（四）稳健性检验

本文进行了以下稳健性检验：（1）替换被解释变量：采用KZ指数替代SA指数作为融资约束的度量指标；（2）替换核心解释变量：采用数字金融覆盖广度、使用深度和数字化程度三个子指标分别进行回归；（3）改变样本区间：剔除2015年股灾期间的样本；（4）排除直辖市样本；（5）采用Tobit模型和系统GMM方法进行估计。上述稳健性检验的结果均与基准回归基本一致，证明了研究结论的可靠性。

（五）机制检验

本文采用中介效应模型检验数字金融缓解中小企业融资约束的作用机制。以信息不对称程度和信贷资源配置效率作为中介变量，检验结果表明，数字金融发展通过降低信息不对称程度和优化信贷资源配置效率两条渠道缓解中小企业融资约束，中介效应分别在5%和1%的水平上显著，验证了研究假设H2和H3。

（六）异质性分析

本文从企业所有制、行业属性和地区金融发展水平三个维度进行了异质性分析。分组回归结果表明：第一，数字金融对民营中小企业融资约束的缓解效应显著强于国有中小企业，这可能是因为民营企业的融资渠道相对有限，对数字金融的依赖程度更高。第二，数字金融对制造业中小企业融资约束的缓解效应更强，这与制造业企业的重资产特征和较大的资金需求密切相关。第三，在传统金融发展水平较低的地区，数字金融的融资约束缓解效应更为显著，说明数字金融具有明显的普惠特征。

五、结论与政策启示

本文基于2011-2020年中国A股中小板上市公司数据，实证检验了数字金融发展对中小企业融资约束的影响。研究发现：第一，数字金融发展显著缓解了中小企业的融资约束程度，这一结论在一系列稳健性检验和内生性处理后依然成立。第二，机制分析表明，数字金融主要通过降低信息不对称程度和优化信贷资源配置效率两条渠道缓解中小企业融资约束。第三，异质性分析显示，数字金融的融资约束缓解效应在民营企业、制造业企业以及传统金融发展水平较低地区的企业中更为显著。

基于上述研究结论，本文提出以下政策启示：第一，继续推进数字金融基础设施建设，完善数字金融服务体系，为中小企业提供更加便捷、低成本的金融服务。第二，加强中小企业数字化转型的支持力度，鼓励企业积极利用数字金融平台优化融资结构。第三，实施差异化的数字金融发展政策，重点支持传统金融发展水平较低地区的数字金融发展，充分发挥数字金融的普惠效应。第四，完善数字金融监管框架，防范数字金融发展中可能出现的系统性风险和数据安全风险。

参考文献

[1] 谢绚丽, 沈艳, 张皓星, 等. 数字金融能促进创业吗?——来自中国的证据[J]. 经济学(季刊), 2018, 17(4): 1557-1580.
[2] 张勋, 万广华, 张佳佳, 等. 数字经济、普惠金融与包容性增长[J]. 经济研究, 2019, 54(8): 71-86.
[3] 唐松, 伍旭川, 祝佳. 数字金融与企业技术创新——结构特征、机制识别与金融监管下的效应差异[J]. 管理世界, 2020, 36(5): 52-66.
[4] 黄益平, 黄卓. 中国的数字金融发展:现在与未来[J]. 经济学(季刊), 2018, 17(4): 1489-1502.
[5] 郭峰, 王靖一, 王芳, 等. 测度中国数字普惠金融发展:指数编制与空间特征[J]. 经济学(季刊), 2020, 19(4): 1401-1418.
[6] Hadlock C J, Pierce J R. New evidence on measuring financial constraints: Moving beyond the KZ index[J]. Review of Financial Studies, 2010, 23(5): 1909-1940.
[7] Kaplan S N, Zingales L. Do investment-cash flow sensitivities provide useful measures of financing constraints?[J]. Quarterly Journal of Economics, 1997, 112(1): 169-215.
[8] Beck T, Demirguc-Kunt A, Maksimovic V. Financing patterns around the world: Are small firms different?[J]. Journal of Financial Economics, 2008, 89(3): 467-487.`;

export function ReviewSystem() {
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pastText, setPastText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<ReviewReportType | null>(null);
  const [paperText, setPaperText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['txt', 'docx', 'doc'].includes(ext || '')) {
      setError('仅支持 .txt 和 .docx 格式的文件');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('文件大小不能超过50MB');
      return;
    }
    setError('');
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      let result;
      if (inputMode === 'upload' && file) {
        result = await uploadAndReview(file);
      } else if (inputMode === 'paste' && pastText.trim()) {
        result = await reviewText(pastText.trim());
      } else {
        setError('请先上传论文文件或粘贴论文内容');
        setLoading(false);
        return;
      }
      setReport(result.report);
      setPaperText(result.text);
    } catch (e: any) {
      setError(e.message || '评审过程出错，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setPastText(SAMPLE_PAPER);
    setInputMode('paste');
    setError('');
  };

  const handleReset = () => {
    setReport(null);
    setPaperText('');
    setFile(null);
    setPastText('');
    setError('');
  };

  return (
    <div className="section">
      {!report ? (
        <>
          <div className="section-title">
            <span className="num">1</span>论文上传与评审
          </div>

          {/* AI Policy Banner */}
          <div className="ai-policy-banner">
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div style={{ fontSize: '0.85rem' }}>
              <strong>学术规范提醒：</strong>《财经理论与实践》严格查重（文字复制比&lt;10%），AI检测总体AI率≤10%、局部AI率≤20%，严禁AI辅助写作。本系统仅模拟期刊评审流程，帮助提升论文质量。
            </div>
          </div>

          {/* Input Mode Selector */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              className={`btn ${inputMode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setInputMode('upload')}
            >
              📁 上传文件
            </button>
            <button
              className={`btn ${inputMode === 'paste' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setInputMode('paste')}
            >
              ✏️ 粘贴文本
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleLoadSample}>
              📄 加载示例论文
            </button>
          </div>

          {error && (
            <div className="ai-policy-banner" style={{ marginBottom: 16 }}>
              <span>❌</span>
              <div>{error}</div>
            </div>
          )}

          {/* Upload Zone */}
          {inputMode === 'upload' && (
            <div
              className={`upload-zone ${dragOver ? 'dragover' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,.doc"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              {file ? (
                <div>
                  <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>✅ 已选择文件</div>
                  <div style={{ fontWeight: 600 }}>{file.name}</div>
                  <div className="upload-hint">
                    {getFileTypeLabel(file)} · {(file.size / 1024).toFixed(1)} KB
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      重新选择
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="upload-icon">📁</div>
                  <div style={{ fontWeight: 600 }}>点击或拖拽论文文件到此处</div>
                  <div className="upload-hint">支持 .txt / .docx 格式，最大 50MB</div>
                </div>
              )}
            </div>
          )}

          {/* Paste Zone */}
          {inputMode === 'paste' && (
            <div>
              <textarea
                className="paper-input"
                placeholder="在此粘贴论文全文（包括标题、摘要、关键词、正文、参考文献）..."
                value={pastText}
                onChange={(e) => setPastText(e.target.value)}
              />
              <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                已输入约 {pastText.replace(/[\s\S]/g, (m) => /[\u4e00-\u9fa5]/.test(m) ? m : '').length} 个中文字符
                （期刊要求8000–10000字）
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button
              className="btn btn-accent"
              onClick={handleSubmit}
              disabled={loading || (inputMode === 'upload' && !file) || (inputMode === 'paste' && !pastText.trim())}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  正在评审中...
                </>
              ) : (
                '🔍 开始模拟评审'
              )}
            </button>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
              评审将评估6个维度：选题创新性、理论深度、研究方法、数据实证、写作规范、实践价值
            </div>
          </div>
        </>
      ) : (
        <ReviewReport report={report} paperText={paperText} onReset={handleReset} />
      )}
    </div>
  );
}
