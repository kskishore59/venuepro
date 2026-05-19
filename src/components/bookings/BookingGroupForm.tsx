import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar, MapPin, Loader2 } from 'lucide-react';

const EVENT_TYPES = ['wedding', 'reception', 'engagement', 'mehendi', 'haldi', 'sangeet', 'birthday', 'anniversary', 'corporate', 'conference', 'pooja', 'other'] as const;

const eventSchema = z.object({
  hall_id: z.string().min(1, 'Hall is required'),
  event_type: z.enum(EVENT_TYPES),
  event_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  guest_count: z.coerce.number().min(1, 'Must have at least 1 guest'),
  total_amount: z.coerce.number().min(0, 'Must be valid amount'),
  advance_amount: z.coerce.number().min(0, 'Must be valid amount'),
}).refine((data) => data.advance_amount <= data.total_amount, {
  message: "Advance cannot exceed total amount",
  path: ["advance_amount"]
});

const groupSchema = z.object({
  title: z.string().min(3, 'Group title must be at least 3 characters'),
  customer_id: z.string().min(1, 'Customer is required'),
  total_budget: z.coerce.number().min(0, 'Must be valid budget'),
  events: z.array(eventSchema).min(1, 'At least one event is required')
});

type GroupFormValues = z.infer<typeof groupSchema>;

export const BookingGroupForm: React.FC<{
  initialDate?: Date;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ initialDate, onClose, onSuccess }) => {
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

  const { register, control, handleSubmit, formState: { errors } } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema) as any,
    defaultValues: {
      title: '',
      customer_id: '',
      total_budget: 0,
      events: [{
        hall_id: '',
        event_type: 'wedding',
        event_date: initialDate ? initialDate.toISOString().split('T')[0] : '',
        start_time: '10:00',
        end_time: '22:00',
        guest_count: 100,
        total_amount: 0,
        advance_amount: 0
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "events"
  });

  const submitGroup = useMutation({
    mutationFn: async (data: GroupFormValues) => {
      // 1. Validate capacities
      for (const event of data.events) {
        const selectedHall = halls?.find(h => h.id === event.hall_id);
        if (selectedHall && event.guest_count > selectedHall.capacity_max) {
          throw new Error(`Guest count exceeds capacity for hall ${selectedHall.name}`);
        }
      }

      // 2. Call Enterprise API wrapper
      await api.createBookingGroup(organization!.id, {
        title: data.title,
        customer_id: data.customer_id,
        total_budget: data.total_budget
      }, data.events);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking Group created successfully!');
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create booking group');
    }
  });

  return (
    <div className="bg-white rounded-xl flex flex-col h-full font-sans">
      <form onSubmit={handleSubmit((d) => submitGroup.mutate(d))} className="flex flex-col flex-1 h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Header Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Master Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Group Title (e.g. Sharma Wedding)</label>
                <input
                  {...register('title')}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all"
                  placeholder="Enter a title for these events"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title.message}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Customer</label>
                <select
                  {...register('customer_id')}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all"
                >
                  <option value="">Select Customer</option>
                  {customers?.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
                {errors.customer_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.customer_id.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Total Negotiated Budget (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    {...register('total_budget')}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block pl-8 p-2.5 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Sub-events Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Event Schedule</h2>
              <button
                type="button"
                onClick={() => append({
                  hall_id: '',
                  event_type: 'other',
                  event_date: initialDate ? initialDate.toISOString().split('T')[0] : '',
                  start_time: '10:00',
                  end_time: '22:00',
                  guest_count: 50,
                  total_amount: 0,
                  advance_amount: 0
                })}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#107ed8]/10 text-[#107ed8] rounded-lg text-sm font-bold hover:bg-[#107ed8]/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event Slot</span>
              </button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm relative">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-6 h-6 rounded bg-[#107ed8] text-white flex items-center justify-center text-xs mr-2">{index + 1}</span>
                    Event Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hall / Space</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <select
                          {...register(`events.${index}.hall_id`)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block pl-9 p-2.5 transition-all"
                        >
                          <option value="">Select a hall...</option>
                          {halls?.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      {errors.events?.[index]?.hall_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.events[index].hall_id?.message}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Event Type</label>
                      <select
                        {...register(`events.${index}.event_type`)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all capitalize"
                      >
                        {EVENT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="date"
                          {...register(`events.${index}.event_date`)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block pl-9 p-2.5 transition-all"
                        />
                      </div>
                      {errors.events?.[index]?.event_date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.events[index].event_date?.message}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start</label>
                        <input
                          type="time"
                          {...register(`events.${index}.start_time`)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">End</label>
                        <input
                          type="time"
                          {...register(`events.${index}.end_time`)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Guests</label>
                      <input
                        type="number"
                        {...register(`events.${index}.guest_count`)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block p-2.5 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Allocated Amount</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-medium sm:text-xs">₹</span>
                          </div>
                          <input
                            type="number"
                            {...register(`events.${index}.total_amount`)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block pl-6 p-2.5 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Advance Cut</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-medium sm:text-xs">₹</span>
                          </div>
                          <input
                            type="number"
                            {...register(`events.${index}.advance_amount`)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-[#107ed8]/20 focus:border-[#107ed8] block pl-6 p-2.5 transition-all"
                          />
                        </div>
                        {errors.events?.[index]?.advance_amount && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.events[index].advance_amount?.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.events?.root && <p className="text-red-500 text-sm mt-2 font-medium">{errors.events.root.message}</p>}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3 rounded-b-xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitGroup.isPending}
            className="btn-brand px-6 py-2.5 text-sm font-bold rounded-xl flex items-center"
          >
            {submitGroup.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Group...</>
            ) : 'Create Multi-Event Group'}
          </button>
        </div>
      </form>
    </div>
  );
};
