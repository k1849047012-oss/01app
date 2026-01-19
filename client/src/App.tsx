import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSupabaseAuth } from "@/lib/supabase-hooks";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Matches from "@/pages/Matches";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import AddPhotos from "@/pages/AddPhotos";
import EditProfile from "@/pages/EditProfile";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Entertainment from "@/pages/Entertainment";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Discover from "@/pages/Discover";
import Together from "@/pages/Together";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      <Route path="/matches" component={Matches} />
      <Route path="/discover" component={Discover} />
      <Route path="/together" component={Together} />
      <Route path="/chat/:id" component={Chat} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/edit" component={EditProfile} />
      <Route path="/settings" component={Settings} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/profile/photos" component={AddPhotos} />
      <Route path="/entertainment" component={Entertainment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 overflow-x-hidden">
          <div className="w-full max-w-[420px] h-screen bg-white shadow-2xl overflow-hidden flex flex-col relative">
            <Router />
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
