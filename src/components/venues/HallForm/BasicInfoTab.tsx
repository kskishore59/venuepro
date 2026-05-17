import React from 'react';
import { useFormContext } from 'react-hook-form';

export const BasicInfoTab: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();

  const HALL_TYPES = [
    'Main Banquet Hall', 
    'Party Hall', 
    'Conference Room', 
    'Lawn/Garden', 
    'Terrace', 
    'Rooftop', 
    'Poolside', 
    'Board Room', 
    'Dining Hall'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hall Name <span className="text-red-500">*</span></label>
        <input 
          type="text" 
          placeholder="e.g. Grand Royal Ballroom"
          {...register('name', { required: 'Hall name is required' })} 
          className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all" 
        />
        {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Hall Type</label>
        <select {...register('hall_type')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all">
          <option value="">Select type...</option>
          {HALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Floor Number</label>
        <div className="relative">
          <input 
            type="number" 
            placeholder="0 for Ground"
            {...register('floor_number')} 
            className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all" 
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">Level</span>
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
        <textarea 
          {...register('description')} 
          rows={5} 
          placeholder="Tell us about the ambiance, decor possibilities, and unique features..."
          className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all resize-none" 
        />
      </div>

      <div className="md:col-span-2 pt-2">
        <label className="relative flex items-center group cursor-pointer">
          <div className="flex items-center h-5">
            <input 
              type="checkbox" 
              {...register('is_active')} 
              id="is_active" 
              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded-md transition-all cursor-pointer" 
            />
          </div>
          <div className="ml-3 text-sm">
            <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Mark as Active</span>
            <p className="text-gray-500 font-normal">Active halls appear in search results and are available for instant booking.</p>
          </div>
        </label>
      </div>
    </div>
  );
};
