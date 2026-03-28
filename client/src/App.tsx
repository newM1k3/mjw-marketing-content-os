import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AppShell from "./components/AppShell";
import DashboardPage from "./pages/Dashboard";
import PipelinePage from "./pages/Pipeline";
import KanbanPage from "./pages/Kanban";
import CalendarPage from "./pages/Calendar";
import AIStudioPage from "./pages/AIStudio";
import CompetitorGapsPage from "./pages/CompetitorGaps";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/pipeline" component={PipelinePage} />
        <Route path="/kanban" component={KanbanPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/ai-studio" component={AIStudioPage} />
        <Route path="/competitor-gaps" component={CompetitorGapsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
