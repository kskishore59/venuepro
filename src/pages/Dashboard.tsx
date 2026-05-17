import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
    <div className="space-y-6">
      <SEO 
        title="Dashboard Overview" 
        description="Unified corporate multi-tenant command dashboard tracking live leads, invoice payments, and synchronized schedules." 
      />

      {/* Warm Welcome and helpers flow for new venue onboarding */}
      {dashboardData?.venuesCount === 0 && (
        <div className="bg-gradient-to-r from-primary to-blue-800 text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <Link to="/venues" className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition-all flex flex-col justify-between h-36">
                <div>
                  <span className="text-xs font-bold text-white/50">STEP 1</span>
                  <h4 className="font-bold text-sm mt-1">Add Venue & Halls</h4>
                  <p className="text-xs text-white/70 mt-1">Configure pricing models, slots, and capacity thresholds.</p>
                </div>
                <span className="text-xs font-bold flex items-center text-white mt-2">Setup Properties <ChevronRight className="w-3 h-3 ml-1" /></span>
              </Link>
              
              <Link to="/settings" className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition-all flex flex-col justify-between h-36">
                <div>
                  <span className="text-xs font-bold text-white/50">STEP 2</span>
                  <h4 className="font-bold text-sm mt-1">Map Cleanliness Staff</h4>
                  <p className="text-xs text-white/70 mt-1">Add Managers and Turnaround Staff to specific halls.</p>
                </div>
                <span className="text-xs font-bold flex items-center text-white mt-2">Map Staff <ChevronRight className="w-3 h-3 ml-1" /></span>
              </Link>

              <Link to="/settings" className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition-all flex flex-col justify-between h-36">
                <div>
                  <span className="text-xs font-bold text-white/50">STEP 3</span>
                  <h4 className="font-bold text-sm mt-1">Bilingual GST Setup</h4>
                  <p className="text-xs text-white/70 mt-1">Configure English & Hindi invoicing rules and SAC codes.</p>
                </div>
                <span className="text-xs font-bold flex items-center text-white mt-2">Setup Billing <ChevronRight className="w-3 h-3 ml-1" /></span>
              </Link>

              <Link to="/leads" className="bg-white/10 hover:bg-white/15 border border-white/15 p-4 rounded-xl transition-all flex flex-col justify-between h-36">
                <div>
                  <span className="text-xs font-bold text-white/50">STEP 4</span>
                  <h4 className="font-bold text-sm mt-1">Track First Inquiry</h4>
                  <p className="text-xs text-white/70 mt-1">Create leads dynamically in your automated CRM board.</p>
                </div>
                <span className="text-xs font-bold flex items-center text-white mt-2">Log Inquiry <ChevronRight className="w-3 h-3 ml-1" /></span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header featuring Date Range selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time indicators synchronized directly from operational database records.</p>
        </div>

        {/* Date Filter selector */}
        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 shadow-sm">
          <CalendarDays className="w-4 h-4 text-gray-400 ml-2" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none pr-3 py-1 cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bookings</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{bookingsCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
            <span className="font-bold text-green-600 mr-1">Active</span>
            <span>in selected window</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Acquired Advances</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
            <span className="font-bold text-green-600 mr-1">Received</span>
            <span>aggregate sums</span>
          </div>
        </div>

        {/* Pending payments */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Balances</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{formatCurrency(pendingPaymentsTotal)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
            <span>Across <span className="font-bold text-gray-700">{pendingBookingsWithBalance.length}</span> outstanding bookings</span>
          </div>
        </div>

        {/* Events this week */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Events This Week</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{eventsThisWeek.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
            <span className="font-bold text-purple-600 mr-1">{todaysEvents.length}</span>
            <span>happening today</span>
          </div>
        </div>

      </div>

      {/* Main Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Bookings Agenda (Replaced Calendar) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Upcoming Bookings Agenda</h3>
              </div>
              <Link 
                to="/bookings" 
                className="text-xs font-bold text-primary hover:text-primary/90 flex items-center bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 transition-colors"
              >
                <span>View All Bookings</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              {upcomingBookings.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm italic">
                  No upcoming bookings found in the database.
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

        <div className="space-y-6">
          
          {/* Today's Events list */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Today's Schedule</h2>
            </div>
            <div className="p-0">
              {todaysEvents.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs italic">No event bookings scheduled for today.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {todaysEvents.map((event: any) => (
                    <li key={event.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{event.customers?.name || 'Unknown'}'s {event.event_type}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{event.halls?.name}</p>
                        </div>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                          {event.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent Leads list */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Active Leads Intake</h2>
            </div>
            <div className="p-0">
              {dashboardData?.recentLeads.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs italic">No recent incoming leads found.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {dashboardData?.recentLeads.map((lead: any) => (
                    <li key={lead.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between text-sm">
                      <div>
                        <p className="font-bold text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{format(new Date(lead.created_at), 'dd/MM/yyyy')}</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-700 border capitalize">
                        {lead.status?.replace('_', ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Dashboard;
