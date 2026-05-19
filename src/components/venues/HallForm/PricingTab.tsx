import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

export const PricingTab: React.FC = () => {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricing.decor_packages"
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Rental Pricing (₹)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Base Rental</label>
            <input type="number" {...register('pricing.base_rental')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Full Day Price</label>
            <input type="number" {...register('pricing.full_day')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Morning (6am-12pm)</label>
            <input type="number" {...register('pricing.morning_slot')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Evening (12pm-6pm)</label>
            <input type="number" {...register('pricing.evening_slot')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Night (6pm-12am)</label>
            <input type="number" {...register('pricing.night_slot')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Overtime Rate / Hr</label>
            <input type="number" {...register('pricing.overtime_rate')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-150">
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Rules & Premiums</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Weekend Premium (%)</label>
            <input type="number" {...register('pricing.weekend_premium')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Season Premium (Nov-Mar, %)</label>
            <input type="number" {...register('pricing.season_premium')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Advance Deposit Req (%)</label>
            <input type="number" defaultValue={25} {...register('pricing.advance_deposit_percent')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Min Booking Hours</label>
            <input type="number" {...register('pricing.min_booking_hours')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-150">
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Catering Per Plate (₹)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Veg</label>
            <input type="number" {...register('pricing.catering_veg')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Non-Veg</label>
            <input type="number" {...register('pricing.catering_nonveg')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Jain</label>
            <input type="number" {...register('pricing.catering_jain')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2.5 transition-all mt-1.5" />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-150">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Decoration Packages</h3>
          </div>
          <button type="button" onClick={() => append({ name: '', price: 0 })} className="text-sm text-primary hover:text-primary/80 flex items-center font-bold">
            <Plus className="w-4 h-4 mr-1"/> Add Package
          </button>
        </div>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500">Package Name</label>
                <input {...register(`pricing.decor_packages.${index}.name` as const)} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2 transition-all mt-1" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-semibold text-gray-500">Price (₹)</label>
                <input type="number" {...register(`pricing.decor_packages.${index}.price` as const)} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white sm:text-sm border px-4 py-2 transition-all mt-1" />
              </div>
              <button type="button" onClick={() => remove(index)} className="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors mb-[1px]">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {fields.length === 0 && <p className="text-xs text-gray-400 italic">No packages added.</p>}
        </div>
      </div>
    </div>
  );
};
