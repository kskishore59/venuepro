import React from 'react';
import { useFormContext } from 'react-hook-form';

const CheckboxWithArea = ({ name, label }: { name: string, label: string }) => {
  const { register } = useFormContext();
  return (
    <div className="flex flex-col p-4 rounded-lg border border-gray-100 bg-gray-50/30 space-y-3">
      <div className="flex items-center">
        <input type="checkbox" {...register(`facilities.has_${name}`)} id={`facilities.has_${name}`} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" />
        <label htmlFor={`facilities.has_${name}`} className="ml-2 block text-sm font-semibold text-gray-700 cursor-pointer">{label}</label>
      </div>
      <div className="relative">
        <input type="number" placeholder="Area" {...register(`facilities.${name}_area`)} className="w-full rounded border-gray-200 bg-white sm:text-xs border px-2 py-1.5 focus:ring-primary focus:border-primary" />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold uppercase">sq ft</span>
      </div>
    </div>
  );
};

export const FacilitiesTab: React.FC = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Restrooms & Hygiene</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Total Count</label>
            <input type="number" {...register('facilities.total_washrooms')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 sm:text-sm border px-4 py-2" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Gents</label>
            <input type="number" {...register('facilities.gents_washrooms')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 sm:text-sm border px-4 py-2" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Ladies</label>
            <input type="number" {...register('facilities.ladies_washrooms')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 sm:text-sm border px-4 py-2" />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" {...register('facilities.diff_abled_washroom')} className="h-5 w-5 text-primary border-gray-300 rounded-md" />
              <span className="ml-2 text-sm font-semibold text-gray-700">Disabled Accessible</span>
            </label>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Backstage & Support Rooms</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CheckboxWithArea name="bridal_suite" label="Bridal Suite" />
          <CheckboxWithArea name="outdoor_space" label="Attached Lawn" />
          
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/30 flex items-center">
            <input type="checkbox" {...register('facilities.grooms_room')} className="h-4 w-4 text-primary border-gray-300 rounded" />
            <span className="ml-2 text-sm font-semibold text-gray-700">Groom's Room</span>
          </div>

          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/30 flex flex-col space-y-3">
            <div className="flex items-center">
              <input type="checkbox" {...register('facilities.has_catering_kitchen')} className="h-4 w-4 text-primary border-gray-300 rounded" />
              <span className="ml-2 text-sm font-semibold text-gray-700">Catering Kitchen</span>
            </div>
            <select {...register('facilities.catering_kitchen_type')} className="w-full rounded border-gray-200 bg-white sm:text-xs border px-2 py-1.5">
              <option value="">Select type...</option>
              <option value="inhouse">In-house Only</option>
              <option value="outside">Outside Allowed</option>
              <option value="both">Both Available</option>
            </select>
          </div>

          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/30 flex items-center">
            <input type="checkbox" {...register('facilities.bartender_space')} className="h-4 w-4 text-primary border-gray-300 rounded" />
            <span className="ml-2 text-sm font-semibold text-gray-700">Bar Counter Space</span>
          </div>
        </div>
      </section>
    </div>
  );
};
