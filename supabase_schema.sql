-- ========================================================
-- AARUSH MENS LUXURY PG - SUPABASE DATABASE SCHEMA
-- Copy & Paste this entire script into your Supabase SQL Editor
-- ========================================================

-- 1. Create Residents Table
CREATE TABLE IF NOT EXISTS public.residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    date_of_birth DATE,
    photo_url TEXT,
    aadhaar_number TEXT NOT NULL,
    aadhaar_doc_url TEXT,
    permanent_address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    floor_id TEXT NOT NULL,
    floor_name TEXT NOT NULL,
    room_id TEXT NOT NULL,
    room_number TEXT NOT NULL,
    bed_id TEXT NOT NULL,
    bed_number INT NOT NULL,
    monthly_rent NUMERIC DEFAULT 7500,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('ACTIVE', 'LEFT')) DEFAULT 'ACTIVE',
    checkout_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE,
    amount_paid NUMERIC NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('UPI', 'CASH', 'BANK_TRANSFER', 'CARD')) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_month TEXT NOT NULL,
    period_year INT NOT NULL,
    receipt_number TEXT UNIQUE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to residents" ON public.residents FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to residents" ON public.residents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to residents" ON public.residents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to residents" ON public.residents FOR DELETE USING (true);

CREATE POLICY "Allow public read access to payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to payments" ON public.payments FOR DELETE USING (true);

-- 4. Create Storage Buckets for Resident Photos and Aadhaar Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resident-photos', 'resident-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('aadhaar-documents', 'aadhaar-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Resident Photos" ON storage.objects FOR SELECT USING (bucket_id = 'resident-photos');
CREATE POLICY "Public Upload Resident Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resident-photos');

CREATE POLICY "Public Read Aadhaar Docs" ON storage.objects FOR SELECT USING (bucket_id = 'aadhaar-documents');
CREATE POLICY "Public Upload Aadhaar Docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'aadhaar-documents');
