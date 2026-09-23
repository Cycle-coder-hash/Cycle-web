import { Suspense } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";
import Home from "./pages/Home";
import { safeLazy } from "./lib/lazyWithRetry";

// Route-level code splitting: heavy application pages are loaded on demand with automatic stale-chunk recovery
const Dashboard = safeLazy(() => import("./pages/Dashboard"));
const Checkout = safeLazy(() => import("./pages/Checkout"));
const Auth = safeLazy(() => import("./pages/Auth"));
const Support = safeLazy(() => import("./pages/Support"));
const Admin = safeLazy(() => import("./pages/admin"));
const Leaderboard = safeLazy(() => import("./pages/Leaderboard"));
const Settings = safeLazy(() => import("./pages/Settings"));
const NotFound = safeLazy(() => import("./pages/NotFound"));

import { FloatingSupportButton } from "./components/FloatingSupportButton";
import { StudentTelegramAccessModal } from "./components/StudentTelegramAccessModal";
import { CursorLightTrail } from "./components/CursorLightTrail";
import { GlobalPreloader } from "./components/GlobalPreloader";
import { WebsiteBackground } from "./components/WebsiteBackground";

function PageFallback() {
  return <div className="min-h-screen bg-[#020813]" />;
}

function StoreRedirect() {
  if (typeof window !== "undefined") {
    window.location.replace("/#store");
  }
  return <PageFallback />;
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/store" component={StoreRedirect} />
        <Route path="/login" component={Auth} />
        <Route path="/register" component={Auth} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/discipline" component={Dashboard} />
        <Route path="/calculator" component={Dashboard} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/settings" component={Settings} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/support" component={Support} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <UserPreferencesProvider>
            <TooltipProvider>
              <GlobalPreloader />
              <WebsiteBackground />
              <div className="relative z-10">
                <Toaster position="top-right" richColors />
                <Router />
                <FloatingSupportButton />
                <StudentTelegramAccessModal />
                <CursorLightTrail />
              </div>
            </TooltipProvider>
          </UserPreferencesProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
