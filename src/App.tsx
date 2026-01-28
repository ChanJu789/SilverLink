import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DuplicateLoginProvider } from "@/contexts/DuplicateLoginContext";
import { SessionExpiredProvider } from "@/contexts/SessionExpiredContext";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";


const queryClient = new QueryClient();
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ForgotId = lazy(() => import("./pages/auth/ForgotId"));

const GuardianDashboard = lazy(() => import("./pages/guardian/GuardianDashboard"));
const GuardianCalls = lazy(() => import("./pages/guardian/GuardianCalls"));
const GuardianCallDetail = lazy(() => import("./pages/guardian/GuardianCallDetail"));
const GuardianStats = lazy(() => import("./pages/guardian/GuardianStats"));
const GuardianWelfare = lazy(() => import("./pages/guardian/GuardianWelfare"));
const GuardianInquiry = lazy(() => import("./pages/guardian/GuardianInquiry"));
const GuardianComplaint = lazy(() => import("./pages/guardian/GuardianComplaint"));
const GuardianNotices = lazy(() => import("./pages/guardian/GuardianNotices"));
const GuardianProfile = lazy(() => import("./pages/guardian/GuardianProfile"));

const CounselorDashboard = lazy(() => import("./pages/counselor/CounselorDashboard"));
const SeniorList = lazy(() => import("./pages/counselor/SeniorList"));
const SeniorDetail = lazy(() => import("./pages/counselor/SeniorDetail"));
const CounselorAlerts = lazy(() => import("./pages/counselor/CounselorAlerts"));
const CounselorRecords = lazy(() => import("./pages/counselor/CounselorRecords"));
const CounselorNotices = lazy(() => import("./pages/counselor/CounselorNotices"));
const CounselorInquiries = lazy(() => import("./pages/counselor/CounselorInquiries"));
const CounselorCalls = lazy(() => import("./pages/counselor/CounselorCalls"));
const CounselorCallDetail = lazy(() => import("./pages/counselor/CounselorCallDetail"));
const CounselorSensitiveInfo = lazy(() => import("./pages/counselor/CounselorSensitiveInfo"));
const CounselorProfile = lazy(() => import("./pages/counselor/CounselorProfile"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const MemberManagement = lazy(() => import("./pages/admin/MemberManagement"));
const AssignmentManagement = lazy(() => import("./pages/admin/AssignmentManagement"));
const AIStats = lazy(() => import("./pages/admin/AIStats"));
const ComplaintManagement = lazy(() => import("./pages/admin/ComplaintManagement"));
const SystemSettings = lazy(() => import("./pages/admin/SystemSettings"));
const NoticeManagement = lazy(() => import("./pages/admin/NoticeManagement"));
const SensitiveInfoManagement = lazy(() => import("./pages/admin/SensitiveInfoManagement"));
const MemberRegistration = lazy(() => import("./pages/admin/MemberRegistration"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const PolicyManagement = lazy(() => import("./pages/admin/PolicyManagement"));

const FAQPage = lazy(() => import("./pages/faq/FAQPage"));

const SeniorDashboard = lazy(() => import("./pages/senior/SeniorDashboard"));
const SeniorLogin = lazy(() => import("./pages/senior/SeniorLogin"));
const SeniorOCR = lazy(() => import("./pages/senior/SeniorOCR"));
const SeniorHealth = lazy(() => import("./pages/senior/SeniorHealth"));
const SeniorMedication = lazy(() => import("./pages/senior/SeniorMedication"));
const SeniorNotices = lazy(() => import("./pages/senior/SeniorNotices"));
const SeniorFAQ = lazy(() => import("./pages/senior/SeniorFAQ"));
const SeniorProfile = lazy(() => import("./pages/senior/SeniorProfile"));
const SeniorBiometric = lazy(() => import("./pages/senior/SeniorBiometric"));

const NotFound = lazy(() => import("./pages/NotFound"));


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DuplicateLoginProvider>
        <SessionExpiredProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/forgot-id" element={<ForgotId />} />
                  {/* Guardian Routes */}
                  <Route path="/guardian" element={<GuardianDashboard />} />
                  <Route path="/guardian/calls" element={<GuardianCalls />} />
                  <Route path="/guardian/calls/:id" element={<GuardianCallDetail />} />
                  <Route path="/guardian/stats" element={<GuardianStats />} />
                  <Route path="/guardian/welfare" element={<GuardianWelfare />} />
                  <Route path="/guardian/inquiry" element={<GuardianInquiry />} />
                  <Route path="/guardian/complaint" element={<GuardianComplaint />} />
                  <Route path="/guardian/notices" element={<GuardianNotices />} />
                  <Route path="/guardian/profile" element={<GuardianProfile />} />
                  <Route path="/guardian/faq" element={<FAQPage />} />
                  {/* Counselor Routes */}
                  <Route path="/counselor" element={<CounselorDashboard />} />
                  <Route path="/counselor/seniors" element={<SeniorList />} />
                  <Route path="/counselor/seniors/:id" element={<SeniorDetail />} />
                  <Route path="/counselor/calls" element={<CounselorCalls />} />
                  <Route path="/counselor/calls/:id" element={<CounselorCallDetail />} />
                  <Route path="/counselor/records" element={<CounselorRecords />} />
                  <Route path="/counselor/inquiries" element={<CounselorInquiries />} />
                  <Route path="/counselor/alerts" element={<CounselorAlerts />} />
                  <Route path="/counselor/notices" element={<CounselorNotices />} />
                  <Route path="/counselor/sensitive-info" element={<CounselorSensitiveInfo />} />
                  <Route path="/counselor/profile" element={<CounselorProfile />} />
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/members" element={<MemberManagement />} />
                  <Route path="/admin/assignments" element={<AssignmentManagement />} />
                  <Route path="/admin/ai-stats" element={<AIStats />} />
                  <Route path="/admin/complaints" element={<ComplaintManagement />} />
                  <Route path="/admin/sensitive-info" element={<SensitiveInfoManagement />} />
                  <Route path="/admin/notices" element={<NoticeManagement />} />
                  <Route path="/admin/policies" element={<PolicyManagement />} />
                  <Route path="/admin/settings" element={<SystemSettings />} />
                  <Route path="/admin/register" element={<MemberRegistration />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                  {/* Senior Routes */}
                  <Route path="/senior" element={<SeniorDashboard />} />
                  <Route path="/senior/login" element={<SeniorLogin />} />
                  <Route path="/senior/ocr" element={<SeniorOCR />} />
                  <Route path="/senior/health" element={<SeniorHealth />} />
                  <Route path="/senior/medication" element={<SeniorMedication />} />
                  <Route path="/senior/notices" element={<SeniorNotices />} />
                  <Route path="/senior/faq" element={<SeniorFAQ />} />
                  <Route path="/senior/profile" element={<SeniorProfile />} />
                  <Route path="/senior/biometric" element={<SeniorBiometric />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </SessionExpiredProvider>
      </DuplicateLoginProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

