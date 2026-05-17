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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rental Pricing (₹)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Base Rental</label>
            <input type="number" {...register('pricing.base_rental')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Day Price</label>
            <input type="number" {...register('pricing.full_day')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Morning (6am-12pm)</label>
            <input type="number" {...register('pricing.morning_slot')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Evening (12pm-6pm)</label>
            <input type="number" {...register('pricing.evening_slot')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Night (6pm-12am)</label>
            <input type="number" {...register('pricing.night_slot')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Overtime Rate / Hr</label>
            <input type="number" {...register('pricing.overtime_rate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rules & Premiums</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weekend Premium (%)</label>
            <input type="number" {...register('pricing.weekend_premium')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Season Premium (Nov-Mar, %)</label>
            <input type="number" {...register('pricing.season_premium')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Advance Deposit Req (%)</label>
            <input type="number" defaultValue={25} {...register('pricing.advance_deposit_percent')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Booking Hours</label>
            <input type="number" {...register('pricing.min_booking_hours')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Catering Per Plate (₹)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Veg</label>
            <input type="number" {...register('pricing.catering_veg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Non-Veg</label>
            <input type="number" {...register('pricing.catering_nonveg')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jain</label>
            <input type="number" {...register('pricing.catering_jain')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Decoration Packages</h3>
          <button type="button" onClick={() => append({ name: '', price: 0 })} className="text-sm text-primary flex items-center font-medium">
            <Plus className="w-4 h-4 mr-1"/> Add Package
          </button>
        </div>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500">Package Name</label>
                <input {...register(`pricing.decor_packages.${index}.name` as const)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2 text-sm" />
              </div>
              <div className="w-32">
                <label className="block text-xs text-gray-500">Price (₹)</label>
                <input type="number" {...register(`pricing.decor_packages.${index}.price` as const)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border px-3 py-2 text-sm" />
              </div>
              <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-200 mb-[1px]">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {fields.length === 0 && <p className="text-sm text-gray-500 italic">No packages added.</p>}
        </div>
      </div>
    </div>
  );
};
