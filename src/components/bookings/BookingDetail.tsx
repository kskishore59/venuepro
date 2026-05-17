import React, { useState } from 'react';
import type { Booking, Payment } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { MessageCircle, FileText, Plus, CreditCard, Edit2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Drawer } from '../ui/Drawer';
import { PaymentForm } from '../payments/PaymentForm';

export const BookingDetail: React.FC<{ booking: Booking, onEdit?: () => void }> = ({ booking, onEdit }) => {
  const { organization } = useAuth();
  const [activeTab, setActiveTab] = useState<'details'|'payments'|'log'>('details');
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments', booking.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', booking.id)
        .order('payment_date', { ascending: false });
      return (data || []) as Payment[];
    },
    enabled: activeTab === 'payments' && !!organization
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const currentBalance = booking.total_amount - totalPaid;

  const handleWhatsApp = () => {
    const phone = booking.customers?.phone;
    if (!phone) return;
    const msg = `Hello ${booking.customers?.name}, this is regarding your booking ${booking.booking_number} on ${format(new Date(booking.event_date), 'dd MMM')}.`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6 bg-white border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{booking.booking_number}</h2>
            <p className="text-sm text-gray-500">{booking.customers?.name} • {booking.event_type}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
            {booking.status}
          </span>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <button onClick={handleWhatsApp} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors">
            <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors">
            <FileText className="w-4 h-4 mr-2" /> Invoice
          </button>
          {onEdit && (
            <button onClick={onEdit} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors">
              <Edit2 className="w-4 h-4 mr-2 text-primary" /> Edit Booking
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white px-6 pt-2">
        {['details', 'payments', 'log'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Hall</p>
                <p className="font-medium">{booking.halls?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{format(new Date(booking.event_date), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Timings</p>
                <p className="font-medium">{booking.start_time} - {booking.end_time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Guests</p>
                <p className="font-medium">{booking.guest_count} pax</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="font-semibold mb-4 text-gray-900">Financials</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">{formatCurrency(booking.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance Required</span>
                  <span className="font-medium text-orange-600">{formatCurrency(booking.advance_amount)}</span>
                </div>
                <div className="pt-2 border-t mt-2 flex justify-between font-bold">
                  <span>Balance Due</span>
                  <span>{formatCurrency(currentBalance)}</span>
                </div>
              </div>
            </div>

            {booking.special_requirements && (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Requirements</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.special_requirements}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Payment History</h3>
              <button 
                onClick={() => setIsAddingPayment(true)}
                className="flex items-center px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Payment
              </button>
            </div>

            {isLoadingPayments ? (
              <div className="text-sm text-gray-500">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg bg-white">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No payments recorded yet.</p>
              </div>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{format(new Date(p.payment_date), 'dd MMM yyyy')}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{p.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {!isLoadingPayments && (
              <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Paid: {formatCurrency(totalPaid)}</span>
                <span className="font-bold text-gray-900">Balance: {formatCurrency(currentBalance)}</span>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'log' && (
          <div className="text-center py-10 text-gray-500">Activity log implementation pending</div>
        )}
      </div>

      <Drawer isOpen={isAddingPayment} onClose={() => setIsAddingPayment(false)} title="Record Payment" size="md">
        <PaymentForm initialBookingId={booking.id} onClose={() => setIsAddingPayment(false)} />
      </Drawer>
    </div>
  );
};
