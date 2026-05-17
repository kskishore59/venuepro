import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const AddVenueForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const saveVenue = useMutation({
    mutationFn: async (data: any) => {
      const { data: newVenue, error } = await supabase.from('venues').insert({
        org_id: organization!.id,
        ...data
      }).select().single();

      if (error) throw error;
      return newVenue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast.success('Venue added successfully');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <div className="flex flex-col h-full ">
      <div className="flex-1 p-6 overflow-y-auto flex-row ">
        <form id="venue-form" onSubmit={handleSubmit((d) => saveVenue.mutate(d))} className="space-y-6 max-w-2xl mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">Venue Name *</label>
            <input type="text" {...register('name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City *</label>
            <input type="text" {...register('city', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Address</label>
            <textarea {...register('address')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea {...register('description')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
          </div>
        </form>
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 px-6">
        <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50">Cancel</button>
        <button form="venue-form" type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Venue'}
        </button>
      </div>
    </div>
  );
};
