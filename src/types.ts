export type AudienceMode = 'business' | 'engineer' | 'both';

export type ExperienceLevel = 'beginner' | 'experienced';

export type TabType = 'guide' | 'ai' | 'quiz' | 'gamification' | 'simulator';

export interface ChapterConcept {
  heading: string;
  detail: string;
  bulletPoints?: string[];
}

export interface BeginnerPrimer {
  whatIsIt: string; // มันคืออะไร อธิบายสำหรับคนไม่เคยทำงานสายนี้
  whyItMatters: string; // ทำไมถึงต้องมีสิ่งนี้ ถ้าไม่มีจะเกิดอะไรขึ้น
  realWorldScenario: string; // สถานการณ์เปรียบเทียบในชีวิตประจำวัน
}

export interface WorkplaceDialogue {
  context: string; // บริบทห้องประชุม
  wrongWay: { speaker: string; text: string; issue: string }; // คำพูดที่สร้างปัญหา
  rightWay: { speaker: string; text: string; benefit: string }; // คำพูดที่สร้างความร่วมมือ
}

export interface JargonTerm {
  term: string;
  formalDefinition: string;
  humanTranslation: string; // แปลภาษาคนแบบเห็นภาพ
  meetingExample?: string; // ตัวอย่างการใช้ในห้องประชุมจริง
}

export interface RealWorldExample {
  title: string;
  companyOrIndustry: string; // เช่น E-Commerce, Fintech, Ride-Hailing, Healthcare
  situation: string; // บริบทและโจทย์เริ่มต้น
  whatHappened: string; // สิ่งที่เกิดขึ้น หรือข้อผิดพลาดคอขาดบาดตาย
  resolution: string; // วิธีแก้ปัญหาและการประสานงานระหว่างสองโลก
  keyLesson: string; // บทเรียนสำคัญสำหรับมือใหม่
}

export interface ChapterPitfall {
  pitfall: string;
  symptom?: string; // อาการเตือนภัยที่เห็นในทีม
  solution: string; // ทางออกที่แก้ได้จริง
  preventionRule?: string; // กฎเหล็กป้องกันล่วงหน้า
}

export interface SvgVisualElement {
  label: string;
  role: string;
  color: string;
  detail: string;
}

export interface ChapterIllustration {
  id: string;
  title: string;
  subtitle: string;
  visualMetaphor: string; // อธิบายเปรียบเทียบภาพให้เข้าใจทันที
  svgType: 'pipeline' | 'matrix' | 'triangle' | 'kitchen-architecture' | 'dual-orbit' | 'iceberg' | 'pyramid' | 'c4' | 'protocol-comparison' | 'custom';
  svgDescription: string; // Structured description of visual scene
  elements: SvgVisualElement[];
  takeaway: string;
}

export interface NegotiationDilemmaOption {
  id: string;
  text: string;
  isOptimal: boolean;
  result: string;
  tip: string;
}

export interface NegotiationDilemma {
  scenario: string;
  counterpartQuote: string;
  options: NegotiationDilemmaOption[];
}

export interface FrictionTradeOff {
  ifYouNeed: string;
  youMustSacrifice: string;
  howToNegotiate: string;
}

export interface GoldenScript {
  situation: string;
  businessScript?: string;
  engineerScript?: string;
}

export interface FrictionPlaybook {
  chapterId: string;
  battlegroundTitle: string;
  businessFrustration: string;
  engineerFrustration: string;
  underlyingRootCause: string;
  tradeOffMatrix: FrictionTradeOff[];
  goldenScripts: GoldenScript[];
  dilemma?: NegotiationDilemma;
}

export interface RoleMindsetGuide {
  role: 'business' | 'engineer';
  title: string;
  whatTheyCareAboutMost: string[];
  whatKeepsThemUpAtNight: string[];
  howTheyMeasureSuccess: string;
  unspokenThoughts: string;
  bridgeAdvice: string;
}

export interface Chapter {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  roleTag: 'all' | 'pm' | 'ux' | 'ba' | 'sa' | 'eng' | 'qa' | 'devops' | 'support' | 'friction' | 'ai';
  businessNote: string;
  engineerNote: string;
  contentHtml?: string;
  keyTakeaway: string;
  plainAnalogy: string;
  readTime: string;
  diagramTitle?: string;
  diagramDescription?: string;
  beginnerPrimer?: BeginnerPrimer;
  jargonList?: JargonTerm[];
  realWorldExamples?: RealWorldExample[];
  dialogueExample?: WorkplaceDialogue;
  coreConcepts?: ChapterConcept[];
  realWorldWorkflow?: { step: string; role: string; description: string }[];
  checklist?: string[];
  commonPitfalls?: ChapterPitfall[];
  illustrations?: ChapterIllustration[];
  frictionPlaybook?: FrictionPlaybook;
}

export interface QuizQuestion {
  id: number;
  category: string;
  role: 'PM' | 'BA' | 'SA' | 'Dev' | 'QA' | 'DevOps' | 'Bridge';
  scenario: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  xp: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'reading' | 'quiz' | 'ai' | 'exploration';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  levelTitle: string;
  quizzesCompleted: number;
  correctAnswers: number;
  aiQuestionsAsked: number;
  readChapters: string[];
  bookmarks: string[];
  plainModeEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini' | 'fallback';
}
