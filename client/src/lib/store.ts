// Marketing Content OS — Data Store
// Tier 1: localStorage-backed store. Swap for PocketBase in Tier 2.
// PocketBase URL: https://mjwdesign-core.pockethost.io

import { nanoid } from 'nanoid';

export type ContentStatus = 'Backlog' | 'Briefing' | 'Drafting' | 'Editing' | 'Approved' | 'Scheduled' | 'Published';
export type ContentType = 'Blog Post' | 'GBP Post' | 'Social Post' | 'YouTube' | 'Email' | 'Lead Magnet' | 'Video';
export type Priority = 'High' | 'Medium' | 'Low';
export type Platform = 'Google Business Profile' | 'Blog' | 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'Email';
export type ApprovalStatus = 'Pending' | 'Reviewed' | 'Approved' | 'Rejected';
export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface Brand {
  id: string;
  name: string;
  url: string;
  toneOfVoice: string;
  targetAudience: string;
  defaultCta: string;
  locationKeyword: string;
  color: string;
}

export interface ContentItem {
  id: string;
  title: string;
  brandId: string;
  type: ContentType;
  status: ContentStatus;
  priority: Priority;
  dueDate: string;
  assigneeId: string;
  targetKeyword: string;
  searchIntent: 'Informational' | 'Navigational' | 'Transactional' | 'Commercial' | '';
  briefText: string;
  angle: string;
  cta: string;
  draftText: string;
  assetUrl: string;
  assetName: string;
  approvalStatus: ApprovalStatus;
  approvedBy: string;
  publishedUrl: string;
  trafficMonthly: number;
  conversions: number;
  repurposedTo: string[];
  internalLinks: string[];
  notes: string;
  // Content Brief Builder fields
  briefAudience: string;
  briefGoal: string;
  briefTone: string;
  briefWordCount: string;
  briefHeadings: string;
  briefKeyPoints: string;
  briefDifferentiators: string;
  briefCompetitorUrls: string;
  briefStatus: 'empty' | 'draft' | 'complete';
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  contentId: string;
  platform: Platform;
  publishDate: string;
  approvalStatus: ApprovalStatus;
  generatedCopy: string;
  publishedUrl: string;
  autoPublish: boolean;
}

export interface Prompt {
  id: string;
  name: string;
  category: string;
  systemPrompt: string;
  userTemplate: string;
  variables: string[];
}

export interface CompetitorGap {
  id: string;
  competitorUrl: string;
  topic: string;
  priority: Priority;
  status: 'Open' | 'In Progress' | 'Covered';
  notes: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  brandIds: string[];
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_BRANDS: Brand[] = [
  {
    id: 'brand-escape-maze',
    name: 'Escape Maze',
    url: 'https://escapemaze.ca',
    toneOfVoice: 'Adventurous, fun, inviting. Speak to families and corporate groups. Highlight the experience and the destination.',
    targetAudience: 'Families, corporate groups, date-night couples in Peterborough/Kawarthas region',
    defaultCta: 'Book Your Adventure',
    locationKeyword: 'Peterborough Kawarthas',
    color: '#6ee7f7',
  },
  {
    id: 'brand-mjw-design',
    name: 'MJW Design',
    url: 'https://mjwdesign.ca',
    toneOfVoice: 'Expert, direct, results-focused. Speak to home service contractors who are skeptical of marketing.',
    targetAudience: 'Home service contractors (plumbers, HVAC, electricians) in the Kawartha region',
    defaultCta: 'Get More Leads',
    locationKeyword: 'Kawartha Lakes Ontario',
    color: '#a78bfa',
  },
];

const SEED_USERS: User[] = [
  { id: 'user-mike', name: 'Mike Walling', email: 'mike@mjwdesign.ca', role: 'Admin', avatar: 'MW', brandIds: ['brand-escape-maze', 'brand-mjw-design'] },
  { id: 'user-jake', name: 'Jake Walling', email: 'jake@escapemaze.ca', role: 'Editor', avatar: 'JW', brandIds: ['brand-escape-maze'] },
];

const EMPTY_BRIEF = {
  briefAudience: '', briefGoal: '', briefTone: '', briefWordCount: '',
  briefHeadings: '', briefKeyPoints: '', briefDifferentiators: '',
  briefCompetitorUrls: '', briefStatus: 'empty' as const,
};

const SEED_CONTENT: ContentItem[] = [
  {
    id: nanoid(), title: 'Top 10 Team Building Activities Near Peterborough', brandId: 'brand-escape-maze',
    type: 'Blog Post', status: 'Published', priority: 'High', dueDate: '2026-03-01',
    assigneeId: 'user-mike', targetKeyword: 'team building Peterborough', searchIntent: 'Informational',
    briefText: 'Target corporate event planners. Cover outdoor and indoor options. Position Escape Maze as the top pick.',
    angle: 'Local expert guide', cta: 'Book a Corporate Group Experience',
    draftText: '', assetUrl: '', assetName: '', approvalStatus: 'Approved', approvedBy: 'user-mike',
    publishedUrl: 'https://escapemaze.ca/blog/team-building-peterborough',
    trafficMonthly: 420, conversions: 8, repurposedTo: ['Instagram', 'Facebook'], internalLinks: [], notes: '',
    ...EMPTY_BRIEF, briefAudience: 'Corporate event planners, HR managers', briefGoal: 'Rank for team building keyword and drive group bookings', briefTone: 'Adventurous, authoritative, local expert', briefWordCount: '1200', briefHeadings: 'Why Team Building Matters|Indoor Options Near Peterborough|Outdoor Adventures|Why Escape Maze Tops the List|How to Book', briefKeyPoints: 'Variety of options, Escape Maze unique selling points, local focus, corporate packages', briefStatus: 'complete' as const,
    createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: nanoid(), title: 'Escape Room Date Night Ideas Kawarthas', brandId: 'brand-escape-maze',
    type: 'Blog Post', status: 'Drafting', priority: 'High', dueDate: '2026-04-05',
    assigneeId: 'user-jake', targetKeyword: 'escape room date night Kawarthas', searchIntent: 'Commercial',
    briefText: 'Target couples planning a date night. Emphasize the fun, challenge, and uniqueness of escape rooms vs dinner/movie.',
    angle: 'Romantic adventure angle', cta: 'Book Date Night',
    draftText: '', assetUrl: '', assetName: '', approvalStatus: 'Pending', approvedBy: '',
    publishedUrl: '', trafficMonthly: 0, conversions: 0, repurposedTo: [], internalLinks: [], notes: 'Draft in progress',
    ...EMPTY_BRIEF, briefAudience: 'Couples aged 25-45 looking for unique date ideas', briefGoal: 'Capture commercial intent searches, drive bookings', briefTone: 'Fun, romantic, adventurous', briefWordCount: '1000', briefStatus: 'draft' as const,
    createdAt: '2026-03-10T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z',
  },
  {
    id: nanoid(), title: 'Spring Corporate Events at Escape Maze', brandId: 'brand-escape-maze',
    type: 'GBP Post', status: 'Approved', priority: 'High', dueDate: '2026-04-01',
    assigneeId: 'user-mike', targetKeyword: 'corporate events Peterborough', searchIntent: 'Commercial',
    briefText: 'Promote spring corporate event packages. Highlight the 129-acre venue, catering options, and group sizes.',
    angle: 'Seasonal promotion', cta: 'Request a Quote',
    draftText: 'Spring is the perfect time to bring your team together...', assetUrl: '', assetName: '',
    approvalStatus: 'Approved', approvedBy: 'user-mike', publishedUrl: '', trafficMonthly: 0, conversions: 0,
    repurposedTo: [], internalLinks: [], notes: '',
    ...EMPTY_BRIEF,
    createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-03-22T10:00:00Z',
  },
  {
    id: nanoid(), title: 'How SEO Helps Plumbers Get More Calls', brandId: 'brand-mjw-design',
    type: 'Blog Post', status: 'Editing', priority: 'High', dueDate: '2026-04-10',
    assigneeId: 'user-mike', targetKeyword: 'SEO for plumbers Ontario', searchIntent: 'Informational',
    briefText: 'Target plumbing business owners skeptical of SEO. Use concrete examples and ROI numbers.',
    angle: 'Skeptic-to-believer conversion', cta: 'Get a Free SEO Audit',
    draftText: 'Most plumbers think SEO is a scam...', assetUrl: '', assetName: '',
    approvalStatus: 'Reviewed', approvedBy: '', publishedUrl: '', trafficMonthly: 0, conversions: 0,
    repurposedTo: [], internalLinks: [], notes: 'Needs stat verification',
    ...EMPTY_BRIEF, briefAudience: 'Plumbing business owners, skeptical of marketing', briefGoal: 'Convert skeptics into SEO clients', briefTone: 'Direct, data-driven, no fluff', briefWordCount: '1500', briefStatus: 'draft' as const,
    createdAt: '2026-03-15T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z',
  },
  {
    id: nanoid(), title: 'Google Business Profile Optimization Checklist', brandId: 'brand-mjw-design',
    type: 'Lead Magnet', status: 'Briefing', priority: 'Medium', dueDate: '2026-04-20',
    assigneeId: 'user-mike', targetKeyword: 'Google Business Profile checklist', searchIntent: 'Informational',
    briefText: 'Create a downloadable PDF checklist for contractors. 10-point GBP optimization guide.',
    angle: 'Actionable quick-win', cta: 'Download the Free Checklist',
    draftText: '', assetUrl: '', assetName: '', approvalStatus: 'Pending', approvedBy: '',
    publishedUrl: '', trafficMonthly: 0, conversions: 0, repurposedTo: [], internalLinks: [], notes: '',
    ...EMPTY_BRIEF,
    createdAt: '2026-03-25T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z',
  },
  {
    id: nanoid(), title: 'Escape Maze Summer Camp Programs 2026', brandId: 'brand-escape-maze',
    type: 'Blog Post', status: 'Backlog', priority: 'Medium', dueDate: '2026-05-01',
    assigneeId: 'user-jake', targetKeyword: 'summer camps Peterborough 2026', searchIntent: 'Informational',
    briefText: 'Target parents looking for summer programs. Cover age groups, activities, and registration.',
    angle: 'Parent decision guide', cta: 'Register for Summer Camp',
    draftText: '', assetUrl: '', assetName: '', approvalStatus: 'Pending', approvedBy: '',
    publishedUrl: '', trafficMonthly: 0, conversions: 0, repurposedTo: [], internalLinks: [], notes: '',
    ...EMPTY_BRIEF,
    createdAt: '2026-03-26T10:00:00Z', updatedAt: '2026-03-26T10:00:00Z',
  },
  {
    id: nanoid(), title: 'Why Local SEO Beats Google Ads for Contractors', brandId: 'brand-mjw-design',
    type: 'Blog Post', status: 'Backlog', priority: 'Medium', dueDate: '2026-05-10',
    assigneeId: 'user-mike', targetKeyword: 'local SEO vs Google Ads contractors', searchIntent: 'Commercial',
    briefText: 'Compare long-term ROI of SEO vs paid ads for home service contractors.',
    angle: 'ROI comparison', cta: 'Start Your SEO Strategy',
    draftText: '', assetUrl: '', assetName: '', approvalStatus: 'Pending', approvedBy: '',
    publishedUrl: '', trafficMonthly: 0, conversions: 0, repurposedTo: [], internalLinks: [], notes: '',
    ...EMPTY_BRIEF,
    createdAt: '2026-03-26T10:00:00Z', updatedAt: '2026-03-26T10:00:00Z',
  },
  {
    id: nanoid(), title: 'Disc Golf at Escape Maze — A Hidden Gem', brandId: 'brand-escape-maze',
    type: 'GBP Post', status: 'Scheduled', priority: 'Low', dueDate: '2026-04-15',
    assigneeId: 'user-jake', targetKeyword: 'disc golf Peterborough', searchIntent: 'Informational',
    briefText: 'Promote the disc golf course. Target outdoor enthusiasts and families.',
    angle: 'Hidden gem discovery', cta: 'Plan Your Visit',
    draftText: 'Did you know Escape Maze has a full disc golf course?', assetUrl: '', assetName: '',
    approvalStatus: 'Approved', approvedBy: 'user-mike', publishedUrl: '', trafficMonthly: 0, conversions: 0,
    repurposedTo: [], internalLinks: [], notes: '',
    ...EMPTY_BRIEF,
    createdAt: '2026-03-22T10:00:00Z', updatedAt: '2026-03-28T10:00:00Z',
  },
  {
    id: nanoid(), title: 'HVAC Contractor SEO Case Study — 3x Leads in 90 Days', brandId: 'brand-mjw-design',
    type: 'Blog Post', status: 'Backlog', priority: 'High', dueDate: '2026-05-15',
    assigneeId: 'user-mike', targetKeyword: 'HVAC SEO case study Ontario', searchIntent: 'Commercial',
    briefText: 'Document a real client result. Show the before/after traffic and lead numbers.',
    angle: 'Proof-based case study', cta: 'Get Similar Results',
    draftText: '', assetUrl: '', assetName: '', approvalStatus: 'Pending', approvedBy: '',
    publishedUrl: '', trafficMonthly: 0, conversions: 0, repurposedTo: [], internalLinks: [], notes: '',
    ...EMPTY_BRIEF,
    createdAt: '2026-03-27T10:00:00Z', updatedAt: '2026-03-27T10:00:00Z',
  },
  {
    id: nanoid(), title: 'Laser Tag Birthday Parties Peterborough', brandId: 'brand-escape-maze',
    type: 'Blog Post', status: 'Briefing', priority: 'High', dueDate: '2026-04-25',
    assigneeId: 'user-jake', targetKeyword: 'laser tag birthday party Peterborough', searchIntent: 'Transactional',
    briefText: 'Target parents planning birthday parties. Cover packages, age groups, and booking process.',
    angle: 'Birthday planning guide', cta: 'Book a Birthday Party',
    draftText: '', assetUrl: '', assetName: '', approvalStatus: 'Pending', approvedBy: '',
    publishedUrl: '', trafficMonthly: 0, conversions: 0, repurposedTo: [], internalLinks: [], notes: '',
    ...EMPTY_BRIEF,
    createdAt: '2026-03-27T10:00:00Z', updatedAt: '2026-03-27T10:00:00Z',
  },
];

const SEED_PROMPTS: Prompt[] = [
  {
    id: 'prompt-blog', name: 'Blog Post Generator', category: 'Content',
    systemPrompt: 'You are an expert content writer for local businesses. Write SEO-optimized blog posts that rank well and convert readers into customers. Always follow the provided H2 structure exactly — do not invent your own headings.',
    userTemplate: 'Write a {{wordcount}}-word blog post for {{brand}} targeting the keyword "{{keyword}}".\n\nTone: {{tone}}\nTarget audience: {{audience}}\nAngle: {{angle}}\nCTA: {{cta}}\n\nUse EXACTLY these H2 headings in this order:\n{{headings}}\n\nUnder each heading, write 2-3 paragraphs that support the overall keyword and angle. End the post with a strong CTA paragraph.',
    variables: ['brand', 'keyword', 'tone', 'audience', 'angle', 'cta', 'wordcount', 'headings'],
  },
  {
    id: 'prompt-gbp', name: 'GBP Post Generator', category: 'Local SEO',
    systemPrompt: 'You are a local SEO expert specializing in Google Business Profile posts. Write posts that drive clicks and calls.',
    userTemplate: 'Write a Google Business Profile post for {{brand}} about: {{topic}}. Location: {{location}}. CTA: {{cta}}. Keep it under 300 words. Include a local keyword naturally.',
    variables: ['brand', 'topic', 'location', 'cta'],
  },
  {
    id: 'prompt-social', name: 'Social Repurpose Pack', category: 'Social Media',
    systemPrompt: 'You are a social media strategist. Repurpose long-form content into engaging social posts for multiple platforms.',
    userTemplate: 'Repurpose this content for {{brand}} into 5 social media posts: one for Instagram (visual, emoji-friendly), one for Facebook (conversational), one for LinkedIn (professional), one short-form video script hook, and one story caption. Source content: {{content}}',
    variables: ['brand', 'content'],
  },
  {
    id: 'prompt-brief', name: 'Content Brief Builder', category: 'Strategy',
    systemPrompt: 'You are a content strategist. Create detailed content briefs that give writers everything they need to produce high-ranking, converting content.',
    userTemplate: 'Create a content brief for {{brand}} targeting "{{keyword}}". Include: target audience, search intent, recommended H2 headings (5-7), key points to cover, competitor angles to differentiate from, internal linking opportunities, and a recommended word count.',
    variables: ['brand', 'keyword'],
  },
];

const SEED_GAPS: CompetitorGap[] = [
  { id: nanoid(), competitorUrl: 'https://adventureescape.ca', topic: 'Corporate team building packages comparison', priority: 'High', status: 'Open', notes: 'They rank #1 for "corporate escape room Ontario"', createdAt: '2026-03-20T10:00:00Z' },
  { id: nanoid(), competitorUrl: 'https://escapezone.ca', topic: 'Escape room difficulty levels guide', priority: 'Medium', status: 'In Progress', notes: 'Good keyword opportunity — low competition', createdAt: '2026-03-22T10:00:00Z' },
  { id: nanoid(), competitorUrl: 'https://localseoguide.com', topic: 'Google Maps ranking factors 2026', priority: 'High', status: 'Open', notes: 'MJW Design needs this for authority building', createdAt: '2026-03-25T10:00:00Z' },
];

// ─── Storage Keys ──────────────────────────────────────────────────────────────

const KEYS = {
  brands: 'mjw_brands',
  content: 'mjw_content',
  prompts: 'mjw_prompts',
  gaps: 'mjw_gaps',
  users: 'mjw_users',
  calendar: 'mjw_calendar',
};

function load<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Store API ─────────────────────────────────────────────────────────────────

export const store = {
  // Brands
  getBrands: () => load<Brand>(KEYS.brands, SEED_BRANDS),
  saveBrands: (data: Brand[]) => save(KEYS.brands, data),
  addBrand: (b: Omit<Brand, 'id'>) => {
    const brands = store.getBrands();
    const newBrand = { ...b, id: nanoid() };
    store.saveBrands([...brands, newBrand]);
    return newBrand;
  },
  updateBrand: (id: string, updates: Partial<Brand>) => {
    const brands = store.getBrands().map(b => b.id === id ? { ...b, ...updates } : b);
    store.saveBrands(brands);
  },
  deleteBrand: (id: string) => store.saveBrands(store.getBrands().filter(b => b.id !== id)),

  // Content
  getContent: () => load<ContentItem>(KEYS.content, SEED_CONTENT),
  saveContent: (data: ContentItem[]) => save(KEYS.content, data),
  addContent: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const content = store.getContent();
    const now = new Date().toISOString();
    const newItem: ContentItem = { ...item as ContentItem, id: nanoid(), createdAt: now, updatedAt: now };
    store.saveContent([...content, newItem]);
    return newItem;
  },
  updateContent: (id: string, updates: Partial<ContentItem>) => {
    const content = store.getContent().map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    store.saveContent(content);
  },
  deleteContent: (id: string) => store.saveContent(store.getContent().filter(c => c.id !== id)),

  // Prompts
  getPrompts: () => load<Prompt>(KEYS.prompts, SEED_PROMPTS),
  savePrompts: (data: Prompt[]) => save(KEYS.prompts, data),
  addPrompt: (p: Omit<Prompt, 'id'>) => {
    const prompts = store.getPrompts();
    const newPrompt = { ...p, id: nanoid() };
    store.savePrompts([...prompts, newPrompt]);
    return newPrompt;
  },
  updatePrompt: (id: string, updates: Partial<Prompt>) => {
    store.savePrompts(store.getPrompts().map(p => p.id === id ? { ...p, ...updates } : p));
  },
  deletePrompt: (id: string) => store.savePrompts(store.getPrompts().filter(p => p.id !== id)),

  // Competitor Gaps
  getGaps: () => load<CompetitorGap>(KEYS.gaps, SEED_GAPS),
  saveGaps: (data: CompetitorGap[]) => save(KEYS.gaps, data),
  addGap: (g: Omit<CompetitorGap, 'id' | 'createdAt'>) => {
    const gaps = store.getGaps();
    const newGap = { ...g, id: nanoid(), createdAt: new Date().toISOString() };
    store.saveGaps([...gaps, newGap]);
    return newGap;
  },
  updateGap: (id: string, updates: Partial<CompetitorGap>) => {
    store.saveGaps(store.getGaps().map(g => g.id === id ? { ...g, ...updates } : g));
  },
  deleteGap: (id: string) => store.saveGaps(store.getGaps().filter(g => g.id !== id)),

  // Users
  getUsers: () => load<User>(KEYS.users, SEED_USERS),

  // Calendar
  getCalendar: () => load<CalendarEvent>(KEYS.calendar, []),
  saveCalendar: (data: CalendarEvent[]) => save(KEYS.calendar, data),
  addCalendarEvent: (e: Omit<CalendarEvent, 'id'>) => {
    const events = store.getCalendar();
    const newEvent = { ...e, id: nanoid() };
    store.saveCalendar([...events, newEvent]);
    return newEvent;
  },
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => {
    store.saveCalendar(store.getCalendar().map(e => e.id === id ? { ...e, ...updates } : e));
  },
  deleteCalendarEvent: (id: string) => store.saveCalendar(store.getCalendar().filter(e => e.id !== id)),
};
