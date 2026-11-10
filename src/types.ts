export interface DimensionScore {
  name: string;
  weight: string;
  score: number;
  detail: string;
}

export interface Verdict {
  code: 'accept' | 'minor' | 'major' | 'reject';
  label: string;
  class: string;
}

export interface PaperInfo {
  title: string;
  abstract: string;
  keywords: string[];
  totalChineseChars: number;
  sectionCount: number;
  refCount: number;
}

export interface TopicMatch {
  column: string;
  score: number;
  matchedTopics: string[];
  prefLevel: number;
}

export interface MethodFound {
  name: string;
  level: number;
  keywords: string[];
  desc: string;
  found: string[];
  confidence: number;
}

export interface LineSuggestion {
  location: string;
  original: string;
  suggestion: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RoadmapStep {
  priority: 'critical' | 'high' | 'medium' | 'done';
  phase: string;
  action: string;
  detail: string;
  done: boolean;
}

export interface SectionalComment {
  section: string;
  comment: string;
}

export interface ReviewReport {
  meta: {
    journalName: string;
    journalEn: string;
    reviewDate: string;
    reviewerType: string;
    fileName: string;
  };
  paperInfo: PaperInfo;
  verdict: Verdict;
  scores: {
    total: number;
    dimensions: DimensionScore[];
  };
  topicAnalysis: {
    matchResults: TopicMatch[];
    bestMatch: TopicMatch | null;
    isInScope: boolean;
  };
  methodAnalysis: {
    methodsFound: MethodFound[];
    hasEmpirical: boolean;
    hasCausalInference: boolean;
    hasEndogeneityAnalysis: boolean;
    hasMechanismAnalysis: boolean;
    recommendation: string;
  };
  abstractAnalysis: {
    score: number;
    issues: { severity: string; text: string }[];
    currentLength: number;
    requiredLength: string;
  };
  keywordsAnalysis: {
    score: number;
    issues: { severity: string; text: string }[];
    currentCount: number;
    requiredCount: string;
  };
  referencesAnalysis: {
    score: number;
    issues: { severity: string; text: string }[];
    currentCount: number;
    recentCount: number;
    requiredCount: string;
  };
  paperStructure: {
    sectionsFound: string[];
    expectedSections: string[];
    missingSections: string[];
  };
  sectionalComments: SectionalComment[];
  lineSuggestions: LineSuggestion[];
  improvementRoadmap: RoadmapStep[];
  summary: {
    strengths: string[];
    weaknesses: string[];
  };
}

export type TabId = 'profile' | 'preferences' | 'review';

export interface JournalProfileData {
  name: string;
  nameEn: string;
  issn: string;
  cn: string;
  founded: number;
  cycle: string;
  host: string;
  publisher: string;
  levels: string[];
  impactFactor: {
    composite: number;
    comprehensive: number;
    hIndex: number;
    totalCitations: number;
  };
  reviewProcess: {
    name: string;
    stages: { name: string; icon: string; time: string; desc: string }[];
  };
}

export interface ColumnTopic {
  name: string;
  prefLevel: number;
  topics: string[];
}
