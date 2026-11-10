/**
 * 财经理论与实践 — 模拟审稿引擎
 * 基于规则的智能分析，模拟双盲评审专家的评审逻辑
 */

import { columnTopics, methodPreferences } from './journal-profile.js';

// ── 论文结构解析 ──────────────────────────────────
function parsePaperStructure(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 识别标题
  const titleCandidates = lines.slice(0, 20).filter(l =>
    l.length >= 5 && l.length <= 50 && !l.startsWith('摘要') && !l.startsWith('关键词') && !l.startsWith('第') && !l.match(/^[0-9]/)
  );
  const title = titleCandidates[0] || '未识别到标题';

  // 识别摘要
  const abstractIdx = lines.findIndex(l => l.includes('摘要') && l.length < 30);
  const keywordsIdx = lines.findIndex(l => l.includes('关键词') && l.length < 80);
  let abstract = '';
  if (abstractIdx >= 0) {
    const end = keywordsIdx > abstractIdx ? keywordsIdx : Math.min(abstractIdx + 10, lines.length);
    abstract = lines.slice(abstractIdx + 1, end).join(' ').replace(/摘要[：:]/, '').trim();
  } else {
    abstract = lines.slice(0, 15).join(' ').substring(0, 400);
  }

  // 识别关键词
  let keywords = [];
  if (keywordsIdx >= 0) {
    const kwLine = lines[keywordsIdx].replace(/关键词[：:]\s*/, '');
    keywords = kwLine.split(/[;；,，\s]+/).filter(k => k.length > 1);
  }

  // 识别章节
  const sectionPatterns = [
    { name: '引言/绪论', patterns: ['引言', '绪论', '问题的提出', '研究背景'] },
    { name: '文献综述', patterns: ['文献综述', '文献回顾', '相关研究', '理论基础', '理论分析'] },
    { name: '理论框架/研究假设', patterns: ['理论框架', '理论分析', '研究假设', '假设提出', '概念模型', '理论模型'] },
    { name: '研究设计', patterns: ['研究设计', '样本选择', '数据来源', '变量定义', '变量选取', '模型设定', '计量模型', '研究方法'] },
    { name: '实证分析', patterns: ['实证分析', '实证结果', '回归结果', '结果分析', '描述性统计', '基准回归', '进一步分析'] },
    { name: '稳健性检验/内生性', patterns: ['稳健性', '内生性', '进一步检验', '异质性分析', '机制检验', '安慰剂'] },
    { name: '结论/政策建议', patterns: ['结论', '政策建议', '政策启示', '研究结论', '总结', '启示'] },
  ];

  const sections = [];
  let currentSection = { name: '正文开头', startLine: 0, content: '' };
  let mainTextStart = keywordsIdx >= 0 ? keywordsIdx + 1 : 0;

  for (let i = mainTextStart; i < lines.length; i++) {
    const line = lines[i];
    let matched = false;
    for (const sec of sectionPatterns) {
      for (const pat of sec.patterns) {
        if (line.includes(pat) && line.length <= 30 && !line.startsWith('表') && !line.startsWith('图')) {
          if (currentSection.content) {
            sections.push({ ...currentSection, content: currentSection.content.trim() });
          }
          currentSection = { name: sec.name, startLine: i, content: '' };
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    if (!matched) {
      currentSection.content += line + '\n';
    }
  }
  if (currentSection.content.trim()) {
    sections.push({ ...currentSection, content: currentSection.content.trim() });
  }

  // 识别参考文献
  const refIdx = lines.findIndex(l =>
    l === '参考文献' || l === '参考文献：' || l === '参考文献:' || l === 'References' || l === '【参考文献】'
  );
  let references = [];
  if (refIdx >= 0) {
    references = lines.slice(refIdx + 1).filter(l => l.length > 5);
  }

  return {
    title,
    abstract,
    keywords,
    sections,
    references,
    totalLength: text.length,
    totalChineseChars: (text.match(/[\u4e00-\u9fa5]/g) || []).length,
    lines,
  };
}

// ── 选题匹配度分析 ────────────────────────────────
function analyzeTopicMatch(title, abstract, keywords, fullText) {
  const combined = `${title} ${abstract} ${keywords.join(' ')} ${fullText.substring(0, 3000)}`;

  const matches = columnTopics.map(col => {
    let score = 0;
    const matchedTopics = [];
    for (const topic of col.topics) {
      if (combined.includes(topic)) {
        score += 20;
        matchedTopics.push(topic);
      }
      // 模糊匹配
      for (const char of topic.substring(0, 4)) {
        if (combined.includes(char)) score += 1;
      }
    }
    score = Math.min(100, score);
    return { column: col.name, score, matchedTopics, prefLevel: col.prefLevel };
  });

  matches.sort((a, b) => b.score - a.score);
  const best = matches[0];
  const isInJournalScope = best.score >= 15;

  return {
    matchResults: matches.filter(m => m.score > 0).sort((a, b) => b.score - a.score),
    bestMatch: best,
    isInScope: isInJournalScope,
    score: best.score,
  };
}

// ── 方法论识别与评价 ──────────────────────────────
function analyzeMethodology(fullText, sections) {
  const results = [];
  const allMethodsFound = [];

  for (const method of methodPreferences) {
    let found = [];
    for (const kw of method.keywords) {
      if (fullText.includes(kw)) {
        found.push(kw);
      }
    }
    if (found.length > 0) {
      results.push({ ...method, found, confidence: Math.min(100, found.length * 25) });
      allMethodsFound.push(...found);
    }
  }

  const hasEmpirical = results.some(r => r.level >= 4 && r.confidence >= 50);
  const hasCausalInference = allMethodsFound.some(k =>
    ['DID', '双重差分', '工具变量', 'IV', 'RDD', '断点回归', 'PSM', '倾向得分匹配', '准自然实验'].includes(k)
  );
  const hasEndogeneity = fullText.includes('内生性') || fullText.includes('稳健性检验') || fullText.includes('机制检验');
  const hasMechanism = fullText.includes('机制') && (fullText.includes('中介') || fullText.includes('调节') || fullText.includes('渠道'));

  let methodScore = 40;

  if (hasEmpirical) methodScore += 25;
  if (hasCausalInference) methodScore += 15;
  if (hasEndogeneity) methodScore += 10;
  if (hasMechanism) methodScore += 10;

  methodScore = Math.min(100, methodScore);

  return {
    methodsFound: results,
    hasEmpirical,
    hasCausalInference,
    hasEndogeneityAnalysis: hasEndogeneity,
    hasMechanismAnalysis: hasMechanism,
    score: methodScore,
    recommendation: !hasEmpirical
      ? '建议增加实证计量分析，该刊强烈偏好实证研究范式'
      : !hasCausalInference
        ? '建议引入因果推断方法（如DID、IV、RDD等），提升方法论的说服力'
        : !hasEndogeneity
          ? '建议补充内生性处理和稳健性检验，增强因果识别可信度'
          : '方法论较为完善，继续保持规范性',
  };
}

// ── 摘要质量评价 ──────────────────────────────────
function analyzeAbstract(abstract) {
  const issues = [];
  const len = abstract.length;
  const chineseChars = (abstract.match(/[\u4e00-\u9fa5]/g) || []).length;

  if (chineseChars < 150) issues.push({ severity: 'warning', text: `摘要字数偏少（当前约${chineseChars}字），期刊要求150-200字` });
  if (chineseChars > 250) issues.push({ severity: 'warning', text: `摘要字数偏多（当前约${chineseChars}字），期刊要求150-200字` });
  if (/本文/.test(abstract) || /作者/.test(abstract) || /笔者/.test(abstract)) {
    issues.push({ severity: 'error', text: '摘要应使用第三人称写法，禁用"本文""作者""笔者"等主语' });
  }
  if (!/研究.*发现|结果.*表明|实证.*表明|结论/.test(abstract)) {
    issues.push({ severity: 'warning', text: '摘要缺少研究发现和核心结论，应着重反映新内容和结论' });
  }
  if (/具有.*意义|具有.*价值|本研究.*创新/.test(abstract)) {
    issues.push({ severity: 'info', text: '摘要不宜包含自我评价性语言（如"具有重要意义""具有创新性"等）' });
  }

  let score = 70;
  if (chineseChars >= 150 && chineseChars <= 220) score += 10;
  if (!/本文|作者|笔者/.test(abstract)) score += 10;
  if (/研究.*发现|结果.*表明|实证.*表明/.test(abstract)) score += 10;
  if (!/具有.*意义|具有.*价值/.test(abstract)) score += 5;

  return { score: Math.min(100, score), issues, chineseChars };
}

// ── 关键词检查 ────────────────────────────────────
function analyzeKeywords(keywords) {
  const issues = [];
  if (keywords.length < 3) issues.push({ severity: 'error', text: `关键词数量不足（当前${keywords.length}个），期刊要求3-5组` });
  if (keywords.length > 5) issues.push({ severity: 'warning', text: `关键词偏多（当前${keywords.length}个），建议控制在3-5组` });

  let score = 70;
  if (keywords.length >= 3 && keywords.length <= 5) score += 30;
  else if (keywords.length >= 2) score += 10;

  return { score: Math.min(100, score), issues, count: keywords.length };
}

// ── 参考文献检查 ──────────────────────────────────
function analyzeReferences(references, fullText) {
  const issues = [];
  const count = references.length;

  if (count < 15) issues.push({ severity: 'warning', text: `参考文献偏少（当前${count}条），建议增加至25-40条` });
  if (count > 60) issues.push({ severity: 'info', text: `参考文献偏多（当前${count}条），建议精简代表性文献` });

  // 检查近年文献
  const recentYears = ['2024', '2025', '2026', '2023'];
  let recentCount = 0;
  for (const ref of references) {
    for (const y of recentYears) {
      if (ref.includes(y)) { recentCount++; break; }
    }
  }

  if (recentCount < 3 && count > 0) {
    issues.push({ severity: 'warning', text: '近期（2023-2026年）文献引用不足，建议增加近3年高水平期刊文献' });
  }

  let score = 60;
  if (count >= 25 && count <= 40) score += 25;
  else if (count >= 15) score += 15;
  if (recentCount >= 5) score += 15;
  else if (recentCount >= 3) score += 5;

  return { score: Math.min(100, score), issues, count, recentCount };
}

// ── 逐句分析 ──────────────────────────────────────
function generateLineByLineSuggestions(text, parsed) {
  const suggestions = [];
  const { lines, abstract, title, keywords } = parsed;

  // 标题检查
  if (title.length > 25) {
    suggestions.push({
      location: '标题',
      original: title,
      suggestion: '标题建议精简至20字以内',
      reason: '期刊要求标题不超过20个汉字，当前标题偏长',
      priority: 'high',
    });
  }
  if (!/[A-Za-z]/.test(title)) {
    // 检查是否有英文翻译
  }

  // 摘要逐句检查
  const abstractSentences = abstract.split(/[。！？；]/).filter(s => s.trim().length > 0);
  abstractSentences.forEach((sentence, i) => {
    const s = sentence.trim();
    if (!s) return;

    if (s.includes('本文') || s.includes('作者') || s.includes('笔者')) {
      suggestions.push({
        location: `摘要第${i + 1}句`,
        original: s,
        suggestion: s.replace(/本文/g, '该研究').replace(/作者/g, '').replace(/笔者/g, ''),
        reason: '摘要应使用第三人称，禁用"本文""作者""笔者"',
        priority: 'high',
      });
    }

    if (/^阐述了|^介绍了|^说明了/.test(s)) {
      suggestions.push({
        location: `摘要第${i + 1}句`,
        original: s,
        suggestion: '建议改为直接陈述研究内容和发现，避免用"阐述了""介绍了"等词汇开头',
        reason: '摘要应直接呈现研究内容和发现，而非描述论文做了什么',
        priority: 'medium',
      });
    }

    if (s.length > 80) {
      suggestions.push({
        location: `摘要第${i + 1}句`,
        original: s.substring(0, 60) + '...',
        suggestion: '建议拆分为2-3个短句，提升可读性',
        reason: '学术摘要句子不宜过长，单句以40-70字为宜',
        priority: 'low',
      });
    }
  });

  // 正文逐段检查
  let lineNum = 0;
  for (const line of lines) {
    lineNum++;
    const l = line.trim();
    if (l.length < 5) continue;

    // 过长句子
    if (l.length > 150 && !l.startsWith('表') && !l.startsWith('图')) {
      suggestions.push({
        location: `正文第${lineNum}行`,
        original: l.substring(0, 80) + '...',
        suggestion: '该句过长（超过150字符），建议拆分为多个短句',
        reason: '过长句子影响学术可读性，建议每句控制在50-100字',
        priority: 'low',
      });
    }

    // AI写作痕迹
    const aiPatterns = [
      { pattern: /首先.*其次.*最后/, msg: '三段式排比结构有AI写作痕迹，建议改为更自然的论述方式' },
      { pattern: /不仅.*而且.*更/, msg: '"不仅...而且...更..."句式有AI写作痕迹' },
      { pattern: /在.*的背景下.*随着.*的发展/, msg: '"在...背景下，随着...的发展"是典型的AI生成套话开头' },
      { pattern: /具有重要的理论意义和现实意义/, msg: '"具有重要的理论意义和现实意义"是AI常用句子，建议具体化' },
      { pattern: /为.*提供.*参考和借鉴/, msg: '"为...提供参考和借鉴"是AI弱结论句式，建议替换为具体政策建议' },
    ];

    for (const ap of aiPatterns) {
      if (ap.pattern.test(l)) {
        suggestions.push({
          location: `正文第${lineNum}行（AI痕迹检测）`,
          original: l.substring(0, 100),
          suggestion: ap.msg,
          reason: '该刊严禁AI辅助写作，AI率超过10%将不予送审，请注意修改',
          priority: 'high',
        });
        break;
      }
    }

    // 模糊归因
    if (/有学者认为|一些研究|许多研究|不少学者/.test(l)) {
      suggestions.push({
        location: `正文第${lineNum}行`,
        original: l.substring(0, 80),
        suggestion: '模糊归因不够学术规范，建议改为具体的作者引用（如"张三（2023）指出..."）',
        reason: '学术论文应有具体引用，避免"有学者认为""一些研究"等模糊表述',
        priority: 'medium',
      });
    }

    // "显著"一词滥用检查
    if ((l.match(/显著/g) || []).length >= 2) {
      suggestions.push({
        location: `正文第${lineNum}行`,
        original: l.substring(0, 80),
        suggestion: '"显著"一词在单句中出现2次以上，建议适当替换（如"明显""较大幅度""突出"等）',
        reason: '"显著"是学术论文中常见高频词，重复使用会降低表达质量',
        priority: 'low',
      });
    }

    // 宣传性语言
    const promoPatterns = [
      { pattern: /前所未有|史无前例/, msg: '夸张性词汇有宣传语言之嫌，学术论文应保持客观冷静' },
      { pattern: /完美|绝佳|极佳|最佳/, msg: '绝对化形容词不符合学术写作规范' },
    ];
    for (const pp of promoPatterns) {
      if (pp.pattern.test(l)) {
        suggestions.push({
          location: `正文第${lineNum}行`,
          original: l.substring(0, 80),
          suggestion: pp.msg,
          reason: '学术论文应避免宣传性和夸张性语言',
          priority: 'medium',
        });
        break;
      }
    }
  }

  // 限制建议数量，优先生成最重要的
  return suggestions.slice(0, 30);
}

// ── 主评审函数 ────────────────────────────────────
export function reviewPaper(text, fileName) {
  const parsed = parsePaperStructure(text);
  const { title, abstract, keywords, sections, references, totalChineseChars, lines } = parsed;

  // 1. 选题与创新性评分 (25%)
  const topicAnalysis = analyzeTopicMatch(title, abstract, keywords, text);
  const innovationIndicators = checkInnovation(text, parsed);
  const topicScore = Math.round(topicAnalysis.score * 0.6 + innovationIndicators.score * 0.4);

  // 2. 理论深度评分 (20%)
  const theoryScore = analyzeTheoryDepth(text, parsed);

  // 3. 研究方法评分 (20%)
  const methodAnalysis = analyzeMethodology(text, sections);
  const methodScore = methodAnalysis.score;

  // 4. 数据与实证评分 (15%)
  const dataScore = analyzeDataAndEmpirical(text, parsed);

  // 5. 写作规范评分 (10%)
  const abstractAnalysis = analyzeAbstract(abstract);
  const keywordsAnalysis = analyzeKeywords(keywords);
  const refAnalysis = analyzeReferences(references, text);
  const formatScore = analyzeWritingFormat(parsed);
  const writingScore = Math.round(
    (abstractAnalysis.score * 0.25 + keywordsAnalysis.score * 0.1 + refAnalysis.score * 0.15 + formatScore * 0.5)
  );

  // 6. 实践价值评分 (10%)
  const practiceScore = analyzePracticeValue(text, parsed);

  // 加权总分
  const totalScore = Math.round(
    topicScore * 0.25 +
    theoryScore * 0.20 +
    methodScore * 0.20 +
    dataScore * 0.15 +
    writingScore * 0.10 +
    practiceScore * 0.10
  );

  // 审稿结论
  let verdict, verdictLabel, verdictClass;
  if (totalScore >= 85) {
    verdict = 'accept'; verdictLabel = '建议录用'; verdictClass = 'verdict-accept';
  } else if (totalScore >= 70) {
    verdict = 'minor'; verdictLabel = '修改后重审（小修）'; verdictClass = 'verdict-minor';
  } else if (totalScore >= 55) {
    verdict = 'major'; verdictLabel = '修改后再投（大修）'; verdictClass = 'verdict-major';
  } else {
    verdict = 'reject'; verdictLabel = '退稿（建议修改后改投）'; verdictClass = 'verdict-reject';
  }

  // 逐句修改建议
  const lineSuggestions = generateLineByLineSuggestions(text, parsed);

  // 改进路线图
  const improvementRoadmap = generateRoadmap(totalScore, topicScore, theoryScore, methodScore, dataScore, writingScore, practiceScore);

  // 生成逐节评审意见
  const sectionalComments = generateSectionalComments(parsed, methodAnalysis);

  return {
    meta: {
      journalName: '《财经理论与实践》',
      journalEn: 'Finance and Economics: Theory and Practice',
      reviewDate: new Date().toISOString().split('T')[0],
      reviewerType: '双向匿名外审模拟评审',
      fileName,
    },
    paperInfo: {
      title,
      abstract: abstract.substring(0, 300),
      keywords,
      totalChineseChars,
      sectionCount: sections.length,
      refCount: references.length,
    },
    verdict: { code: verdict, label: verdictLabel, class: verdictClass },
    scores: {
      total: totalScore,
      dimensions: [
        { name: '选题与创新性', weight: '25%', score: topicScore, detail: `栏目匹配度: ${topicAnalysis.score}分` },
        { name: '理论深度', weight: '20%', score: theoryScore, detail: sections.length >= 4 ? '论文结构较为完整' : '论文结构有待完善' },
        { name: '研究方法', weight: '20%', score: methodScore, detail: methodAnalysis.recommendation },
        { name: '数据与实证', weight: '15%', score: dataScore, detail: dataScore >= 70 ? '实证分析较为规范' : '实证分析有待加强' },
        { name: '写作规范', weight: '10%', score: writingScore, detail: `摘要${abstractAnalysis.chineseChars}字 | 关键词${keywords.length}组 | 参考文献${references.length}条` },
        { name: '实践价值', weight: '10%', score: practiceScore, detail: practiceScore >= 70 ? '政策启示较为明确' : '实践价值有待凸显' },
      ],
    },
    topicAnalysis: {
      matchResults: topicAnalysis.matchResults,
      bestMatch: topicAnalysis.bestMatch,
      isInScope: topicAnalysis.isInScope,
    },
    methodAnalysis: {
      methodsFound: methodAnalysis.methodsFound,
      hasEmpirical: methodAnalysis.hasEmpirical,
      hasCausalInference: methodAnalysis.hasCausalInference,
      hasEndogeneityAnalysis: methodAnalysis.hasEndogeneityAnalysis,
      hasMechanismAnalysis: methodAnalysis.hasMechanismAnalysis,
      recommendation: methodAnalysis.recommendation,
    },
    abstractAnalysis: {
      score: abstractAnalysis.score,
      issues: abstractAnalysis.issues,
      currentLength: abstractAnalysis.chineseChars,
      requiredLength: '150-200字',
    },
    keywordsAnalysis: {
      score: keywordsAnalysis.score,
      issues: keywordsAnalysis.issues,
      currentCount: keywordsAnalysis.count,
      requiredCount: '3-5组',
    },
    referencesAnalysis: {
      score: refAnalysis.score,
      issues: refAnalysis.issues,
      currentCount: refAnalysis.count,
      recentCount: refAnalysis.recentCount,
      requiredCount: '建议25-40条',
    },
    paperStructure: {
      sectionsFound: parsed.sections.map(s => s.name),
      expectedSections: ['引言/绪论', '文献综述/理论分析', '研究设计', '实证分析', '结论/政策建议'],
      missingSections: checkMissingSections(parsed),
    },
    sectionalComments,
    lineSuggestions,
    improvementRoadmap,
    summary: generateSummary(totalScore, verdict, topicAnalysis, methodAnalysis),
  };
}

// ── 辅助函数 ──────────────────────────────────────

function checkInnovation(text, parsed) {
  let score = 40;
  const indicators = [];

  if (/首次|率先|开创性|本文的边际贡献/.test(text)) { score += 20; indicators.push('论文明确指出了边际贡献'); }
  if (/不同于|区别于|与以往研究不同/.test(text)) { score += 10; indicators.push('与现有研究进行了比较区分'); }
  if (/新的视角|新的数据|新的方法|新的机制/.test(text)) { score += 10; indicators.push('提出了新的研究视角/方法/机制'); }
  if (parsed.sections.some(s => s.name.includes('文献综') || s.name.includes('理论'))) { score += 10; indicators.push('包含文献综述章节'); }
  if (/假设[Hh]ypothesis/.test(text)) { score += 10; indicators.push('提出了明确的研究假设'); }

  return { score: Math.min(100, score), indicators };
}

function analyzeTheoryDepth(text, parsed) {
  let score = 45;

  const hasLitReview = parsed.sections.some(s => s.name.includes('文献综'));
  const hasTheoryFramework = parsed.sections.some(s => s.name.includes('理论框架') || s.name.includes('理论分析'));
  const hasHypothesis = parsed.sections.some(s => s.name.includes('假设'));
  const hasLiteratureWord = (text.match(/文献/g) || []).length >= 3;

  if (hasLitReview) score += 15;
  else if (hasLiteratureWord) score += 8;
  if (hasTheoryFramework) score += 20;
  if (hasHypothesis) score += 10;

  // 检查是否有理论推导逻辑
  if (/提出假设|假设1|假设2|H1|H2|据此|由此可见|因此.*假设/.test(text)) score += 10;

  return Math.min(100, score);
}

function analyzeDataAndEmpirical(text, parsed) {
  let score = 45;

  const hasDescriptive = /描述性统计|均值|标准差|最大值|最小值/.test(text);
  const hasCorrelation = /相关系数|相关性/.test(text);
  const hasRegression = /回归结果|回归系数|t值|p值|显著性/.test(text);
  const hasDataSource = /数据来源|样本期|样本期间|数据.*来源于|数据.*来自/.test(text);
  const hasRobustness = /稳健性|稳健性检验/.test(text);
  const hasEndogeneity = /内生性|工具变量|IV|DID|双重差分|PSM|Heckman/.test(text);
  const hasHeterogeneity = /异质性|分组回归|分样本/.test(text);
  const hasMechanism = /机制检验|中介效应|调节效应|渠道/.test(text);

  if (hasDataSource) score += 15;
  if (hasDescriptive) score += 8;
  if (hasCorrelation) score += 5;
  if (hasRegression) score += 12;
  if (hasRobustness) score += 8;
  if (hasEndogeneity) score += 10;
  if (hasHeterogeneity) score += 5;
  if (hasMechanism) score += 5;

  return Math.min(100, score);
}

function analyzeWritingFormat(parsed) {
  let score = 50;

  if (parsed.totalChineseChars >= 7000 && parsed.totalChineseChars <= 11000) score += 20;
  else if (parsed.totalChineseChars >= 5000) score += 10;

  if (parsed.keywords.length >= 3 && parsed.keywords.length <= 5) score += 10;
  if (parsed.sections.length >= 4) score += 10;
  if (parsed.references.length >= 15) score += 5;
  if (parsed.references.length >= 25) score += 5;

  return Math.min(100, score);
}

function analyzePracticeValue(text, parsed) {
  let score = 40;

  const hasPolicyImplication = /政策建议|政策启示|政策含义|政策含义|对策建议|管理启示/.test(text);
  const hasPractical = /实践|现实|应用|指导/.test(text);
  const hasChineseContext = /中国|我国|国内/.test(text);
  const hasConclusion = parsed.sections.some(s => s.name.includes('结论') || s.name.includes('政策'));

  if (hasPolicyImplication) score += 20;
  if (hasPractical) score += 15;
  if (hasChineseContext) score += 10;
  if (hasConclusion) score += 15;

  return Math.min(100, score);
}

function checkMissingSections(parsed) {
  const expected = ['引言/绪论', '文献综述/理论分析', '研究设计', '实证分析', '结论/政策建议'];
  const found = parsed.sections.map(s => s.name);
  return expected.filter(e => !found.some(f => {
    if (e === '文献综述/理论分析') return f.includes('文献综') || f.includes('理论分析') || f.includes('理论框架');
    if (e === '引言/绪论') return f.includes('引言') || f.includes('绪论');
    if (e === '研究设计') return f.includes('研究设计') || f.includes('样本') || f.includes('变量');
    if (e === '实证分析') return f.includes('实证') || f.includes('回归');
    if (e === '结论/政策建议') return f.includes('结论') || f.includes('政策');
    return false;
  }));
}

function generateRoadmap(totalScore, topic, theory, method, data, writing, practice) {
  const steps = [];

  if (totalScore >= 85) {
    steps.push({ priority: 'done', phase: '1', action: '论文质量较高', detail: '已达到该刊发表水准，建议关注最新研究动态做最后润色后投稿', done: true });
    return steps;
  }

  const dims = [
    { name: '选题与创新性', score: topic, action: '强化选题的学术创新贡献', detail: '补充明确的边际贡献说明，凝练研究问题的独特性，强化与现有文献的对话' },
    { name: '理论深度', score: theory, action: '深化理论分析与文献综述', detail: '完善文献综述章节，构建清晰的理论分析框架，从逻辑上推导研究假设' },
    { name: '研究方法', score: method, action: '提升研究方法的科学性', detail: '引入更严谨的因果推断方法（DID/IV/RDD），补充内生性处理和稳健性检验' },
    { name: '数据与实证', score: data, action: '加强实证分析的规范性', detail: '明确数据来源和样本选择依据，增加描述性统计、相关性分析和稳健性检验' },
    { name: '写作规范', score: writing, action: '规范学术写作格式', detail: '规范摘要写法（第三人称），控制关键词数量（3-5组），增加参考文献并确保格式规范' },
    { name: '实践价值', score: practice, action: '凸显研究的实践价值', detail: '丰富政策建议章节，强化研究结论对中国经济实践的指导意义' },
  ];

  const sorted = dims.sort((a, b) => a.score - b.score);
  const topIssues = sorted.filter(d => d.score < 70).slice(0, 4);

  topIssues.forEach((d, i) => {
    steps.push({
      priority: i === 0 ? 'critical' : i === 1 ? 'high' : 'medium',
      phase: `${i + 1}`,
      action: d.action,
      detail: d.detail,
      done: false,
    });
  });

  if (steps.length === 0) {
    steps.push({ priority: 'medium', phase: '1', action: '整体质量较好', detail: '建议精细打磨后投稿，可增加基金项目支撑以提高录用概率', done: false });
  }

  return steps;
}

function generateSectionalComments(parsed, methodAnalysis) {
  const comments = [];

  // 标题
  if (parsed.title.length > 25) {
    comments.push({ section: '标题', comment: `当前标题"${parsed.title.substring(0, 30)}..."较长（${parsed.title.length}字），建议精简至20字以内，并确保标题准确反映论文核心研究问题。` });
  } else {
    comments.push({ section: '标题', comment: '标题长度适中，建议检查是否准确概括了研究的核心变量和关系，确保标题具有学术吸引力。' });
  }

  // 摘要
  const absLen = (parsed.abstract.match(/[\u4e00-\u9fa5]/g) || []).length;
  if (absLen < 150) {
    comments.push({ section: '摘要', comment: `摘要字数偏少（约${absLen}字），需扩充至150-200字。建议补充：研究目标→研究方法→核心发现→政策含义。"背景"部分1-2句即可，重点突出"发现了什么"。` });
  } else if (absLen > 250) {
    comments.push({ section: '摘要', comment: `摘要字数偏多（约${absLen}字），需精简至200字以内。删除背景铺垫过多部分，聚焦核心研究内容和发现。` });
  } else {
    comments.push({ section: '摘要', comment: '摘要字数和结构基本符合要求，建议检查：（1）是否使用第三人称（2）是否包含核心发现和结论（3）是否避免了自我评价。' });
  }

  // 引言
  const hasIntro = parsed.sections.some(s => s.name.includes('引言') || s.name.includes('绪论'));
  if (!hasIntro) {
    comments.push({ section: '引言', comment: '缺少明确的引言部分。引言应按"研究背景→研究问题→文献缺口→本文贡献"的逻辑展开，建议用1-2段概括研究动机，用一段阐明边际贡献。' });
  }

  // 文献综述
  const hasLit = parsed.sections.some(s => s.name.includes('文献综'));
  if (!hasLit) {
    comments.push({ section: '文献综述/理论分析', comment: '缺少独立的文献综述或理论分析章节。该刊重视理论基础，建议增设文献综述，系统性梳理相关研究脉络，并明确本文在文献中的定位。' });
  }

  // 研究方法
  if (!methodAnalysis.hasEmpirical) {
    comments.push({ section: '研究方法', comment: '未检测到明确的实证研究方法。该刊高度偏好实证研究范式，强烈建议增加计量实证分析部分（如面板回归、DID、IV等），纯理论或纯定性文章录用难度极大。' });
  }

  // 结论
  const hasConclusion = parsed.sections.some(s => s.name.includes('结论') || s.name.includes('政策'));
  if (!hasConclusion) {
    comments.push({ section: '结论/政策建议', comment: '缺少独立的结论和政策建议章节。建议补充：（1）简明扼要总结研究发现（2）提出具体的政策启示或管理建议（3）指出研究局限和未来方向。' });
  }

  return comments;
}

function generateSummary(totalScore, verdict, topicAnalysis, methodAnalysis) {
  const strengths = [];
  const weaknesses = [];

  if (topicAnalysis.isInScope) strengths.push('选题方向与本刊栏目较为匹配');
  else weaknesses.push('选题方向与本刊主要栏目的匹配度有待提高');

  if (methodAnalysis.hasEmpirical) strengths.push('采用了实证研究方法，符合本刊方法偏好');
  if (methodAnalysis.hasCausalInference) strengths.push('使用了因果推断方法，方法论较为规范');
  if (!methodAnalysis.hasEmpirical) weaknesses.push('缺少实证计量分析，与本刊方法论偏好存在差距');
  if (!methodAnalysis.hasEndogeneityAnalysis) weaknesses.push('缺少内生性处理和稳健性检验');
  if (!methodAnalysis.hasMechanismAnalysis) weaknesses.push('缺少机制检验分析');

  strengths.push('进行了该领域的学术探索');

  return { strengths, weaknesses };
}
