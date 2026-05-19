import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Clock, Database, User, Activity, Search } from 'lucide-react';
import type { AuditLog } from '../../types';

export const AuditLogViewer: React.FC = () => {
  const { organization } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('org_id', organization!.id)
        .order('created_at', { ascending: false })
        .limit(100);
      return (data || []) as AuditLog[];
    },
    enabled: !!organization
  });

  const filteredLogs = logs.filter(log => 
    log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATE': return 'text-green-600 bg-green-50 border-green-200';
      case 'UPDATE': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DELETE': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading audit trail...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <Activity className="w-5 h-5 mr-2 text-[#107ed8]" /> Immutable Audit Trail
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            System-level tracking of all entity mutations across your organization.
          </p>
        </div>
      </div>

      <div className="card-elevated rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by entity or action..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block pl-9 p-2 transition-all"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing last {filteredLogs.length} events
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Record ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actor ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 capitalize flex items-center">
                    <Database className="w-3.5 h-3.5 mr-1.5 text-[#107ed8]" />
                    {log.entity_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                    {log.entity_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {log.actor_id || 'System'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No matching audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
