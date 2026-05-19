import React from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, Building, Bell, AlertTriangle, ShieldAlert, Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '../ui/sidebar';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { useSubscription } from '../../hooks/useSubscription';

export const DashboardLayout: React.FC = () => {
  const { user, loading, profile } = useAuth();
  const { subInfo } = useSubscription();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500 animate-pulse">Loading VenuePro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Define compact mobile bottom tabs
  const bottomTabs = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Calendar, label: 'Calendar', path: '/bookings' },
    { icon: Building, label: 'Venues', path: '/venues' },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
        
        {/* Sidebar Component with responsive styling */}
        <Sidebar />
        
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Header Navigation - matches screenshot */}
          <header className="h-14 md:h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-35">
            <div className="flex items-center space-x-3 flex-1 text-left">
              {/* Sidebar trigger matching styling */}
              <SidebarTrigger className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors mr-2 focus:outline-none" />
              
              {/* Search Input matching screenshot */}
              <div className="hidden md:flex items-center bg-[#f8fafc] border border-slate-200 rounded-lg px-3 py-1.5 w-80">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search bookings, leads, customers..." 
                  className="bg-transparent border-none text-xs text-slate-600 focus:outline-none w-full placeholder-slate-400 font-semibold"
                />
              </div>
            </div>
            
            {/* Header Action Items */}
            <div className="flex items-center space-x-4">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg text-slate-500 transition-colors relative">
                <Bell className="w-4.5 h-4.5" />
              </button>
              
              {/* User Profile Summary */}
              <div className="flex items-center space-x-2 pl-1">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'KK'}
                </div>
                <span className="hidden sm:block text-xs font-bold text-slate-700">{profile?.full_name || 'Kishore K'}</span>
              </div>
            </div>
          </header>

          {/* Subscription Banners */}
          {subInfo.showWarning && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2.5 text-xs md:text-sm font-bold flex items-center justify-between shadow-md relative z-20 shrink-0">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                <span>
                  Trial Reminder: Your free trial ends in {subInfo.trialDaysLeft} days. Upgrade your plan now to prevent feature locks!
                </span>
              </div>
              <NavLink
                to="/settings"
                className="bg-white text-orange-700 hover:text-orange-800 px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 shadow-sm ml-4"
              >
                Upgrade Plan
              </NavLink>
            </div>
          )}

          {subInfo.isLocked && (
            <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-2.5 text-xs md:text-sm font-bold flex items-center justify-between shadow-md relative z-20 shrink-0">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  Account Locked: Your trial or subscription has expired. Please renew to add new bookings and leads.
                </span>
              </div>
              <NavLink
                to="/settings"
                className="bg-white text-red-700 hover:text-red-800 px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 shadow-sm ml-4"
              >
                Renew Plan
              </NavLink>
            </div>
          )}
          
          {/* Main Content Area - compact scroll offsets on mobile */}
          <main className="flex-1 overflow-y-auto p-3.5 md:p-6 lg:p-8 pb-24 md:pb-8 bg-gray-50/50">
            <Outlet />
          </main>
        </SidebarInset>

        {/* Premium Mobile App Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200/90 px-2 flex justify-around items-center z-45 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          {bottomTabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 relative",
                  isActive ? "text-primary scale-105" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {/* Micro-indicator above active icon */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-primary rounded-b-md" />
                )}
                <tab.icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold mt-1 tracking-tight">{tab.label}</span>
              </NavLink>
            );
          })}
        </div>

      </div>
    </SidebarProvider>
  );
};
export default DashboardLayout;
