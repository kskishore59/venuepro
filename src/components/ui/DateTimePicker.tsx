import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, Clock } from 'lucide-react';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  placeholderText?: string;
  className?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  minDate,
  placeholderText = "Select Date",
  className = ""
}) => {
  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 transition-colors group-hover:text-primary text-gray-400">
        <Calendar className="w-4 h-4" />
      </div>
      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        placeholderText={placeholderText}
        dateFormat="dd MMM yyyy"
        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white transition-all ${className}`}
        wrapperClassName="w-full"
        popperClassName="premium-datepicker-popper"
      />
    </div>
  );
};

interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select Time",
  className = ""
}) => {
  // Generate times at 30 min intervals
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const hh = hour.toString().padStart(2, '0');
        const mm = min.toString().padStart(2, '0');
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        slots.push({
          value: `${hh}:${mm}`,
          label: `${displayHour}:${mm} ${ampm}`
        });
      }
    }
    return slots;
  }, []);

  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 transition-colors group-hover:text-primary text-gray-400">
        <Clock className="w-4 h-4" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white cursor-pointer transition-all ${className}`}
      >
        <option value="" disabled>{placeholder}</option>
        {timeSlots.map(slot => (
          <option key={slot.value} value={slot.value}>{slot.label}</option>
        ))}
      </select>
    </div>
  );
};
