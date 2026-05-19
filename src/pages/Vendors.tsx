import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/ui/SEO';
import { Truck, Phone, Star, Plus, Mail, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

export const Vendors: React.FC = () => {
  const { organization } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch vendors mock data
  const { data: vendors = [], isLoading, refetch } = useQuery({
    queryKey: ['vendors', organization?.id],
    queryFn: async () => {
      // In a full production SaaS, we query the vendors table.
      // Here we provide high-fidelity mock vendors matching Indian venue setups (Catering, Decors, Lights).
      return [
        { id: '1', name: 'Elite Catering Solutions', service: 'Catering & Buffet', phone: '9876543210', email: 'elite@catering.com', rating: 4.8, status: 'approved' },
        { id: '2', name: 'Grand Mandap Decors', service: 'Stage Decoration & Floral', phone: '9845612300', email: 'grand@decor.com', rating: 4.9, status: 'approved' },
        { id: '3', name: 'Spark DJ & Lighting', service: 'Sound System & Pyrotechnics', phone: '9123456789', email: 'spark@lights.com', rating: 4.5, status: 'pending' },
        { id: '4', name: 'Valet Pro Services', service: 'Parking Coordination', phone: '9786541230', email: 'valet@parking.com', rating: 4.7, status: 'approved' },
      ];
    },
    enabled: !!organization?.id
  });

  const handleAddVendor = () => {
    toast.success("Add Vendor dialog opened.");
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <SEO 
        title="Vendor Management" 
        description="Collaborate with external decorators, caterers, DJs, and valet services." 
      />

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Vendor Management</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Track external contracts, verify ratings, and coordinate stage decors or catering setups.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors bg-white shadow-sm"
            title="Refresh Vendors"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleAddVendor}
            className="btn-brand px-4 py-2.5 rounded-lg text-sm font-bold flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Partner Vendor
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <input
            type="text"
            placeholder="Search by vendor name or service..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-80 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm border px-3 py-2 bg-white"
          />
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">
              <Truck className="w-12 h-12 mx-auto text-gray-250 mb-3" />
              No partner vendors added yet.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {vendor.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900 flex items-center"><Phone className="w-3 h-3 mr-1 text-slate-400" /> {vendor.phone}</div>
                      <div className="text-xs text-slate-500 flex items-center"><Mail className="w-3 h-3 mr-1 text-slate-400" /> {vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-bold text-amber-500">
                        <Star className="w-4 h-4 mr-1 fill-amber-500" /> {vendor.rating}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                        vendor.status === 'approved' 
                          ? 'bg-green-50 text-green-700 border-green-150' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-150'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => toast.info("Opening vendor detail portal...")}
                        className="text-[#107ed8] hover:text-[#107ed8]/80 font-bold transition-colors"
                      >
                        Manage Contract
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
export default Vendors;
