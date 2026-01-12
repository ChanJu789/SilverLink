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
import GuardianInquiry from "./pages/guardian/GuardianInquiry";
import GuardianComplaint from "./pages/guardian/GuardianComplaint";
import GuardianNotices from "./pages/guardian/GuardianNotices";
import CounselorDashboard from "./pages/counselor/CounselorDashboard";
import SeniorList from "./pages/counselor/SeniorList";
import SeniorDetail from "./pages/counselor/SeniorDetail";
import CounselorAlerts from "./pages/counselor/CounselorAlerts";
import CounselorRecords from "./pages/counselor/CounselorRecords";
import CounselorNotices from "./pages/counselor/CounselorNotices";
import CounselorInquiries from "./pages/counselor/CounselorInquiries";
import CounselorCalls from "./pages/counselor/CounselorCalls";
import CounselorSensitiveInfo from "./pages/counselor/CounselorSensitiveInfo";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MemberManagement from "./pages/admin/MemberManagement";
import AssignmentManagement from "./pages/admin/AssignmentManagement";
import AIStats from "./pages/admin/AIStats";
import ComplaintManagement from "./pages/admin/ComplaintManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import NoticeManagement from "./pages/admin/NoticeManagement";
import SensitiveInfoManagement from "./pages/admin/SensitiveInfoManagement";
import MemberRegistration from "./pages/admin/MemberRegistration";
import FAQPage from "./pages/faq/FAQPage";
import SeniorDashboard from "./pages/senior/SeniorDashboard";
import SeniorOCR from "./pages/senior/SeniorOCR";
import SeniorHealth from "./pages/senior/SeniorHealth";
import SeniorNotices from "./pages/senior/SeniorNotices";
import SeniorFAQ from "./pages/senior/SeniorFAQ";
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
          {/* Guardian Routes */}
          <Route path="/guardian" element={<GuardianDashboard />} />
          <Route path="/guardian/calls" element={<GuardianCalls />} />
          <Route path="/guardian/calls/:id" element={<GuardianCallDetail />} />
          <Route path="/guardian/stats" element={<GuardianStats />} />
          <Route path="/guardian/welfare" element={<GuardianWelfare />} />
          <Route path="/guardian/inquiry" element={<GuardianInquiry />} />
          <Route path="/guardian/complaint" element={<GuardianComplaint />} />
          <Route path="/guardian/notices" element={<GuardianNotices />} />
          <Route path="/guardian/faq" element={<FAQPage />} />
          {/* Counselor Routes */}
          <Route path="/counselor" element={<CounselorDashboard />} />
          <Route path="/counselor/seniors" element={<SeniorList />} />
          <Route path="/counselor/seniors/:id" element={<SeniorDetail />} />
          <Route path="/counselor/calls" element={<CounselorCalls />} />
          <Route path="/counselor/records" element={<CounselorRecords />} />
          <Route path="/counselor/inquiries" element={<CounselorInquiries />} />
          <Route path="/counselor/alerts" element={<CounselorAlerts />} />
          <Route path="/counselor/notices" element={<CounselorNotices />} />
          <Route path="/counselor/sensitive-info" element={<CounselorSensitiveInfo />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/members" element={<MemberManagement />} />
          <Route path="/admin/assignments" element={<AssignmentManagement />} />
          <Route path="/admin/ai-stats" element={<AIStats />} />
          <Route path="/admin/complaints" element={<ComplaintManagement />} />
          <Route path="/admin/sensitive-info" element={<SensitiveInfoManagement />} />
          <Route path="/admin/notices" element={<NoticeManagement />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="/admin/register" element={<MemberRegistration />} />
          {/* Senior Routes */}
          <Route path="/senior" element={<SeniorDashboard />} />
          <Route path="/senior/ocr" element={<SeniorOCR />} />
          <Route path="/senior/health" element={<SeniorHealth />} />
          <Route path="/senior/notices" element={<SeniorNotices />} />
          <Route path="/senior/faq" element={<SeniorFAQ />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
