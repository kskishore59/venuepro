import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { 
  Calendar as CalendarIcon, CreditCard, Building2, 
  TrendingUp, CalendarDays, ArrowRight, Sparkles, 
  ChevronRight
} from 'lucide-react';
import { format, isToday, subDays, startOfWeek, endOfWeek } from 'date-fns';
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

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 120, 
      damping: 16 
    } 
  }
};

export const Dashboard: React.FC = () => {
  const { organization, profile } = useAuth();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      
      const [bookingsRes, paymentsRes, leadsRes, venuesRes] = await Promise.all([
        supabase.from('bookings').select('*, halls(name), customers(name)').eq('org_id', organization.id),
        supabase.from('bookings').select('balance_amount, event_date').eq('org_id', organization.id),
        supabase.from('leads').select('*').eq('org_id', organization.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('venues').select('id').eq('org_id', organization.id)
      ]);

      return {
        bookings: (bookingsRes.data || []) as Booking[],
        pendingBookings: (paymentsRes.data || []) as { balance_amount: number, event_date: string }[],
        recentLeads: leadsRes.data || [],
        venuesCount: venuesRes.data?.length || 0
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

  const filteredPending = (dashboardData?.pendingBookings || []).filter(b => {
    if (dateRange === 'all') return true;
    return new Date(b.event_date) >= filterDateLimit;
  });

  // KPI Calculations
  const bookingsCount = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.advance_amount || 0), 0);
  
  const pendingBookingsWithBalance = filteredPending.filter(b => (b.balance_amount || 0) > 0);
  const pendingPaymentsTotal = pendingBookingsWithBalance.reduce((sum, b) => sum + (b.balance_amount || 0), 0);

  // Weekly events limits
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const eventsThisWeek = (dashboardData?.bookings || []).filter(b => {
    const d = new Date(b.event_date);
    return d >= weekStart && d <= weekEnd;
  });

  const todaysEvents = (dashboardData?.bookings || []).filter(e => isToday(new Date(e.event_date))) || [];

  // Sort and filter upcoming bookings for agenda display
  const upcomingBookings = (dashboardData?.bookings || [])
    .filter(b => new Date(b.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <SEO 
        title="Dashboard Overview" 
        description="Unified corporate multi-tenant command dashboard tracking live leads, invoice payments, and synchronized schedules." 
      />

      {/* Warm Welcome and helpers flow for new venue onboarding */}
      {dashboardData?.venuesCount === 0 && (
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-primary to-blue-800 text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Getting Started Guide</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Warm Welcome to VenuePro, {profile?.full_name}! 🏰</h2>
            <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
              We are absolutely thrilled to partner with your team! Let's get your venue operations completely configured. Follow these 4 easy steps to start coordinate slot bookings:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <motion.div whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Link to="/venues" className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition-all flex flex-col justify-between h-36">
                  <div>
                    <span className="text-xs font-bold text-white/50">STEP 1</span>
                    <h4 className="font-bold text-sm mt-1">Add Venue & Halls</h4>
                    <p className="text-xs text-white/70 mt-1">Configure pricing models, slots, and capacity thresholds.</p>
                  </div>
                  <span className="text-xs font-bold flex items-center text-white mt-2">Setup Properties <ChevronRight className="w-3 h-3 ml-1" /></span>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Link to="/settings" className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition-all flex flex-col justify-between h-36">
                  <div>
                    <span className="text-xs font-bold text-white/50">STEP 2</span>
                    <h4 className="font-bold text-sm mt-1">Map Cleanliness Staff</h4>
                    <p className="text-xs text-white/70 mt-1">Add Managers and Turnaround Staff to specific halls.</p>
                  </div>
                  <span className="text-xs font-bold flex items-center text-white mt-2">Map Staff <ChevronRight className="w-3 h-3 ml-1" /></span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Link to="/settings" className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition-all flex flex-col justify-between h-36">
                  <div>
                    <span className="text-xs font-bold text-white/50">STEP 3</span>
                    <h4 className="font-bold text-sm mt-1">Bilingual GST Setup</h4>
                    <p className="text-xs text-white/70 mt-1">Configure English & Hindi invoicing rules and SAC codes.</p>
                  </div>
                  <span className="text-xs font-bold flex items-center text-white mt-2">Setup Billing <ChevronRight className="w-3 h-3 ml-1" /></span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Link to="/leads" className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition-all flex flex-col justify-between h-36">
                  <div>
                    <span className="text-xs font-bold text-white/50">STEP 4</span>
                    <h4 className="font-bold text-sm mt-1">Track First Inquiry</h4>
                    <p className="text-xs text-white/70 mt-1">Create leads dynamically in your automated CRM board.</p>
                  </div>
                  <span className="text-xs font-bold flex items-center text-white mt-2">Log Inquiry <ChevronRight className="w-3 h-3 ml-1" /></span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header featuring Date Range selector */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200/80 shadow-sm gap-4"
      >
        <div>
          <h1 className="text-lg md:text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Real-time indicators synchronized directly from database records.</p>
        </div>

        {/* Date Filter selector */}
        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 text-gray-400 ml-2" />
            <span className="text-xs font-bold text-gray-400 ml-1.5 sm:hidden">Filter:</span>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none pr-3 py-0.5 cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </motion.div>

      {/* KPI Cards Grid - compact 2-columns on mobile with premium slide in */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      >
        
        {/* Bookings */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, scale: 1.015, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between transition-colors hover:border-primary/20 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Bookings</p>
              <p className="text-xl md:text-3xl font-extrabold text-gray-900 mt-0.5 md:mt-1">{bookingsCount}</p>
            </div>
            <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4 flex items-center text-[10px] md:text-xs text-gray-400 font-medium border-t border-gray-50 pt-2">
            <span className="font-bold text-green-600 mr-1">Active</span>
            <span className="truncate">in window</span>
          </div>
        </motion.div>

        {/* Revenue */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, scale: 1.015, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between transition-colors hover:border-primary/20 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Advances</p>
              <p className="text-xl md:text-3xl font-extrabold text-gray-900 mt-0.5 md:mt-1 truncate max-w-[100px] sm:max-w-none">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-9 h-9 md:w-12 md:h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4 flex items-center text-[10px] md:text-xs text-gray-400 font-medium border-t border-gray-50 pt-2">
            <span className="font-bold text-green-600 mr-1">Received</span>
            <span className="truncate">sums</span>
          </div>
        </motion.div>

        {/* Pending payments */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, scale: 1.015, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between transition-colors hover:border-primary/20 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Balances</p>
              <p className="text-xl md:text-3xl font-extrabold text-gray-900 mt-0.5 md:mt-1 truncate max-w-[100px] sm:max-w-none">{formatCurrency(pendingPaymentsTotal)}</p>
            </div>
            <div className="w-9 h-9 md:w-12 md:h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
              <CreditCard className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4 flex items-center text-[10px] md:text-xs text-gray-400 font-medium border-t border-gray-50 pt-2">
            <span className="truncate">Across <span className="font-bold text-gray-700">{pendingBookingsWithBalance.length}</span> bills</span>
          </div>
        </motion.div>

        {/* Events this week */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -3, scale: 1.015, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between transition-colors hover:border-primary/20 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Weekly Events</p>
              <p className="text-xl md:text-3xl font-extrabold text-gray-900 mt-0.5 md:mt-1">{eventsThisWeek.length}</p>
            </div>
            <div className="w-9 h-9 md:w-12 md:h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
              <Building2 className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4 flex items-center text-[10px] md:text-xs text-gray-400 font-medium border-t border-gray-50 pt-2">
            <span className="font-bold text-purple-600 mr-1">{todaysEvents.length}</span>
            <span className="truncate">today</span>
          </div>
        </motion.div>

      </motion.div>

      {/* Main Operational Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        
        {/* Upcoming Bookings Agenda (Replaced Calendar) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">Upcoming Banquet Schedules</h3>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/bookings" className="text-xs font-extrabold text-primary hover:text-primary-dark transition-colors flex items-center">
                  View All Bookings <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </motion.div>
            </div>

            <div className="overflow-x-auto">
              {upcomingBookings.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-medium text-sm">
                  <CalendarIcon className="w-12 h-12 mx-auto text-gray-250 mb-3" />
                  No upcoming slot bookings listed.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase bg-gray-50/20">
                      <th className="px-6 py-3.5">Customer / Contact</th>
                      <th className="px-6 py-3.5">Date & Slot</th>
                      <th className="px-6 py-3.5">Hall Name</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {upcomingBookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{b.customers?.name || 'Walk-in Client'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{b.customers?.phone || 'No phone'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-700">{format(new Date(b.event_date), 'dd MMM yyyy')}</p>
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">{b.start_time ? `${b.start_time.slice(0, 5)} - ${b.end_time?.slice(0, 5)}` : 'Full Day'}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-semibold">
                          {b.halls?.name || 'Main Hall'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border capitalize ${
                            b.status === 'confirmed' 
                              ? 'bg-green-50 text-green-700 border-green-100' 
                              : b.status === 'hold'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          {formatCurrency((b.total_amount || 0) - (b.advance_amount || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50/20 text-center">
            <p className="text-xs text-gray-400">Showing top 5 upcoming banquet and slot schedules.</p>
          </div>
        </div>

        {/* Live Leads CRM column */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-sm text-gray-800 tracking-tight">Recent CRM Leads</h3>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/leads" className="text-xs font-extrabold text-primary hover:text-primary-dark transition-colors flex items-center">
                  Open CRM Board <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </motion.div>
            </div>

            <div className="divide-y divide-gray-100">
              {dashboardData?.recentLeads.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-medium text-sm">
                  No active sales inquiries.
                </div>
              ) : (
                dashboardData?.recentLeads.map((l: any) => (
                  <motion.div 
                    key={l.id} 
                    whileHover={{ x: 3, backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                    className="p-4 flex items-center justify-between transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{l.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{l.phone} • {l.event_type || 'General'}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border capitalize ${
                      l.status === 'new' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : l.status === 'negotiating'
                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                        : 'bg-gray-50 text-gray-700 border-gray-100'
                    }`}>
                      {l.status}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/20 text-center">
            <p className="text-xs text-gray-400">Track inquiries automatically in real-time CRM pipelines.</p>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
};
export default Dashboard;
