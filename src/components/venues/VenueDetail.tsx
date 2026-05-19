import React, { useState } from 'react';
import type { Venue, Hall } from '../../types';
import { ArrowLeft, Building, Edit2, Users, Maximize } from 'lucide-react';
import { HallForm } from './HallForm';
import { formatCurrency } from '../../lib/utils';
import { Drawer } from '../ui/Drawer';

export const VenueDetail: React.FC<{ venue: Venue, halls: Hall[], onBack: () => void }> = ({ venue, halls, onBack }) => {
  const [drawerMode, setDrawerMode] = useState<'none' | 'add_hall' | 'edit_hall'>('none');
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);

  return (
    <div className="space-y-6 flex flex-col h-full bg-gray-50/30">
      <div className="bg-white border-b border-gray-200 px-8 py-6 -mx-8 -mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2.5 hover:bg-gray-50 border border-gray-100 rounded-xl transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{venue.name}</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1 font-medium">
                <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">VENUE</span>
                {venue.city} {venue.address ? `• ${venue.address}` : ''}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setSelectedHall(null); setDrawerMode('add_hall'); }}
            className="flex items-center  px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Edit2 className="w-4 h-4 mr-2" /> + Create New Space
          </button>
        </div>
      </div>

      <div className="px-8 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Configured Spaces ({halls.length})</h2>
        </div>

        {halls.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Building className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Start by adding a hall</h3>
            <p className="text-gray-500 mt-2 mb-8 max-w-sm">Every venue needs at least one hall or space to receive bookings. Add your first one now.</p>
            <button onClick={() => setDrawerMode('add_hall')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">
              Create First Hall
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pb-12 overflow-y-auto pr-2 max-w-xl">
            {halls.map(hall => {
              const primaryPhoto = hall.media?.primary_photo || hall.media?.photos?.[0];
              const baseRental = hall.pricing?.base_rental || 0;

              return (
                <div
                  key={hall.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                  onClick={() => { setSelectedHall(hall); setDrawerMode('edit_hall'); }}
                >
                  <div className="flex">
                    <div className="w-40 h-50 bg-gray-50 shrink-0 relative">
                      {primaryPhoto ? (
                        <img src={primaryPhoto} alt={hall.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                          <Building className="w-10 h-10" />
                        </div>
                      )}
                      {!hall.is_active && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">Inactive</div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col justify-between items-start">
                          <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors leading-tight">{hall.name}</h3>
                          <span className="text-[10px] font-bold mt-4 text-gray-400 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">{hall.hall_type || 'Hall'}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4">
                          <div className="flex items-center text-xs font-semibold text-gray-600">
                            <Users className="w-3.5 h-3.5 mr-1.5 text-primary/50" />
                            {hall.capacity_max} Pax
                          </div>
                          {hall.area_sqft && (
                            <div className="flex items-center text-xs font-semibold text-gray-600">
                              <Maximize className="w-3.5 h-3.5 mr-1.5 text-primary/50" />
                              {hall.area_sqft} sqft
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                        <div className="text-xs font-bold text-gray-900">
                          Starts at <span className="text-primary">{formatCurrency(baseRental)}</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Drawer
        isOpen={drawerMode === 'add_hall' || drawerMode === 'edit_hall'}
        onClose={() => setDrawerMode('none')}
        title={drawerMode === 'add_hall' ? `Add Hall to ${venue.name}` : `Edit ${selectedHall?.name}`}
        size="xl"
      >
        <HallForm
          onClose={() => setDrawerMode('none')}
          venueId={venue.id}
          initialData={drawerMode === 'edit_hall' && selectedHall ? selectedHall : undefined}
        />
      </Drawer>
    </div>
  );
};
