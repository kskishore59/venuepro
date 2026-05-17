import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { KanbanBoard } from '../components/leads/KanbanBoard';
import { LeadForm } from '../components/leads/LeadForm';
import { LeadDetail } from '../components/leads/LeadDetail';
import { Drawer } from '../components/ui/Drawer';
import type { Lead } from '../types';
import { formatCurrency } from '../lib/utils';
import { isToday, format } from 'date-fns';
import { LayoutGrid, List, Phone, Mail, Calendar, Eye, Edit2 } from 'lucide-react';
import { BoardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { SEO } from '../components/ui/SEO';

export const Leads: React.FC = () => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const [drawerMode, setDrawerMode] = useState<'none' | 'create' | 'view' | 'edit'>('none');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('org_id', organization!.id)
        .order('created_at', { ascending: false });
      return (data || []) as Lead[];
    },
    enabled: !!organization?.id
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads', organization?.id]);
      if (previousLeads) {
        queryClient.setQueryData(
          ['leads', organization?.id],
          previousLeads.map(l => l.id === id ? { ...l, status } : l)
        );
      }
      return { previousLeads };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', organization?.id], context.previousLeads);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  const handleLeadMove = (leadId: string, newStatus: string) => {
    updateLeadStatus.mutate({ id: leadId, status: newStatus });
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerMode('view');
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerMode('edit');
  };

  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const conversionRate = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const wonLeadsWithBudget = leads.filter(l => l.status === 'won' && l.budget_to);
  const avgDealSize = wonLeadsWithBudget.length
    ? wonLeadsWithBudget.reduce((acc, l) => acc + (l.budget_to || 0), 0) / wonLeadsWithBudget.length
    : 0;

  const followUpsToday = leads.filter(l => l.follow_up_date && isToday(new Date(l.follow_up_date))).length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'visit_scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'proposal_sent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'negotiating': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'won': return 'bg-green-100 text-green-800 border-green-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <SEO
        title="Leads CRM"
        description="Track event inquiries, client walkthroughs, conversion pipelines, and sales notes in your CRM."
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Leads & CRM</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Manage inquiries, follow-ups, and sales pipeline.</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md flex items-center transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'
                }`}
              title="Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'
                }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => { setSelectedLead(null); setDrawerMode('create'); }}
            className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-bold text-xs md:text-sm text-center"
          >
            + New Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-3.5 md:p-4 rounded-xl shadow-sm border border-gray-200/80">
          <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider">Total Leads</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{isLoading ? '...' : totalLeads}</p>
        </div>
        <div className="bg-white p-3.5 md:p-4 rounded-xl shadow-sm border border-gray-200/80">
          <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider">Conversions</p>
          <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">{isLoading ? '...' : `${conversionRate}%`}</p>
        </div>
        <div className="bg-white p-3.5 md:p-4 rounded-xl shadow-sm border border-gray-200/80">
          <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider">Avg Deal Size</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1 truncate max-w-[100px] sm:max-w-none">{isLoading ? '...' : formatCurrency(avgDealSize)}</p>
        </div>
        <div className="bg-white p-3.5 md:p-4 rounded-xl shadow-sm border border-gray-200/80">
          <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider">Follow-ups</p>
          <p className="text-xl md:text-2xl font-bold text-orange-600 mt-1">{isLoading ? '...' : followUpsToday}</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-h-[500px]">
        {isLoading ? (
          viewMode === 'board' ? <BoardSkeleton /> : <TableSkeleton />
        ) : viewMode === 'board' ? (
          <KanbanBoard leads={leads} onLeadMove={handleLeadMove} onLeadClick={handleLeadClick} />
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-400">Created: {format(new Date(lead.created_at || ''), 'dd MMM yyyy')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-y-0.5">
                        <div className="text-sm text-gray-700 flex items-center"><Phone className="w-3.5 h-3.5 mr-1 text-gray-400" /> {lead.phone}</div>
                        {lead.email && <div className="text-xs text-gray-400 flex items-center"><Mail className="w-3.5 h-3.5 mr-1 text-gray-400" /> {lead.email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${getStatusStyle(lead.status)}`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 capitalize">{lead.event_type || 'N/A'}</div>
                        {lead.tentative_date && (
                          <div className="text-xs text-gray-400 flex items-center mt-0.5">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {format(new Date(lead.tentative_date), 'dd MMM yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {lead.budget_from || lead.budget_to
                          ? `₹${lead.budget_from || 0} - ₹${lead.budget_to || 'Any'}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleLeadClick(lead)}
                          className="p-1 text-gray-500 hover:text-primary transition-colors inline-block"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(lead)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors inline-block"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">No leads found. Create your first lead to get started!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Drawer
        isOpen={drawerMode === 'create' || drawerMode === 'edit'}
        onClose={() => setDrawerMode('none')}
        title={drawerMode === 'create' ? "Create New Lead" : "Edit Lead"}
        size="lg"
      >
        <LeadForm
          onClose={() => {
            if (drawerMode === 'edit') setDrawerMode('view');
            else setDrawerMode('none');
          }}
          initialData={drawerMode === 'edit' && selectedLead ? selectedLead : undefined}
        />
      </Drawer>

      <Drawer
        isOpen={drawerMode === 'view'}
        onClose={() => { setDrawerMode('none'); setSelectedLead(null); }}
        title="Lead Details"
        size="lg"
      >
        {selectedLead && (
          <LeadDetail
            lead={selectedLead}
            onEdit={() => setDrawerMode('edit')}
            onClose={() => setDrawerMode('none')}
          />
        )}
      </Drawer>
    </div>
  );
};
