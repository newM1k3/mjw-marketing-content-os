// ContentBriefPanel — Slide-in structured brief builder for a content item
// Design: Dark Studio, purple AI accent, right-side drawer
import { useState, useEffect } from "react";
import { store, type ContentItem } from "@/lib/store";
import { X, Save, Sparkles, CheckCircle2, FileText, ChevronRight, Copy, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  item: ContentItem;
  onClose: () => void;
  onSaved: () => void;
  onGenerateInStudio: (item: ContentItem) => void;
}

const BRIEF_FIELDS = [
  {
    key: 'briefAudience',
    label: 'Target Audience',
    placeholder: 'e.g. Corporate HR managers planning team events in Peterborough',
    hint: 'Who is this piece written for? Be specific.',
    rows: 2,
  },
  {
    key: 'briefGoal',
    label: 'Content Goal',
    placeholder: 'e.g. Rank for "team building Peterborough" and convert readers to group bookings',
    hint: 'What should this content achieve? (rank, convert, educate, retain)',
    rows: 2,
  },
  {
    key: 'briefTone',
    label: 'Tone & Voice',
    placeholder: 'e.g. Adventurous, authoritative, local expert — avoid corporate jargon',
    hint: 'How should this sound? Reference the brand voice.',
    rows: 2,
  },
  {
    key: 'briefWordCount',
    label: 'Target Word Count',
    placeholder: 'e.g. 1200',
    hint: 'Recommended: 800–1200 for GBP/social, 1200–2000 for blog posts.',
    rows: 1,
  },
  {
    key: 'briefHeadings',
    label: 'Recommended H2 Headings',
    placeholder: 'e.g. Why Team Building Matters|Indoor Options Near Peterborough|Why Escape Maze Tops the List',
    hint: 'Separate headings with a pipe | character. These become the article structure.',
    rows: 3,
  },
  {
    key: 'briefKeyPoints',
    label: 'Key Points to Cover',
    placeholder: 'e.g. Unique 129-acre venue, group sizes 10–200, catering available, booking process',
    hint: 'List the must-include facts, stats, or selling points.',
    rows: 3,
  },
  {
    key: 'briefDifferentiators',
    label: 'Competitor Angles to Differentiate From',
    placeholder: 'e.g. Competitors focus on indoor only — we should emphasize outdoor adventures',
    hint: 'What are competitors saying? How should we stand out?',
    rows: 2,
  },
  {
    key: 'briefCompetitorUrls',
    label: 'Competitor URLs to Reference',
    placeholder: 'e.g. https://adventureescape.ca/team-building, https://escapezone.ca/corporate',
    hint: 'Paste competitor URLs that rank for this keyword.',
    rows: 2,
  },
] as const;

type BriefKey = typeof BRIEF_FIELDS[number]['key'];

function completionScore(item: ContentItem): number {
  const fields: BriefKey[] = ['briefAudience', 'briefGoal', 'briefTone', 'briefWordCount', 'briefHeadings', 'briefKeyPoints', 'briefDifferentiators', 'briefCompetitorUrls'];
  const filled = fields.filter(f => item[f]?.trim()).length;
  return Math.round((filled / fields.length) * 100);
}

function statusColor(score: number): string {
  if (score === 100) return '#34d399';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

function statusLabel(score: number): string {
  if (score === 100) return 'Complete';
  if (score > 0) return 'Draft';
  return 'Empty';
}

export function ContentBriefPanel({ item, onClose, onSaved, onGenerateInStudio }: Props) {
  const [form, setForm] = useState<Record<BriefKey, string>>({
    briefAudience: item.briefAudience ?? '',
    briefGoal: item.briefGoal ?? '',
    briefTone: item.briefTone ?? '',
    briefWordCount: item.briefWordCount ?? '',
    briefHeadings: item.briefHeadings ?? '',
    briefKeyPoints: item.briefKeyPoints ?? '',
    briefDifferentiators: item.briefDifferentiators ?? '',
    briefCompetitorUrls: item.briefCompetitorUrls ?? '',
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const set = (key: BriefKey, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = (briefStatus: ContentItem['briefStatus']) => {
    store.updateContent(item.id, { ...form, briefStatus });
    setIsDirty(false);
    toast.success(briefStatus === 'complete' ? 'Brief marked complete ✓' : 'Brief saved');
    onSaved();
  };

  const handleCopyBrief = () => {
    const brands = store.getBrands();
    const brand = brands.find(b => b.id === item.brandId);
    const lines = [
      `# Content Brief: ${item.title}`,
      `**Brand:** ${brand?.name ?? item.brandId}`,
      `**Keyword:** ${item.targetKeyword}`,
      `**Type:** ${item.type}`,
      `**CTA:** ${item.cta}`,
      '',
      `## Target Audience\n${form.briefAudience}`,
      `## Content Goal\n${form.briefGoal}`,
      `## Tone & Voice\n${form.briefTone}`,
      `## Word Count\n${form.briefWordCount}`,
      `## Recommended Headings\n${form.briefHeadings.split('|').map((h, i) => `${i + 1}. ${h.trim()}`).join('\n')}`,
      `## Key Points\n${form.briefKeyPoints}`,
      `## Differentiation\n${form.briefDifferentiators}`,
      `## Competitor URLs\n${form.briefCompetitorUrls}`,
    ].join('\n\n');
    navigator.clipboard.writeText(lines);
    toast.success('Brief copied to clipboard');
  };

  const score = completionScore({ ...item, ...form } as ContentItem);
  const brands = store.getBrands();
  const brand = brands.find(b => b.id === item.brandId);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleAIGenerateBrief = async () => {
    const apiKey = localStorage.getItem('mjw_openai_key');
    if (!apiKey) {
      toast.error('Add your OpenAI API key in AI Studio first');
      return;
    }
    setIsGeneratingBrief(true);
    const brandName = brand?.name ?? item.brandId;
    const systemPrompt = `You are an expert content strategist. Given a content item, generate a structured content brief with specific, actionable suggestions. Return ONLY a JSON object with these exact keys: audience, goal, tone, wordCount, headings (pipe-separated H2s), keyPoints, differentiators. No markdown, no explanation, just the JSON.`;
    const userPrompt = `Brand: ${brandName}\nContent Title: ${item.title}\nTarget Keyword: ${item.targetKeyword || 'not set'}\nContent Type: ${item.type}\nSearch Intent: ${item.searchIntent || 'not set'}\nAngle: ${item.angle || 'not set'}\nBrand Voice: ${brand?.toneOfVoice || 'professional, helpful'}\nTarget Audience: ${brand?.targetAudience || 'local business owners'}\nLocation: ${brand?.locationKeyword || ''}\n\nGenerate a detailed content brief for this piece.`;
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          temperature: 0.7,
        }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content ?? '{}';
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      setForm(f => ({
        ...f,
        briefAudience: parsed.audience || f.briefAudience,
        briefGoal: parsed.goal || f.briefGoal,
        briefTone: parsed.tone || f.briefTone,
        briefWordCount: parsed.wordCount || f.briefWordCount,
        briefHeadings: parsed.headings || f.briefHeadings,
        briefKeyPoints: parsed.keyPoints || f.briefKeyPoints,
        briefDifferentiators: parsed.differentiators || f.briefDifferentiators,
      }));
      setIsDirty(true);
      toast.success('Brief suggestions generated — review and edit before saving');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.5)', opacity: isVisible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          width: 520,
          background: '#13172a',
          borderLeft: '1px solid #2d3748',
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b" style={{ borderColor: '#2d3748' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} style={{ color: '#a78bfa' }} />
                <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>Content Brief</span>
              </div>
              <h2 className="text-sm font-bold leading-snug" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>
                {item.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs" style={{ color: '#64748b' }}>{brand?.name}</span>
                <span className="text-xs" style={{ color: '#2d3748' }}>·</span>
                <span className="text-xs" style={{ color: '#64748b' }}>{item.targetKeyword || 'No keyword set'}</span>
              </div>
            </div>
            <button onClick={handleClose} className="p-1 rounded hover:bg-white/5 shrink-0">
              <X size={18} style={{ color: '#64748b' }} />
            </button>
          </div>

          {/* Completion bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: '#64748b' }}>Brief completeness</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold" style={{ color: statusColor(score) }}>{score}%</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: `${statusColor(score)}18`, color: statusColor(score) }}>
                  {statusLabel(score)}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#2d3748' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${score}%`, background: `linear-gradient(90deg, #a78bfa 0%, ${statusColor(score)} 100%)` }}
              />
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* AI Generate Brief button */}
          <button
            onClick={handleAIGenerateBrief}
            disabled={isGeneratingBrief}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}
          >
            {isGeneratingBrief
              ? <><Loader2 size={14} className="animate-spin" /> Generating suggestions...</>
              : <><Wand2 size={14} /> Generate Brief Suggestions with AI</>}
          </button>
          {isGeneratingBrief && (
            <p className="text-xs text-center" style={{ color: '#64748b' }}>Analyzing your content item and brand voice...</p>
          )}

          {/* Core item info (read-only summary) */}
          <div className="rounded-lg p-3 space-y-1.5" style={{ background: '#1a1f2e', border: '1px solid #2d3748' }}>
            <p className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>Item Summary</p>
            {[
              { label: 'Type', value: item.type },
              { label: 'Search Intent', value: item.searchIntent || 'Not set' },
              { label: 'CTA', value: item.cta || 'Not set' },
              { label: 'Angle', value: item.angle || 'Not set' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-2">
                <span className="text-xs shrink-0 w-24" style={{ color: '#64748b' }}>{label}</span>
                <span className="text-xs" style={{ color: '#94a3b8' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Brief fields */}
          {BRIEF_FIELDS.map(({ key, label, placeholder, hint, rows }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium" style={{ color: '#e2e8f0' }}>{label}</label>
                {form[key]?.trim() && (
                  <CheckCircle2 size={12} style={{ color: '#34d399' }} />
                )}
              </div>
              <p className="text-xs mb-1.5" style={{ color: '#64748b' }}>{hint}</p>
              {rows === 1 ? (
                <input
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors"
                  style={{ background: '#1a1f2e', borderColor: form[key]?.trim() ? 'rgba(167,139,250,0.4)' : '#2d3748', color: '#e2e8f0' }}
                />
              ) : (
                <textarea
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  rows={rows}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none transition-colors"
                  style={{ background: '#1a1f2e', borderColor: form[key]?.trim() ? 'rgba(167,139,250,0.4)' : '#2d3748', color: '#e2e8f0' }}
                />
              )}
            </div>
          ))}

          {/* Brand voice reference */}
          {brand?.toneOfVoice && (
            <div className="rounded-lg p-3" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#a78bfa' }}>Brand Voice Reference — {brand.name}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{brand.toneOfVoice}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-5 py-4 border-t space-y-2" style={{ borderColor: '#2d3748' }}>
          {/* Generate button */}
          <button
            onClick={() => {
              if (isDirty) handleSave('draft');
              onGenerateInStudio({ ...item, ...form } as ContentItem);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #6ee7f7 100%)', color: '#0f1117' }}
          >
            <Sparkles size={15} />
            Generate with AI Studio
            <ChevronRight size={14} />
          </button>

          {/* Save row */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyBrief}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #2d3748' }}
            >
              <Copy size={12} /> Copy Brief
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={!isDirty}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ background: 'rgba(110,231,247,0.1)', color: '#6ee7f7', border: '1px solid rgba(110,231,247,0.25)' }}
            >
              <Save size={12} /> Save Draft
            </button>
            <button
              onClick={() => handleSave('complete')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
            >
              <CheckCircle2 size={12} /> Mark Complete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
