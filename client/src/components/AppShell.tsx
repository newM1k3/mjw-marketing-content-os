// AppShell — Dark Studio layout: fixed sidebar + top bar + main content
// Design: MJW dark theme, cyan active states, Space Grotesk headings
import { useLocation } from "wouter";
import {
  LayoutDashboard, List, Columns3, CalendarDays, Sparkles,
  Target, Settings, ChevronRight, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard",       href: "/",                icon: LayoutDashboard },
  { label: "Pipeline",        href: "/pipeline",        icon: List },
  { label: "Kanban",          href: "/kanban",          icon: Columns3 },
  { label: "Calendar",        href: "/calendar",        icon: CalendarDays },
  { label: "AI Studio",       href: "/ai-studio",       icon: Sparkles },
  { label: "Competitor Gaps", href: "/competitor-gaps", icon: Target },
  { label: "Settings",        href: "/settings",        icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [location, navigate] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1117' }}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="flex flex-col w-60 shrink-0 border-r"
        style={{ background: '#0c0f18', borderColor: '#1e2535' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: '#1e2535' }}>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6ee7f7 0%, #a78bfa 100%)' }}
          >
            <Zap size={16} className="text-black" />
          </div>
          <div>
            <p className="text-xs font-semibold leading-none" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>
              Content OS
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>MJW Design</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = location === href || (href !== '/' && location.startsWith(href));
            return (
              <button
                key={href}
                onClick={() => navigate(href)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                  isActive ? "nav-item-active" : "nav-item-inactive"
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span>{label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t" style={{ borderColor: '#1e2535' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #6ee7f7 0%, #a78bfa 100%)', color: '#0f1117' }}
            >
              MW
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#e2e8f0' }}>Mike Walling</p>
              <p className="text-xs truncate" style={{ color: '#64748b' }}>Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-3 border-b shrink-0"
          style={{ background: '#0f1117', borderColor: '#1e2535' }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
            <span>Marketing Content OS</span>
            <ChevronRight size={12} />
            <span style={{ color: '#e2e8f0' }}>
              {NAV_ITEMS.find(n => n.href === location || (n.href !== '/' && location.startsWith(n.href)))?.label ?? 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: 'rgba(110,231,247,0.1)', color: '#6ee7f7', border: '1px solid rgba(110,231,247,0.2)' }}
            >
              Beta v0.1
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#0f1117' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
