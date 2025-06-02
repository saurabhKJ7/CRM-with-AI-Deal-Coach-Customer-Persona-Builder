-- Seed data for testing and development
-- First, create a test user and profile
DO $$
DECLARE
  user_id uuid := '00000000-0000-0000-0000-000000000000';
  company1_id uuid;
  company2_id uuid;
  company3_id uuid;
  contact1_id uuid;
  contact2_id uuid;
  contact3_id uuid;
  deal1_id uuid;
  deal2_id uuid;
BEGIN
  -- Create auth user (this requires RLS to be disabled or appropriate permissions)
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (
    user_id,
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    user_id,
    'test@example.com',
    'Test User',
    'admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert companies one by one and store their IDs
  INSERT INTO public.companies (name, industry, website, phone, created_by, created_at, updated_at)
  VALUES ('Acme Corp', 'Technology', 'https://acme.example.com', '+1234567890', user_id, NOW(), NOW())
  RETURNING id INTO company1_id;

  INSERT INTO public.companies (name, industry, website, phone, created_by, created_at, updated_at)
  VALUES ('Globex', 'Manufacturing', 'https://globex.example.com', '+1987654321', user_id, NOW(), NOW())
  RETURNING id INTO company2_id;

  INSERT INTO public.companies (name, industry, website, phone, created_by, created_at, updated_at)
  VALUES ('Soylent', 'Food & Beverage', 'https://soylent.example.com', '+1122334455', user_id, NOW(), NOW())
  RETURNING id INTO company3_id;

  -- Insert contacts
  INSERT INTO public.contacts (
    first_name, last_name, email, phone, job_title, 
    company_id, status, source, assigned_to, created_by, created_at, updated_at
  ) VALUES 
    ('John', 'Doe', 'john@acme.example.com', '+1234567891', 'CEO', company1_id, 'active', 'website', user_id, user_id, NOW(), NOW())
    RETURNING id INTO contact1_id;

  INSERT INTO public.contacts (
    first_name, last_name, email, phone, job_title, 
    company_id, status, source, assigned_to, created_by, created_at, updated_at
  ) VALUES 
    ('Jane', 'Smith', 'jane@acme.example.com', '+1234567892', 'CTO', company1_id, 'active', 'referral', user_id, user_id, NOW(), NOW())
    RETURNING id INTO contact2_id;

  INSERT INTO public.contacts (
    first_name, last_name, email, phone, job_title, 
    company_id, status, source, assigned_to, created_by, created_at, updated_at
  ) VALUES 
    ('Bob', 'Johnson', 'bob@globex.example.com', '+1987654322', 'Sales Director', company2_id, 'lead', 'cold call', user_id, user_id, NOW(), NOW())
    RETURNING id INTO contact3_id;

  -- Insert deals
  INSERT INTO public.deals (
    name, description, amount, stage, probability, 
    expected_close_date, contact_id, company_id, assigned_to, created_by, created_at, updated_at
  ) VALUES 
    ('Enterprise Plan', 'Upgrade to enterprise plan', 5000.00, 'proposal', 70, (NOW() + interval '30 days')::date, contact1_id, company1_id, user_id, user_id, NOW(), NOW())
    RETURNING id INTO deal1_id;

  INSERT INTO public.deals (
    name, description, amount, stage, probability, 
    expected_close_date, contact_id, company_id, assigned_to, created_by, created_at, updated_at
  ) VALUES 
    ('New Implementation', 'Full implementation package', 25000.00, 'negotiation', 90, (NOW() + interval '15 days')::date, contact3_id, company2_id, user_id, user_id, NOW(), NOW())
    RETURNING id INTO deal2_id;

  -- Insert activities
  INSERT INTO public.activities (
    subject, type, due_date, completed, priority, 
    description, contact_id, deal_id, assigned_to, created_by, created_at, updated_at
  ) VALUES 
    ('Follow up call', 'call', NOW() + interval '1 day', false, 'high', 'Discuss proposal details', contact1_id, deal1_id, user_id, user_id, NOW(), NOW()),
    ('Send contract', 'email', NOW() + interval '2 days', false, 'medium', 'Draft and send contract for review', contact3_id, deal2_id, user_id, user_id, NOW(), NOW()),
    ('Product demo', 'meeting', NOW() + interval '5 days', false, 'high', 'Full product demonstration', contact1_id, deal1_id, user_id, user_id, NOW(), NOW());

  -- Insert notes
  INSERT INTO public.notes (content, contact_id, created_by, created_at, updated_at)
  VALUES 
    ('Customer is interested in our premium features. Follow up next week.', contact1_id, user_id, NOW(), NOW()),
    ('Discussed pricing options. Waiting for budget approval.', contact3_id, user_id, NOW(), NOW()),
    ('Needs to consult with their team before making a decision.', contact1_id, user_id, NOW(), NOW());
END $$;
