import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import {
  TrendingUp, Users, Calendar, DollarSign,
  Globe, CalendarDays, ArrowUpRight
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { SEO } from '../components/ui/SEO';

const COLORS = ['#107ed8', '#2563EB', '#10B981', '#F59E0B', '#EF4444'];

export const Reports: React.FC = () => {
  const { organization } = useAuth();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

  // 1. Fetch Bookings
  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['reports-bookings', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*, halls(name)').eq('org_id', organization!.id).neq('status', 'cancelled');
      return data || [];
    },
    enabled: !!organization
  });

  // 2. Fetch Leads
  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ['reports-leads', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('leads').select('*').eq('org_id', organization!.id);
      return data || [];
    },
    enabled: !!organization
  });

  if (loadingBookings || loadingLeads) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Analyzing corporate datasets...</p>
      </div>
    );
  }

  // 3. Calculate date range boundaries
  const now = new Date();
  let filterDateLimit = subDays(now, 30);
  if (dateRange === '7d') filterDateLimit = subDays(now, 7);

  // 4. Apply Dynamic Date Filtering
  const filteredBookings = bookings.filter(b => {
    if (dateRange === 'all') return true;
    return new Date(b.event_date) >= filterDateLimit;
  });

  const filteredLeads = leads.filter(l => {
    if (dateRange === 'all') return true;
    return new Date(l.created_at) >= filterDateLimit;
  });

  // 5. GA4 styled Analytics Processing: Acquisition over time
  const trafficByDay: Record<string, { date: string, bookings: number, revenue: number }> = {};

  // Initialize date indexes
  const daysToGenerate = dateRange === '7d' ? 7 : (dateRange === '30d' ? 30 : 60);
  for (let i = daysToGenerate - 1; i >= 0; i--) {
    const formattedDate = format(subDays(now, i), 'dd MMM');
    trafficByDay[formattedDate] = { date: formattedDate, bookings: 0, revenue: 0 };
  }

  filteredBookings.forEach(b => {
    const formattedDate = format(parseISO(b.event_date), 'dd MMM');
    if (trafficByDay[formattedDate] !== undefined) {
      trafficByDay[formattedDate].bookings += 1;
      trafficByDay[formattedDate].revenue += b.total_amount;
    }
  });

  const acquisitionData = Object.values(trafficByDay);

  // 6. Lead conversion distribution
  const leadStatusCounts = filteredLeads.reduce((acc: any, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const conversionFunnel = [
    { name: 'Total Inquiries', count: filteredLeads.length, percentage: 100 },
    { name: 'Contacted', count: (leadStatusCounts['contacted'] || 0) + (leadStatusCounts['visit_scheduled'] || 0) + (leadStatusCounts['proposal_sent'] || 0) + (leadStatusCounts['negotiating'] || 0) + (leadStatusCounts['won'] || 0), percentage: 0 },
    { name: 'Negotiations', count: (leadStatusCounts['negotiating'] || 0) + (leadStatusCounts['won'] || 0), percentage: 0 },
    { name: 'Won Bookings', count: leadStatusCounts['won'] || 0, percentage: 0 }
  ];

  // Calculate funnel conversions
  conversionFunnel[1].percentage = filteredLeads.length ? Math.round((conversionFunnel[1].count / filteredLeads.length) * 100) : 0;
  conversionFunnel[2].percentage = filteredLeads.length ? Math.round((conversionFunnel[2].count / filteredLeads.length) * 100) : 0;
  conversionFunnel[3].percentage = filteredLeads.length ? Math.round((conversionFunnel[3].count / filteredLeads.length) * 100) : 0;

  // 7. Hall utilization
  const hallCounts = filteredBookings.reduce((acc: any, b) => {
    const name = b.halls?.name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const hallUtilizationData = Object.keys(hallCounts).map(name => ({
    name,
    bookings: hallCounts[name]
  })).sort((a, b) => b.bookings - a.bookings);

  // Overall sums
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const totalLeads = filteredLeads.length;
  const wonLeads = filteredLeads.filter(l => l.status === 'won').length;
  const conversionRate = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6">
      <SEO title="Acquisition Reports" description="GA4 acquisition pipelines, audience segments, multi-tenant lead funnels, and utilization indexes." />

      {/* GA4 style Sub-Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Performance</h1>
          <p className="text-gray-500 text-sm mt-0.5">Google Analytics-style dashboard tracking acquisition streams, conversion rates, and revenue indexes.</p>
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

      {/* GA4 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Booked Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Acquired Events</p>
            <p className="text-3xl font-bold text-gray-900">{filteredBookings.length}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total CRM Leads</p>
            <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Goal Conversion</p>
            <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Layout (GA4 Double Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* GA4 Users / Revenue Timeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-h-[400px]">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Revenue Performance Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Continuous transaction metrics and event value aggregation</p>
            </div>
            <div className="inline-flex items-center space-x-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>Realtime Connected</span>
            </div>
          </div>

          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={acquisitionData}>
                <defs>
                  <linearGradient id="colorAcq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#107ed8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#107ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}`} />
                <Tooltip formatter={(val: any) => `₹${val.toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="revenue" stroke="#107ed8" strokeWidth={3} fillOpacity={1} fill="url(#colorAcq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GA4 style Funnel Conversion Pipeline */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Conversion Funnel Path</h3>
            <p className="text-xs text-gray-400 mt-0.5">SaaS pipeline metrics from discovery to booking conversion</p>
          </div>

          <div className="space-y-4 my-6">
            {conversionFunnel.map((step, idx) => (
              <div key={step.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{step.name}</span>
                  <span className="font-bold text-gray-900">{step.count} ({step.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="rounded-full h-2.5 transition-all duration-700"
                    style={{
                      width: `${step.percentage}%`,
                      backgroundColor: COLORS[idx % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>Overall Conversion</span>
            <span className="font-bold text-gray-900">{conversionRate}% goal completion</span>
          </div>
        </div>

        {/* Hall Utilization breakdown (GA4 style list) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Hall Utilization Directory</h3>
              <p className="text-xs text-gray-400 mt-0.5">Most active spaces ranked by checkout frequency</p>
            </div>
            <button className="text-xs text-primary font-bold hover:underline flex items-center">
              View Detailed Index <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b">
                <tr>
                  <th className="px-6 py-4">Banquet Hall</th>
                  <th className="px-6 py-4">Total Bookings Managed</th>
                  <th className="px-6 py-4">Audience Rank</th>
                  <th className="px-6 py-4 text-right">Activity Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {hallUtilizationData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No utilizations recorded for the selected window.</td>
                  </tr>
                ) : (
                  hallUtilizationData.map((hall, idx) => {
                    const maxBookings = Math.max(...hallUtilizationData.map(h => h.bookings));
                    const percentage = maxBookings ? Math.round((hall.bookings / maxBookings) * 100) : 0;
                    return (
                      <tr key={hall.name} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{hall.name}</td>
                        <td className="px-6 py-4 font-semibold">{hall.bookings} events</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                            Rank #{idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="w-32 bg-gray-100 rounded-full h-2 ml-auto">
                            <div className="bg-primary rounded-full h-2" style={{ width: `${percentage}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Reports;
