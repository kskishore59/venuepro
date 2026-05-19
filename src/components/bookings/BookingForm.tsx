import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { CustomDatePicker, CustomTimePicker } from '../ui/DateTimePicker';

const EVENT_TYPES = ['wedding', 'reception', 'engagement', 'mehendi', 'haldi', 'sangeet', 'birthday', 'anniversary', 'corporate', 'conference', 'pooja', 'other'] as const;

const bookingSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  hall_id: z.string().min(1, 'Hall is required'),
  event_type: z.enum(EVENT_TYPES),
  event_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  setup_start_time: z.string().optional(),
  teardown_end_time: z.string().optional(),
  guest_count: z.coerce.number().min(1, 'Must have at least 1 guest'),
  total_amount: z.coerce.number().min(0, 'Must be valid amount'),
  advance_amount: z.coerce.number().min(0, 'Must be valid amount'),
  special_requirements: z.string().optional(),
  internal_notes: z.string().optional()
}).refine((data) => data.advance_amount <= data.total_amount, {
  message: "Advance cannot exceed total amount",
  path: ["advance_amount"]
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export const BookingForm: React.FC<{ 
  initialDate?: Date, 
  initialValues?: Partial<BookingFormValues>, 
  bookingId?: string, // Added for editing
  onClose: () => void, 
  onSuccess?: (booking: any) => void 
}> = ({ initialDate, initialValues, bookingId, onClose, onSuccess }) => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const { data: halls } = useQuery({
    queryKey: ['halls', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('halls').select('*').eq('org_id', organization!.id);
      return data || [];
    },
    enabled: !!organization
  });

  const { data: customers } = useQuery({
    queryKey: ['customers', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('customers').select('*').eq('org_id', organization!.id);
      return data || [];
    },
    enabled: !!organization
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      ...initialValues,
      event_date: initialDate ? initialDate.toISOString().split('T')[0] : (initialValues?.event_date || ''),
    }
  });

  const watchHallId = watch('hall_id');
  const watchTotal = watch('total_amount');
  const watchEventDate = watch('event_date');
  const watchStartTime = watch('start_time');
  const watchEndTime = watch('end_time');
  const watchSetupStartTime = watch('setup_start_time') || '';
  const watchTeardownEndTime = watch('teardown_end_time') || '';

  const eventDateObj = React.useMemo(() => {
    return watchEventDate ? new Date(watchEventDate) : null;
  }, [watchEventDate]);

  const selectedHall = React.useMemo(() => {
    return halls?.find(h => h.id === watchHallId);
  }, [halls, watchHallId]);

  // Sync total_amount with hall base rental when hall changes (only for new bookings)
  React.useEffect(() => {
    if (selectedHall && !bookingId) {
      const pricing = selectedHall.pricing || {};
      const baseRental = Number(pricing.base_rental) || Number(pricing.full_day) || 0;
      if (baseRental > 0) {
        setValue('total_amount', baseRental);
      }
    }
  }, [selectedHall, setValue, bookingId]);

  // Sync advance_amount when total_amount or selectedHall changes
  React.useEffect(() => {
    if (watchTotal > 0) {
      const pricing = selectedHall?.pricing || {};
      const percent = Number(pricing.advance_deposit_percent) || 25;
      setValue('advance_amount', Math.round(watchTotal * (percent / 100)));
    }
  }, [watchTotal, selectedHall, setValue]);

  const submitBooking = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const selectedHall = halls?.find(h => h.id === data.hall_id);
      if (selectedHall && data.guest_count > selectedHall.capacity_max) {
        throw new Error(`Guest count exceeds hall capacity (${selectedHall.capacity_max})`);
      }

      // Check conflict
      const conflictQuery = supabase
        .from('bookings')
        .select('id')
        .eq('hall_id', data.hall_id)
        .eq('event_date', data.event_date)
        .neq('status', 'cancelled');
        
      if (bookingId) {
        conflictQuery.neq('id', bookingId);
      }

      const { data: conflicts } = await conflictQuery;
        
      if (conflicts && conflicts.length > 0) {
        throw new Error('Hall is already booked for this date');
      }

      if (bookingId) {
        // Fetch current version for OCC
        const { data: currentRec } = await supabase.from('bookings').select('version').eq('id', bookingId).single();
        // Update booking with OCC
        const updatedBooking = await api.updateWithOCC('bookings', bookingId, currentRec?.version || 1, {
            ...data,
            balance_amount: data.total_amount - data.advance_amount,
        });
        return updatedBooking;
      } else {
        // Create booking using dual-write helper
        const newBooking = await api.createBooking({
          ...data,
          balance_amount: data.total_amount - data.advance_amount,
          org_id: organization!.id,
          status: 'hold'
        });
        return newBooking;
      }
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(bookingId ? 'Booking updated successfully' : 'Booking created successfully');
      if (onSuccess) onSuccess(booking);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <form onSubmit={handleSubmit((d) => submitBooking.mutate(d as BookingFormValues))} className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Customer</label>
          <select {...register('customer_id')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2">
            <option value="">Select customer...</option>
            {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hall</label>
          <select {...register('hall_id')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2">
            <option value="">Select hall...</option>
            {halls?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          {errors.hall_id && <p className="text-red-500 text-xs mt-1">{errors.hall_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Event Type</label>
          <select {...register('event_type')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2">
            <option value="">Select type...</option>
            {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          {errors.event_type && <p className="text-red-500 text-xs mt-1">{errors.event_type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <div className="mt-1">
            <CustomDatePicker
              selected={eventDateObj}
              onChange={(date) => {
                setValue('event_date', date ? date.toISOString().split('T')[0] : '');
              }}
              minDate={new Date()}
            />
          </div>
          {errors.event_date && <p className="text-red-500 text-xs mt-1">{errors.event_date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Guest Count</label>
          <input type="number" {...register('guest_count')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.guest_count && <p className="text-red-500 text-xs mt-1">{errors.guest_count.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <div className="mt-1">
            <CustomTimePicker
              value={watchStartTime}
              onChange={(time) => setValue('start_time', time)}
              placeholder="Select Start Time"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <div className="mt-1">
            <CustomTimePicker
              value={watchEndTime}
              onChange={(time) => setValue('end_time', time)}
              placeholder="Select End Time"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Setup Start</label>
          <div className="mt-1">
            <CustomTimePicker
              value={watchSetupStartTime}
              onChange={(time) => setValue('setup_start_time', time)}
              placeholder="Select Setup Start"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Teardown End</label>
          <div className="mt-1">
            <CustomTimePicker
              value={watchTeardownEndTime}
              onChange={(time) => setValue('teardown_end_time', time)}
              placeholder="Select Teardown End"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Total Amount (₹)</label>
          <input type="number" {...register('total_amount')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.total_amount && <p className="text-red-500 text-xs mt-1">{errors.total_amount.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Advance Required (₹)</label>
          <input type="number" {...register('advance_amount')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.advance_amount && <p className="text-red-500 text-xs mt-1">{errors.advance_amount.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
          <textarea {...register('special_requirements')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Internal Notes</label>
          <textarea {...register('internal_notes')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : bookingId ? 'Save Changes' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
};
