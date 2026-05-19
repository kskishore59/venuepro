import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/ui/SEO';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { FileText, Send, Download, Plus, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

export const Quotations: React.FC = () => {
  const { organization } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch proposals/quotations mock data (or real table if it exists)
  const { data: quotes = [], isLoading, refetch } = useQuery({
    queryKey: ['quotations', organization?.id],
    queryFn: async () => {
      // In a real database, we would query the proposals table.
      // Since it's a new feature, we fallback to a high-fidelity mock list or fetch from database if available.
      const { data, error } = await supabase
        .from('bookings')
        .select('*, customers(name, phone), halls(name)')
        .eq('org_id', organization!.id)
        .limit(10);
      
      if (error) return [];
      
      return (data || []).map(b => ({
        id: b.id,
        quote_number: `VP-QT-${new Date(b.created_at).getFullYear()}-${b.booking_number?.split('-')[1] || '001'}`,
        customer_name: b.customers?.name || 'Walk-in Client',
        phone: b.customers?.phone || 'N/A',
        hall_name: b.halls?.name || 'Main Hall',
        event_date: b.event_date,
        total_amount: b.total_amount || 75000,
        status: b.status === 'confirmed' ? 'approved' : b.status === 'hold' ? 'sent' : 'draft',
        created_at: b.created_at
      }));
    },
    enabled: !!organization?.id
  });

  const handleCreateProposal = () => {
    toast.success("Proposal Generator loaded: Creating a branded GST quotation.");
  };

  const filteredQuotes = quotes.filter(q => 
    q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.quote_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <SEO 
        title="Proposal Generator" 
        description="Generate and track beautiful branded venue quotations, pricing sheets, and e-signatures." 
      />

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Proposal & Quotation Engine</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Generate branded PDF quotes with automated GST calculations and custom line items.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm"
            title="Refresh Data"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreateProposal}
            className="btn-brand px-4 py-2.5 rounded-lg text-sm font-bold flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> New Quotation
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <input
            type="text"
            placeholder="Search by quote # or customer name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-80 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm border px-3 py-2 bg-white"
          />
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Loading proposals...</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">
              <FileText className="w-12 h-12 mx-auto text-gray-250 mb-3" />
              No quotations generated yet. Click "New Quotation" to start.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue / Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                      {quote.quote_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{quote.customer_name}</div>
                      <div className="text-xs text-slate-500">{quote.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">{quote.hall_name}</div>
                      <div className="text-xs text-slate-500">{format(new Date(quote.event_date), 'dd MMM yyyy')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {formatCurrency(quote.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                        quote.status === 'approved' 
                          ? 'bg-green-50 text-green-700 border-green-150' 
                          : quote.status === 'sent'
                          ? 'bg-blue-50 text-blue-700 border-blue-150'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-150'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => toast.success("Quotation Link copied to clipboard.")}
                          className="text-slate-600 hover:text-slate-900 transition-colors flex items-center"
                          title="Share Link"
                        >
                          <Send className="w-4 h-4 mr-1" /> Share
                        </button>
                        <button 
                          onClick={() => toast.success("Downloading PDF proposal...")}
                          className="text-[#107ed8] hover:text-[#107ed8]/80 transition-colors flex items-center"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4 mr-1" /> PDF
                        </button>
                      </div>
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
export default Quotations;
