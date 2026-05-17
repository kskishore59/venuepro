import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import type { Lead } from '../../types';

const EVENT_TYPES = ['wedding', 'reception', 'engagement', 'mehendi', 'haldi', 'sangeet', 'birthday', 'anniversary', 'corporate', 'conference', 'pooja', 'other'] as const;
const SOURCES = ['WhatsApp', 'Google', 'JustDial', 'Walk-in', 'Referral', 'Instagram', 'Facebook', 'Other'] as const;

const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  event_type: z.enum(EVENT_TYPES).optional(),
  tentative_date: z.string().optional(),
  guest_count: z.coerce.number().optional(),
  budget_from: z.coerce.number().optional(),
  budget_to: z.coerce.number().optional(),
  source: z.enum(SOURCES).optional(),
  notes: z.string().optional(),
  follow_up_date: z.string().min(1, 'Follow-up date required'),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export const LeadForm: React.FC<{ onClose: () => void, initialData?: Lead }> = ({ onClose, initialData }) => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      email: initialData.email || '',
      tentative_date: initialData.tentative_date ? initialData.tentative_date.split('T')[0] : '',
      follow_up_date: initialData.follow_up_date ? initialData.follow_up_date.split('T')[0] : tomorrow.toISOString().split('T')[0],
      source: (initialData.source as any) || '',
      event_type: (initialData.event_type as any) || ''
    } : {
      follow_up_date: tomorrow.toISOString().split('T')[0]
    }
  });

  const saveLead = useMutation({
    mutationFn: async (data: LeadFormValues) => {
      const payload = {
        ...data,
        org_id: organization!.id,
      };

      if (initialData?.id) {
        const { data: lead, error } = await supabase.from('leads').update(payload).eq('id', initialData.id).select().single();
        if (error) throw error;
        return lead;
      } else {
        const { data: lead, error } = await supabase.from('leads').insert({
          ...payload,
          status: 'new',
          created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return lead;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(initialData ? 'Lead updated' : 'Lead created');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <form onSubmit={handleSubmit((d) => saveLead.mutate(d))} className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input type="text" {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone *</label>
          <input type="tel" {...register('phone')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" {...register('email')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Event Type</label>
          <select {...register('event_type')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2">
            <option value="">Select type...</option>
            {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tentative Date</label>
          <input type="date" {...register('tentative_date')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Guest Count</label>
          <input type="number" {...register('guest_count')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Lead Source</label>
          <select {...register('source')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2">
            <option value="">Select source...</option>
            {SOURCES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Budget From (₹)</label>
          <input type="number" {...register('budget_from')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Budget To (₹)</label>
          <input type="number" {...register('budget_to')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Follow-up Date *</label>
          <input type="date" {...register('follow_up_date')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          {errors.follow_up_date && <p className="text-red-500 text-xs mt-1">{errors.follow_up_date.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea {...register('notes')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Lead'}
        </button>
      </div>
    </form>
  );
};
