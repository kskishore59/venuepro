import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/ui/SEO';
import { formatCurrency } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Award, Calendar, RefreshCcw } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { organization } = useAuth();

  // Fetch analytics mock data or aggregates
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['analytics_metrics', organization?.id],
    queryFn: async () => {
      // Create high-fidelity Indian venue analytics mock aggregates
      const monthlyRevenue = [
        { month: 'Jan', revenue: 1200000, bookings: 12 },
        { month: 'Feb', revenue: 1800000, bookings: 18 },
        { month: 'Mar', revenue: 2400000, bookings: 24 },
        { month: 'Apr', revenue: 1500000, bookings: 15 },
        { month: 'May', revenue: 2900000, bookings: 29 },
        { month: 'Jun', revenue: 800000, bookings: 8 },
        { month: 'Jul', revenue: 600000, bookings: 6 },
        { month: 'Aug', revenue: 1100000, bookings: 11 },
        { month: 'Sep', revenue: 1700000, bookings: 17 },
        { month: 'Oct', revenue: 3200000, bookings: 32 },
        { month: 'Nov', revenue: 4500000, bookings: 45 },
        { month: 'Dec', revenue: 5200000, bookings: 50 },
      ];

      const popularHalls = [
        { name: 'Grand Ballroom', bookings: 42 },
        { name: 'Royal Garden', bookings: 35 },
        { name: 'Crystal Plaza', bookings: 28 },
        { name: 'Lotus Hall', bookings: 19 },
      ];

      return { monthlyRevenue, popularHalls };
    },
    enabled: !!organization?.id
  });

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading analytics...</div>;

  const totalRevenue = metrics?.monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0) || 0;
  const totalBookings = metrics?.monthlyRevenue.reduce((sum, item) => sum + item.bookings, 0) || 0;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <SEO 
        title="Business Intelligence Analytics" 
        description="Visualize monthly revenue comparison, popular halls distribution, and operational metrics." 
      />

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Business Analytics</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Visualize monthly revenue trajectories, popular banquet halls, and lead conversion rates.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm"
          title="Refresh Analytics"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Annual Revenue</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center text-xs text-green-600 font-bold mt-2">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +14.2% YoY growth
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Bookings Completed</p>
          <p className="text-2xl font-bold text-slate-900">{totalBookings} Completed</p>
          <div className="flex items-center text-xs text-[#107ed8] font-bold mt-2">
            <Calendar className="w-3.5 h-3.5 mr-1" /> Capacity utilization: 72%
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Top Performing Location</p>
          <p className="text-2xl font-bold text-slate-900">{metrics?.popularHalls[0]?.name || 'Grand Ballroom'}</p>
          <div className="flex items-center text-xs text-amber-600 font-bold mt-2">
            <Award className="w-3.5 h-3.5 mr-1" /> Highest yield per square foot
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="font-extrabold text-sm text-gray-800 tracking-tight mb-4">Monthly Revenue Flow</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#107ed8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#107ed8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
                <Tooltip formatter={(value: any) => [formatCurrency(value), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#107ed8" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="font-extrabold text-sm text-gray-800 tracking-tight mb-4">Popularity by Location</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.popularHalls} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <Tooltip formatter={(value: any) => [value, 'Bookings']} />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {metrics?.popularHalls.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#107ed8' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
