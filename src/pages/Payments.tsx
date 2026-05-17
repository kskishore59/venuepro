import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Drawer } from '../components/ui/Drawer';
import { PaymentForm } from '../components/payments/PaymentForm';
import { formatCurrency } from '../lib/utils';
import { generateInvoice } from '../lib/invoiceUtils';
import { format, isBefore, addDays } from 'date-fns';
import { CreditCard, Download, Search, AlertCircle, CalendarClock, MessageCircle } from 'lucide-react';

export const Payments: React.FC = () => {
  const { organization } = useAuth();
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ledger' | 'reminders'>('ledger');

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('payments')
        .select(`
          *,
          bookings (
            *,
            customers (name, phone, address, gstin),
            halls(name)
          )
        `)
        .eq('org_id', organization!.id)
        .order('payment_date', { ascending: false });
      return (data || []) as any[];
    },
    enabled: !!organization?.id
  });

  const { data: dueBookings = [], isLoading: loadingDues } = useQuery({
    queryKey: ['due_bookings', organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, customers(name, phone)')
        .eq('org_id', organization!.id)
        .gt('balance_amount', 0)
        .order('event_date', { ascending: true });
      return (data || []) as any[];
    },
    enabled: !!organization?.id
  });

  const filteredPayments = payments.filter(p =>
    p.bookings?.booking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bookings?.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReceivedThisMonth = payments
    .filter(p => new Date(p.payment_date).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCollections = dueBookings.reduce((sum, b) => sum + b.balance_amount, 0);

  const overdueBookings = dueBookings.filter(b => isBefore(new Date(b.event_date), new Date())).length;

  const handleSendReminder = (booking: any) => {
    const msg = `Hello ${booking.customers?.name}, a gentle reminder that an amount of ${formatCurrency(booking.balance_amount)} is pending for your booking ${booking.booking_number}.`;
    window.open(`https://wa.me/91${booking.customers?.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleGenerateInvoice = (booking: any, payment?: any) => {
    generateInvoice(booking, organization, payment);
  };

  if (loadingPayments || loadingDues) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Finance</h1>
          <p className="text-gray-500">Track all incoming payments, pending dues, and invoices.</p>
        </div>
        <button
          onClick={() => setIsAddingPayment(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center"
        >
          <CreditCard className="w-4 h-4 mr-2" /> Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Received This Month</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalReceivedThisMonth)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Pending Collections</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(pendingCollections)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Overdue Events</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{overdueBookings} Bookings</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-gray-200 bg-white px-6 pt-2">
          <button onClick={() => setActiveTab('ledger')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'ledger' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Ledger & Invoices
          </button>
          <button onClick={() => setActiveTab('reminders')} className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center ${activeTab === 'reminders' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Payment Reminders
            {dueBookings.length > 0 && <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{dueBookings.length}</span>}
          </button>
        </div>

        {activeTab === 'ledger' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div className="relative w-96">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer or booking #"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking / Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(payment.payment_date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.bookings?.booking_number}</div>
                        <div className="text-sm text-gray-500">{payment.bookings?.customers?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 capitalize">{payment.payment_type || 'Payment'}</div>
                        <div className="text-xs text-gray-500">{payment.payment_method} {payment.transaction_ref ? `(${payment.transaction_ref})` : ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleGenerateInvoice(payment.bookings, payment)} className="text-primary hover:text-primary/80 transition-colors flex items-center justify-end w-full">
                          <Download className="w-4 h-4 mr-1" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dueBookings.map(booking => {
                const isOverdue = isBefore(new Date(booking.event_date), new Date());
                const isDueSoon = !isOverdue && isBefore(new Date(booking.event_date), addDays(new Date(), 3));

                return (
                  <div key={booking.id} className={`p-4 rounded-lg border shadow-sm flex items-start justify-between ${isOverdue ? 'bg-red-50 border-red-100' : isDueSoon ? 'bg-yellow-50 border-yellow-100' : 'bg-white'
                    }`}>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-900">{booking.booking_number}</h3>
                        {isOverdue && <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded"><AlertCircle className="w-3 h-3 mr-1" /> OVERDUE</span>}
                        {isDueSoon && <span className="flex items-center text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded"><CalendarClock className="w-3 h-3 mr-1" /> DUE SOON</span>}
                      </div>
                      <p className="text-sm font-medium mt-1">{booking.customers?.name}</p>
                      <p className="text-sm text-gray-600 mt-1">Event: {format(new Date(booking.event_date), 'dd MMM yyyy')}</p>
                      <p className="text-sm font-bold text-orange-600 mt-2">Balance Due: {formatCurrency(booking.balance_amount)}</p>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button onClick={() => handleSendReminder(booking)} className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        <MessageCircle className="w-4 h-4 mr-1" /> Remind
                      </button>
                    </div>
                  </div>
                );
              })}
              {dueBookings.length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  All bookings are fully paid up! No pending dues.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Drawer isOpen={isAddingPayment} onClose={() => setIsAddingPayment(false)} title="Record Payment" size="md">
        <PaymentForm onClose={() => setIsAddingPayment(false)} />
      </Drawer>
    </div>
  );
};
