import React from 'react';
import { useFormContext } from 'react-hook-form';
import { UploadCloud, Link as LinkIcon, Video } from 'lucide-react';

export const MediaTab: React.FC = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Hall Photography</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 hover:border-primary/30 transition-all cursor-pointer group">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-bold text-gray-900">Upload Gallery Photos</p>
            <p className="text-xs text-gray-500 mt-1.5 max-w-[200px]">Drag and drop or click to browse. Up to 10 high-res photos.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Upload Tip</h4>
              <p className="text-xs text-blue-700 leading-relaxed">High-quality photos of the stage, seating, and entrance significantly increase booking conversion rates.</p>
            </div>
            <p className="text-xs text-gray-400 italic">Supabase Storage integration is currently being finalized. Uploaded images will appear here for preview.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Digital Experience</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <LinkIcon className="w-4 h-4 mr-2 text-primary/60" />
              360° Virtual Tour URL
            </label>
            <input type="url" placeholder="https://matterport.com/..." {...register('media.tour_url')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <Video className="w-4 h-4 mr-2 text-primary/60" />
              YouTube Video Tour URL
            </label>
            <input type="url" placeholder="https://youtube.com/watch?v=..." {...register('media.video_url')} className="w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-4 py-2.5" />
          </div>
        </div>
      </section>
    </div>
  );
};
