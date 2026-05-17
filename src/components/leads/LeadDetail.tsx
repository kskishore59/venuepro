import React, { useState } from 'react';
import type { Lead } from '../../types';
import { format } from 'date-fns';
import { Phone, Mail, Calendar, Edit2, Plus, ArrowRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Drawer } from '../ui/Drawer';
import { BookingForm } from '../bookings/BookingForm';

export const LeadDetail: React.FC<{ lead: Lead, onEdit: () => void, onClose: () => void }> = ({ lead, onEdit, onClose }) => {
  const { organization } = useAuth();
  const [activeTab, setActiveTab] = useState<'info'|'activity'>('info');
  const [isLosing, setIsLosing] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ status, reason }: { status: string, reason?: string }) => {
      const { error } = await supabase.from('leads').update({ status, lost_reason: reason }).eq('id', lead.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (isLosing) {
        toast.success('Lead marked as lost');
        onClose();
      }
    }
  });

  const handleLost = () => {
    if (!lostReason) return toast.error('Please provide a reason');
    updateStatus.mutate({ status: 'lost', reason: lostReason });
  };

  const convertToCustomer = useMutation({
    mutationFn: async () => {
      // First check if a customer with this email/phone already exists
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('org_id', organization!.id)
        .or(`phone.eq.${lead.phone}${lead.email ? `,email.eq.${lead.email}` : ''}`)
        .limit(1)
        .single();

      if (existing) return existing.id;

      // Create new customer
      const { data: customer, error } = await supabase.from('customers').insert({
        org_id: organization!.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email || null,
        address: null
      }).select('id').single();

      if (error) throw error;
      return customer.id;
    },
    onSuccess: (customerId) => {
      setNewCustomerId(customerId);
      setIsConverting(true); // Open booking drawer
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create customer record');
    }
  });

  const handleBookingSuccess = () => {
    updateStatus.mutate({ status: 'won' });
    toast.success('Lead successfully converted to a booked customer!');
    setIsConverting(false);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6 bg-white border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
              <span className="flex items-center"><Phone className="w-3 h-3 mr-1"/> {lead.phone}</span>
              {lead.email && <span className="flex items-center"><Mail className="w-3 h-3 mr-1"/> {lead.email}</span>}
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
            {lead.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={onEdit} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Info
          </button>
          <button 
            onClick={() => convertToCustomer.mutate()} 
            disabled={convertToCustomer.isPending || lead.status === 'won'}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {convertToCustomer.isPending ? 'Converting...' : 'Convert to Booking'} <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          <button onClick={() => setIsLosing(true)} className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 transition-colors">
            Mark as Lost
          </button>
        </div>
      </div>

      {isLosing && (
        <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex-1 mr-4">
            <label className="block text-xs font-medium text-red-800 mb-1">Reason for losing lead</label>
            <select value={lostReason} onChange={(e) => setLostReason(e.target.value)} className="w-full text-sm border-red-200 rounded-md py-1.5 focus:ring-red-500 focus:border-red-500">
              <option value="">Select reason...</option>
              <option value="Price">Price too high</option>
              <option value="Date">Date not available</option>
              <option value="Competitor">Went with competitor</option>
              <option value="No Response">Unresponsive</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex space-x-2 mt-5">
            <button onClick={() => setIsLosing(false)} className="px-3 py-1.5 text-sm text-gray-600 bg-white border rounded">Cancel</button>
            <button onClick={handleLost} className="px-3 py-1.5 text-sm text-white bg-red-600 rounded hover:bg-red-700">Confirm</button>
          </div>
        </div>
      )}

      <div className="flex border-b border-gray-200 bg-white px-6 pt-2">
        {['info', 'activity'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'info' ? 'Lead Info' : 'Activity Log'}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Event Type</p>
                <p className="font-medium capitalize">{lead.event_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tentative Date</p>
                <p className="font-medium">{lead.tentative_date ? format(new Date(lead.tentative_date), 'dd MMM yyyy') : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Guest Count</p>
                <p className="font-medium">{lead.guest_count ? `${lead.guest_count} pax` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-medium">
                  {lead.budget_from || lead.budget_to 
                    ? `₹${lead.budget_from || 0} - ₹${lead.budget_to || 'Any'}` 
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-medium">{lead.source || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Follow-up Date</p>
                <p className="font-medium flex items-center">
                  <Calendar className="w-3 h-3 mr-1"/>
                  {lead.follow_up_date ? format(new Date(lead.follow_up_date), 'dd MMM yyyy') : 'N/A'}
                </p>
              </div>
            </div>

            {lead.notes && (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Timeline</h3>
              <button className="flex items-center text-sm text-primary hover:text-primary/80 font-medium">
                <Plus className="w-4 h-4 mr-1"/> Add Activity
              </button>
            </div>
            
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pb-4">
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5" />
                <p className="text-sm font-medium text-gray-900">Lead Created</p>
                <p className="text-xs text-gray-500 mt-0.5">{format(new Date(lead.created_at || new Date()), 'dd MMM yyyy, h:mm a')}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-8">Activity logging functionality pending implementation.</p>
          </div>
        )}
      </div>

      <Drawer isOpen={isConverting} onClose={() => setIsConverting(false)} title="Convert to Booking" size="lg">
        {newCustomerId && (
          <BookingForm 
            onClose={() => setIsConverting(false)} 
            onSuccess={handleBookingSuccess}
            initialValues={{
              customer_id: newCustomerId,
              event_date: lead.tentative_date ? lead.tentative_date.split('T')[0] : '',
              event_type: (lead.event_type as any) || undefined,
              guest_count: lead.guest_count || 100,
            }}
          />
        )}
      </Drawer>
    </div>
  );
};
