import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import type { Hall } from '../../../types';

import { BasicInfoTab } from './BasicInfoTab';
import { DimensionsTab } from './DimensionsTab';
import { AmenitiesTab } from './AmenitiesTab';
import { FacilitiesTab } from './FacilitiesTab';
import { PricingTab } from './PricingTab';
import { MediaTab } from './MediaTab';

const TABS = ['Basic Info', 'Dimensions', 'Amenities', 'Facilities', 'Pricing', 'Media'];

export const HallForm: React.FC<{ onClose: () => void, initialData?: Hall, venueId?: string }> = ({ onClose, initialData, venueId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const methods = useForm({
    defaultValues: initialData || {
      pricing: { decor_packages: [] },
      amenities: {},
      facilities: {},
      media: {}
    }
  });

  const saveHall = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        org_id: organization!.id,
        venue_id: venueId || data.venue_id
      };

      if (initialData?.id) {
        const { error } = await supabase.from('halls').update(payload).eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('halls').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['halls'] });
      toast.success(initialData ? 'Hall updated' : 'Hall created');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  return (
    <div className="flex flex-col h-full bg-white space-y-6 max-w-5xl mx-auto pb-16">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 flex space-x-8">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`py-5 text-sm font-semibold border-b-2 transition-all ${activeTab === idx
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <FormProvider {...methods}>
          <form id="hall-form" onSubmit={methods.handleSubmit((d) => saveHall.mutate(d))} className="max-w-4xl">
            {activeTab === 0 && <BasicInfoTab />}
            {activeTab === 1 && <DimensionsTab />}
            {activeTab === 2 && <AmenitiesTab />}
            {activeTab === 3 && <FacilitiesTab />}
            {activeTab === 4 && <PricingTab />}
            {activeTab === 5 && <MediaTab />}
          </form>
        </FormProvider>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 z-10 bg-gray-50/80 backdrop-blur-md border-t border-gray-100 p-6 flex justify-between items-center px-8">
        <div className="flex space-x-3">
          {activeTab > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab(a => a - 1)}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Back
            </button>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Discard
          </button>
          {activeTab < TABS.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveTab(a => a + 1)}
              className="px-8 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              Next
            </button>
          ) : (
            <button
              form="hall-form"
              type="submit"
              disabled={saveHall.isPending}
              className="px-10 py-2.5 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              {saveHall.isPending ? 'Saving...' : 'Publish Hall Details'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
