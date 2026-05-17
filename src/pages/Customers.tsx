import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Customer } from '../types';
import { Users, Search, Phone, Mail, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

interface CustomerWithStats extends Customer {
  bookings: { id: string, total_amount: number, status: string }[];
}

export const Customers: React.FC = () => {
  const { organization } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('customers')
        .select(`
          *,
          bookings (
            id,
            total_amount,
            status
          )
        `)
        .eq('org_id', organization!.id)
        .order('created_at', { ascending: false });
      return (data || []) as CustomerWithStats[];
    },
    enabled: !!organization?.id
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCustomers = customers.length;
  const customersWithBookings = customers.filter(c => c.bookings && c.bookings.length > 0).length;

  if (isLoading) return <div className="p-8">Loading customers...</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your client database and view their booking history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Active Bookers</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{customersWithBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Repeat Customers</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {customers.filter(c => c.bookings && c.bookings.length > 1).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifetime Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                    <p>No customers found.</p>
                  </td>
                </tr>
              ) : filteredCustomers.map((customer) => {
                const totalSpent = customer.bookings?.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.total_amount : 0), 0) || 0;

                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center"><Phone className="w-3 h-3 mr-1 text-gray-400" /> {customer.phone}</div>
                      {customer.email && <div className="text-sm text-gray-500 flex items-center mt-1"><Mail className="w-3 h-3 mr-1 text-gray-400" /> {customer.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {customer.bookings?.length || 0} Bookings
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.created_at ? format(new Date(customer.created_at), 'dd MMM yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary/80 flex items-center justify-end w-full">
                        View Profile <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
