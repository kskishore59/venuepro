import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronRight, RefreshCcw, Plus,
  TrendingUp
} from 'lucide-react';
import { format, isToday, subDays } from 'date-fns';
import { SEO } from '../components/ui/SEO';
import type { Booking } from '../types';

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 h-96" />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-96" />
    </div>
  </div>
);

// High-fidelity spring animations variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const Dashboard: React.FC = () => {
  const { organization, profile } = useAuth();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [showSetupBanner, setShowSetupBanner] = useState(true);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;

      const [bookingsRes, paymentsRes, leadsRes, venuesRes, hallsRes] = await Promise.all([
        supabase.from('bookings').select('*, halls(name, capacity), customers(name, phone)').eq('org_id', organization.id),
        supabase.from('bookings').select('balance_amount, event_date').eq('org_id', organization.id),
        supabase.from('leads').select('*').eq('org_id', organization.id),
        supabase.from('venues').select('*').eq('org_id', organization.id),
        supabase.from('halls').select('*').eq('org_id', organization.id)
      ]);

      return {
        bookings: (bookingsRes.data || []) as Booking[],
        pendingBookings: (paymentsRes.data || []) as { balance_amount: number, event_date: string }[],
        recentLeads: leadsRes.data || [],
        venuesCount: venuesRes.data?.length || 0,
        halls: hallsRes.data || []
      };
    },
    enabled: !!organization?.id
  });

  if (isLoading) return <DashboardSkeleton />;

  const now = new Date();
  let filterDateLimit = subDays(now, 30);
  if (dateRange === '7d') filterDateLimit = subDays(now, 7);

  // Dynamic Live Date Filtering for KPI Blocks
  const filteredBookings = (dashboardData?.bookings || []).filter(b => {
    if (dateRange === 'all') return true;
    return new Date(b.event_date) >= filterDateLimit;
  });


  // KPI Calculations
  const bookingsCount = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.advance_amount || 0), 0);
  const totalBalanceDue = filteredBookings.reduce((sum, b) => sum + ((b.total_amount || 0) - (b.advance_amount || 0)), 0);
  const activeLeadsCount = (dashboardData?.recentLeads || []).filter(l => l.status !== 'lost' && l.status !== 'converted').length;

  // Calculate Avg Event value
  const avgEventValue = bookingsCount ? Math.round(filteredBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookingsCount) : 0;

  // Calculate Conversion rate
  const totalLeads = dashboardData?.recentLeads.length || 0;
  const convertedLeads = (dashboardData?.recentLeads || []).filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const todaysEvents = (dashboardData?.bookings || []).filter(e => isToday(new Date(e.event_date))) || [];

  // Sort and filter upcoming bookings for agenda display
  const upcomingBookings = (dashboardData?.bookings || [])
    .filter(b => new Date(b.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);


  // Greeting based on time
  const hour = now.getHours();
  const greetingText = hour < 12 ? 'GOOD MORNING' : hour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const firstName = profile?.full_name?.split(' ')[0] || 'Kishore';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      <SEO
        title="Dashboard"
        description="Unified corporate multi-tenant command dashboard tracking live leads, invoice payments, and synchronized schedules."
      />

      {/* Dynamic Greetings matches screenshot */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase">{greetingText}</span>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight mt-0.5">{firstName}, here's your day.</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">A quiet command center for your venue operations.</p>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
            <CalendarDays className="w-4 h-4 text-gray-400 ml-1" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none pr-3 py-0.5 cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm"
            title="Refresh Dashboard"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <Link
            to="/bookings"
            className="px-4 py-2.5 bg-[#107ed8] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New booking
          </Link>
        </div>
      </div>

      {/* Setup helper blue banner matches screenshot */}
      {showSetupBanner && (
        <div className="bg-[#eff6ff] border border-blue-150 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
          <div>
            <h4 className="font-bold text-sm text-blue-900">Finish setting up your venue</h4>
            <p className="text-xs text-blue-700 mt-0.5">Pricing, policies, and halls power smarter quotes & conflict checks. Takes ~3 minutes.</p>
          </div>
          <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
            <button onClick={() => setShowSetupBanner(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
              Later
            </button>
            <Link to="/settings" className="px-4 py-2 bg-[#107ed8] hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
              Continue setup
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards Grid matches screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Today's Events */}
        <div className="bg-white p-4 rounded-xl border border-gray-250 shadow-sm flex flex-col justify-between h-32 text-left transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-primary/[0.01] hover:-translate-y-0.5 cursor-pointer group">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary transition-colors">Today's Events</p>
          <p className="text-xl md:text-4xl font-medium text-slate-900 mt-1">{todaysEvents.length}</p>
          <p className="text-[12px] text-slate-400 font-medium mt-1">
            {todaysEvents.length === 0 ? 'No events scheduled' : `${todaysEvents.length} scheduled`}
          </p>
        </div>

        {/* Active Leads */}
        <div className="bg-white p-4 rounded-xl border border-gray-250 shadow-sm flex flex-col justify-between h-32 text-left transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-primary/[0.01] hover:-translate-y-0.5 cursor-pointer group">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary transition-colors">Active Leads</p>
          <p className="text-xl md:text-4xl font-medium text-slate-900 mt-1">{activeLeadsCount}</p>
          <p className="text-[12px] text-slate-400 font-medium mt-1">In selected range</p>
        </div>

        {/* Advance Received */}
        <div className="bg-white p-4 rounded-xl border border-gray-250 shadow-sm flex flex-col justify-between h-32 text-left transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-primary/[0.01] hover:-translate-y-0.5 cursor-pointer group">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary transition-colors">Advance Paid</p>
          <p className="text-xl md:text-4xl font-medium text-slate-900 mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Received revenue</p>
        </div>

        {/* Pending Balance */}
        <div className="bg-white p-4 rounded-xl border border-gray-250 shadow-sm flex flex-col justify-between h-32 text-left transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-primary/[0.01] hover:-translate-y-0.5 cursor-pointer group">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary transition-colors">Balance Due</p>
          <p className="text-xl md:text-4xl font-medium text-red-600 mt-1">{formatCurrency(totalBalanceDue)}</p>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Pending payments</p>
        </div>

        {/* Average Event Value */}
        <div className="bg-white p-4 rounded-xl border border-gray-250 shadow-sm flex flex-col justify-between h-32 text-left transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-primary/[0.01] hover:-translate-y-0.5 cursor-pointer group">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary transition-colors">Avg Event Size</p>
          <p className="text-xl md:text-4xl font-medium text-slate-900 mt-1">{formatCurrency(avgEventValue)}</p>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Average invoice size</p>
        </div>

        {/* Lead Conversion */}
        <div className="bg-white p-4 rounded-xl border border-gray-250 shadow-sm flex flex-col justify-between h-32 text-left transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-primary/[0.01] hover:-translate-y-0.5 cursor-pointer group">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary transition-colors">Conversion</p>
          <p className="text-xl md:text-4xl font-medium text-green-600 mt-1">{conversionRate}%</p>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Leads to bookings</p>
        </div>
      </div>

      {/* Main Grid matching original items but with premium visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Banquet Schedules (spans 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-250 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">Upcoming Banquet Schedules</h3>
              </div>
              <Link to="/bookings" className="text-xs font-bold text-[#107ed8] hover:underline flex items-center">
                View All Bookings <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              {upcomingBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium text-sm">
                  <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  No upcoming slot bookings listed.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                      <th className="px-6 py-3">Customer / Contact</th>
                      <th className="px-6 py-3">Date & Slot</th>
                      <th className="px-6 py-3">Hall Name</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 text-xs">
                    {upcomingBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <p className="font-bold text-slate-850">{b.customers?.name || 'Walk-in Client'}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{b.customers?.phone || 'No phone'}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-slate-700">{format(new Date(b.event_date), 'dd MMM yyyy')}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{b.start_time ? `${b.start_time.slice(0, 5)} - ${b.end_time?.slice(0, 5)}` : 'Full Day'}</p>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-bold">
                          {b.halls?.name || 'Main Hall'}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border capitalize ${b.status === 'confirmed'
                            ? 'bg-green-50 text-green-700 border-green-150'
                            : b.status === 'hold'
                              ? 'bg-blue-50 text-blue-700 border-blue-150'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-150'
                            }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-slate-850">
                          {formatCurrency((b.total_amount || 0) - (b.advance_amount || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-gray-150 bg-slate-50/50 text-center">
            <p className="text-[10px] text-slate-400 font-semibold">Showing top 5 upcoming banquet and slot schedules.</p>
          </div>
        </div>

        {/* Live Leads CRM column (spans 1) */}
        <div className="bg-white rounded-xl border border-gray-250 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">Recent CRM Leads</h3>
              </div>
              <Link to="/leads" className="text-xs font-bold text-[#107ed8] hover:underline flex items-center">
                Open CRM Board <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-150">
              {dashboardData?.recentLeads.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium text-sm">
                  No active sales inquiries.
                </div>
              ) : (
                dashboardData?.recentLeads.slice(0, 5).map((l: any) => (
                  <div
                    key={l.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-850 text-xs">{l.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{l.phone} • {l.event_type || 'General'}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border capitalize ${l.status === 'new'
                      ? 'bg-blue-50 text-blue-700 border-blue-150'
                      : l.status === 'negotiating'
                        ? 'bg-purple-50 text-purple-700 border-purple-150'
                        : 'bg-gray-50 text-gray-700 border-gray-150'
                      }`}>
                      {l.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 border-t border-gray-150 bg-slate-50/50 text-center">
            <p className="text-[10px] text-slate-400 font-semibold">Track inquiries automatically in real-time CRM pipelines.</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
export default Dashboard;
