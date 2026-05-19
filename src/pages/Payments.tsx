import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Drawer } from '../components/ui/Drawer';
import { PaymentForm } from '../components/payments/PaymentForm';
import { formatCurrency } from '../lib/utils';
import { generateInvoice } from '../lib/invoiceUtils';
import { format, isBefore, addDays } from 'date-fns';
import { CreditCard, Download, Search, AlertCircle, CalendarClock, MessageCircle, RefreshCcw, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';

export const Payments: React.FC = () => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ledger' | 'expenses' | 'reminders'>('ledger');

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('payment_ledger')
        .select(`
          *,
          bookings (
            *,
            customers (name, phone, address, gstin),
            halls(name)
          )
        `)
        .eq('org_id', organization!.id)
        .order('created_at', { ascending: false });
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

  const filteredPayments = payments.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.bookings?.booking_number?.toLowerCase().includes(term) ||
           p.bookings?.customers?.name?.toLowerCase().includes(term) ||
           p.reference_id?.toLowerCase().includes(term);
  });

  const inboundPayments = filteredPayments.filter(p => !p.is_outbound);
  const outboundPayments = filteredPayments.filter(p => p.is_outbound);

  const totalReceivedThisMonth = inboundPayments
    .filter(p => new Date(p.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpensesThisMonth = outboundPayments
    .filter(p => new Date(p.created_at).getMonth() === new Date().getMonth())
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
      <div className="flex justify-between items-end bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Payments & Ledger</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Track all incoming payments, pending dues, and invoices.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['payments'] });
              queryClient.invalidateQueries({ queryKey: ['due_bookings'] });
            }}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm"
            title="Refresh Data"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddingPayment(true)}
            className="btn-brand px-4 py-2.5 rounded-lg text-sm font-bold flex items-center shadow-sm"
          >
            <CreditCard className="w-4 h-4 mr-2" /> Record Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center"><ArrowUpRight className="w-3.5 h-3.5 mr-1 text-green-500"/> Received This Month</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalReceivedThisMonth)}</p>
        </div>
        <div className="card-elevated p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center"><ArrowDownRight className="w-3.5 h-3.5 mr-1 text-red-500"/> Expenses This Month</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpensesThisMonth)}</p>
        </div>
        <div className="card-elevated p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Collections</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingCollections)}</p>
        </div>
        <div className="card-elevated p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overdue Events</p>
          <p className="text-2xl font-bold text-red-600">{overdueBookings} Bookings</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 pt-2">
          <button onClick={() => setActiveTab('ledger')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ledger' ? 'border-[#107ed8] text-[#107ed8]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Income Ledger
          </button>
          <button onClick={() => setActiveTab('expenses')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'expenses' ? 'border-[#107ed8] text-[#107ed8]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Expenses & Payouts
          </button>
          <button onClick={() => setActiveTab('reminders')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'reminders' ? 'border-[#107ed8] text-[#107ed8]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inboundPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {format(new Date(payment.created_at), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800">{payment.bookings?.booking_number || 'No Booking Ref'}</div>
                        <div className="text-sm text-slate-500">{payment.bookings?.customers?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-800 capitalize">{payment.transaction_type?.replace('_', ' ') || 'Payment'}</div>
                        <div className="text-xs text-slate-500 font-medium">{payment.payment_method} {payment.reference_id ? `(${payment.reference_id})` : ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button onClick={() => setSelectedLedgerEntry(payment)} className="text-slate-600 hover:text-slate-900 transition-colors flex items-center">
                            <Eye className="w-4 h-4 mr-1" /> View
                          </button>
                          {payment.bookings && (
                            <button onClick={() => handleGenerateInvoice(payment.bookings, payment)} className="text-[#107ed8] hover:text-[#107ed8]/80 transition-colors flex items-center">
                              <Download className="w-4 h-4 mr-1" /> Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {inboundPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No income payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category / Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {outboundPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {format(new Date(payment.created_at), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800 capitalize">{payment.transaction_type?.replace('_', ' ') || 'Expense'}</div>
                        <div className="text-xs text-slate-500 font-medium">Ref: {payment.reference_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {payment.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                        - {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => setSelectedLedgerEntry(payment)} className="text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-end w-full">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {outboundPayments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No expenses recorded yet.</td>
                    </tr>
                  )}
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

      <Drawer isOpen={!!selectedLedgerEntry} onClose={() => setSelectedLedgerEntry(null)} title="Transaction Details" size="md">
        {selectedLedgerEntry && (
          <div className="p-6 space-y-6 font-sans">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className={`p-4 text-white ${selectedLedgerEntry.is_outbound ? 'bg-red-600' : 'bg-slate-900'} flex justify-between items-center`}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Transaction ID</p>
                  <p className="text-xs font-mono">{selectedLedgerEntry.id}</p>
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold capitalize">
                  {selectedLedgerEntry.is_outbound ? 'Outbound / Expense' : 'Inbound / Revenue'}
                </span>
              </div>
              <div className="p-5 space-y-4 bg-white">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</p>
                    <p className={`text-2xl font-bold ${selectedLedgerEntry.is_outbound ? 'text-red-600' : 'text-slate-900'}`}>
                      {selectedLedgerEntry.is_outbound ? '-' : ''}{formatCurrency(selectedLedgerEntry.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {format(new Date(selectedLedgerEntry.created_at), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Type</p>
                    <p className="font-semibold text-slate-900 capitalize mt-0.5">
                      {selectedLedgerEntry.transaction_type?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</p>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedLedgerEntry.payment_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference ID</p>
                    <p className="font-semibold text-slate-900 mt-0.5 font-mono">
                      {selectedLedgerEntry.reference_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</p>
                    <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded-md capitalize mt-0.5">
                      {selectedLedgerEntry.status}
                    </span>
                  </div>
                </div>

                {selectedLedgerEntry.bookings && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Linked Booking</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Booking Number</p>
                        <p className="font-bold text-slate-800">{selectedLedgerEntry.bookings.booking_number}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Customer Name</p>
                        <p className="font-bold text-slate-800">{selectedLedgerEntry.bookings.customers?.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Hall Name</p>
                        <p className="font-bold text-slate-800">{selectedLedgerEntry.bookings.halls?.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Event Date</p>
                        <p className="font-bold text-slate-800">{format(new Date(selectedLedgerEntry.bookings.event_date), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setSelectedLedgerEntry(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors text-sm shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
