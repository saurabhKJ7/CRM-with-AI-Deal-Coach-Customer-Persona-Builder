-- Script to verify that data exists in tables
-- Run this in your Supabase SQL Editor to check the data

-- Check counts from each table
SELECT 'Companies' as table_name, COUNT(*) as record_count FROM public.companies
UNION ALL
SELECT 'Contacts' as table_name, COUNT(*) as record_count FROM public.contacts
UNION ALL
SELECT 'Deals' as table_name, COUNT(*) as record_count FROM public.deals
UNION ALL
SELECT 'Activities' as table_name, COUNT(*) as record_count FROM public.activities;

-- Sample data from companies
SELECT id, name, industry, created_at FROM public.companies LIMIT 5;

-- Sample data from contacts
SELECT id, first_name, last_name, email, company_id FROM public.contacts LIMIT 5;

-- Sample data from deals
SELECT id, name, amount, stage, probability, contact_id, company_id FROM public.deals LIMIT 5;

-- Sample data from activities
SELECT id, subject, type, due_date, completed, contact_id, deal_id FROM public.activities LIMIT 5;

-- Check relationships
SELECT 
    c.name as company_name,
    COUNT(DISTINCT co.id) as contact_count,
    COUNT(DISTINCT d.id) as deal_count,
    SUM(d.amount) as total_deal_value
FROM 
    public.companies c
LEFT JOIN 
    public.contacts co ON c.id = co.company_id
LEFT JOIN 
    public.deals d ON c.id = d.company_id
GROUP BY 
    c.id, c.name
ORDER BY 
    total_deal_value DESC NULLS LAST
LIMIT 10;

-- Dashboard metrics queries
SELECT COUNT(*) as total_contacts FROM public.contacts;
SELECT COUNT(*) as active_deals FROM public.deals WHERE stage NOT IN ('won', 'lost');
SELECT SUM(amount) as total_revenue FROM public.deals WHERE stage = 'won';
SELECT SUM(amount) as pipeline_value FROM public.deals WHERE stage NOT IN ('won', 'lost');
SELECT AVG(amount) as average_deal_size FROM public.deals;
SELECT 
    ROUND((COUNT(CASE WHEN stage = 'won' THEN 1 END)::numeric / 
    NULLIF(COUNT(CASE WHEN stage IN ('won', 'lost') THEN 1 END), 0)::numeric) * 100, 2) 
    as conversion_rate
FROM public.deals;
SELECT COUNT(*) as completed_activities FROM public.activities WHERE completed = true;
SELECT COUNT(*) as overdue_tasks FROM public.activities WHERE completed = false AND due_date < NOW();