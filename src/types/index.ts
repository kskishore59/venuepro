export interface Organization {
  id: string;
  name: string;
  slug: string;
  gstin?: string;
  pan?: string;
  address?: string;
  settings?: Record<string, any>;
  plan: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  version?: number;
}

export interface Profile {
  id: string;
  org_id: string;
  full_name: string;
  role: 'owner' | 'manager' | 'booking_staff' | 'finance_staff' | 'operations_staff';
  phone?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  version?: number;
}

export interface Venue {
  id: string;
  org_id: string;
  name: string;
  city: string;
  address?: string;
  description?: string;
  primary_photo?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  version?: number;
}

export interface Hall {
  id: string;
  org_id: string;
  venue_id?: string;
  name: string;
  hall_type?: string;
  floor_number?: number;
  description?: string;
  is_active?: boolean;
  
  capacity_min: number;
  capacity_max: number;
  comfortable_capacity?: number;
  area_sqft?: number;
  length_ft?: number;
  width_ft?: number;
  height_ft?: number;
  ceiling_height_ft?: number;
  floors_within?: number;
  
  amenities?: Record<string, boolean | string | number>;
  facilities?: Record<string, boolean | string | number>;
  pricing?: Record<string, any>;
  media?: {
    photos?: string[];
    primary_photo?: string;
    tour_url?: string;
    video_url?: string;
  };
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  version?: number;
}

export interface Customer {
  id: string;
  org_id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  gstin?: string;
  pan?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  version?: number;
}

export interface Booking {
  id: string;
  org_id: string;
  group_id?: string;
  hall_id: string;
  customer_id: string;
  event_type: 'wedding' | 'reception' | 'engagement' | 'mehendi' | 'haldi' | 'sangeet' | 'birthday' | 'anniversary' | 'corporate' | 'conference' | 'pooja' | 'other';
  event_date: string;
  time_range?: string; // TSTZRANGE
  start_time?: string;
  end_time?: string;
  setup_start_time?: string;
  teardown_end_time?: string;
  guest_count?: number;
  special_requirements?: string;
  internal_notes?: string;
  booking_number?: string;
  status: 'inquiry' | 'hold' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  advance_amount: number;
  expires_at?: string;
  beo_details?: Record<string, any>;
  halls?: Hall;
  customers?: Customer;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  version?: number;
}

export interface Payment {
  id: string;
  org_id: string;
  booking_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_type?: string;
  transaction_ref?: string;
  cheque_number?: string;
  bank_name?: string;
  notes?: string;
  status: string;
  receipt_url?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  version?: number;
  bookings?: Booking;
}

export interface Lead {
  id: string;
  org_id: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  status: 'new' | 'contacted' | 'visit_scheduled' | 'proposal_sent' | 'negotiating' | 'won' | 'lost';
  notes?: string;
  assigned_to?: string;
  event_type?: string;
  tentative_date?: string;
  guest_count?: number;
  budget_from?: number;
  budget_to?: number;
  follow_up_date?: string;
  last_contact_date?: string;
  lost_reason?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  version?: number;
}

export interface ActivityLog {
  id: string;
  lead_id: string;
  type: 'call' | 'whatsapp' | 'email' | 'meeting' | 'note';
  description: string;
  created_at: string;
  created_by?: string;
}

export interface BookingGroup {
  id: string;
  org_id: string;
  customer_id: string;
  title: string;
  total_budget?: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  version?: number;
}

export interface PaymentLedger {
  id: string;
  org_id: string;
  booking_id?: string;
  booking_group_id?: string;
  amount: number;
  currency: string;
  transaction_type: 'advance' | 'installment' | 'final_settlement' | 'refund' | 'vendor_payout';
  payment_method?: string;
  reference_id?: string;
  is_outbound: boolean;
  status: string;
  recorded_by?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  org_id: string;
  entity_type: string;
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  actor_id?: string;
  created_at: string;
}
