-- Create customer_personas table
CREATE TABLE IF NOT EXISTS public.customer_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  
  -- Input data from form
  inputs JSONB NOT NULL,
  
  -- Generated persona data
  generated_persona JSONB NOT NULL,
  
  -- Meta data
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_customer_personas_contact_id ON public.customer_personas(contact_id);
CREATE INDEX IF NOT EXISTS idx_customer_personas_created_at ON public.customer_personas(created_at);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_customer_personas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_personas_updated_at
BEFORE UPDATE ON public.customer_personas
FOR EACH ROW
EXECUTE FUNCTION update_customer_personas_updated_at();

-- Disable RLS for development (same as other tables)
ALTER TABLE public.customer_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view personas for their contacts"
    ON public.customer_personas FOR SELECT
    USING (auth.uid() IN (
        SELECT DISTINCT assigned_to
        FROM public.contacts
        WHERE id = contact_id
    ));

CREATE POLICY "Users can insert personas for their contacts"
    ON public.customer_personas FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT DISTINCT assigned_to
        FROM public.contacts
        WHERE id = contact_id
    ));

-- Create a view to easily get persona data with related contact info
-- Create a view to easily get persona data with related contact and company info
CREATE OR REPLACE VIEW public.customer_personas_view AS
SELECT 
  p.*,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  co.name as company_name
FROM public.customer_personas p
JOIN public.contacts c ON p.contact_id = c.id
LEFT JOIN public.companies co ON c.company_id = co.id;
