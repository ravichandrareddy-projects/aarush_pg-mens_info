import { supabase, isSupabaseConfigured } from './supabase';
import { Resident, PaymentRecord } from '../types/pg';

/**
 * Sync resident records to remote Supabase DB
 */
export async function syncResidentsToSupabase(residents: Resident[]) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const payload = residents.map((r) => ({
      full_name: r.fullName,
      phone: r.phone,
      email: r.email || null,
      aadhaar_number: r.aadhaarNumber,
      floor_id: r.floorId,
      floor_name: r.floorName,
      room_id: r.roomId,
      room_number: r.roomNumber,
      bed_id: r.bedId,
      bed_number: r.bedNumber,
      monthly_rent: r.monthlyRent,
      joining_date: r.joiningDate,
      status: r.status,
      checkout_date: r.checkoutDate || null,
      notes: r.notes || null
    }));

    const { error } = await supabase.from('residents').upsert(payload);
    if (error) {
      console.warn('Supabase sync notice:', error.message);
    } else {
      console.log('Successfully synced residents to Supabase!');
    }
  } catch (err) {
    console.warn('Supabase sync catch error:', err);
  }
}

/**
 * Sync payment transactions to remote Supabase DB
 */
export async function syncPaymentsToSupabase(payments: PaymentRecord[]) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const payload = payments.map((p) => ({
      resident_id: p.residentId,
      amount_paid: p.amountPaid,
      payment_method: p.paymentMethod,
      payment_date: p.paymentDate,
      period_month: p.periodMonth,
      period_year: p.periodYear,
      receipt_number: p.receiptNumber,
      notes: p.notes || null
    }));

    const { error } = await supabase.from('payments').upsert(payload);
    if (error) {
      console.warn('Supabase payments sync notice:', error.message);
    } else {
      console.log('Successfully synced payments to Supabase!');
    }
  } catch (err) {
    console.warn('Supabase payments sync catch error:', err);
  }
}
