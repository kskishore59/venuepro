import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BookingCalendar } from '../components/bookings/BookingCalendar';
import { BookingList } from '../components/bookings/BookingList';
import { Drawer } from '../components/ui/Drawer';
import { BookingForm } from '../components/bookings/BookingForm';
import { BookingDetail } from '../components/bookings/BookingDetail';
import type { Booking } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { SEO } from '../components/ui/SEO';

export const Bookings: React.FC = () => {
  const { organization } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [drawerMode, setDrawerMode] = useState<'none' | 'create' | 'view' | 'edit'>('none');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, halls(*), customers(*)')
        .eq('org_id', organization!.id)
        .order('event_date', { ascending: false });
      return (data || []) as Booking[];
    },
    enabled: !!organization?.id
  });

  const activeBooking = bookings.find(b => b.id === selectedBooking?.id) || selectedBooking;

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setDrawerMode('create');
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDrawerMode('view');
  };

  if (isLoading) return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[450px] w-full" />
      <Skeleton className="h-[150px] w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <SEO 
        title="Bookings" 
        description="Manage your banquet bookings, coordinate venue dates, process deposits, and preview client event layouts." 
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
        <div>
          <h1 className="text-lg md:text-2xl font-extrabold text-gray-900 tracking-tight">Bookings & Calendar</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Manage your hall bookings, events, and schedules.</p>
        </div>
        <button 
          onClick={() => { setSelectedDate(new Date()); setDrawerMode('create'); }}
          className="w-full sm:w-auto px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-bold text-xs md:text-sm text-center"
        >
          + New Booking
        </button>
      </div>

      <div className="h-[460px] md:h-[600px]">
        <BookingCalendar 
          bookings={bookings} 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate}
          onDateClick={handleDateClick}
          onBookingClick={handleBookingClick}
        />
      </div>

      <BookingList bookings={bookings} onBookingClick={handleBookingClick} />

      <Drawer 
        isOpen={drawerMode === 'create' || drawerMode === 'edit'} 
        onClose={() => setDrawerMode('none')} 
        title={drawerMode === 'create' ? "Create New Booking" : "Edit Booking"}
        size="lg"
      >
        <BookingForm 
          initialDate={selectedDate} 
          bookingId={drawerMode === 'edit' && activeBooking ? activeBooking.id : undefined}
          initialValues={drawerMode === 'edit' && activeBooking ? {
            customer_id: activeBooking.customer_id,
            hall_id: activeBooking.hall_id,
            event_type: activeBooking.event_type as any,
            event_date: activeBooking.event_date,
            start_time: activeBooking.start_time || '',
            end_time: activeBooking.end_time || '',
            setup_start_time: activeBooking.setup_start_time || '',
            teardown_end_time: activeBooking.teardown_end_time || '',
            guest_count: activeBooking.guest_count || 1,
            total_amount: activeBooking.total_amount,
            advance_amount: activeBooking.advance_amount,
            special_requirements: activeBooking.special_requirements || '',
            internal_notes: activeBooking.internal_notes || '',
          } : undefined}
          onClose={() => {
            if (drawerMode === 'edit') setDrawerMode('view');
            else setDrawerMode('none');
          }} 
        />
      </Drawer>

      <Drawer 
        isOpen={drawerMode === 'view'} 
        onClose={() => { setDrawerMode('none'); setSelectedBooking(null); }} 
        title="Booking Details"
        size="xl"
      >
        {activeBooking && (
          <BookingDetail 
            booking={activeBooking} 
            onEdit={() => setDrawerMode('edit')}
          />
        )}
      </Drawer>
    </div>
  );
};
