// Competitor Gap Tracker — Track content opportunities from competitor analysis
import { useState } from "react";
import { store, type CompetitorGap, type Priority } from "@/lib/store";
import { priorityBadgeClass } from "@/lib/utils";
import { Plus, X, Target, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";

function AddGapModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (g: Omit<CompetitorGap, 'id' | 'createdAt'>) => void;
}) {
  const [form, setForm] = useState({
    competitorUrl: '',
    topic: '',
    priority: 'Medium' as Priority,
    status: 'Open' as CompetitorGap['status'],
    notes: '',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-xl border p-6" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>Add Content Gap</h2>
          <button onClick={onClose}><X size={18} style={{ color: '#64748b' }} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Competitor URL</label>
            <input value={form.competitorUrl} onChange={e => setForm(f => ({ ...f, competitorUrl: e.target.value }))}
              placeholder="https://competitor.com/their-post"
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Topic / Keyword Gap *</label>
            <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              placeholder="What topic are they covering that you're not?"
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }}>
                {['High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as CompetitorGap['status'] }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }}>
                {['Open', 'In Progress', 'Covered'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: '#2d3748', color: '#64748b' }}>Cancel</button>
          <button onClick={() => {
            if (!form.topic.trim()) { toast.error('Topic is required'); return; }
            onSave(form);
            onClose();
          }} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: '#6ee7f7', color: '#0f1117' }}>
            Add Gap
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompetitorGapsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<CompetitorGap['status'] | ''>('');
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const gaps = store.getGaps();
  const filtered = filterStatus ? gaps.filter(g => g.status === filterStatus) : gaps;

  const stats = {
    open: gaps.filter(g => g.status === 'Open').length,
    inProgress: gaps.filter(g => g.status === 'In Progress').length,
    covered: gaps.filter(g => g.status === 'Covered').length,
  };

  const handleAdd = (g: Omit<CompetitorGap, 'id' | 'createdAt'>) => {
    store.addGap(g);
    toast.success('Gap added');
    refresh();
  };

  const handleStatusChange = (id: string, status: CompetitorGap['status']) => {
    store.updateGap(id, { status });
    toast.success(`Marked as ${status}`);
    refresh();
  };

  const handleDelete = (id: string) => {
    store.deleteGap(id);
    toast.success('Deleted');
    refresh();
  };

  const STATUS_COLORS: Record<CompetitorGap['status'], string> = {
    Open: '#f87171',
    'In Progress': '#fbbf24',
    Covered: '#34d399',
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>Competitor Gap Tracker</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Track content opportunities from competitor analysis</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#6ee7f7', color: '#0f1117' }}>
          <Plus size={15} /> Add Gap
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open Gaps', value: stats.open, color: '#f87171' },
          { label: 'In Progress', value: stats.inProgress, color: '#fbbf24' },
          { label: 'Covered', value: stats.covered, color: '#34d399' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-4 text-center" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
            <p className="text-2xl font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['', 'Open', 'In Progress', 'Covered'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={filterStatus === s
              ? { background: 'rgba(110,231,247,0.15)', color: '#6ee7f7', border: '1px solid rgba(110,231,247,0.3)' }
              : { background: 'transparent', color: '#64748b', border: '1px solid #2d3748' }
            }>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Gaps list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
          <Target size={32} className="mx-auto mb-3" style={{ color: '#2d3748' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>No gaps found. Add your first competitor content gap.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(gap => (
            <div key={gap.id} className="rounded-xl border p-4 card-hover" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: STATUS_COLORS[gap.status] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadgeClass(gap.priority)}`}>{gap.priority}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${STATUS_COLORS[gap.status]}18`, color: STATUS_COLORS[gap.status] }}>
                      {gap.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#e2e8f0' }}>{gap.topic}</p>
                  {gap.competitorUrl && (
                    <a href={gap.competitorUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs mb-1" style={{ color: '#64748b' }}>
                      <ExternalLink size={10} />
                      <span className="truncate max-w-xs">{gap.competitorUrl}</span>
                    </a>
                  )}
                  {gap.notes && <p className="text-xs" style={{ color: '#94a3b8' }}>{gap.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select value={gap.status}
                    onChange={e => handleStatusChange(gap.id, e.target.value as CompetitorGap['status'])}
                    className="px-2 py-1 rounded-lg text-xs border outline-none"
                    style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }}>
                    {['Open', 'In Progress', 'Covered'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => handleDelete(gap.id)} className="p-1 rounded hover:bg-red-500/10">
                    <Trash2 size={13} style={{ color: '#64748b' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddGapModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
    </div>
  );
}
