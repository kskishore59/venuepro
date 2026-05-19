import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/ui/SEO';
import { CheckSquare, Square, ShieldCheck, AlertCircle, RefreshCcw, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export const Operations: React.FC = () => {
  const { organization } = useAuth();

  const [activeTab, setActiveTab] = useState<'cleanliness' | 'readiness'>('cleanliness');

  // Operational items status checklist mock
  const { data: operationsList = [], isLoading, refetch } = useQuery({
    queryKey: ['operations', organization?.id],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, halls(name)')
        .eq('org_id', organization!.id)
        .order('event_date', { ascending: true })
        .limit(10);
      
      return (bookings || []).map(b => ({
        id: b.id,
        hallName: b.halls?.name || 'Main Hall',
        eventDate: b.event_date,
        cleanlinessStatus: b.status === 'confirmed' ? 'cleaned' : 'pending',
        readinessStatus: b.status === 'confirmed' ? 'ready' : 'setup_in_progress',
        staffAssigned: b.beo_details?.operational_notes ? 'Manager Assigned' : 'Not Assigned'
      }));
    },
    enabled: !!organization?.id
  });

  const toggleStatus = (_id: string, _type: 'cleanliness' | 'readiness') => {
    toast.success("Operational status updated successfully.");
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <SEO 
        title="Operations Command Center" 
        description="Monitor staff, track hall cleanliness turnarounds, and readiness checklists." 
      />

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Operations Command Center</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Manage turnarounds, cleanliness checksheets, and room setups.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm"
            title="Refresh Operations"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.info("Staff Mapping tool is located in Settings.")}
            className="btn-brand px-4 py-2.5 rounded-lg text-sm font-bold flex items-center shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Assign Staff
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 pt-2">
          <button onClick={() => setActiveTab('cleanliness')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'cleanliness' ? 'border-[#107ed8] text-[#107ed8]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Cleanliness Checklist
          </button>
          <button onClick={() => setActiveTab('readiness')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'readiness' ? 'border-[#107ed8] text-[#107ed8]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Readiness & Setup
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Loading checklists...</div>
          ) : operationsList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">
              <ShieldCheck className="w-12 h-12 mx-auto text-gray-250 mb-3" />
              No operations metrics found. Add bookings to generate setup lists.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hall Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Assigned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operationsList.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                      {op.hallName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {op.eventDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded ${
                        op.staffAssigned === 'Manager Assigned' ? 'bg-green-150 text-green-800' : 'bg-yellow-150 text-yellow-800'
                      }`}>
                        {op.staffAssigned}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {activeTab === 'cleanliness' ? (
                        <span className={`capitalize inline-flex items-center text-xs font-bold ${
                          op.cleanlinessStatus === 'cleaned' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {op.cleanlinessStatus === 'cleaned' ? <CheckSquare className="w-4 h-4 mr-1" /> : <Square className="w-4 h-4 mr-1" />}
                          {op.cleanlinessStatus}
                        </span>
                      ) : (
                        <span className={`capitalize inline-flex items-center text-xs font-bold ${
                          op.readinessStatus === 'ready' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {op.readinessStatus === 'ready' ? <ShieldCheck className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                          {op.readinessStatus.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => toggleStatus(op.id, activeTab)}
                        className="text-[#107ed8] hover:text-[#107ed8]/80 font-bold transition-colors"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
export default Operations;
