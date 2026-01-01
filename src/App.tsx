import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import GuardianDashboard from "./pages/guardian/GuardianDashboard";
import GuardianCalls from "./pages/guardian/GuardianCalls";
import GuardianCallDetail from "./pages/guardian/GuardianCallDetail";
import GuardianStats from "./pages/guardian/GuardianStats";
import GuardianWelfare from "./pages/guardian/GuardianWelfare";
import CounselorDashboard from "./pages/counselor/CounselorDashboard";
import SeniorList from "./pages/counselor/SeniorList";
import SeniorDetail from "./pages/counselor/SeniorDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/guardian" element={<GuardianDashboard />} />
          <Route path="/guardian/calls" element={<GuardianCalls />} />
          <Route path="/guardian/calls/:id" element={<GuardianCallDetail />} />
          <Route path="/guardian/stats" element={<GuardianStats />} />
          <Route path="/guardian/welfare" element={<GuardianWelfare />} />
          <Route path="/counselor" element={<CounselorDashboard />} />
          <Route path="/counselor/seniors" element={<SeniorList />} />
          <Route path="/counselor/seniors/:id" element={<SeniorDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
