import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const PAYMENT_METHODS = ['UPI', 'NEFT', 'RTGS', 'Cheque', 'Cash', 'Online'] as const;
const PAYMENT_TYPES = ['advance', 'installment', 'final', 'refund', 'vendor_payout'] as const;

const paymentSchema = z.object({
  is_outbound: z.boolean().default(false),
  booking_id: z.string().optional(),
  payment_type: z.enum(PAYMENT_TYPES),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  payment_method: z.enum(PAYMENT_METHODS),
  transaction_ref: z.string().optional(),
  cheque_number: z.string().optional(),
  bank_name: z.string().optional(),
  payment_date: z.string().min(1, 'Date is required'),
  notes: z.string().optional()
}).superRefine((data, ctx) => {
  if (['UPI', 'NEFT', 'RTGS', 'Online'].includes(data.payment_method) && !data.transaction_ref) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Transaction Reference is required', path: ['transaction_ref'] });
  }
  if (data.payment_method === 'Cheque') {
    if (!data.cheque_number) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cheque Number is required', path: ['cheque_number'] });
    if (!data.bank_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bank Name is required', path: ['bank_name'] });
  }
  if (!data.is_outbound && (!data.booking_id || data.booking_id === '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Booking is required for inbound payments', path: ['booking_id'] });
  }
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export const PaymentForm: React.FC<{ initialBookingId?: string, onClose: () => void }> = ({ initialBookingId, onClose }) => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings } = useQuery({
    queryKey: ['bookings', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*, customers(name), version').eq('org_id', organization!.id).neq('status', 'cancelled');
      return data || [];
    },
    enabled: !!organization
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      is_outbound: false,
      booking_id: initialBookingId || '',
      payment_type: 'installment',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'UPI'
    }
  });

  const selectedBookingId = watch('booking_id');
  const selectedPaymentType = watch('payment_type');
  const selectedPaymentMethod = watch('payment_method');
  const isOutbound = watch('is_outbound');

  useEffect(() => {
    if (selectedPaymentType === 'final' && selectedBookingId && bookings) {
      const booking = bookings.find(b => b.id === selectedBookingId);
      if (booking) {
        setValue('amount', booking.balance_amount);
      }
    }
  }, [selectedPaymentType, selectedBookingId, bookings, setValue]);

  const createPayment = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      // Create payment in payment_ledger
      const { data: payment, error } = await supabase.from('payment_ledger').insert({
        booking_id: data.booking_id || null,
        amount: data.amount,
        transaction_type: data.is_outbound ? 'vendor_payout' : (data.payment_type === 'final' ? 'final_settlement' : data.payment_type),
        payment_method: data.payment_method,
        reference_id: data.transaction_ref || data.cheque_number || null,
        is_outbound: data.is_outbound,
        org_id: organization!.id,
        status: 'completed',
        created_at: new Date(data.payment_date).toISOString()
      }).select().single();

      if (error) throw error;

      // Update booking balance and advance using OCC
      const booking = bookings?.find(b => b.id === data.booking_id);
      if (booking) {
        let newBalance = booking.balance_amount;
        let newAdvance = booking.advance_amount;
        
        if (data.payment_type === 'refund') {
          newBalance += data.amount;
        } else {
          newBalance = Math.max(0, booking.balance_amount - data.amount);
          if (data.payment_type === 'advance') {
            newAdvance += data.amount;
          }
        }
        
        await api.updateWithOCC('bookings', booking.id, booking.version || 1, {
          balance_amount: newBalance,
          advance_amount: newAdvance,
          ...(newBalance === 0 ? { status: 'confirmed' } : {}) 
        });

        if (newBalance === 0 && booking.status !== 'confirmed') {
          toast.success("Booking fully paid! Status updated to confirmed.");
        }
      }

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Payment recorded successfully. Receipt generated.');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to record payment');
    }
  });

  return (
    <div className="bg-white rounded-xl flex flex-col h-full font-sans">
      <form onSubmit={handleSubmit((d) => createPayment.mutate(d))} className="p-6 space-y-6">
        
        <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            id="is_outbound"
            {...register('is_outbound')}
            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
          />
          <label htmlFor="is_outbound" className="text-sm font-bold text-slate-700 cursor-pointer">
            Record as Expense / Vendor Payout (Outbound)
          </label>
        </div>

        {!isOutbound && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Booking Link *</label>
          <select {...register('booking_id')} disabled={!!initialBookingId} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all disabled:opacity-50">
            <option value="">Select a booking...</option>
            {bookings?.map(b => (
              <option key={b.id} value={b.id}>
                {b.booking_number} - {b.customers?.name} (Bal Due: ₹{b.balance_amount})
              </option>
            ))}
          </select>
          {errors.booking_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.booking_id.message}</p>}
        </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Payment Type *</label>
            <select {...register('payment_type')} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all capitalize">
              {isOutbound 
                ? <option value="vendor_payout">Vendor Payout</option> 
                : PAYMENT_TYPES.filter(t => t !== 'vendor_payout').map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
            {errors.payment_type && <p className="text-red-500 text-xs mt-1 font-medium">{errors.payment_type.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Amount (₹) *</label>
            <input type="number" {...register('amount')} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all" />
            {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount.message}</p>}
          </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Payment Mode *</label>
          <select {...register('payment_method')} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all">
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.payment_method && <p className="text-red-500 text-xs mt-1 font-medium">{errors.payment_method.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Payment Date *</label>
          <input type="date" {...register('payment_date')} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all" />
          {errors.payment_date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.payment_date.message}</p>}
        </div>
      </div>

      {['UPI', 'NEFT', 'RTGS', 'Online'].includes(selectedPaymentMethod) && (
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Transaction Reference *</label>
          <input type="text" {...register('transaction_ref')} placeholder="e.g. UTR Number" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all" />
          {errors.transaction_ref && <p className="text-red-500 text-xs mt-1 font-medium">{errors.transaction_ref.message}</p>}
        </div>
      )}

      {selectedPaymentMethod === 'Cheque' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Cheque Number *</label>
            <input type="text" {...register('cheque_number')} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all" />
            {errors.cheque_number && <p className="text-red-500 text-xs mt-1 font-medium">{errors.cheque_number.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Bank Name *</label>
            <input type="text" {...register('bank_name')} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all" />
            {errors.bank_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.bank_name.message}</p>}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Notes</label>
        <textarea {...register('notes')} rows={2} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all" />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors">Cancel</button>
        <button type="submit" disabled={isSubmitting || createPayment.isPending} className="btn-brand px-6 py-2.5 text-sm font-bold rounded-xl flex items-center disabled:opacity-50">
          {(isSubmitting || createPayment.isPending) ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
    </div>
  );
};
