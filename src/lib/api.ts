import { supabase } from './supabase';

export class ConcurrencyError extends Error {
  constructor(message = 'Record modified by another user. Please refresh and try again.') {
    super(message);
    this.name = 'ConcurrencyError';
  }
}

/**
 * Enterprise API Wrappers
 * Enforces Optimistic Concurrency Control and Soft Deletes
 */
export const api = {
  /**
   * Updates a record only if the provided version matches the database version.
   * Prevents lost updates in concurrent environments.
   */
  async updateWithOCC(table: string, id: string, version: number, data: any) {
    // If version is undefined (e.g. legacy data without version), assume version 1
    const currentVersion = version || 1;
    
    const { data: updated, error } = await supabase
      .from(table)
      .update({ ...data, version: currentVersion + 1 })
      .eq('id', id)
      .eq('version', currentVersion)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!updated) {
      throw new ConcurrencyError();
    }
    
    return updated;
  },

  /**
   * Soft deletes a record by setting deleted_at to current timestamp.
   */
  async softDelete(table: string, id: string) {
    const { error } = await supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
      
    if (error) throw error;
  },
  
  /**
   * Dual-write helper for Bookings during Phase 2 migration
   * Converts slot-based legacy properties to tstzrange while preserving both
   */
  async createBooking(data: any) {
    // Phase 2: Compute time_range if we have date, start, end
    let time_range = null;
    if (data.event_date && data.start_time && data.end_time) {
       const startTs = new Date(`${data.event_date}T${data.start_time}`).toISOString();
       const endTs = new Date(`${data.event_date}T${data.end_time}`).toISOString();
       // format: [start, end)
       time_range = `[${startTs},${endTs})`;
    }
    
    const { data: created, error } = await supabase
      .from('bookings')
      .insert({
         ...data,
         time_range,
         version: 1
      })
      .select()
      .single();
      
    if (error) throw error;
    return created;
  },

  /**
   * Enterprise Multi-Event Booking Group Creation
   * Simulates a transaction to create the Group and its sub-events
   */
  async createBookingGroup(orgId: string, groupData: any, eventsData: any[]) {
    // 1. Create the Group
    const { data: group, error: groupError } = await supabase
      .from('booking_groups')
      .insert({
        org_id: orgId,
        customer_id: groupData.customer_id,
        title: groupData.title,
        total_budget: groupData.total_budget,
        status: 'active',
        version: 1
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // 2. Create the associated Bookings concurrently
    const bookingPromises = eventsData.map(event => {
       return this.createBooking({
         ...event,
         org_id: orgId,
         group_id: group.id,
         customer_id: groupData.customer_id, // Inherit customer from group
         status: 'hold'
       });
    });

    const createdBookings = await Promise.all(bookingPromises);
    
    return { group, bookings: createdBookings };
  }
};
