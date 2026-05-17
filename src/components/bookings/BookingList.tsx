import React, { useState } from 'react';
import type { Booking } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

interface BookingListProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

export const BookingList: React.FC<BookingListProps> = ({ bookings, onBookingClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = bookings.filter(b => {
    const matchesSearch = 
      b.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.booking_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="inquiry">Inquiry</option>
            <option value="hold">Hold</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Booking #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Hall</th>
              <th className="px-4 py-3">Event Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No bookings found</td>
              </tr>
            ) : (
              filtered.map((booking) => (
                <tr 
                  key={booking.id} 
                  onClick={() => onBookingClick(booking)}
                  className="bg-white border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{booking.booking_number || 'N/A'}</td>
                  <td className="px-4 py-3">{booking.customers?.name}</td>
                  <td className="px-4 py-3">{booking.halls?.name}</td>
                  <td className="px-4 py-3">
                    {format(new Date(booking.event_date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(booking.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {formatCurrency(booking.total_amount - booking.advance_amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
