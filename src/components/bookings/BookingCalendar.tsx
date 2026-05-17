import React from 'react';
import type { Booking } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BookingCalendarProps {
  bookings: Booking[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onDateClick: (date: Date) => void;
  onBookingClick: (booking: Booking) => void;
}

const statusColors: Record<string, string> = {
  inquiry: 'bg-gray-100 text-gray-800 border-gray-200',
  hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings, currentDate, setCurrentDate, onDateClick, onBookingClick }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="p-2 border border-gray-300 rounded hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={nextMonth} className="p-2 border border-gray-300 rounded hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 uppercase">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 min-h-[500px]">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="border-b border-r border-gray-100 bg-gray-50/50 p-2" />
        ))}
        {days.map(day => {
          const dayBookings = bookings.filter(b => isSameDay(new Date(b.event_date), day));
          return (
            <div 
              key={day.toISOString()} 
              className={cn("border-b border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors min-h-[100px]", 
                isSameDay(day, new Date()) ? "bg-blue-50/30" : ""
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex justify-between items-start">
                <span className={cn("text-sm font-medium", isSameDay(day, new Date()) ? "text-primary" : "text-gray-700")}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {dayBookings.map(booking => (
                  <div
                    key={booking.id}
                    onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                    className={cn("text-xs px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity", statusColors[booking.status] || statusColors.inquiry)}
                    title={`${booking.customers?.name || 'Unknown'} - ${booking.halls?.name || 'Unknown'}`}
                  >
                    {booking.start_time?.slice(0,5)} {booking.customers?.name?.split(' ')[0]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
