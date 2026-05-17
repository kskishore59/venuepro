import React from 'react';
import type { Booking } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BookingCalendarProps {
  bookings: Booking[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onDateClick: (date: Date) => void;
  onBookingClick: (booking: Booking) => void;
}

const statusColors: Record<string, string> = {
  inquiry: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  hold: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70',
  in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 11 }, (_, i) => 2024 + i); // 2024 to 2034

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  bookings, 
  currentDate, 
  setCurrentDate, 
  onDateClick, 
  onBookingClick 
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Calculate Google Calendar grid start and end intervals (includes outer days)
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextDate = new Date(currentDate.getFullYear(), parseInt(e.target.value), 1);
    setCurrentDate(nextDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextDate = new Date(parseInt(e.target.value), currentDate.getMonth(), 1);
    setCurrentDate(nextDate);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header controls with Month & Year Selectors */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-gray-150 gap-4 bg-gray-50/20">
        
        {/* Title & Dropdown controls */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary shrink-0" />
          
          <div className="flex items-center space-x-1.5">
            {/* Month Select */}
            <select
              value={currentDate.getMonth()}
              onChange={handleMonthChange}
              className="bg-transparent font-bold text-gray-900 text-base focus:outline-none cursor-pointer hover:text-primary pr-2 py-0.5 rounded transition-colors"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={currentDate.getFullYear()}
              onChange={handleYearChange}
              className="bg-transparent font-bold text-gray-500 text-sm focus:outline-none cursor-pointer hover:text-primary pr-2 py-0.5 rounded transition-colors"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation chevrons */}
        <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button 
            onClick={prevMonth} 
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextMonth} 
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-150 bg-gray-50/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">{day}</div>
        ))}
      </div>

      {/* Days Grid (Google Calendar Layout style with outer month days) */}
      <div className="grid grid-cols-7 flex-1 min-h-[380px] divide-x divide-y divide-gray-100 bg-gray-50/10">
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isSameDay(day, new Date());
          const dayBookings = bookings.filter(b => isSameDay(new Date(b.event_date), day));
          
          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "p-1.5 cursor-pointer hover:bg-gray-50/60 transition-all min-h-[75px] flex flex-col justify-between group", 
                !isCurrentMonth && "bg-gray-50/40 opacity-45 pointer-events-none",
                isTodayDate && "bg-blue-50/20"
              )}
              onClick={() => isCurrentMonth && onDateClick(day)}
            >
              {/* Date Badge */}
              <div className="flex justify-between items-center">
                <span className={cn(
                  "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all", 
                  isTodayDate 
                    ? "bg-primary text-white shadow-sm" 
                    : isCurrentMonth
                    ? "text-gray-700 group-hover:bg-gray-200/50"
                    : "text-gray-300"
                )}>
                  {format(day, 'd')}
                </span>
                
                {dayBookings.length > 0 && isCurrentMonth && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-gray-150 text-gray-600 rounded-full font-bold">
                    {dayBookings.length}
                  </span>
                )}
              </div>

              {/* Day slots list */}
              <div className="mt-1 flex flex-col gap-0.5 overflow-hidden flex-1 max-h-[70px]">
                {isCurrentMonth && dayBookings.slice(0, 3).map(booking => (
                  <div
                    key={booking.id}
                    onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                    className={cn(
                      "text-[10px] px-1 py-0.5 rounded border font-semibold truncate cursor-pointer transition-all shadow-sm", 
                      statusColors[booking.status] || statusColors.inquiry
                    )}
                    title={`${booking.customers?.name || 'Walk-in'} - ${booking.halls?.name || 'Main space'}`}
                  >
                    <span className="font-bold mr-1">{booking.start_time?.slice(0, 5)}</span>
                    {booking.customers?.name?.split(' ')[0]}
                  </div>
                ))}
                
                {isCurrentMonth && dayBookings.length > 3 && (
                  <div className="text-[9px] text-gray-400 font-bold text-center pt-0.5 animate-pulse">
                    + {dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default BookingCalendar;
