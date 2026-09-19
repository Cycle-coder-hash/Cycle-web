import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Support from "./pages/Support";
import Admin from "./pages/Admin";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import { FloatingSupportButton } from "./components/FloatingSupportButton";
import { CursorLightTrail } from "./components/CursorLightTrail";
import { GlobalPreloader } from "./components/GlobalPreloader";
import { WebsiteBackground } from "./components/WebsiteBackground";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <GlobalPreloader />
          <WebsiteBackground />
          <div className="relative z-10">
            <Toaster position="top-right" richColors />
            <Router />
            <FloatingSupportButton />
            <CursorLightTrail />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
