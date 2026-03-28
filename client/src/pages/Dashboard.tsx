// Dashboard — Command Center
// Design: MJW Dark Studio — metric cards, pipeline health, recent activity
import { useMemo } from "react";
import { useLocation } from "wouter";
import { store } from "@/lib/store";
import { formatDate, statusBadgeClass, brandClass } from "@/lib/utils";
import {
  FileText, CheckCircle2, Clock, Target, TrendingUp,
  ArrowRight, Sparkles, BarChart3
} from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/3MeSGugCZeowAaENeGLcBo/hero-bg-X4BNiberjJQWiAnXwPFMEB.webp";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const content = store.getContent();
  const brands = store.getBrands();
  const gaps = store.getGaps();

  const metrics = useMemo(() => {
    const active = content.filter(c => !['Published', 'Backlog'].includes(c.status)).length;
    const published = content.filter(c => c.status === 'Published').length;
    const pendingApproval = content.filter(c => c.approvalStatus === 'Pending' && c.status !== 'Backlog').length;
    const openGaps = gaps.filter(g => g.status === 'Open').length;
    const totalTraffic = content.reduce((sum, c) => sum + (c.trafficMonthly || 0), 0);
    const totalConversions = content.reduce((sum, c) => sum + (c.conversions || 0), 0);
    return { active, published, pendingApproval, openGaps, totalTraffic, totalConversions };
  }, [content, gaps]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    content.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, [content]);

  const recentItems = useMemo(() =>
    [...content].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6),
    [content]
  );

  const brandName = (id: string) => brands.find(b => b.id === id)?.name ?? id;

  return (
    <div className="p-6 space-y-6">
      {/* Hero Banner */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ minHeight: 160, background: '#1a1f2e' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="relative z-10 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Marketing Content OS
            </h1>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Your AI-powered content pipeline — from idea to published.
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-studio')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, #6ee7f7 0%, #a78bfa 100%)', color: '#0f1117' }}
          >
            <Sparkles size={15} />
            Open AI Studio
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Items', value: metrics.active, icon: FileText, color: '#6ee7f7', sub: 'In progress' },
          { label: 'Published', value: metrics.published, icon: CheckCircle2, color: '#34d399', sub: 'All time' },
          { label: 'Pending Approval', value: metrics.pendingApproval, icon: Clock, color: '#fbbf24', sub: 'Need review' },
          { label: 'Content Gaps', value: metrics.openGaps, icon: Target, color: '#f87171', sub: 'Open gaps' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div
            key={label}
            className="rounded-xl p-5 border card-hover"
            style={{ background: '#1a1f2e', borderColor: '#2d3748' }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: '#64748b' }}>{label}</p>
              <div className="p-1.5 rounded-lg" style={{ background: `${color}18` }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column: Pipeline Health + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Health */}
        <div className="rounded-xl border p-5" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>
              Pipeline Health
            </h2>
            <button onClick={() => navigate('/kanban')} className="flex items-center gap-1 text-xs" style={{ color: '#6ee7f7' }}>
              View Kanban <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {['Backlog','Briefing','Drafting','Editing','Approved','Scheduled','Published'].map(status => {
              const count = statusCounts[status] || 0;
              const total = content.length || 1;
              const pct = Math.round((count / total) * 100);
              const colors: Record<string, string> = {
                Backlog: '#64748b', Briefing: '#fbbf24', Drafting: '#6ee7f7',
                Editing: '#a78bfa', Approved: '#34d399', Scheduled: '#fb923c', Published: '#6ee7b7'
              };
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs w-20 shrink-0" style={{ color: '#94a3b8' }}>{status}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2d3748' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: colors[status] }}
                    />
                  </div>
                  <span className="text-xs w-6 text-right shrink-0" style={{ color: '#64748b' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="rounded-xl border p-5" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>
              Performance Summary
            </h2>
            <BarChart3 size={14} style={{ color: '#64748b' }} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg p-3" style={{ background: '#252d3d' }}>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>Monthly Traffic</p>
              <p className="text-2xl font-bold" style={{ color: '#6ee7f7', fontFamily: "'Space Grotesk', sans-serif" }}>
                {metrics.totalTraffic.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: '#252d3d' }}>
              <p className="text-xs mb-1" style={{ color: '#64748b' }}>Conversions</p>
              <p className="text-2xl font-bold" style={{ color: '#34d399', fontFamily: "'Space Grotesk', sans-serif" }}>
                {metrics.totalConversions}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {brands.map(brand => {
              const brandContent = content.filter(c => c.brandId === brand.id && c.status === 'Published');
              const traffic = brandContent.reduce((s, c) => s + (c.trafficMonthly || 0), 0);
              return (
                <div key={brand.id} className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${brandClass(brand.id)}`}>
                    {brand.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={12} style={{ color: '#34d399' }} />
                    <span className="text-xs" style={{ color: '#94a3b8' }}>{traffic.toLocaleString()} visits/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2d3748' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>
            Recent Activity
          </h2>
          <button onClick={() => navigate('/pipeline')} className="flex items-center gap-1 text-xs" style={{ color: '#6ee7f7' }}>
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="divide-y" style={{ borderColor: '#2d3748' }}>
          {recentItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => navigate('/pipeline')}>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusBadgeClass(item.status)}`}>
                {item.status}
              </span>
              <span className="flex-1 text-sm truncate" style={{ color: '#e2e8f0' }}>{item.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${brandClass(item.brandId)}`}>
                {brandName(item.brandId)}
              </span>
              <span className="text-xs shrink-0" style={{ color: '#64748b' }}>{formatDate(item.updatedAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
