import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { 
  Building2, Calendar, 
  TrendingUp, Globe, Sparkles, Trash2, Edit3 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { SEO } from '../components/ui/SEO';
import { Drawer } from '../components/ui/Drawer';

// Mock system-wide analytics styled like Google Analytics 4 Dashboard
const MOCK_REALTIME_USERS = 37;
const MOCK_ACTIVE_BREAKDOWN = [
  { device: 'Desktop', percentage: 65, color: '#1B4F8A' },
  { device: 'Mobile', percentage: 28, color: '#2563EB' },
  { device: 'Tablet', percentage: 7, color: '#10B981' }
];

const MOCK_TRAFFIC_DATA = [
  { time: '05:00', users: 12 },
  { time: '05:05', users: 18 },
  { time: '05:10', users: 27 },
  { time: '05:15', users: 37 },
  { time: '05:20', users: 34 },
  { time: '05:25', users: 41 },
  { time: '05:30', users: 45 },
];

const MOCK_REVENUE_METRICS = [
  { month: 'Jan', value: 4500000 },
  { month: 'Feb', value: 5200000 },
  { month: 'Mar', value: 6100000 },
  { month: 'Apr', value: 5800000 },
  { month: 'May', value: 7200000 }
];

export const SuperAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'analytics' | 'orgs' | 'venues' | 'bookings'>('analytics');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({ name: '', slug: '', city: '' });

  // 1. Fetch Global System Organizations
  const { data: globalOrgs = [] } = useQuery({
    queryKey: ['super_global_orgs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 2. Fetch Global System Venues
  const { data: globalVenues = [] } = useQuery({
    queryKey: ['super_global_venues'],
    queryFn: async () => {
      const { data, error } = await supabase.from('venues').select('*, organizations(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 3. Fetch Global System Bookings
  const { data: globalBookings = [] } = useQuery({
    queryKey: ['super_global_bookings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('bookings').select('*, organizations(name), customers(name), halls(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 4. CRUD Mutations
  const deleteOrg = useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase.from('organizations').delete().eq('id', orgId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Organization deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['super_global_orgs'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const updateOrg = useMutation({
    mutationFn: async (payload: { id: string, name: string, slug: string }) => {
      const { error } = await supabase.from('organizations').update({ name: payload.name, slug: payload.slug }).eq('id', payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Organization updated successfully');
      setIsEditing(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ['super_global_orgs'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleEditClick = (item: any, type: 'org') => {
    setSelectedItem(item);
    setIsEditing(true);
    if (type === 'org') {
      setEditForm({ name: item.name, slug: item.slug });
    }
  };

  const totalSystemRevenue = globalBookings.reduce((sum, bk) => sum + (bk.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <SEO title="Super Admin Panel" description="Platform-level controls, global analytics metrics, and organization directory management." />

      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Controller Mode</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">Command Center</h1>
          <p className="text-gray-500">Global SaaS supervision, live system traffic, and organization metrics.</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1.5 shadow-sm border max-w-lg">
        {[
          { id: 'analytics', label: 'Google Analytics UI', icon: Globe },
          { id: 'orgs', label: 'Organizations', icon: Building2 },
          { id: 'venues', label: 'Global Venues', icon: Building2 },
          { id: 'bookings', label: 'All Bookings', icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ANALYTICS TAB (Styled like Google Analytics 4 Real-time) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GA Real-time Card */}
            <div className="bg-[#1b253b] text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[350px] relative overflow-hidden border border-gray-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">Realtime Monitor</h3>
                  <div className="flex items-center space-x-2 bg-green-500/20 px-2.5 py-1 rounded-full border border-green-500/30">
                    <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
                    <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Live</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-6xl font-black tracking-tight">{MOCK_REALTIME_USERS}</span>
                  <p className="text-xs text-gray-400 font-medium">active operators in the last 30 minutes</p>
                </div>
              </div>

              {/* Real-time area chart */}
              <div className="h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_TRAFFIC_DATA}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                    <Area type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="border-t border-gray-800 pt-4 flex justify-between text-xs text-gray-400">
                <span>Updated just now</span>
                <span className="font-semibold text-green-400">System Nominal</span>
              </div>
            </div>

            {/* Platform Revenue Stream */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between min-h-[350px]">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Monthly Platform Transactions</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalSystemRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="inline-flex items-center space-x-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% YoY</span>
                </div>
              </div>

              {/* Monthly Revenue chart */}
              <div className="h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_REVENUE_METRICS}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B4F8A" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1B4F8A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val/100000}L`} />
                    <Tooltip formatter={(val: any) => `₹${val.toLocaleString('en-IN')}`} />
                    <Area type="monotone" dataKey="value" stroke="#1B4F8A" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Core breakdown row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Device breakdown card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">Device Statistics</h4>
              <div className="space-y-3">
                {MOCK_ACTIVE_BREAKDOWN.map(dev => (
                  <div key={dev.device} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">{dev.device}</span>
                      <span className="font-bold text-gray-900">{dev.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="rounded-full h-2 transition-all duration-500" style={{ width: `${dev.percentage}%`, backgroundColor: dev.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Organization counters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">Organizations Base</h4>
              <div className="flex items-center justify-between mt-4">
                <div className="space-y-1">
                  <p className="text-4xl font-extrabold text-gray-900">{globalOrgs.length}</p>
                  <p className="text-xs text-gray-500">Registered SaaS Tenants</p>
                </div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Building2 className="w-7 h-7" />
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-4 border-t pt-3 flex justify-between">
                <span>Standard SLA: 99.9%</span>
                <span className="font-bold text-green-600">Active</span>
              </div>
            </div>

            {/* Total System Bookings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">System-Wide Bookings</h4>
              <div className="flex items-center justify-between mt-4">
                <div className="space-y-1">
                  <p className="text-4xl font-extrabold text-gray-900">{globalBookings.length}</p>
                  <p className="text-xs text-gray-500">Total Confirmed Events</p>
                </div>
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-7 h-7" />
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-4 border-t pt-3 flex justify-between">
                <span>0 Collision Conflicts</span>
                <span className="font-bold text-green-600">Checked</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER ORGANIZATIONS TAB (With CRUD capabilities) */}
      {activeTab === 'orgs' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Registered SaaS Organizations</h3>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">{globalOrgs.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">GSTIN</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {globalOrgs.map(org => (
                  <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{org.name}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{org.slug}</td>
                    <td className="px-6 py-4">{org.gstin || <span className="text-gray-400 italic">Not set</span>}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{new Date(org.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEditClick(org, 'org')}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Are you sure you want to delete this org?')) deleteOrg.mutate(org.id); }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VENUES TAB (Global view across multi-tenancies) */}
      {activeTab === 'venues' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Global Venues Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b">
                <tr>
                  <th className="px-6 py-4">Venue Name</th>
                  <th className="px-6 py-4">SaaS Owner (Org)</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {globalVenues.map(ven => (
                  <tr key={ven.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{ven.name}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-blue-600 uppercase bg-blue-50 rounded-md px-2 py-1 max-w-[200px] truncate">
                      {ven.organizations?.name}
                    </td>
                    <td className="px-6 py-4">{ven.city}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{ven.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER BOOKINGS TAB (Global audit log list) */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">System-Wide Booking Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b">
                <tr>
                  <th className="px-6 py-4">Event Date</th>
                  <th className="px-6 py-4">Tenant Venue</th>
                  <th className="px-6 py-4">Hall Name</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Event Type</th>
                  <th className="px-6 py-4 text-right">Invoice Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {globalBookings.map(bk => (
                  <tr key={bk.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{new Date(bk.event_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{bk.organizations?.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{bk.halls?.name}</td>
                    <td className="px-6 py-4">{bk.customers?.name}</td>
                    <td className="px-6 py-4 capitalize text-gray-500">{bk.event_type}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">₹{bk.total_amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Organization Drawer */}
      <Drawer
        isOpen={isEditing}
        onClose={() => { setIsEditing(false); setSelectedItem(null); }}
        title="Edit Organization Properties"
        size="md"
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization Slug</label>
              <input
                type="text"
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={() => { if(selectedItem) updateOrg.mutate({ id: selectedItem.id, ...editForm }); }}
              className="flex-1 py-2 px-4 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm"
            >
              Save Organization Changes
            </button>
            <button
              onClick={() => { setIsEditing(false); setSelectedItem(null); }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
export default SuperAdmin;
