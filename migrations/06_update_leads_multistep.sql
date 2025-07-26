-- Migration: Update leads table for multistep form
-- This migration updates the leads table to match the new requirements

-- Drop existing leads table if it exists (for clean slate)
DROP TABLE IF EXISTS public.leads CASCADE;

-- Create updated leads table
CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- Step 1: Basic client information
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NULL, -- Made optional for step 1
  
  -- Step 2: Location information
  location text NULL, -- Client's location
  
  -- Step 3: Coaching preferences
  preferred_coaching text[] NULL DEFAULT '{}'::text[], -- Services from coach
  goals text NULL, -- Made optional initially
  experience text NULL, -- Client's experience level
  availability text NULL, -- Client's availability
  budget text NULL, -- Client's budget
  additional_info text NULL, -- Message to coach
  
  -- System fields
  status text NULL DEFAULT 'new'::text,
  coach_id uuid NULL,
  coach_note text NULL,
  contacted_at timestamp with time zone NULL,
  converted_at timestamp with time zone NULL,
  source text NULL DEFAULT 'web'::text,
  priority text NULL DEFAULT 'medium'::text,
  converted_booking_id uuid NULL,
  estimated_value numeric(10, 2) NULL,
  actual_value numeric(10, 2) NULL,
  
  -- Multistep tracking
  current_step integer NOT NULL DEFAULT 1,
  completed_steps integer[] NOT NULL DEFAULT '{1}'::integer[],
  is_completed boolean NOT NULL DEFAULT false,
  
  CONSTRAINT leads_pkey PRIMARY KEY (id),
  CONSTRAINT leads_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES coaches (id),
  CONSTRAINT leads_converted_booking_id_fkey FOREIGN KEY (converted_booking_id) REFERENCES bookings (id),
  CONSTRAINT leads_priority_check CHECK (
    priority = ANY (ARRAY[
      'low'::text,
      'medium'::text,
      'high'::text,
      'urgent'::text
    ])
  ),
  CONSTRAINT leads_source_check CHECK (
    source = ANY (ARRAY[
      'web'::text,
      'mobile'::text,
      'referral'::text,
      'social'::text,
      'ads'::text
    ])
  ),
  CONSTRAINT leads_status_check CHECK (
    status = ANY (ARRAY[
      'new'::text,
      'assigned'::text,
      'contacted'::text,
      'converted'::text,
      'closed'::text
    ])
  ),
  CONSTRAINT leads_step_check CHECK (
    current_step >= 1 AND current_step <= 3
  )
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_coach_id ON public.leads USING btree (coach_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads USING btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_leads_preferred_coaching ON public.leads USING gin (preferred_coaching) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads USING btree (source) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_leads_current_step ON public.leads USING btree (current_step) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_leads_is_completed ON public.leads USING btree (is_completed) TABLESPACE pg_default;

-- Create updated_at trigger
CREATE TRIGGER handle_leads_updated_at 
  BEFORE UPDATE ON leads 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Insert sample data for testing (optional)
-- INSERT INTO public.leads (client_name, client_email, coach_id) 
-- VALUES ('Test Client', 'test@example.com', (SELECT id FROM coaches LIMIT 1));
