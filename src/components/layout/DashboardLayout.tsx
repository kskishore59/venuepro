import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Menu, Home, Calendar, Users, Building, X, Bell, User, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { useSubscription } from '../../hooks/useSubscription';

export const DashboardLayout: React.FC = () => {
  const { user, loading, profile } = useAuth();
  const { subInfo } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component with responsive styling */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 md:static md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar collapsed={false} onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header Navigation - compact and premium */}
        <header className="h-14 md:h-16 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-30">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors md:hidden focus:outline-none"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Professional compact logo inside the top bar on mobile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <span className="font-extrabold text-white text-sm tracking-tighter">VP</span>
              </div>
              <span className="font-extrabold text-gray-900 tracking-tight text-sm md:text-base">VenuePro</span>
            </div>
          </div>
          
          {/* Header Action Items */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors relative">
              <Bell className="w-4.5 h-4.5 md:w-5 md:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            
            <div className="h-8 w-px bg-gray-250 hidden md:block" />
            
            {/* User Profile Summary */}
            <div className="flex items-center space-x-2 pl-1">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-700 truncate max-w-[100px]">{profile?.full_name?.split(' ')[0]}</p>
                <p className="text-[10px] text-gray-400 font-semibold capitalize truncate max-w-[100px]">{profile?.role}</p>
              </div>
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
      </div>

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
  );
};
export default DashboardLayout;
