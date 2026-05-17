import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Drawer } from '../components/ui/Drawer';
import { AddVenueForm } from '../components/venues/AddVenueForm';
import { VenueDetail } from '../components/venues/VenueDetail';
import type { Venue, Hall } from '../types';
import { Building, MapPin, Calendar, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';

export const Venues: React.FC = () => {
  const { organization } = useAuth();
  const [drawerMode, setDrawerMode] = useState<'none' | 'add_venue'>('none');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const { data: venues = [], isLoading: loadingVenues } = useQuery({
    queryKey: ['venues', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('venues').select('*').eq('org_id', organization!.id);
      return (data || []) as Venue[];
    },
    enabled: !!organization?.id
  });

  const { data: allHalls = [] } = useQuery({
    queryKey: ['halls', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('halls').select('*').eq('org_id', organization!.id);
      return (data || []) as Hall[];
    },
    enabled: !!organization?.id
  });

  const { data: todayBookings = [] } = useQuery({
    queryKey: ['today_bookings', organization?.id],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase.from('bookings').select('hall_id').eq('org_id', organization!.id).eq('event_date', today).neq('status', 'cancelled');
      return data || [];
    },
    enabled: !!organization?.id
  });

  if (selectedVenue) {
    return <VenueDetail venue={selectedVenue} halls={allHalls.filter(h => h.venue_id === selectedVenue.id)} onBack={() => setSelectedVenue(null)} />;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venues & Halls</h1>
          <p className="text-gray-500">Manage your properties, halls, amenities, and pricing.</p>
        </div>
        <button
          onClick={() => setDrawerMode('add_venue')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          + Add Venue
        </button>
      </div>

      {loadingVenues ? (
        <div className="p-8 text-center text-gray-500">Loading venues...</div>
      ) : venues.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No venues found</h3>
          <p className="text-gray-500 mt-1 mb-4">Get started by creating your first venue location.</p>
          <button onClick={() => setDrawerMode('add_venue')} className="text-primary font-medium hover:underline">
            Add a Venue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map(venue => {
            const venueHalls = allHalls.filter(h => h.venue_id === venue.id);
            const venueHallIds = venueHalls.map(h => h.id);
            const todayCount = todayBookings.filter(b => venueHallIds.includes(b.hall_id)).length;

            return (
              <div
                key={venue.id}
                onClick={() => setSelectedVenue(venue)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {venue.primary_photo ? (
                    <img src={venue.primary_photo} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                      <Building className="w-12 h-12" />
                    </div>
                  )}
                  {todayCount > 0 && (
                    <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      {todayCount} Bookings Today
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{venue.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1.5">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {venue.city}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex space-x-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-semibold">Halls</span>
                        <div className="flex items-center mt-1">
                          <LayoutGrid className="w-4 h-4 mr-1 text-primary/60" />
                          <span className="text-sm font-bold text-gray-700">{venueHalls.length}</span>
                        </div>
                      </div>
                      <div className="flex flex-col border-l pl-4">
                        <span className="text-xs text-gray-400 uppercase font-semibold">Today</span>
                        <div className="flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1 text-green-500/60" />
                          <span className="text-sm font-bold text-gray-700">{todayCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Drawer isOpen={drawerMode === 'add_venue'} onClose={() => setDrawerMode('none')} title="Add New Venue" size="xl">
        <AddVenueForm onClose={() => setDrawerMode('none')} />
      </Drawer>
    </div>
  );
};
