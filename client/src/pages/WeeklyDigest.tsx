// Weekly Email Digest — compose, preview, and send/copy workflow
// Design: Dark Studio aesthetic, cyan/purple accents, card-based layout
import { useState, useMemo, useCallback } from "react";
import { store } from "@/lib/store";
import { Mail, Copy, CheckCircle2, Calendar, AlertTriangle, Clock, FileText, Send, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function getWeekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday
  const fmt = (d: Date) => d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  return { start, end, label: `${fmt(start)} – ${fmt(end)}` };
}

function getNextWeekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 8); // Next Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  return { start, end, label: `${fmt(start)} – ${fmt(end)}` };
}

export default function WeeklyDigest() {
  const [copied, setCopied] = useState(false);
  const [activeWeek, setActiveWeek] = useState<'this' | 'next'>('next');

  const content = store.getContent();
  const calendar = store.getCalendar();
  const brands = store.getBrands();

  const week = activeWeek === 'next' ? getNextWeekRange() : getWeekRange();

  // Items scheduled in the selected week
  const scheduled = useMemo(() => {
    return calendar.filter(ev => {
      if (!ev.publishDate) return false;
      const d = new Date(ev.publishDate);
      return d >= week.start && d <= week.end;
    }).sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
  }, [calendar, week]);

  // Pending approval
  const pendingApproval = useMemo(() =>
    content.filter(c => c.status === 'Approved' && !calendar.find(ev => ev.contentId === c.id && ev.approvalStatus === 'Approved' && ev.publishedUrl)),
    [content, calendar]
  );

  // Missing briefs on active items
  const missingBriefs = useMemo(() =>
    content.filter(c =>
      ['Briefing', 'Drafting', 'Editing'].includes(c.status) &&
      (!c.briefStatus || c.briefStatus === 'empty')
    ),
    [content]
  );

  // Build the digest text
  const digestText = useMemo(() => {
    const brandName = brands[0]?.name ?? 'Your Brand';
    const lines: string[] = [];

    lines.push(`📬 WEEKLY CONTENT DIGEST — ${week.label}`);
    lines.push(`${brandName} | Marketing Content OS`);
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');

    // Scheduled content
    lines.push(`📅 SCHEDULED THIS WEEK (${scheduled.length} items)`);
    lines.push('');
    if (scheduled.length === 0) {
      lines.push('  • No content scheduled for this period.');
    } else {
      scheduled.forEach(ev => {
        const item = content.find(c => c.id === ev.contentId);
        const d = new Date(ev.publishDate).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
        const evTitle = item?.title ?? ev.contentId;
        lines.push(`  • [${d}] ${evTitle} (${ev.platform}) — ${ev.approvalStatus}`);
        if (item?.targetKeyword) lines.push(`    Keyword: ${item.targetKeyword}`);
      });
    }

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');

    // Pending approval
    lines.push(`⏳ PENDING APPROVAL (${pendingApproval.length} items)`);
    lines.push('');
    if (pendingApproval.length === 0) {
      lines.push('  • No items awaiting approval. Great work!');
    } else {
      pendingApproval.forEach(item => {
        const b = brands.find(br => br.id === item.brandId);
        lines.push(`  • ${item.title} [${b?.name ?? item.brandId}] — ${item.type}`);
      });
    }

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');

    // Missing briefs
    lines.push(`⚠️  MISSING BRIEFS — ACTION REQUIRED (${missingBriefs.length} items)`);
    lines.push('');
    if (missingBriefs.length === 0) {
      lines.push('  • All active items have briefs. AI generation is ready to go!');
    } else {
      missingBriefs.forEach(item => {
        const b = brands.find(br => br.id === item.brandId);
        lines.push(`  • ${item.title} [${b?.name ?? item.brandId}] — currently in ${item.status}`);
      });
      lines.push('');
      lines.push('  → Open the Pipeline, click the brief dot on each item, and fill in');
      lines.push('    the audience, goal, tone, and headings before generating.');
    }

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push('📊 PIPELINE SNAPSHOT');
    lines.push('');
    const stages = ['Backlog', 'Briefing', 'Drafting', 'Editing', 'Approved', 'Scheduled', 'Published'];
    stages.forEach(stage => {
      const count = content.filter(c => c.status === stage).length;
      if (count > 0) lines.push(`  ${stage.padEnd(12)} ${count} item${count !== 1 ? 's' : ''}`);
    });

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push('Sent from Marketing Content OS by MJW Design');
    lines.push('https://mjwcontent-3mesgugc.manus.space');

    return lines.join('\n');
  }, [scheduled, pendingApproval, missingBriefs, content, brands, week]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(digestText).then(() => {
      setCopied(true);
      toast.success('Digest copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = digestText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      toast.success('Digest copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    });
  }, [digestText]);

  const handleMailto = useCallback(() => {
    const subject = encodeURIComponent(`Weekly Content Digest — ${week.label}`);
    const body = encodeURIComponent(digestText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success('Email client opened');
  }, [digestText, week.label]);

  return (
    <div className="flex flex-col h-full" style={{ background: '#0f1117' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b" style={{ borderColor: '#1e2433' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#e2e8f0' }}>
              Weekly Digest
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
              Auto-generated summary ready to copy or send
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Week selector */}
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: '#2d3748' }}>
              {(['this', 'next'] as const).map(w => (
                <button
                  key={w}
                  onClick={() => setActiveWeek(w)}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={activeWeek === w
                    ? { background: 'rgba(110,231,247,0.15)', color: '#6ee7f7' }
                    : { background: 'transparent', color: '#64748b' }}
                >
                  {w === 'this' ? 'This Week' : 'Next Week'}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={copied
                ? { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.35)' }
                : { background: 'rgba(110,231,247,0.1)', color: '#6ee7f7', border: '1px solid rgba(110,231,247,0.25)' }}
            >
              {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Digest'}
            </button>
            <button
              onClick={handleMailto}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}
            >
              <Send size={15} />
              Open in Email
            </button>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: '#475569' }}>
          Week of {week.label}
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Summary cards — left column */}
        <div className="w-72 flex-shrink-0 p-4 border-r overflow-y-auto" style={{ borderColor: '#1e2433' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#475569' }}>
            Digest Summary
          </p>

          {/* Scheduled */}
          <div className="rounded-xl p-4 mb-3 border" style={{ background: '#131929', borderColor: '#1e2433' }}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} style={{ color: '#6ee7f7' }} />
              <span className="text-xs font-semibold" style={{ color: '#6ee7f7' }}>Scheduled</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}>
              {scheduled.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>items this period</p>
          </div>

          {/* Pending Approval */}
          <div className="rounded-xl p-4 mb-3 border" style={{ background: '#131929', borderColor: '#1e2433' }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} style={{ color: '#fbbf24' }} />
              <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>Pending Approval</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}>
              {pendingApproval.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>need review</p>
          </div>

          {/* Missing Briefs */}
          <div className="rounded-xl p-4 mb-3 border" style={{
            background: missingBriefs.length > 0 ? 'rgba(239,68,68,0.05)' : '#131929',
            borderColor: missingBriefs.length > 0 ? 'rgba(239,68,68,0.25)' : '#1e2433'
          }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} style={{ color: missingBriefs.length > 0 ? '#f87171' : '#64748b' }} />
              <span className="text-xs font-semibold" style={{ color: missingBriefs.length > 0 ? '#f87171' : '#64748b' }}>
                Missing Briefs
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}>
              {missingBriefs.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>active items need briefs</p>
          </div>

          {/* Pipeline snapshot */}
          <div className="rounded-xl p-4 border" style={{ background: '#131929', borderColor: '#1e2433' }}>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} style={{ color: '#a78bfa' }} />
              <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>Pipeline Snapshot</span>
            </div>
            {['Backlog', 'Briefing', 'Drafting', 'Editing', 'Approved', 'Scheduled', 'Published'].map(stage => {
              const count = content.filter(c => c.status === stage).length;
              if (count === 0) return null;
              return (
                <div key={stage} className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: '#94a3b8' }}>{stage}</span>
                  <span className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digest preview — right pane */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
              <Mail size={14} className="inline mr-1.5" style={{ color: '#6ee7f7' }} />
              Digest Preview
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(110,231,247,0.1)', color: '#6ee7f7' }}>
              Plain text · ready to paste
            </span>
          </div>
          <div
            className="rounded-xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap border"
            style={{
              background: '#131929',
              borderColor: '#1e2433',
              color: '#cbd5e1',
              minHeight: '400px'
            }}
          >
            {digestText}
          </div>
          <p className="text-xs mt-3" style={{ color: '#475569' }}>
            Tip: Click "Copy Digest" to copy this text, then paste into Slack, email, or your team chat. Click "Open in Email" to launch your email client with this pre-filled.
          </p>
        </div>
      </div>
    </div>
  );
}
