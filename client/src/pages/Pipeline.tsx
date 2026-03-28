// Pipeline — Master content table with filters, sorting, and slide-in detail panel
import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { store, type ContentItem, type ContentStatus, type ContentType, type Priority } from "@/lib/store";
import { statusBadgeClass, priorityBadgeClass, brandClass, formatDate, CONTENT_TYPES, PRIORITIES, STATUS_ORDER, SEARCH_INTENTS } from "@/lib/utils";
import { Search, Plus, X, ChevronDown, Sparkles, ExternalLink, Trash2, Save, FileText, CheckCircle2 } from "lucide-react";
import { ContentBriefPanel } from "@/components/ContentBriefPanel";
import { toast } from "sonner";

const STATUSES: ContentStatus[] = STATUS_ORDER;

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>;
}

function AddContentModal({ brands, onClose, onSave }: {
  brands: ReturnType<typeof store.getBrands>;
  onClose: () => void;
  onSave: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [form, setForm] = useState({
    title: '', brandId: brands[0]?.id ?? '', type: 'Blog Post' as ContentType,
    status: 'Backlog' as ContentStatus, priority: 'Medium' as Priority,
    dueDate: '', assigneeId: 'user-mike', targetKeyword: '', searchIntent: '' as ContentItem['searchIntent'],
    briefText: '', angle: '', cta: '', draftText: '', assetUrl: '', assetName: '',
    approvalStatus: 'Pending' as ContentItem['approvalStatus'], approvedBy: '',
    publishedUrl: '', trafficMonthly: 0, conversions: 0, repurposedTo: [], internalLinks: [], notes: '',
    briefAudience: '', briefGoal: '', briefTone: '', briefWordCount: '',
    briefHeadings: '', briefKeyPoints: '', briefDifferentiators: '',
    briefCompetitorUrls: '', briefStatus: 'empty' as const,
  });
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-lg rounded-xl border p-6 shadow-2xl" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>Add Content Item</h2>
          <button onClick={onClose}><X size={18} style={{ color: '#64748b' }} /></button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {[
            { label: 'Title *', key: 'title', type: 'text' },
            { label: 'Target Keyword', key: 'targetKeyword', type: 'text' },
            { label: 'Angle', key: 'angle', type: 'text' },
            { label: 'CTA', key: 'cta', type: 'text' },
            { label: 'Due Date', key: 'dueDate', type: 'date' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs mb-1" style={{ color: '#64748b' }}>{label}</label>
              <input
                type={type}
                value={(form as Record<string, unknown>)[key] as string}
                onChange={e => set(key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none focus:border-cyan-400"
                style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }}
              />
            </div>
          ))}
          {[
            { label: 'Brand', key: 'brandId', options: brands.map(b => ({ value: b.id, label: b.name })) },
            { label: 'Type', key: 'type', options: CONTENT_TYPES.map(t => ({ value: t, label: t })) },
            { label: 'Status', key: 'status', options: STATUSES.map(s => ({ value: s, label: s })) },
            { label: 'Priority', key: 'priority', options: PRIORITIES.map(p => ({ value: p, label: p })) },
            { label: 'Search Intent', key: 'searchIntent', options: SEARCH_INTENTS.map(i => ({ value: i, label: i || 'Not set' })) },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <label className="block text-xs mb-1" style={{ color: '#64748b' }}>{label}</label>
              <select
                value={(form as Record<string, unknown>)[key] as string}
                onChange={e => set(key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }}
              >
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Content Brief</label>
            <textarea
              value={form.briefText}
              onChange={e => set('briefText', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: '#2d3748', color: '#64748b' }}>
            Cancel
          </button>
          <button
            onClick={() => { if (!form.title.trim()) { toast.error('Title is required'); return; } onSave(form); onClose(); }}
            className="flex-1 py-2 rounded-lg text-sm font-medium"
            style={{ background: '#6ee7f7', color: '#0f1117' }}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | ''>('');
  const [filterBrand, setFilterBrand] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [briefItemId, setBriefItemId] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const brands = store.getBrands();
  const content = store.getContent();

  const filtered = useMemo(() => {
    return content.filter(c => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.targetKeyword.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || c.status === filterStatus;
      const matchBrand = !filterBrand || c.brandId === filterBrand;
      return matchSearch && matchStatus && matchBrand;
    });
  }, [content, search, filterStatus, filterBrand]);

  const selected = useMemo(() => content.find(c => c.id === selectedId) ?? null, [content, selectedId]);

  const handleAdd = useCallback((item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    store.addContent(item);
    toast.success('Content item added');
    refresh();
  }, []);

  const handleDelete = useCallback((id: string) => {
    store.deleteContent(id);
    if (selectedId === id) setSelectedId(null);
    toast.success('Item deleted');
    refresh();
  }, [selectedId]);

  const handleSaveEdit = useCallback(() => {
    if (!editItem) return;
    store.updateContent(editItem.id, editItem);
    setEditItem(null);
    toast.success('Saved');
    refresh();
  }, [editItem]);

  const brandName = (id: string) => brands.find(b => b.id === id)?.name ?? id;
  const briefItem = useMemo(() => briefItemId ? content.find(c => c.id === briefItemId) ?? null : null, [content, briefItemId]);

  const handleGenerateInStudio = useCallback((item: ContentItem) => {
    // Store the item id so AI Studio can pick it up
    localStorage.setItem('mjw_studio_prefill', item.id);
    navigate('/ai-studio');
  }, [navigate]);

  return (
    <div className="flex h-full">
      {/* Main table area */}
      <div className="flex-1 flex flex-col min-w-0 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>Content Pipeline</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>{filtered.length} items</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: '#6ee7f7', color: '#0f1117' }}
          >
            <Plus size={15} /> Add Content
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-48" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
            <Search size={14} style={{ color: '#64748b' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title or keyword..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#e2e8f0' }}
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as ContentStatus | '')}
              className="appearance-none px-3 py-2 pr-8 rounded-lg border text-sm outline-none"
              style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748b' }} />
          </div>
          <div className="relative">
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 rounded-lg border text-sm outline-none"
              style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}
            >
              <option value="">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#64748b' }} />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden flex-1" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#2d3748' }}>
                  {['Title', 'Brand', 'Type', 'Status', 'Priority', 'Keyword', 'Due Date', 'Brief', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#2d3748' }}>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: '#64748b' }}>No items found</td></tr>
                )}
                {filtered.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                    style={selectedId === item.id ? { background: 'rgba(110,231,247,0.04)' } : {}}
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium truncate" style={{ color: '#e2e8f0' }}>{item.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={brandClass(item.brandId)}>{brandName(item.brandId)}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#94a3b8' }}>{item.type}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusBadgeClass(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={priorityBadgeClass(item.priority)}>{item.priority}</Badge>
                    </td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <span className="truncate block text-xs" style={{ color: '#94a3b8' }}>{item.targetKeyword || '—'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: '#94a3b8' }}>{formatDate(item.dueDate)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); setBriefItemId(item.id); }}
                        title={`Brief: ${item.briefStatus ?? 'empty'}`}
                        className="flex items-center gap-1.5 group"
                      >
                        <span
                          className="inline-block rounded-full transition-transform group-hover:scale-125"
                          style={{
                            width: 9, height: 9,
                            background: item.briefStatus === 'complete' ? '#34d399'
                              : item.briefStatus === 'draft' ? '#fbbf24'
                              : '#f87171',
                            boxShadow: item.briefStatus === 'complete' ? '0 0 6px #34d39988'
                              : item.briefStatus === 'draft' ? '0 0 6px #fbbf2488'
                              : '0 0 4px #f8717144',
                          }}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); setBriefItemId(item.id); }}
                          className="p-1 rounded hover:bg-purple-500/10 transition-colors"
                          title="Open Content Brief"
                        >
                          {item.briefStatus === 'complete'
                            ? <CheckCircle2 size={13} style={{ color: '#34d399' }} />
                            : item.briefStatus === 'draft'
                              ? <FileText size={13} style={{ color: '#fbbf24' }} />
                              : <FileText size={13} style={{ color: '#64748b' }} />}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                          className="p-1 rounded hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={13} style={{ color: '#64748b' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div
          className="w-96 shrink-0 border-l flex flex-col overflow-y-auto"
          style={{ background: '#12161f', borderColor: '#2d3748' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10" style={{ background: '#12161f', borderColor: '#2d3748' }}>
            <h3 className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>Item Details</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { navigate('/ai-studio'); }}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}
              >
                <Sparkles size={11} /> AI Studio
              </button>
              <button onClick={() => setSelectedId(null)}>
                <X size={16} style={{ color: '#64748b' }} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1">
            {editItem?.id === selected.id ? (
              // Edit mode
              <div className="space-y-3">
                {[
                  { label: 'Title', key: 'title', type: 'text' },
                  { label: 'Target Keyword', key: 'targetKeyword', type: 'text' },
                  { label: 'Angle', key: 'angle', type: 'text' },
                  { label: 'CTA', key: 'cta', type: 'text' },
                  { label: 'Due Date', key: 'dueDate', type: 'date' },
                  { label: 'Published URL', key: 'publishedUrl', type: 'url' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs mb-1" style={{ color: '#64748b' }}>{label}</label>
                    <input
                      type={type}
                      value={(editItem as unknown as Record<string, unknown>)[key] as string}
                      onChange={e => setEditItem(prev => prev ? { ...prev, [key]: e.target.value } : null)}
                      className="w-full px-3 py-1.5 rounded-lg text-sm border outline-none"
                      style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}
                    />
                  </div>
                ))}
                {[
                  { label: 'Status', key: 'status', options: STATUSES },
                  { label: 'Priority', key: 'priority', options: PRIORITIES },
                  { label: 'Approval', key: 'approvalStatus', options: ['Pending','Reviewed','Approved','Rejected'] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="block text-xs mb-1" style={{ color: '#64748b' }}>{label}</label>
                    <select
                      value={(editItem as unknown as Record<string, unknown>)[key] as string}
                      onChange={e => setEditItem(prev => prev ? { ...prev, [key]: e.target.value } : null)}
                      className="w-full px-3 py-1.5 rounded-lg text-sm border outline-none"
                      style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}
                    >
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Content Brief</label>
                  <textarea
                    value={editItem.briefText}
                    onChange={e => setEditItem(prev => prev ? { ...prev, briefText: e.target.value } : null)}
                    rows={4}
                    className="w-full px-3 py-1.5 rounded-lg text-sm border outline-none resize-none"
                    style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Traffic / Month</label>
                  <input
                    type="number"
                    value={editItem.trafficMonthly}
                    onChange={e => setEditItem(prev => prev ? { ...prev, trafficMonthly: Number(e.target.value) } : null)}
                    className="w-full px-3 py-1.5 rounded-lg text-sm border outline-none"
                    style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Notes</label>
                  <textarea
                    value={editItem.notes}
                    onChange={e => setEditItem(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-1.5 rounded-lg text-sm border outline-none resize-none"
                    style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditItem(null)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: '#2d3748', color: '#64748b' }}>Cancel</button>
                  <button onClick={handleSaveEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium" style={{ background: '#6ee7f7', color: '#0f1117' }}>
                    <Save size={13} /> Save
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <>
                <div>
                  <h4 className="text-base font-semibold mb-2" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>{selected.title}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className={statusBadgeClass(selected.status)}>{selected.status}</Badge>
                    <Badge className={priorityBadgeClass(selected.priority)}>{selected.priority}</Badge>
                    <Badge className={brandClass(selected.brandId)}>{brandName(selected.brandId)}</Badge>
                  </div>
                </div>

                {[
                  { label: 'Type', value: selected.type },
                  { label: 'Target Keyword', value: selected.targetKeyword || '—' },
                  { label: 'Search Intent', value: selected.searchIntent || '—' },
                  { label: 'Angle', value: selected.angle || '—' },
                  { label: 'CTA', value: selected.cta || '—' },
                  { label: 'Due Date', value: formatDate(selected.dueDate) },
                  { label: 'Approval', value: selected.approvalStatus },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: '#64748b' }}>{label}</span>
                    <span style={{ color: '#e2e8f0' }}>{value}</span>
                  </div>
                ))}

                {selected.briefText && (
                  <div>
                    <p className="text-xs font-medium mb-1.5" style={{ color: '#64748b' }}>Content Brief</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{selected.briefText}</p>
                  </div>
                )}

                {selected.status === 'Published' && (
                  <div className="rounded-lg p-3 border" style={{ background: '#252d3d', borderColor: '#2d3748' }}>
                    <p className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>Performance</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs" style={{ color: '#64748b' }}>Traffic/mo</p>
                        <p className="text-lg font-bold" style={{ color: '#6ee7f7', fontFamily: "'Space Grotesk', sans-serif" }}>{selected.trafficMonthly.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: '#64748b' }}>Conversions</p>
                        <p className="text-lg font-bold" style={{ color: '#34d399', fontFamily: "'Space Grotesk', sans-serif" }}>{selected.conversions}</p>
                      </div>
                    </div>
                    {selected.publishedUrl && (
                      <a href={selected.publishedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs mt-2" style={{ color: '#6ee7f7' }}>
                        <ExternalLink size={11} /> View published
                      </a>
                    )}
                  </div>
                )}

                {selected.notes && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Notes</p>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>{selected.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => setBriefItemId(selected.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: 'rgba(167,139,250,0.4)', color: '#a78bfa', background: 'rgba(167,139,250,0.06)' }}
                >
                  <FileText size={13} />
                  {selected.briefStatus === 'complete' ? 'View Brief (Complete)' : selected.briefStatus === 'draft' ? 'Edit Brief (Draft)' : 'Build Content Brief'}
                </button>
                <button
                  onClick={() => setEditItem({ ...selected })}
                  className="w-full py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: '#6ee7f7', color: '#6ee7f7', background: 'rgba(110,231,247,0.06)' }}
                >
                  Edit Item
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showAdd && <AddContentModal brands={brands} onClose={() => setShowAdd(false)} onSave={handleAdd} />}

      {briefItem && (
        <ContentBriefPanel
          item={briefItem}
          onClose={() => setBriefItemId(null)}
          onSaved={() => { refresh(); }}
          onGenerateInStudio={handleGenerateInStudio}
        />
      )}
    </div>
  );
}
