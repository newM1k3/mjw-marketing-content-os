// AI Studio — Content generation with prompt library
// Design: Purple AI aesthetic, split-pane layout
import { useState, useCallback } from "react";
import { store, type Prompt } from "@/lib/store";
import { Sparkles, Copy, Save, Plus, X, Edit2, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const AI_BG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/3MeSGugCZeowAaENeGLcBo/ai-studio-bg-JrRBsMZsUNQHKhiFjqieMm.webp";

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `[${key}]`);
}

function extractVars(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) ?? [];
  const seen = new Set<string>();
  const result: string[] = [];
  matches.forEach(m => {
    const key = m.replace(/\{\{|\}\}/g, '');
    if (!seen.has(key)) { seen.add(key); result.push(key); }
  });
  return result;;
}

function PromptModal({ prompt, onClose, onSave }: {
  prompt?: Prompt;
  onClose: () => void;
  onSave: (p: Omit<Prompt, 'id'> & { id?: string }) => void;
}) {
  const [form, setForm] = useState({
    id: prompt?.id,
    name: prompt?.name ?? '',
    category: prompt?.category ?? 'Content',
    systemPrompt: prompt?.systemPrompt ?? '',
    userTemplate: prompt?.userTemplate ?? '',
    variables: prompt?.variables ?? [],
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-lg rounded-xl border p-6" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>
            {prompt ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <button onClick={onClose}><X size={18} style={{ color: '#64748b' }} /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Category</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }} />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>System Prompt</label>
            <textarea value={form.systemPrompt} onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))}
              rows={3} className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>
              User Template <span style={{ color: '#64748b' }}>(use {'{{variable}}'} syntax)</span>
            </label>
            <textarea value={form.userTemplate} onChange={e => setForm(f => ({ ...f, userTemplate: e.target.value }))}
              rows={4} className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none font-mono"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0', fontSize: '12px' }} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: '#2d3748', color: '#64748b' }}>Cancel</button>
          <button onClick={() => {
            if (!form.name.trim()) { toast.error('Name required'); return; }
            const vars = extractVars(form.userTemplate);
            onSave({ ...form, variables: vars });
            onClose();
          }} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: '#a78bfa', color: '#0f1117' }}>
            Save Prompt
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIStudioPage() {
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const [selectedPromptId, setSelectedPromptId] = useState<string>('prompt-blog');
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();
  const [activeTab, setActiveTab] = useState<'generate' | 'library'>('generate');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mjw_openai_key') ?? '');
  const [showApiKey, setShowApiKey] = useState(false);

  const prompts = store.getPrompts();
  const brands = store.getBrands();
  const content = store.getContent();

  const selectedPrompt = prompts.find(p => p.id === selectedPromptId) ?? prompts[0];
  const vars = selectedPrompt ? extractVars(selectedPrompt.userTemplate) : [];

  const handleGenerate = useCallback(async () => {
    if (!selectedPrompt) return;
    if (!apiKey) {
      toast.error('Please enter your OpenAI API key in the settings below');
      setShowApiKey(true);
      return;
    }

    const filledPrompt = fillTemplate(selectedPrompt.userTemplate, varValues);
    setIsGenerating(true);
    setOutput('');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: selectedPrompt.systemPrompt },
            { role: 'user', content: filledPrompt },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? 'API error');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            fullText += delta;
            setOutput(fullText);
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedPrompt, varValues, apiKey]);

  const handleSaveToItem = useCallback(() => {
    const contentId = varValues['contentId'];
    if (!contentId || !output) { toast.error('No content item selected or no output generated'); return; }
    store.updateContent(contentId, { draftText: output });
    toast.success('Saved to content item');
  }, [varValues, output]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('mjw_openai_key', apiKey);
    toast.success('API key saved');
    setShowApiKey(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="relative shrink-0" style={{ minHeight: 100 }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${AI_BG})` }} />
        <div className="relative z-10 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>
              <Sparkles size={20} style={{ color: '#a78bfa' }} />
              AI Studio
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Generate content using your prompt library</p>
          </div>
          <div className="flex gap-2">
            {(['generate', 'library'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={activeTab === tab
                  ? { background: 'rgba(167,139,250,0.2)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.4)' }
                  : { background: 'transparent', color: '#64748b', border: '1px solid transparent' }
                }>
                {tab === 'generate' ? 'Generate' : 'Prompt Library'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'generate' ? (
          <div className="flex h-full">
            {/* Left: Controls */}
            <div className="w-80 shrink-0 border-r overflow-y-auto p-5 space-y-4" style={{ borderColor: '#2d3748' }}>
              {/* Prompt selector */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#64748b' }}>Prompt Template</label>
                <div className="relative">
                  <select value={selectedPromptId} onChange={e => { setSelectedPromptId(e.target.value); setVarValues({}); }}
                    className="w-full appearance-none px-3 py-2 pr-8 rounded-lg text-sm border outline-none"
                    style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}>
                    {prompts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748b' }} />
                </div>
              </div>

              {/* Variables */}
              {vars.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium" style={{ color: '#64748b' }}>Variables</p>
                  {vars.map(v => {
                    if (v === 'brand') return (
                      <div key={v}>
                        <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>brand</label>
                        <select value={varValues[v] ?? ''} onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                          style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}>
                          <option value="">Select brand...</option>
                          {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                    );
                    if (v === 'contentId') return (
                      <div key={v}>
                        <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>content item</label>
                        <select value={varValues[v] ?? ''} onChange={e => {
                          const item = content.find(c => c.id === e.target.value);
                          setVarValues(prev => ({
                            ...prev,
                            contentId: e.target.value,
                            brand: brands.find(b => b.id === item?.brandId)?.name ?? prev.brand,
                            keyword: item?.targetKeyword ?? prev.keyword,
                            topic: item?.title ?? prev.topic,
                          }));
                        }}
                          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                          style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}>
                          <option value="">Select item...</option>
                          {content.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                    );
                    return (
                      <div key={v}>
                        <label className="block text-xs mb-1" style={{ color: '#94a3b8' }}>{v}</label>
                        <input value={varValues[v] ?? ''} onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                          placeholder={`Enter ${v}...`}
                          className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                          style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Preview filled prompt */}
              {selectedPrompt && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>Preview</p>
                  <div className="rounded-lg p-3 text-xs font-mono leading-relaxed"
                    style={{ background: '#252d3d', color: '#94a3b8', maxHeight: 120, overflow: 'auto' }}>
                    {fillTemplate(selectedPrompt.userTemplate, varValues)}
                  </div>
                </div>
              )}

              {/* Generate button */}
              <button onClick={handleGenerate} disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #6ee7f7 100%)', color: '#0f1117' }}>
                <Sparkles size={15} className={isGenerating ? 'animate-spin' : ''} />
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>

              {/* API Key */}
              <div>
                <button onClick={() => setShowApiKey(!showApiKey)} className="text-xs" style={{ color: '#64748b' }}>
                  {showApiKey ? 'Hide' : 'Set'} OpenAI API Key
                </button>
                {showApiKey && (
                  <div className="mt-2 space-y-2">
                    <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                      style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }} />
                    <button onClick={handleSaveApiKey}
                      className="w-full py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
                      Save Key
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Output */}
            <div className="flex-1 flex flex-col p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>Output</p>
                {output && (
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(110,231,247,0.1)', color: '#6ee7f7', border: '1px solid rgba(110,231,247,0.25)' }}>
                      <Copy size={12} /> Copy
                    </button>
                    <button onClick={handleSaveToItem} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>
                      <Save size={12} /> Save to Item
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 rounded-xl border p-4 overflow-y-auto"
                style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
                {!output && !isGenerating && (
                  <div className="flex flex-col items-center justify-center h-full opacity-40">
                    <Sparkles size={32} style={{ color: '#a78bfa' }} />
                    <p className="text-sm mt-3" style={{ color: '#64748b' }}>Fill in the variables and click Generate</p>
                  </div>
                )}
                {isGenerating && !output && (
                  <div className="flex items-center gap-2" style={{ color: '#a78bfa' }}>
                    <Sparkles size={16} className="animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </div>
                )}
                {output && (
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#e2e8f0', fontFamily: 'inherit' }}>
                    {output}
                    {isGenerating && <span className="animate-pulse" style={{ color: '#a78bfa' }}>▊</span>}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Prompt Library */
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{prompts.length} prompts</p>
              <button onClick={() => { setEditingPrompt(undefined); setShowPromptModal(true); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>
                <Plus size={14} /> New Prompt
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {prompts.map(p => (
                <div key={p.id} className="rounded-xl border p-4 card-hover"
                  style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{p.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>{p.category}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingPrompt(p); setShowPromptModal(true); }}
                        className="p-1.5 rounded hover:bg-white/5"><Edit2 size={13} style={{ color: '#64748b' }} /></button>
                      <button onClick={() => { store.deletePrompt(p.id); toast.success('Deleted'); refresh(); }}
                        className="p-1.5 rounded hover:bg-red-500/10"><Trash2 size={13} style={{ color: '#64748b' }} /></button>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: '#94a3b8' }}>{p.userTemplate}</p>
                  <div className="flex flex-wrap gap-1">
                    {extractVars(p.userTemplate).map(v => (
                      <span key={v} className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{ background: '#252d3d', color: '#6ee7f7' }}>{`{{${v}}}`}</span>
                    ))}
                  </div>
                  <button onClick={() => { setSelectedPromptId(p.id); setActiveTab('generate'); }}
                    className="mt-3 text-xs flex items-center gap-1" style={{ color: '#6ee7f7' }}>
                    <Sparkles size={11} /> Use this prompt
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showPromptModal && (
        <PromptModal
          prompt={editingPrompt}
          onClose={() => setShowPromptModal(false)}
          onSave={p => {
            if (p.id) store.updatePrompt(p.id, p);
            else store.addPrompt(p as Omit<Prompt, 'id'>);
            toast.success('Prompt saved');
            refresh();
          }}
        />
      )}
    </div>
  );
}
