// Content Calendar — Schedule and manage publishing
import { useState, useMemo } from "react";
import { store, type CalendarEvent, type Platform } from "@/lib/store";
import { formatDate, PLATFORMS } from "@/lib/utils";
import { Plus, X, CalendarDays, CheckCircle2, Clock, Globe } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";

const PLATFORM_COLORS: Record<Platform, string> = {
  'Google Business Profile': '#34d399',
  'Blog': '#6ee7f7',
  'Instagram': '#a78bfa',
  'Facebook': '#60a5fa',
  'LinkedIn': '#38bdf8',
  'YouTube': '#f87171',
  'Email': '#fbbf24',
};

function AddEventModal({ content, onClose, onSave }: {
  content: ReturnType<typeof store.getContent>;
  onClose: () => void;
  onSave: (e: Omit<CalendarEvent, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    contentId: content[0]?.id ?? '',
    platform: 'Blog' as Platform,
    publishDate: new Date().toISOString().split('T')[0],
    approvalStatus: 'Pending' as CalendarEvent['approvalStatus'],
    generatedCopy: '',
    publishedUrl: '',
    autoPublish: false,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-xl border p-6" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>Schedule Content</h2>
          <button onClick={onClose}><X size={18} style={{ color: '#64748b' }} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Content Item</label>
            <select value={form.contentId} onChange={e => setForm(f => ({ ...f, contentId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }}>
              {content.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Platform</label>
            <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }}>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Publish Date</label>
            <input type="date" value={form.publishDate} onChange={e => setForm(f => ({ ...f, publishDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Approval Status</label>
            <select value={form.approvalStatus} onChange={e => setForm(f => ({ ...f, approvalStatus: e.target.value as CalendarEvent['approvalStatus'] }))}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }}>
              {['Pending','Reviewed','Approved','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Generated Copy (optional)</label>
            <textarea value={form.generatedCopy} onChange={e => setForm(f => ({ ...f, generatedCopy: e.target.value }))}
              rows={3} className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ background: '#252d3d', borderColor: '#2d3748', color: '#e2e8f0' }} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.autoPublish} onChange={e => setForm(f => ({ ...f, autoPublish: e.target.checked }))}
              className="rounded" />
            <span className="text-sm" style={{ color: '#94a3b8' }}>Auto-publish when approved (GBP)</span>
          </label>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: '#2d3748', color: '#64748b' }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: '#6ee7f7', color: '#0f1117' }}>
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const events = store.getCalendar();
  const content = store.getContent();
  const brands = store.getBrands();

  const contentTitle = (id: string) => content.find(c => c.id === id)?.title ?? id;
  const brandName = (contentId: string) => {
    const item = content.find(c => c.id === contentId);
    return brands.find(b => b.id === item?.brandId)?.name ?? '';
  };

  const grouped = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(e => {
      const key = e.publishDate.split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  const handleSave = (e: Omit<CalendarEvent, 'id'>) => {
    store.addCalendarEvent(e);
    toast.success('Event scheduled');
    refresh();
  };

  const handleApprove = (id: string) => {
    store.updateCalendarEvent(id, { approvalStatus: 'Approved' });
    toast.success('Approved');
    refresh();
  };

  const handleApproveAndSchedule = (event: CalendarEvent) => {
    // Approve the calendar event
    store.updateCalendarEvent(event.id, { approvalStatus: 'Approved' });
    // Also advance the linked content item to 'Scheduled' if it isn't already published
    if (event.contentId) {
      const item = store.getContent().find(c => c.id === event.contentId);
      if (item && !['Scheduled', 'Published'].includes(item.status)) {
        store.updateContent(event.contentId, { status: 'Scheduled' });
      }
    }
    toast.success('Approved & moved to Scheduled in Pipeline');
    refresh();
  };

  const handleDelete = (id: string) => {
    store.deleteCalendarEvent(id);
    toast.success('Removed');
    refresh();
  };

  const stats = useMemo(() => ({
    total: events.length,
    approved: events.filter(e => e.approvalStatus === 'Approved').length,
    pending: events.filter(e => e.approvalStatus === 'Pending').length,
    autoPublish: events.filter(e => e.autoPublish).length,
  }), [events]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>Content Calendar</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Schedule and approve content for publishing</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#6ee7f7', color: '#0f1117' }}>
          <Plus size={15} /> Schedule Content
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Scheduled', value: stats.total, icon: CalendarDays, color: '#6ee7f7' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: '#34d399' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#fbbf24' },
          { label: 'Auto-Publish', value: stats.autoPublish, icon: Globe, color: '#a78bfa' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs" style={{ color: '#64748b' }}>{label}</p>
              <Icon size={14} style={{ color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Calendar list */}
      {grouped.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
          <CalendarDays size={32} className="mx-auto mb-3" style={{ color: '#2d3748' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>No events scheduled yet. Click "Schedule Content" to add your first event.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, dayEvents]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold" style={{ color: '#6ee7f7', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formatDate(date)}
                </span>
                <div className="flex-1 h-px" style={{ background: '#2d3748' }} />
              </div>
              <div className="space-y-2">
                {dayEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-4 rounded-xl border p-4"
                    style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: PLATFORM_COLORS[event.platform] ?? '#64748b' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${PLATFORM_COLORS[event.platform] ?? '#64748b'}18`, color: PLATFORM_COLORS[event.platform] ?? '#64748b' }}>
                          {event.platform}
                        </span>
                        <span className="text-xs" style={{ color: '#64748b' }}>{brandName(event.contentId)}</span>
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: '#e2e8f0' }}>{contentTitle(event.contentId)}</p>
                      {event.generatedCopy && (
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: '#94a3b8' }}>{event.generatedCopy}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        event.approvalStatus === 'Approved' ? 'badge-approved' :
                        event.approvalStatus === 'Rejected' ? 'badge-high' : 'badge-briefing'
                      }`}>{event.approvalStatus}</span>
                      {event.approvalStatus === 'Pending' && (
                        <button
                          onClick={() => handleApproveAndSchedule(event)}
                          className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-all hover:brightness-110"
                          style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
                          title="Approve this event and move the Pipeline item to Scheduled"
                        >
                          <CheckCircle2 size={11} />
                          Approve &amp; Schedule
                        </button>
                      )}
                      {event.approvalStatus === 'Approved' && (
                        <span className="text-xs px-2 py-1 rounded-lg flex items-center gap-1" style={{ background: 'rgba(110,231,247,0.08)', color: '#6ee7f7', border: '1px solid rgba(110,231,247,0.2)' }}>
                          <CalendarDays size={11} />
                          Scheduled
                        </span>
                      )}
                      <button onClick={() => handleDelete(event.id)} className="p-1 rounded hover:bg-red-500/10">
                        <X size={13} style={{ color: '#64748b' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddEventModal content={content} onClose={() => setShowAdd(false)} onSave={handleSave} />}
    </div>
  );
}
