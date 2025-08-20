-- Fix RLS policies on public.leads to match coach identity by email -> coach.id
-- Run this in Supabase SQL Editor. Idempotent.

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create leads (public flow)
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
CREATE POLICY "Anyone can create leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Coaches can view their assigned leads (coach_id references public.coaches.id)
DROP POLICY IF EXISTS "Coaches can view assigned leads" ON public.leads;
CREATE POLICY "Coaches can view assigned leads" ON public.leads
    FOR SELECT USING (
      coach_id IN (
        SELECT id FROM public.coaches WHERE email = auth.email()
      )
    );

-- Coaches can update their assigned leads
DROP POLICY IF EXISTS "Coaches can update assigned leads" ON public.leads;
CREATE POLICY "Coaches can update assigned leads" ON public.leads
    FOR UPDATE USING (
      coach_id IN (
        SELECT id FROM public.coaches WHERE email = auth.email()
      )
    );

-- Optional: index to speed up coach_id filter (existing in schema, safe to re-run)
CREATE INDEX IF NOT EXISTS idx_leads_coach_id ON public.leads(coach_id);
