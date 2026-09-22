// ============================================================================
// BUKKAPP Supabase Client Integration
// PostgreSQL Relational Database, Realtime & Storage Adapter
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Booking, Business, Review } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Supabase client initialization warning:', err);
  }
}

export const supabase = supabaseInstance;

// ============================================================================
// SUPABASE DATABASE SYNC HELPERS (HYBRID ARCHITECTURE)
// ============================================================================

/**
 * Look up a user in Supabase by Phone or Email
 */
export async function getSupabaseUserByPhoneOrEmail(identifier: string): Promise<User | null> {
  if (!supabase) return null;

  try {
    const isEmail = identifier.includes('@');
    const column = isEmail ? 'email' : 'phone';

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq(column, identifier.trim().toLowerCase())
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email || '',
      phone: data.phone,
      role: data.role,
      avatar: data.avatar_url,
      businessId: data.business_id,
      createdAt: data.created_at,
    };
  } catch (e) {
    console.warn('Supabase user lookup warning:', e);
    return null;
  }
}

/**
 * Upsert a user in Supabase
 */
export async function upsertSupabaseUser(user: User & { firebaseUid?: string }): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('users').upsert(
      {
        id: user.id,
        name: user.name,
        email: user.email || null,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar || null,
        business_id: user.businessId || null,
        firebase_uid: user.firebaseUid || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('Supabase upsertUser warning:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase upsertUser error:', e);
    return false;
  }
}

/**
 * Insert atomic booking into Supabase (Leverages DB unique collision index)
 */
export async function insertSupabaseBooking(booking: Booking): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: true }; // Local store fallback

  try {
    const { error } = await supabase.from('bookings').insert({
      id: booking.id,
      booking_reference: booking.bookingReference,
      user_id: booking.userId,
      business_id: booking.businessId,
      service_id: booking.serviceId,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      customer_email: booking.customerEmail,
      date: booking.date,
      start_time: booking.startTime,
      end_time: booking.endTime || booking.startTime,
      service_price: booking.servicePrice,
      duration_minutes: booking.durationMinutes,
      status: booking.status,
      payment_status: booking.paymentStatus || 'paid_simulated',
      notes: booking.notes || null,
    });

    if (error) {
      // Catch atomic unique slot collision
      if (error.code === '23505' || error.message.includes('uq_booking_slot_collision')) {
        return {
          success: false,
          error: 'That time slot was just booked by another customer. Please choose another slot.',
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Database booking sync failed' };
  }
}
