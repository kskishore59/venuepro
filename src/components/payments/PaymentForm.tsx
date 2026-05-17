import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const PAYMENT_METHODS = ['UPI', 'NEFT', 'RTGS', 'Cheque', 'Cash', 'Online'] as const;
const PAYMENT_TYPES = ['advance', 'installment', 'final', 'refund'] as const;

const paymentSchema = z.object({
  booking_id: z.string().min(1, 'Booking is required'),
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
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export const PaymentForm: React.FC<{ initialBookingId?: string, onClose: () => void }> = ({ initialBookingId, onClose }) => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings } = useQuery({
    queryKey: ['bookings', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('bookings').select('*, customers(name)').eq('org_id', organization!.id).neq('status', 'cancelled');
      return data || [];
    },
    enabled: !!organization
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      booking_id: initialBookingId || '',
      payment_type: 'installment',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'UPI'
    }
  });

  const selectedBookingId = watch('booking_id');
  const selectedPaymentType = watch('payment_type');
  const selectedPaymentMethod = watch('payment_method');

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
      // Create payment
      const { data: payment, error } = await supabase.from('payments').insert({
        ...data,
        org_id: organization!.id,
        status: 'completed',
        payment_date: new Date(data.payment_date).toISOString()
      }).select().single();

      if (error) throw error;

      // Update booking balance and advance (if advance type)
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
        
        await supabase.from('bookings').update({ 
          balance_amount: newBalance,
          advance_amount: newAdvance,
          ...(newBalance === 0 ? { status: 'confirmed' } : {}) 
        }).eq('id', booking.id);

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
    <form onSubmit={handleSubmit((d) => createPayment.mutate(d))} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Booking *</label>
        <select {...register('booking_id')} disabled={!!initialBookingId} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2 disabled:bg-gray-100">
          <option value="">Select a booking...</option>
          {bookings?.map(b => (
            <option key={b.id} value={b.id}>
              {b.booking_number} - {b.customers?.name} (Bal Due: ₹{b.balance_amount})
            </option>
          ))}
        </select>
        {errors.booking_id && <p className="text-red-500 text-xs mt-1">{errors.booking_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Type *</label>
          <select {...register('payment_type')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2">
            {PAYMENT_TYPES.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
          </select>
          {errors.payment_type && <p className="text-red-500 text-xs mt-1">{errors.payment_type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount (₹) *</label>
          <input type="number" {...register('amount')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Mode *</label>
          <select {...register('payment_method')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2">
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.payment_method && <p className="text-red-500 text-xs mt-1">{errors.payment_method.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Date *</label>
          <input type="date" {...register('payment_date')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.payment_date && <p className="text-red-500 text-xs mt-1">{errors.payment_date.message}</p>}
        </div>
      </div>

      {['UPI', 'NEFT', 'RTGS', 'Online'].includes(selectedPaymentMethod) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Transaction Reference *</label>
          <input type="text" {...register('transaction_ref')} placeholder="e.g. UTR Number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.transaction_ref && <p className="text-red-500 text-xs mt-1">{errors.transaction_ref.message}</p>}
        </div>
      )}

      {selectedPaymentMethod === 'Cheque' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cheque Number *</label>
            <input type="text" {...register('cheque_number')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
            {errors.cheque_number && <p className="text-red-500 text-xs mt-1">{errors.cheque_number.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Name *</label>
            <input type="text" {...register('bank_name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
            {errors.bank_name && <p className="text-red-500 text-xs mt-1">{errors.bank_name.message}</p>}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea {...register('notes')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50">
          {isSubmitting ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
};
