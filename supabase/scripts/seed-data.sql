-- Seed Data SQL Script for Zoho CRM Clone
-- This script populates the database with sample data for testing and demonstration purposes.
-- Creates 25 records for each entity using the correct schema structure

DO $$
DECLARE
    default_user_id UUID := '00000000-0000-0000-0000-000000000000';
    company_ids UUID[] := ARRAY[]::UUID[];
    contact_ids UUID[] := ARRAY[]::UUID[];
    deal_ids UUID[] := ARRAY[]::UUID[];
    job_titles TEXT[] := ARRAY['CEO', 'CTO', 'CFO', 'CIO', 'COO', 'VP Sales', 'VP Marketing', 'Director of IT', 'IT Manager', 'Product Manager', 'Sales Manager', 'Marketing Director', 'Project Manager', 'Business Analyst', 'Technical Lead'];
    industry_types TEXT[] := ARRAY['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Education', 'Energy', 'Transportation', 'Media', 'Construction'];
    status_types TEXT[] := ARRAY['Lead', 'Prospect', 'Customer', 'Inactive', 'Partner'];
    source_types TEXT[] := ARRAY['Website', 'Referral', 'Conference', 'Email Campaign', 'LinkedIn', 'Cold Call', 'Trade Show', 'Webinar', 'Social Media', 'Partner'];
BEGIN
    -- Create a user profile if it doesn't exist
    INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (default_user_id, 'demo@example.com', 'Demo User', 'admin', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Temporarily disable RLS for data insertion
    ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
    ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
    ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
    ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

    -- Clean existing data if needed
    DELETE FROM activities;
    DELETE FROM deals;
    DELETE FROM contacts;
    DELETE FROM companies;

    -- Insert companies (25 companies)
    WITH inserted_companies AS (
        INSERT INTO companies (name, industry, website, phone, address_line1, city, state, postal_code, country, description, created_by, created_at, updated_at)
        VALUES
            ('TechCorp Inc.', 'Technology', 'https://techcorp.example.com', '+1 (555) 123-4567', '123 Tech Avenue', 'San Francisco', 'CA', '94105', 'USA', 'Leading enterprise software provider', default_user_id, NOW(), NOW()),
            ('Global Systems Ltd.', 'IT Services', 'https://globalsystems.example.com', '+1 (555) 987-6543', '456 Innovation Drive', 'Boston', 'MA', '02110', 'USA', 'Specialized in cloud infrastructure and migration', default_user_id, NOW(), NOW()),
            ('Secure Financial', 'Finance', 'https://securefinancial.example.com', '+1 (555) 456-7890', '789 Finance Blvd', 'New York', 'NY', '10004', 'USA', 'Financial services and solutions', default_user_id, NOW(), NOW()),
            ('HealthPlus', 'Healthcare', 'https://healthplus.example.com', '+1 (555) 234-5678', '321 Wellness Way', 'Chicago', 'IL', '60601', 'USA', 'Healthcare technology solutions', default_user_id, NOW(), NOW()),
            ('EcoSolutions', 'Environmental', 'https://ecosolutions.example.com', '+1 (555) 876-5432', '567 Green Street', 'Portland', 'OR', '97204', 'USA', 'Sustainable technology and consulting', default_user_id, NOW(), NOW()),
            ('Quantum Innovations', 'Technology', 'https://quantuminnovate.example.com', '+1 (555) 222-3333', '789 Quantum Road', 'Austin', 'TX', '78701', 'USA', 'Cutting-edge quantum computing solutions', default_user_id, NOW(), NOW()),
            ('BlueSky Logistics', 'Transportation', 'https://blueskylog.example.com', '+1 (555) 444-5555', '456 Freight Way', 'Seattle', 'WA', '98101', 'USA', 'Global logistics and supply chain solutions', default_user_id, NOW(), NOW()),
            ('GreenEnergy Co.', 'Energy', 'https://greenenergy.example.com', '+1 (555) 666-7777', '123 Solar Avenue', 'Denver', 'CO', '80201', 'USA', 'Renewable energy solutions and consulting', default_user_id, NOW(), NOW()),
            ('MediaMax Studios', 'Media', 'https://mediamax.example.com', '+1 (555) 888-9999', '321 Film Boulevard', 'Los Angeles', 'CA', '90028', 'USA', 'Media production and distribution', default_user_id, NOW(), NOW()),
            ('EduLearn Systems', 'Education', 'https://edulearn.example.com', '+1 (555) 111-2222', '555 Knowledge Way', 'Cambridge', 'MA', '02142', 'USA', 'Educational technology and learning platforms', default_user_id, NOW(), NOW()),
            ('RetailPlus Group', 'Retail', 'https://retailplus.example.com', '+1 (555) 333-4444', '777 Market Street', 'Chicago', 'IL', '60607', 'USA', 'Innovative retail solutions and services', default_user_id, NOW(), NOW()),
            ('ConstructWell Inc.', 'Construction', 'https://constructwell.example.com', '+1 (555) 555-6666', '888 Builder Road', 'Dallas', 'TX', '75201', 'USA', 'Construction management and services', default_user_id, NOW(), NOW()),
            ('AgriTech Solutions', 'Agriculture', 'https://agritech.example.com', '+1 (555) 777-8888', '999 Farm Drive', 'Des Moines', 'IA', '50309', 'USA', 'Agricultural technology and innovation', default_user_id, NOW(), NOW()),
            ('FashionForward', 'Retail', 'https://fashionforward.example.com', '+1 (555) 999-0000', '101 Style Avenue', 'New York', 'NY', '10001', 'USA', 'Trendsetting fashion retail and e-commerce', default_user_id, NOW(), NOW()),
            ('GlobalHealth Partners', 'Healthcare', 'https://globalhealth.example.com', '+1 (555) 000-1111', '202 Wellness Blvd', 'Boston', 'MA', '02115', 'USA', 'International healthcare solutions and services', default_user_id, NOW(), NOW()),
            ('DataFlow Analytics', 'Technology', 'https://dataflow.example.com', '+1 (555) 200-3000', '150 Analytics Lane', 'San Jose', 'CA', '95110', 'USA', 'Big data analytics and business intelligence solutions', default_user_id, NOW(), NOW()),
            ('CloudFirst Solutions', 'IT Services', 'https://cloudfirst.example.com', '+1 (555) 300-4000', '250 Cloud Avenue', 'Atlanta', 'GA', '30309', 'USA', 'Cloud-first architecture and consulting services', default_user_id, NOW(), NOW()),
            ('NextGen Robotics', 'Manufacturing', 'https://nextgenrobotics.example.com', '+1 (555) 400-5000', '350 Innovation Drive', 'Detroit', 'MI', '48201', 'USA', 'Advanced robotics and automation solutions', default_user_id, NOW(), NOW()),
            ('CyberShield Security', 'Cybersecurity', 'https://cybershield.example.com', '+1 (555) 500-6000', '450 Security Blvd', 'Washington', 'DC', '20001', 'USA', 'Comprehensive cybersecurity and threat protection', default_user_id, NOW(), NOW()),
            ('SmartCity Infrastructure', 'Government', 'https://smartcity.example.com', '+1 (555) 600-7000', '550 Municipal Way', 'Phoenix', 'AZ', '85001', 'USA', 'Smart city technology and infrastructure solutions', default_user_id, NOW(), NOW()),
            ('MobileApp Developers', 'Technology', 'https://mobileapp.example.com', '+1 (555) 700-8000', '650 Mobile Street', 'San Diego', 'CA', '92101', 'USA', 'Mobile application development and consulting', default_user_id, NOW(), NOW()),
            ('BioTech Innovations', 'Healthcare', 'https://biotech.example.com', '+1 (555) 800-9000', '750 Research Park', 'Raleigh', 'NC', '27601', 'USA', 'Biotechnology research and development', default_user_id, NOW(), NOW()),
            ('FinTech Solutions', 'Finance', 'https://fintech.example.com', '+1 (555) 900-0100', '850 Financial Center', 'Miami', 'FL', '33101', 'USA', 'Financial technology and digital banking solutions', default_user_id, NOW(), NOW()),
            ('AI Research Group', 'Technology', 'https://airesearch.example.com', '+1 (555) 010-1100', '950 Intelligence Drive', 'Pittsburgh', 'PA', '15201', 'USA', 'Artificial intelligence and machine learning research', default_user_id, NOW(), NOW()),
            ('Sustainable Manufacturing', 'Manufacturing', 'https://sustainmfg.example.com', '+1 (555) 110-1200', '1050 Eco Factory Road', 'Portland', 'OR', '97204', 'USA', 'Environmentally sustainable manufacturing processes', default_user_id, NOW(), NOW())
        RETURNING id
    )
    SELECT ARRAY_AGG(id) INTO company_ids FROM inserted_companies;

    -- Insert contacts (25 contacts)
    WITH inserted_contacts AS (
        INSERT INTO contacts (first_name, last_name, email, phone, job_title, company_id, status, source, notes, assigned_to, created_by, created_at, updated_at)
        VALUES
            ('John', 'Smith', 'john.smith@techcorp.example.com', '+1 (555) 123-4567', 'CTO', company_ids[1], 'Customer', 'Conference', 'Key decision maker for enterprise software purchases.', default_user_id, default_user_id, NOW(), NOW()),
            ('Sarah', 'Johnson', 'sarah.j@globalsystems.example.com', '+1 (555) 987-6543', 'VP Sales', company_ids[2], 'Lead', 'Website', 'Interested in our cloud migration services.', default_user_id, default_user_id, NOW(), NOW()),
            ('Michael', 'Chen', 'm.chen@securefinancial.example.com', '+1 (555) 456-7890', 'Director of IT', company_ids[3], 'Lead', 'Referral', 'Looking for security solutions.', default_user_id, default_user_id, NOW(), NOW()),
            ('Emily', 'Davis', 'emily.davis@healthplus.example.com', '+1 (555) 234-5678', 'CIO', company_ids[4], 'Customer', 'Email Campaign', 'Interested in healthcare data solutions.', default_user_id, default_user_id, NOW(), NOW()),
            ('David', 'Wilson', 'd.wilson@ecosolutions.example.com', '+1 (555) 876-5432', 'CEO', company_ids[5], 'Prospect', 'LinkedIn', 'Looking for sustainable tech solutions.', default_user_id, default_user_id, NOW(), NOW()),
            ('Jennifer', 'Lopez', 'j.lopez@techcorp.example.com', '+1 (555) 345-6789', 'Product Manager', company_ids[1], 'Customer', 'Conference', 'Works with John Smith on product decisions.', default_user_id, default_user_id, NOW(), NOW()),
            ('Robert', 'Brown', 'r.brown@globalsystems.example.com', '+1 (555) 654-3210', 'IT Manager', company_ids[2], 'Lead', 'Website', 'Technical contact for migration projects.', default_user_id, default_user_id, NOW(), NOW()),
            ('Lisa', 'Wang', 'l.wang@securefinancial.example.com', '+1 (555) 789-0123', 'CISO', company_ids[3], 'Lead', 'Webinar', 'Concerned about data security compliance.', default_user_id, default_user_id, NOW(), NOW()),
            ('Thomas', 'Anderson', 't.anderson@quantuminnovate.example.com', '+1 (555) 222-3344', 'CEO', company_ids[6], 'Prospect', 'Conference', 'Interested in exploring quantum computing applications.', default_user_id, default_user_id, NOW(), NOW()),
            ('Jessica', 'Miller', 'j.miller@blueskylog.example.com', '+1 (555) 444-5566', 'COO', company_ids[7], 'Lead', 'Referral', 'Looking to improve logistics operations.', default_user_id, default_user_id, NOW(), NOW()),
            ('Daniel', 'Taylor', 'd.taylor@greenenergy.example.com', '+1 (555) 666-7788', 'CTO', company_ids[8], 'Customer', 'Website', 'Implementing new energy solutions.', default_user_id, default_user_id, NOW(), NOW()),
            ('Amanda', 'Lee', 'a.lee@mediamax.example.com', '+1 (555) 888-9900', 'Director of Production', company_ids[9], 'Customer', 'Trade Show', 'Looking for media production tools.', default_user_id, default_user_id, NOW(), NOW()),
            ('William', 'Clark', 'w.clark@edulearn.example.com', '+1 (555) 111-2233', 'CIO', company_ids[10], 'Lead', 'Webinar', 'Interested in educational technology platforms.', default_user_id, default_user_id, NOW(), NOW()),
            ('Olivia', 'Martin', 'o.martin@retailplus.example.com', '+1 (555) 333-4455', 'VP Marketing', company_ids[11], 'Prospect', 'Email Campaign', 'Looking for retail analytics solutions.', default_user_id, default_user_id, NOW(), NOW()),
            ('Christopher', 'Hill', 'c.hill@constructwell.example.com', '+1 (555) 555-6677', 'Project Manager', company_ids[12], 'Lead', 'LinkedIn', 'Interested in construction management software.', default_user_id, default_user_id, NOW(), NOW()),
            ('Sophia', 'Adams', 's.adams@agritech.example.com', '+1 (555) 777-8899', 'Operations Director', company_ids[13], 'Customer', 'Cold Call', 'Implementing agricultural technology solutions.', default_user_id, default_user_id, NOW(), NOW()),
            ('Ryan', 'Baker', 'r.baker@fashionforward.example.com', '+1 (555) 999-0011', 'Digital Director', company_ids[14], 'Lead', 'Social Media', 'Exploring e-commerce platform options.', default_user_id, default_user_id, NOW(), NOW()),
            ('Emma', 'Garcia', 'e.garcia@globalhealth.example.com', '+1 (555) 000-1122', 'Medical Director', company_ids[15], 'Prospect', 'Partner', 'Interested in healthcare analytics tools.', default_user_id, default_user_id, NOW(), NOW()),
            ('Alexander', 'Rodriguez', 'a.rodriguez@dataflow.example.com', '+1 (555) 200-3100', 'Data Scientist', company_ids[16], 'Lead', 'Website', 'Looking for advanced analytics solutions.', default_user_id, default_user_id, NOW(), NOW()),
            ('Victoria', 'Thompson', 'v.thompson@cloudfirst.example.com', '+1 (555) 300-4100', 'Cloud Architect', company_ids[17], 'Customer', 'Conference', 'Implementing cloud-first strategy.', default_user_id, default_user_id, NOW(), NOW()),
            ('Benjamin', 'Martinez', 'b.martinez@nextgenrobotics.example.com', '+1 (555) 400-5100', 'Chief Engineer', company_ids[18], 'Prospect', 'Trade Show', 'Evaluating robotics automation solutions.', default_user_id, default_user_id, NOW(), NOW()),
            ('Catherine', 'Robinson', 'c.robinson@cybershield.example.com', '+1 (555) 500-6100', 'Security Director', company_ids[19], 'Lead', 'Webinar', 'Looking for comprehensive security solutions.', default_user_id, default_user_id, NOW(), NOW()),
            ('Nicholas', 'Lewis', 'n.lewis@smartcity.example.com', '+1 (555) 600-7100', 'Project Director', company_ids[20], 'Customer', 'Partner', 'Implementing smart city infrastructure.', default_user_id, default_user_id, NOW(), NOW()),
            ('Samantha', 'Walker', 's.walker@mobileapp.example.com', '+1 (555) 700-8100', 'Development Lead', company_ids[21], 'Lead', 'Website', 'Interested in development services.', default_user_id, default_user_id, NOW(), NOW()),
            ('Matthew', 'Collins', 'm.collins@biotech.example.com', '+1 (555) 800-9100', 'Research Director', company_ids[22], 'Prospect', 'Conference', 'Exploring biotech solutions.', default_user_id, default_user_id, NOW(), NOW())
        RETURNING id
    )
    SELECT ARRAY_AGG(id) INTO contact_ids FROM inserted_contacts;

    -- Insert deals (25 deals)
    WITH inserted_deals AS (
        INSERT INTO deals (name, description, amount, stage, probability, expected_close_date, contact_id, company_id, assigned_to, created_by, created_at, updated_at)
        VALUES
            ('Enterprise Software License', 'Annual enterprise software license for 500 users', 120000.00, 'negotiation', 75, NOW() + INTERVAL '15 days', contact_ids[1], company_ids[1], default_user_id, default_user_id, NOW(), NOW()),
            ('Cloud Migration Project', 'Complete cloud infrastructure migration', 85000.00, 'proposal', 50, NOW() + INTERVAL '30 days', contact_ids[2], company_ids[2], default_user_id, default_user_id, NOW(), NOW()),
            ('Security Suite Implementation', 'Implementation of security software and services', 75000.00, 'qualified', 25, NOW() + INTERVAL '45 days', contact_ids[3], company_ids[3], default_user_id, default_user_id, NOW(), NOW()),
            ('Healthcare Data Solution', 'Data analytics and management solution for healthcare provider', 95000.00, 'negotiation', 80, NOW() + INTERVAL '20 days', contact_ids[4], company_ids[4], default_user_id, default_user_id, NOW(), NOW()),
            ('Sustainable Tech Consultation', 'Environmental impact assessment and technology recommendations', 45000.00, 'lead', 15, NOW() + INTERVAL '60 days', contact_ids[5], company_ids[5], default_user_id, default_user_id, NOW(), NOW()),
            ('Software Upgrade Package', 'Upgrade existing systems to latest version', 35000.00, 'won', 100, NOW() - INTERVAL '10 days', contact_ids[6], company_ids[1], default_user_id, default_user_id, NOW(), NOW()),
            ('Maintenance Contract Renewal', 'Annual maintenance and support contract', 25000.00, 'won', 100, NOW() - INTERVAL '5 days', contact_ids[7], company_ids[2], default_user_id, default_user_id, NOW(), NOW()),
            ('Custom Development Project', 'Custom software development for specific business needs', 150000.00, 'proposal', 40, NOW() + INTERVAL '40 days', contact_ids[8], company_ids[3], default_user_id, default_user_id, NOW(), NOW()),
            ('Hardware Procurement', 'Supply of hardware and infrastructure equipment', 65000.00, 'lost', 0, NOW() - INTERVAL '15 days', contact_ids[4], company_ids[4], default_user_id, default_user_id, NOW(), NOW()),
            ('Quantum Computing POC', 'Proof of concept for quantum computing applications', 200000.00, 'qualified', 30, NOW() + INTERVAL '90 days', contact_ids[9], company_ids[6], default_user_id, default_user_id, NOW(), NOW()),
            ('Logistics Optimization System', 'End-to-end logistics management platform', 120000.00, 'proposal', 60, NOW() + INTERVAL '45 days', contact_ids[10], company_ids[7], default_user_id, default_user_id, NOW(), NOW()),
            ('Renewable Energy Implementation', 'Solar and wind energy installation project', 350000.00, 'negotiation', 85, NOW() + INTERVAL '30 days', contact_ids[11], company_ids[8], default_user_id, default_user_id, NOW(), NOW()),
            ('Media Production Software', 'Advanced media editing and production suite', 75000.00, 'won', 100, NOW() - INTERVAL '20 days', contact_ids[12], company_ids[9], default_user_id, default_user_id, NOW(), NOW()),
            ('E-Learning Platform License', 'Enterprise license for online learning platform', 60000.00, 'lead', 20, NOW() + INTERVAL '60 days', contact_ids[13], company_ids[10], default_user_id, default_user_id, NOW(), NOW()),
            ('Retail Analytics Solution', 'Customer behavior and sales analytics platform', 95000.00, 'proposal', 55, NOW() + INTERVAL '45 days', contact_ids[14], company_ids[11], default_user_id, default_user_id, NOW(), NOW()),
            ('Construction Management Platform', 'Digital transformation for construction workflows', 180000.00, 'contacted', 35, NOW() + INTERVAL '50 days', contact_ids[15], company_ids[12], default_user_id, default_user_id, NOW(), NOW()),
            ('AgriTech Innovation Suite', 'Comprehensive agricultural technology package', 125000.00, 'qualified', 45, NOW() + INTERVAL '35 days', contact_ids[16], company_ids[13], default_user_id, default_user_id, NOW(), NOW()),
            ('Fashion E-commerce Platform', 'Next-generation online retail solution', 110000.00, 'proposal', 60, NOW() + INTERVAL '25 days', contact_ids[17], company_ids[14], default_user_id, default_user_id, NOW(), NOW()),
            ('Global Health Analytics', 'International healthcare data management system', 275000.00, 'negotiation', 70, NOW() + INTERVAL '40 days', contact_ids[18], company_ids[15], default_user_id, default_user_id, NOW(), NOW()),
            ('Big Data Analytics Platform', 'Enterprise-grade data processing and insights', 195000.00, 'contacted', 25, NOW() + INTERVAL '55 days', contact_ids[19], company_ids[16], default_user_id, default_user_id, NOW(), NOW()),
            ('Cloud Strategy Assessment', 'Cloud readiness assessment and migration planning', 55000.00, 'qualified', 40, NOW() + INTERVAL '25 days', contact_ids[20], company_ids[17], default_user_id, default_user_id, NOW(), NOW()),
            ('Industrial Robotics Solution', 'Advanced robotics for manufacturing automation', 320000.00, 'proposal', 65, NOW() + INTERVAL '45 days', contact_ids[21], company_ids[18], default_user_id, default_user_id, NOW(), NOW()),
            ('Cybersecurity Audit', 'Comprehensive security assessment and recommendations', 45000.00, 'lead', 15, NOW() + INTERVAL '30 days', contact_ids[22], company_ids[19], default_user_id, default_user_id, NOW(), NOW()),
            ('Smart City Pilot Project', 'IoT-based smart city infrastructure pilot', 250000.00, 'negotiation', 80, NOW() + INTERVAL '60 days', contact_ids[23], company_ids[20], default_user_id, default_user_id, NOW(), NOW()),
            ('Mobile App Development', 'Custom mobile application development', 85000.00, 'qualified', 35, NOW() + INTERVAL '40 days', contact_ids[24], company_ids[21], default_user_id, default_user_id, NOW(), NOW())
        RETURNING id
    )
    SELECT ARRAY_AGG(id) INTO deal_ids FROM inserted_deals;

    -- Insert activities (25 activities)
    INSERT INTO activities (subject, type, due_date, completed, priority, description, contact_id, deal_id, assigned_to, created_by, created_at, updated_at)
    VALUES
        ('Follow-up call with John Smith', 'call', NOW() + INTERVAL '2 days', FALSE, 'high', 'Discuss contract terms and implementation timeline', contact_ids[1], deal_ids[1], default_user_id, default_user_id, NOW(), NOW()),
        ('Send proposal to Sarah Johnson', 'email', NOW() + INTERVAL '1 day', TRUE, 'medium', 'Send detailed proposal for cloud migration project', contact_ids[2], deal_ids[2], default_user_id, default_user_id, NOW(), NOW()),
        ('Demo session with Michael Chen', 'meeting', NOW() + INTERVAL '5 days', FALSE, 'medium', 'Product demonstration and Q&A session', contact_ids[3], deal_ids[3], default_user_id, default_user_id, NOW(), NOW()),
        ('Prepare contract for Emily Davis', 'task', NOW() + INTERVAL '3 days', FALSE, 'high', 'Draft final contract with negotiated terms', contact_ids[4], deal_ids[4], default_user_id, default_user_id, NOW(), NOW()),
        ('Initial consultation with David Wilson', 'meeting', NOW() + INTERVAL '7 days', FALSE, 'low', 'Discuss requirements and potential solutions', contact_ids[5], deal_ids[5], default_user_id, default_user_id, NOW(), NOW()),
        ('Weekly check-in with Jennifer Lopez', 'call', NOW() - INTERVAL '2 days', TRUE, 'medium', 'Regular project status update', contact_ids[6], deal_ids[6], default_user_id, default_user_id, NOW(), NOW()),
        ('Technical assessment for Robert Brown', 'task', NOW() + INTERVAL '4 days', FALSE, 'medium', 'Evaluate current IT infrastructure and recommend improvements', contact_ids[7], deal_ids[7], default_user_id, default_user_id, NOW(), NOW()),
        ('Security briefing with Lisa Wang', 'meeting', NOW() + INTERVAL '6 days', FALSE, 'high', 'Present security solutions and compliance measures', contact_ids[8], deal_ids[8], default_user_id, default_user_id, NOW(), NOW()),
        ('Follow up on maintenance renewal', 'email', NOW() - INTERVAL '5 days', TRUE, 'high', 'Send maintenance contract renewal information', contact_ids[7], deal_ids[7], default_user_id, default_user_id, NOW(), NOW()),
        ('Quarterly business review', 'meeting', NOW() - INTERVAL '10 days', TRUE, 'medium', 'Review business performance and set goals for next quarter', contact_ids[1], deal_ids[1], default_user_id, default_user_id, NOW(), NOW()),
        ('Prepare sales presentation', 'task', NOW() - INTERVAL '1 day', FALSE, 'medium', 'Create presentation for new product launch', contact_ids[3], deal_ids[3], default_user_id, default_user_id, NOW(), NOW()),
        ('Training session on new software', 'meeting', NOW() + INTERVAL '12 days', FALSE, 'low', 'Train team on using the new software platform', contact_ids[4], deal_ids[4], default_user_id, default_user_id, NOW(), NOW()),
        ('Quantum computing demo', 'meeting', NOW() + INTERVAL '14 days', FALSE, 'high', 'Demonstrate quantum computing capabilities', contact_ids[9], deal_ids[10], default_user_id, default_user_id, NOW(), NOW()),
        ('Logistics software installation', 'task', NOW() + INTERVAL '8 days', FALSE, 'medium', 'Install and configure logistics management software', contact_ids[10], deal_ids[11], default_user_id, default_user_id, NOW(), NOW()),
        ('Energy project kickoff', 'meeting', NOW() + INTERVAL '3 days', FALSE, 'high', 'Initial project kickoff for renewable energy implementation', contact_ids[11], deal_ids[12], default_user_id, default_user_id, NOW(), NOW()),
        ('Media software training', 'meeting', NOW() - INTERVAL '4 days', TRUE, 'medium', 'Train team on new media production software', contact_ids[12], deal_ids[13], default_user_id, default_user_id, NOW(), NOW()),
        ('E-Learning platform review', 'call', NOW() + INTERVAL '5 days', FALSE, 'low', 'Review e-learning platform features and capabilities', contact_ids[13], deal_ids[14], default_user_id, default_user_id, NOW(), NOW()),
        ('Retail analytics proposal', 'email', NOW() + INTERVAL '2 days', FALSE, 'medium', 'Send detailed proposal for retail analytics solution', contact_ids[14], deal_ids[15], default_user_id, default_user_id, NOW(), NOW()),
        ('Construction platform demo', 'meeting', NOW() + INTERVAL '10 days', FALSE, 'high', 'Demonstrate construction management platform functionality', contact_ids[15], deal_ids[16], default_user_id, default_user_id, NOW(), NOW()),
        ('AgriTech solution presentation', 'meeting', NOW() + INTERVAL '15 days', FALSE, 'medium', 'Present agricultural technology solutions', contact_ids[16], deal_ids[17], default_user_id, default_user_id, NOW(), NOW()),
        ('Fashion e-commerce planning', 'task', NOW() + INTERVAL '7 days', FALSE, 'high', 'Plan e-commerce platform implementation phases', contact_ids[17], deal_ids[18], default_user_id, default_user_id, NOW(), NOW()),
        ('Health analytics requirements', 'meeting', NOW() + INTERVAL '5 days', FALSE, 'medium', 'Gather detailed requirements for healthcare analytics system', contact_ids[18], deal_ids[19], default_user_id, default_user_id, NOW(), NOW()),
        ('Big data architecture review', 'meeting', NOW() + INTERVAL '9 days', FALSE, 'high', 'Review and finalize big data platform architecture', contact_ids[19], deal_ids[20], default_user_id, default_user_id, NOW(), NOW()),
        ('Cloud strategy workshop', 'meeting', NOW() + INTERVAL '14 days', FALSE, 'medium', 'Workshop to develop detailed cloud migration strategy', contact_ids[20], deal_ids[21], default_user_id, default_user_id, NOW(), NOW()),
        ('Robotics integration planning', 'task', NOW() + INTERVAL '6 days', FALSE, 'high', 'Plan integration of robotics solution with existing systems', contact_ids[21], deal_ids[22], default_user_id, default_user_id, NOW(), NOW());

    -- Re-enable RLS for security
    ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

    -- Display summary of inserted records
    RAISE NOTICE 'Data seeding completed successfully!';
    RAISE NOTICE 'Companies: %', (SELECT COUNT(*) FROM companies);
    RAISE NOTICE 'Contacts: %', (SELECT COUNT(*) FROM contacts);
    RAISE NOTICE 'Deals: %', (SELECT COUNT(*) FROM deals);
    RAISE NOTICE 'Activities: %', (SELECT COUNT(*) FROM activities);
END $$;