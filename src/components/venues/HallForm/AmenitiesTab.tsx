import React from 'react';
import { useFormContext } from 'react-hook-form';

const CheckboxField: React.FC<{ name: string, label: string, description?: string }> = ({ name, label, description }) => {
  const { register } = useFormContext();
  return (
    <label className="flex items-start p-3 rounded-lg border border-gray-100 bg-gray-50/30 hover:bg-gray-50 hover:border-primary/20 transition-all cursor-pointer group">
      <div className="flex items-center h-5">
        <input 
          type="checkbox" 
          {...register(`amenities.${name}`)} 
          id={`amenities.${name}`} 
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" 
        />
      </div>
      <div className="ml-3 text-sm">
        <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{label}</span>
        {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
      </div>
    </label>
  );
};

export const AmenitiesTab: React.FC = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Seating Arrangements</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CheckboxField name="theatre_style" label="Theatre Style" description="Rows of chairs facing stage" />
          <CheckboxField name="classroom_style" label="Classroom Style" description="Desks and chairs for training" />
          <CheckboxField name="banquet_round" label="Banquet Rounds" description="Round tables for dining" />
          <CheckboxField name="u_shape" label="U-Shape" description="Conference style layout" />
          <CheckboxField name="cocktail_standing" label="Cocktail / High-top" description="No fixed seating" />
          <CheckboxField name="custom_seating" label="Custom" description="Bespoke configurations" />
        </div>
      </section>

      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Audio-Visual & Tech</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <CheckboxField name="has_projector" label="Projector / Screen" />
            <input type="text" placeholder="Lumens (e.g. 5000)" {...register('amenities.projector_lumens')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 sm:text-xs border px-3 py-2" />
          </div>
          <CheckboxField name="led_screen" label="LED Wall" description="Indoor/Outdoor LED panels" />
          <CheckboxField name="pa_system" label="PA System" description="Speakers and amplifiers" />
          <div className="space-y-3">
            <CheckboxField name="has_wireless_mics" label="Wireless Mics" />
            <input type="number" placeholder="Number of mics" {...register('amenities.wireless_mics_count')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 sm:text-xs border px-3 py-2" />
          </div>
          <CheckboxField name="video_conf" label="Video Conferencing" description="Cameras and Zoom setup" />
          <div className="space-y-3">
            <CheckboxField name="has_stage_lighting" label="Stage Lighting" />
            <input type="text" placeholder="Type (PAR, Moving Head)" {...register('amenities.stage_lighting_type')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 sm:text-xs border px-3 py-2" />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Comfort & Environment</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <CheckboxField name="has_central_ac" label="Central AC" />
            <input type="text" placeholder="Total Tonnage" {...register('amenities.central_ac_tonnage')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 sm:text-xs border px-3 py-2" />
          </div>
          <div className="space-y-3">
            <CheckboxField name="has_split_ac" label="Split ACs" />
            <input type="number" placeholder="Number of units" {...register('amenities.split_ac_count')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 sm:text-xs border px-3 py-2" />
          </div>
          <CheckboxField name="ceiling_fans" label="Ceiling Fans" />
          <div className="space-y-3">
            <CheckboxField name="has_wifi" label="Guest WiFi" />
            <input type="text" placeholder="Speed (e.g. 500 Mbps)" {...register('amenities.wifi_speed')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 sm:text-xs border px-3 py-2" />
          </div>
          <CheckboxField name="air_purifiers" label="Air Purifiers" />
          <CheckboxField name="heating" label="Heating" />
        </div>
      </section>
    </div>
  );
};
