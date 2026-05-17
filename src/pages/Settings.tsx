import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Save, Building, CreditCard, Shield, Users,
  AlertOctagon, Check, X, Upload
} from 'lucide-react';
import { SEO } from '../components/ui/SEO';
import { DataImport } from '../components/import/DataImport';

// Default matrix for role permissions
const DEFAULT_PERMISSIONS = {
  manager: { leads_view: true, leads_edit: true, bookings_create: true, bookings_edit: true, payments_record: true, settings_edit: false },
  coordinator: { leads_view: true, leads_edit: true, bookings_create: true, bookings_edit: false, payments_record: false, settings_edit: false },
  cleanliness: { leads_view: false, leads_edit: false, bookings_create: false, bookings_edit: false, payments_record: false, settings_edit: false }
};

export const Settings: React.FC = () => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const [activePanel, setActivePanel] = useState<'profile' | 'security' | 'staff' | 'import'>('profile');

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: organization || {}
  });

  const watchSettings = watch('settings') || {};
  const currentPermissions = watchSettings.permissions || DEFAULT_PERMISSIONS;

  // 1. Fetch Latest Organization profile
  const { data: orgData } = useQuery({
    queryKey: ['org-settings', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('organizations').select('*').eq('id', organization!.id).single();
      return data;
    },
    enabled: !!organization
  });

  // 2. Fetch Active Profiles (Staff)
  const { data: staffProfiles = [] } = useQuery({
    queryKey: ['settings-staff-profiles', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('org_id', organization!.id);
      return data || [];
    },
    enabled: !!organization
  });

  // 3. Fetch Halls
  const { data: halls = [] } = useQuery({
    queryKey: ['settings-halls', organization?.id],
    queryFn: async () => {
      const { data } = await supabase.from('halls').select('*').eq('org_id', organization!.id);
      return data || [];
    },
    enabled: !!organization
  });

  React.useEffect(() => {
    if (orgData) {
      reset(orgData);
    }
  }, [orgData, reset]);

  // 4. Update org profile mutation
  const updateSettings = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('organizations').update({
        name: data.name,
        gstin: data.gstin,
        pan: data.pan,
        address: data.address,
        settings: data.settings // Contains bank info, tax, permissions, staff assignments, abuse limits
      }).eq('id', organization!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-settings'] });
      toast.success('Configuration saved successfully');
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  // Onboard new staff profile directly inside organization boundary
  const onboardStaff = useMutation({
    mutationFn: async (payload: { email: string, full_name: string }) => {
      const { data, error } = await supabase.from('profiles').insert({
        id: crypto.randomUUID(),
        org_id: organization!.id,
        role: 'staff',
        full_name: payload.full_name
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-staff-profiles'] });
      toast.success('Staff member onboarded successfully');
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  // Toggle dynamic matrix permission
  const handlePermissionToggle = (role: string, permission: string) => {
    const updatedPermissions = { ...currentPermissions };
    const rolePermissions = updatedPermissions[role] || {};
    rolePermissions[permission] = !rolePermissions[permission];
    updatedPermissions[role] = rolePermissions;
    setValue('settings.permissions', updatedPermissions, { shouldDirty: true });
  };

  // Staff Assignment functions
  const staffAssignments = watchSettings.staff_assignments || [];

  const handleAddAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profileId = formData.get('profileId') as string;
    const hallId = formData.get('hallId') as string;
    const customRole = formData.get('customRole') as string;

    if (!profileId || !hallId || !customRole) {
      toast.error('Please fill in all staff mapping fields');
      return;
    }

    const newAssignment = {
      id: crypto.randomUUID(),
      profileId,
      hallId,
      customRole
    };

    const updated = [...staffAssignments, newAssignment];
    setValue('settings.staff_assignments', updated, { shouldDirty: true });
    toast.success('Staff mapping added');
    e.currentTarget.reset();
  };

  const handleRemoveAssignment = (id: string) => {
    const updated = staffAssignments.filter((a: any) => a.id !== id);
    setValue('settings.staff_assignments', updated, { shouldDirty: true });
    toast.success('Staff mapping removed');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <SEO title="System Settings" description="Configure organization profile, Indian GST tax schedules, role-based permission grids, and venue staff mappings." />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Configuration</h1>
        <p className="text-gray-500 mt-1">Configure multi-tenant structures, role permission matrices, cleanliness mappings, and automated abuse parameters.</p>
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar Nav */}
        <div className="space-y-1 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm h-fit">
          {[
            { id: 'profile', label: 'Organization Profile', icon: Building },
            { id: 'security', label: 'Access & Role Matrix', icon: Shield },
            { id: 'staff', label: 'Venue Staff Assignments', icon: Users },
            { id: 'import', label: 'Import Previous Data', icon: Upload }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${activePanel === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Form Panels */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit((d) => updateSettings.mutate(d))} className="space-y-6">

            {/* PANEL 1: PROFILE & BANKING */}
            {activePanel === 'profile' && (
              <div className="space-y-6 animate-fadeIn">

                {/* Org Info */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
                    <Building className="w-5 h-5 text-primary mr-2" />
                    <h3 className="font-bold text-gray-900">Organization Settings</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Venue / Org Name</label>
                      <input type="text" {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GSTIN (Indian Tax ID)</label>
                      <input type="text" {...register('gstin')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PAN (Income Tax PAN)</label>
                      <input type="text" {...register('pan')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Corporate Address</label>
                      <textarea {...register('address')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
                    <CreditCard className="w-5 h-5 text-primary mr-2" />
                    <h3 className="font-bold text-gray-900">Settlement Bank Details</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                      <input type="text" {...register('settings.bank.account_name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                      <input type="text" {...register('settings.bank.bank_name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Number</label>
                      <input type="text" {...register('settings.bank.account_number')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                      <input type="text" {...register('settings.bank.ifsc')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Branch</label>
                      <input type="text" {...register('settings.bank.branch')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                  </div>
                </div>

                {/* Tax Configuration */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
                    <Shield className="w-5 h-5 text-primary mr-2" />
                    <h3 className="font-bold text-gray-900">Tax Schedule Rates</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Default Indian GST (%)</label>
                      <input type="number" defaultValue={18} {...register('settings.tax.default_gst')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SAC Billing Classification Code</label>
                      <input type="text" defaultValue="996331" {...register('settings.tax.sac_code')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 2: SECURITY & ROLE MATRIX */}
            {activePanel === 'security' && (
              <div className="space-y-6 animate-fadeIn">

                {/* Access Control matrix */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-primary mr-2" />
                      <h3 className="font-bold text-gray-900">Role & Permission Matrices</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs rounded font-bold uppercase tracking-wider">Dynamic</span>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      Custom permissions define what actions employees can initiate across the dashboard. Click checkboxes inside the table below to toggle rules dynamically.
                    </p>

                    <table className="w-full text-left text-sm border border-gray-100 rounded-xl overflow-hidden">
                      <thead className="bg-gray-50/80 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-bold text-gray-900">Functional Modules</th>
                          <th className="px-6 py-4 text-center font-bold text-gray-900">Manager</th>
                          <th className="px-6 py-4 text-center font-bold text-gray-900">Booking Coordinator</th>
                          <th className="px-6 py-4 text-center font-bold text-gray-900">Cleanliness Staff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {[
                          { id: 'leads_view', label: 'View Leads CRM Pipeline' },
                          { id: 'leads_edit', label: 'Edit & Transition Leads' },
                          { id: 'bookings_create', label: 'Record New Hall Bookings' },
                          { id: 'bookings_edit', label: 'Edit Booking & Details' },
                          { id: 'payments_record', label: 'Log Payments & Issue Receipts' },
                          { id: 'settings_edit', label: 'Alter Corporate Tax Settings' }
                        ].map(perm => (
                          <tr key={perm.id} className="hover:bg-gray-50/30 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-800">{perm.label}</td>
                            {['manager', 'coordinator', 'cleanliness'].map(role => {
                              const isChecked = currentPermissions[role]?.[perm.id] || false;
                              return (
                                <td key={role} className="px-6 py-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handlePermissionToggle(role, perm.id)}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center border mx-auto transition-all ${isChecked
                                        ? 'bg-primary border-primary text-white scale-110 shadow-sm'
                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                      }`}
                                  >
                                    {isChecked && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Abuse limits & alerts */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
                    <AlertOctagon className="w-5 h-5 text-primary mr-2" />
                    <h3 className="font-bold text-gray-900">Abuse Protection & Spend Caps</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tentative Hold Auto-Release Interval</label>
                      <select {...register('settings.abuse.hold_expiry_hours')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2 bg-white">
                        <option value={12}>12 Hours (High Demand)</option>
                        <option value={24}>24 Hours (Standard)</option>
                        <option value={48}>48 Hours (Lenient)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Google Maps Places API Daily Hard Cap</label>
                      <input type="number" defaultValue={1000} {...register('settings.abuse.google_maps_daily_cap')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max Invoice Mailings Per Client / Day</label>
                      <input type="number" defaultValue={5} {...register('settings.abuse.max_daily_invoices')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Twilio SMS Monthly Limit Spend Cap (USD)</label>
                      <input type="number" defaultValue={20} {...register('settings.abuse.twilio_monthly_cap')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border px-3 py-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 3: VENUE STAFF ASSIGNMENT */}
            {activePanel === 'staff' && (
              <div className="space-y-6 animate-fadeIn">

                {/* Onboard Team Member Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
                    <Users className="w-5 h-5 text-primary mr-2" />
                    <h3 className="font-bold text-gray-900">Onboard & Invite Team Members</h3>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                      Create operational credentials to invite managers, coordinators, or cleanliness staff to log into the VenuePro system.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const full_name = formData.get('fullName') as string;
                        const email = formData.get('email') as string;
                        if (!full_name || !email) {
                          toast.error('Please specify both name and email');
                          return;
                        }
                        onboardStaff.mutate({ email, full_name });
                        e.currentTarget.reset();
                      }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Full Name</label>
                        <input name="fullName" type="text" placeholder="E.g. Rajesh Kumar" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm border px-2.5 py-1.5 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Email Address</label>
                        <input name="email" type="email" placeholder="rajesh@venue.in" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm border px-2.5 py-1.5 bg-white" />
                      </div>
                      <div>
                        <button
                          type="submit"
                          disabled={onboardStaff.isPending}
                          className="w-full py-1.5 px-4 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center"
                        >
                          {onboardStaff.isPending ? 'Inviting...' : 'Add Team Member'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Assignment Creator Form */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
                    <Users className="w-5 h-5 text-primary mr-2" />
                    <h3 className="font-bold text-gray-900">Map Staff Members to Specific Venues/Halls</h3>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-6">
                      Define direct accountability by assigning specialized operators (Managers, Cleanliness Heads, etc.) to coordinate individual halls.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <form onSubmit={handleAddAssignment} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Select Staff</label>
                          <select name="profileId" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm border px-2.5 py-1.5 bg-white">
                            <option value="">Choose employee...</option>
                            {staffProfiles.map((prof: any) => (
                              <option key={prof.id} value={prof.id}>{prof.full_name || 'Staff Member'}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Select Venue Hall</label>
                          <select name="hallId" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm border px-2.5 py-1.5 bg-white">
                            <option value="">Choose hall...</option>
                            {halls.map((hall: any) => (
                              <option key={hall.id} value={hall.id}>{hall.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned Role</label>
                          <select name="customRole" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm border px-2.5 py-1.5 bg-white">
                            <option value="">Choose role...</option>
                            <option value="Manager">Manager</option>
                            <option value="Head of Cleanliness">Head of Cleanliness</option>
                            <option value="Booking Coordinator">Booking Coordinator</option>
                          </select>
                        </div>
                        <div>
                          <button
                            type="submit"
                            className="w-full py-1.5 px-4 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center"
                          >
                            <Save className="w-4 h-4 mr-2" /> Assign Staff
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Assignment List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Current Mappings</h3>
                    <span className="px-2.5 py-0.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                      {staffAssignments.length} active assignments
                    </span>
                  </div>

                  {staffAssignments.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm italic">
                      No venue staff mappings defined yet. Add an assignment above to allocate staff roles.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {staffAssignments.map((assignment: any) => {
                        const employee = staffProfiles.find((p: any) => p.id === assignment.profileId);
                        const targetHall = halls.find((h: any) => h.id === assignment.hallId);
                        return (
                          <div key={assignment.id} className="p-4 hover:bg-gray-50 flex items-center justify-between text-sm transition-all">
                            <div className="flex items-center space-x-4">
                              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                {employee?.full_name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{employee?.full_name || 'Staff Operator'}</p>
                                <p className="text-xs text-gray-500">
                                  Assigned to <span className="font-semibold text-gray-700">{targetHall?.name || 'Hall'}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-xs rounded-full font-bold">
                                {assignment.customRole}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAssignment(assignment.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sticky Action Footer */}
            {activePanel !== 'import' && (
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={updateSettings.isPending}
                  className="btn-primary flex items-center px-6 py-2.5 text-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateSettings.isPending ? 'Saving Configurations...' : 'Save Configuration Changes'}
                </button>
              </div>
            )}

            {/* PANEL 4: DATA IMPORT */}
            {activePanel === 'import' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-sm text-gray-800">Import Previous Data</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Migrate your existing leads and bookings from Excel sheets or CSV files.</p>
                  </div>
                  <div className="p-6 space-y-8">
                    <DataImport type="leads" />
                    <div className="border-t border-gray-200 pt-8">
                      <DataImport type="bookings" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};
export default Settings;
