import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { 
  Calendar as CalendarIcon, CreditCard, Building2, 
  TrendingUp, CalendarDays 
} from 'lucide-react';
import { format, isToday, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { SEO } from '../components/ui/SEO';
import { BookingCalendar } from '../components/bookings/BookingCalendar';
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
  const { organization } = useAuth();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      
      const [bookingsRes, paymentsRes, leadsRes] = await Promise.all([
        supabase.from('bookings').select('*, halls(name), customers(name)').eq('org_id', organization.id),
        supabase.from('bookings').select('balance_amount, event_date').eq('org_id', organization.id),
        supabase.from('leads').select('*').eq('org_id', organization.id).order('created_at', { ascending: false }).limit(5)
      ]);

      return {
        bookings: (bookingsRes.data || []) as Booking[],
        pendingBookings: (paymentsRes.data || []) as { balance_amount: number, event_date: string }[],
        recentLeads: leadsRes.data || []
      };
    },
    enabled: !!organization?.id
  });

  if (isLoading) return <DashboardSkeleton />;

  const now = new Date();
  let filterDateLimit = subDays(now, 30);
  if (dateRange === '7d') filterDateLimit = subDays(now, 7);

  // 1. Dynamic Live Date Filtering for KPI Blocks
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

  return (
    <div className="space-y-6">
      <SEO 
        title="Dashboard Overview" 
        description="Unified corporate multi-tenant command dashboard tracking live leads, invoice payments, and synchronized schedules." 
      />

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

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fully Interactive Booking Calendar component */}
        <div className="lg:col-span-2 flex flex-col">
          <BookingCalendar 
            bookings={dashboardData?.bookings || []} 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate} 
            onDateClick={() => {}} 
            onBookingClick={() => {}} 
          />
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
