import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";

// Route-level code splitting: heavy application pages are loaded on demand
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const Support = lazy(() => import("./pages/Support"));
const Admin = lazy(() => import("./pages/admin"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
        <Route path="/leaderboard" component={Leaderboard} />
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
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
