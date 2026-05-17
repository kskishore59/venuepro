import React from 'react';
import { useFormContext } from 'react-hook-form';

export const DimensionsTab: React.FC = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Capacity Metrics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Min Guests <span className="text-red-500">*</span></label>
            <input type="number" {...register('capacity_min', { required: true })} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Max Guests <span className="text-red-500">*</span></label>
            <input type="number" {...register('capacity_max', { required: true })} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Comfortable</label>
            <input type="number" {...register('comfortable_capacity')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Physical Dimensions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Total Area</label>
            <div className="relative">
              <input type="number" {...register('area_sqft')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">sq ft</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Ceiling Height</label>
            <div className="relative">
              <input type="number" {...register('ceiling_height_ft')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">ft</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Length</label>
            <div className="relative">
              <input type="number" {...register('length_ft')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">ft</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Width</label>
            <div className="relative">
              <input type="number" {...register('width_ft')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">ft</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Height</label>
            <div className="relative">
              <input type="number" {...register('height_ft')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">ft</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Internal Floors</label>
            <input type="number" placeholder="1 for single level" {...register('floors_within')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
          </div>
        </div>
      </section>
    </div>
  );
};
