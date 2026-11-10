export const journalProfile = {
  name: '财经理论与实践',
  nameEn: 'Finance and Economics: Theory and Practice',
  issn: '1003-7217',
  cn: 'CN 43-1057/F',
  founded: 1980,
  cycle: '双月刊（逢单月25日出版）',
  host: '中华人民共和国教育部',
  publisher: '湖南大学',
  editorInChief: '姚德权',
  location: '湖南省长沙市',
  levels: [
    'CSSCI来源期刊（南大核心）',
    '北大中文核心期刊',
    'AMI核心期刊',
    '中国科技核心期刊（统计源）',
    '全国百强社会科学学报',
    '湖南省十佳社科期刊',
  ],
  impactFactor: {
    composite: 5.123,
    comprehensive: 4.992,
    hIndex: 46,
    totalCitations: 15401,
    citationHalfLife: 4.65,
    selfCitationRate: 0.05,
    avgCitationRate: 12.52,
  },
  reviewProcess: {
    name: '三审三校 + 双向匿名外审',
    stages: [
      { name: '初筛', icon: 'search', time: '1–15天', desc: '编辑部评估选题方向、学术规范性、格式体例，不符合直接退稿' },
      { name: '外审', icon: 'users', time: '1–2个月', desc: '送交至少2位相关领域专家进行双向匿名评审，评估创新性、方法科学性、数据可靠性' },
      { name: '作者修改', icon: 'edit', time: '视情况', desc: '根据外审意见进行实质性修改，提交修改说明' },
      { name: '复审/终审', icon: 'gavel', time: '1–2个月', desc: '主编/编委会最终决定是否录用' },
      { name: '录用/退稿', icon: 'flag', time: '—', desc: '整体周期4–6个月，部分稿件因反复修改可能更长' },
    ],
    note: '投稿后若2个月内系统状态仍显示"新收稿"，则未达到送专家评审标准，作者可自行处理',
  },
  aiPolicy: {
    plagiarismRate: 10,
    aiRate: 10,
    localAiRate: 20,
    note: '查重率<10%，总体AI率≤10%，局部AI率≤20%，严禁AI辅助写作',
  },
};

export const columnTopics = [
  {
    id: 'theory',
    name: '理论探讨',
    prefLevel: 4,
    topics: ['经济学基础理论', '经济思想史', '经济体制比较', '政治经济学', '中国特色社会主义经济理论', '发展经济学'],
  },
  {
    id: 'finance',
    name: '金融与保险',
    prefLevel: 5,
    topics: ['货币政策与央行', '商业银行管理', '金融科技与数字金融', '保险市场', '风险管理', '金融工程', '普惠金融', '绿色金融'],
  },
  {
    id: 'securities',
    name: '证券与投资',
    prefLevel: 5,
    topics: ['资产定价', '投资组合理论', '资本市场运行', '公司金融', '行为金融', '资产证券化', '私募股权投资'],
  },
  {
    id: 'accounting',
    name: '财务与会计',
    prefLevel: 5,
    topics: ['财务会计准则', '管理会计', '审计学', '公司财务治理', '智能财务', '内部控制', '财务信息披露'],
  },
  {
    id: 'fiscal',
    name: '财政与税务',
    prefLevel: 5,
    topics: ['财政政策', '税收制度改革', '政府预算管理', '地方债务', '转移支付', '税收征管', '公共财政管理'],
  },
  {
    id: 'statistics',
    name: '统计与信息',
    prefLevel: 4,
    topics: ['经济统计方法', '计量经济学', '大数据技术经济应用', '机器学习与预测', '国民经济核算'],
  },
  {
    id: 'management',
    name: '经济管理',
    prefLevel: 4,
    topics: ['战略管理', '组织行为', '创新管理', '企业数字化转型', '供应链管理', '市场营销', '人力资源管理'],
  },
  {
    id: 'law',
    name: '经济法',
    prefLevel: 3,
    topics: ['公司法', '证券法', '金融法', '竞争法', '知识产权法', '税法', '破产法'],
  },
];

export const methodPreferences = [
  { name: '实证计量研究', level: 5, keywords: ['回归', '面板数据', 'DID', '双重差分', '工具变量', 'IV', 'RDD', '断点回归', 'PSM', '倾向得分匹配', '固定效应', '随机效应', 'GMM', '面板', '内生性处理', '稳健性检验', '机制检验'], desc: '该刊最主流的研究范式，使用面板数据回归、因果推断等方法进行量化分析' },
  { name: '案例研究', level: 4, keywords: ['案例研究', '案例分析', '典型案例', '多案例', '单案例', '扎根理论', '质性研究'], desc: '典型企业/政策案例的深度剖析，注重从案例到理论的抽象升华' },
  { name: '政策效应评估', level: 5, keywords: ['政策效应', '政策评估', '准自然实验', '自然实验', '事件研究', '事件研究法', '政策试点'], desc: '对财税、金融政策的效应进行评估的实证研究，高度重视' },
  { name: '理论建模', level: 3, keywords: ['模型构建', '数理模型', '博弈模型', '均衡分析', 'DSGE', '一般均衡'], desc: '数理经济模型和金融定价模型，需与实证结合更佳' },
  { name: '文献综述', level: 2, keywords: ['文献综述', '研究综述', '元分析', 'Meta', '系统综述'], desc: '需有理论创新或元分析，纯描述性综述不易录用' },
  { name: '定性规范分析', level: 2, keywords: ['规范分析', '理论推演', '定性研究', '比较分析'], desc: '纯定性分析需搭配实证或案例研究，单一范式不易录用' },
];

export const researchParadigms = {
  coreFeatures: [
    { title: '理论与实践结合', desc: '刊名即体现"理论+实践"双重取向，论文需兼顾理论深度与现实解释力' },
    { title: '学术创新性', desc: '要求论文在理论视角、研究方法或政策建议上有明确边际贡献，而非简单重复已有研究' },
    { title: '数据与方法科学', desc: '数据来源需权威（国家统计局、CNRDS、CSMAR等），方法需科学合理，强调内生性处理和稳健性检验' },
    { title: '聚焦中国问题', desc: '高度聚焦中国改革与发展中的热点难点问题，国际比较研究需有中国实践关照' },
    { title: '政策导向', desc: '注重研究的实践价值与政策启示，鼓励对现实问题的理论回应' },
  ],
  formatRequirements: {
    wordCount: '8000–10000字（含中英文摘要、关键词、参考文献）',
    titleLimit: '不超过20个汉字，需配英文翻译',
    abstract: '150–200字，第三人称写法，禁用"本文""作者"等主语，着重反映新内容和结论',
    keywords: '3–5组，需提供英文',
    references: 'GB/T 7714标准，按正文出现顺序标注',
    notes: '尾注形式（圆圈序码），禁止脚注或夹注',
    english: '题目、作者单位、摘要、关键词均需英文翻译',
    bio: '作者姓名、出生年、性别、民族、籍贯、职务、职称、研究方向、工作单位、地址、邮编、电话及电子信箱',
  },
  submissionTips: [
    { title: '选题紧扣热点', detail: '紧扣金融改革、财税政策、产业经济、企业治理等热点，结合国家政策导向' },
    { title: '方法首选实证', detail: '优先采用实证计量方法，数据来源需权威，内生性处理和稳健性检验不可或缺' },
    { title: '创新性要具体', detail: '在理论视角、研究方法或政策建议上需有明确边际贡献，不可泛泛而谈' },
    { title: '引用适配', detail: '适度引用该刊近2年论文（体现对期刊的关注），同时引用高被引经典文献' },
    { title: '基金支撑', detail: '挂靠国家级或省部级基金项目将显著提高录用概率' },
    { title: '避免AI写作', detail: 'AI检测总体AI率不超过10%，局部不超过20%，否则直接不予送审' },
  ],
};

export default journalProfile;
