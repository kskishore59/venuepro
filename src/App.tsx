import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Lazy load pages for premium modularized bundling and lazy loading experience
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Bookings = lazy(() => import('./pages/Bookings').then(m => ({ default: m.Bookings })));
const Leads = lazy(() => import('./pages/Leads').then(m => ({ default: m.Leads })));
const Customers = lazy(() => import('./pages/Customers').then(m => ({ default: m.Customers })));
const Payments = lazy(() => import('./pages/Payments').then(m => ({ default: m.Payments })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Venues = lazy(() => import('./pages/Venues').then(m => ({ default: m.Venues })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const SignUp = lazy(() => import('./pages/SignUp').then(m => ({ default: m.SignUp })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsConditions = lazy(() => import('./pages/TermsConditions').then(m => ({ default: m.TermsConditions })));
const SuperAdmin = lazy(() => import('./pages/SuperAdmin').then(m => ({ default: m.SuperAdmin })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DesignSystem = lazy(() => import('./pages/DesignSystem').then(m => ({ default: m.DesignSystem })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// New high fidelity modular pages from VenueOS specifications
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const Quotations = lazy(() => import('./pages/Quotations').then(m => ({ default: m.Quotations })));
const Operations = lazy(() => import('./pages/Operations').then(m => ({ default: m.Operations })));
const Vendors = lazy(() => import('./pages/Vendors').then(m => ({ default: m.Vendors })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // Keep cache for 15 minutes to prevent empty skeletons on back navigation
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Only fetch on mount if data is stale/missing
      retry: 1,
    },
  },
});


// High-Fidelity Global Loader overlay with premium branding and micro-animations
const GlobalLoader = () => (
  <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
    <div className="relative w-16 h-16">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 rounded-full border-4 border-[#107ed8]/20 border-t-[#107ed8] animate-spin" />
      {/* Pulsing overlay */}
      <div className="absolute inset-3 bg-[#107ed8]/10 rounded-full animate-ping" />
      {/* Core branded dot */}
      <div className="absolute inset-5 bg-[#107ed8] rounded-full shadow-[0_0_12px_rgba(27,79,138,0.4)]" />
    </div>
    <h3 className="mt-6 text-lg font-bold text-gray-900 tracking-wider font-sans">VENUEPRO</h3>
    <p className="text-sm text-gray-500 mt-1 font-medium animate-pulse">Setting up your workspace...</p>
  </div>
);

const SuperAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  if (!profile || (profile.role as string) !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    const savedFont = localStorage.getItem('venuepro-brand-font') || "'Outfit', 'Inter', sans-serif";
    const savedPrimary = localStorage.getItem('venuepro-brand-primary') || "211 67% 32%";
    const savedAccent = localStorage.getItem('venuepro-brand-accent') || "221 83% 53%";
    
    document.documentElement.style.setProperty('--global-font', savedFont);
    document.documentElement.style.setProperty('--primary', savedPrimary);
    document.documentElement.style.setProperty('--accent', savedAccent);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Suspense fallback={<GlobalLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/" element={<LandingPage />} />
              
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/venues" element={<Venues />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/operations" element={<Operations />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/super-admin" element={<SuperAdminGuard><SuperAdmin /></SuperAdminGuard>} />
                <Route path="/design-system" element={<DesignSystem />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
