import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BookingCalendar } from '../components/bookings/BookingCalendar';
import { Drawer } from '../components/ui/Drawer';
import { BookingForm } from '../components/bookings/BookingForm';
import { BookingDetail } from '../components/bookings/BookingDetail';
import type { Booking } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { SEO } from '../components/ui/SEO';
import { useSubscription } from '../hooks/useSubscription';
import { toast } from 'sonner';
import { RefreshCcw, Calendar as CalendarIcon } from 'lucide-react';

export const Calendar: React.FC = () => {
  const { organization } = useAuth();
  const { subInfo } = useSubscription();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [drawerMode, setDrawerMode] = useState<'none' | 'create' | 'view' | 'edit'>('none');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const queryClient = useQueryClient();

  const moveBooking = useMutation({
    mutationFn: async ({ bookingId, newDate }: { bookingId: string, newDate: string }) => {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) throw new Error("Booking not found");
      
      const { error } = await supabase.rpc('update_booking_occ', {
        p_id: bookingId,
        p_expected_version: booking.version || 1,
        p_data: { event_date: newDate }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success("Booking rescheduled successfully.");
    },
    onError: (error: any) => {
      toast.error(`Failed to move booking: ${error.message}`);
    }
  });

  const handleBookingMove = (bookingId: string, newDate: Date) => {
    moveBooking.mutate({ bookingId, newDate: newDate.toISOString().split('T')[0] });
  };

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
    if (subInfo.isLocked) {
      toast.error("Account locked: Please renew your subscription in settings to add bookings.");
      return;
    }
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
      <Skeleton className="h-[550px] w-full" />
    </div>
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <SEO
        title="Interactive Calendar"
        description="Synchronized drag-and-drop banquet scheduler with real-time conflict checking."
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Interactive Calendar</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Drag-and-drop bookings to reschedule. Conflict check happens in real-time.</p>
        </div>
        <div className="flex w-full sm:w-auto space-x-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['bookings'] })}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm"
            title="Refresh Bookings"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (subInfo.isLocked) {
                toast.error("Account locked: Please renew your subscription to add bookings.");
                return;
              }
              setSelectedDate(new Date());
              setDrawerMode('create');
            }}
            className="px-4 py-2.5 bg-[#107ed8] text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm font-bold text-xs md:text-sm flex items-center"
          >
            <CalendarIcon className="w-4 h-4 mr-2" /> New Hold/Booking
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-250 shadow-sm p-4 overflow-hidden min-h-[500px]">
        <BookingCalendar
          bookings={bookings}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onDateClick={handleDateClick}
          onBookingClick={handleBookingClick}
          onBookingMove={handleBookingMove}
        />
      </div>

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
            internal_notes: activeBooking.internal_notes || ''
          } : undefined}
          onClose={() => setDrawerMode('none')}
        />
      </Drawer>

      <Drawer
        isOpen={drawerMode === 'view'}
        onClose={() => setDrawerMode('none')}
        title="Booking Details"
        size="lg"
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
