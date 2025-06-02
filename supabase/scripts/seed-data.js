// Script to seed the database with sample data
const { createClient } = require('@supabase/supabase-js');
// Using direct environment variables instead of dotenv

// Initialize Supabase client
const supabaseUrl = 'https://qadyhhvvomgylvuluivk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZHloaHZ2b21neWx2dWx1aXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDU1NDcsImV4cCI6MjA2NDEyMTU0N30.kll7vL9STNABC6ZfLjbXDn5Mv94y3MeL2MlB-2FNLy4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Set a mock user ID to use for all records
// This avoids authentication issues while still providing the necessary foreign key
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

// Sample data
const sampleCompanies = [
  {
    name: 'TechCorp Inc.',
    industry: 'Technology',
    website: 'https://techcorp.example.com',
    phone: '+1 (555) 123-4567',
    address_line1: '123 Tech Avenue',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94105',
    country: 'USA',
    description: 'Leading enterprise software provider',
  },
  {
    name: 'Global Systems Ltd.',
    industry: 'IT Services',
    website: 'https://globalsystems.example.com',
    phone: '+1 (555) 987-6543',
    address_line1: '456 Innovation Drive',
    city: 'Boston',
    state: 'MA',
    postal_code: '02110',
    country: 'USA',
    description: 'Specialized in cloud infrastructure and migration',
  },
  {
    name: 'Secure Financial',
    industry: 'Finance',
    website: 'https://securefinancial.example.com',
    phone: '+1 (555) 456-7890',
    address_line1: '789 Finance Blvd',
    city: 'New York',
    state: 'NY',
    postal_code: '10004',
    country: 'USA',
    description: 'Financial services and solutions',
  },
  {
    name: 'HealthPlus',
    industry: 'Healthcare',
    website: 'https://healthplus.example.com',
    phone: '+1 (555) 234-5678',
    address_line1: '321 Wellness Way',
    city: 'Chicago',
    state: 'IL',
    postal_code: '60601',
    country: 'USA',
    description: 'Healthcare technology solutions',
  },
  {
    name: 'EcoSolutions',
    industry: 'Environmental',
    website: 'https://ecosolutions.example.com',
    phone: '+1 (555) 876-5432',
    address_line1: '567 Green Street',
    city: 'Portland',
    state: 'OR',
    postal_code: '97204',
    country: 'USA',
    description: 'Sustainable technology and consulting',
  }
];

const sampleContacts = [
  {
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@techcorp.example.com',
    phone: '+1 (555) 123-4567',
    job_title: 'CTO',
    status: 'Customer',
    source: 'Conference',
    notes: 'Key decision maker for enterprise software purchases.'
  },
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.j@globalsystems.example.com',
    phone: '+1 (555) 987-6543',
    job_title: 'VP Sales',
    status: 'Lead',
    source: 'Website',
    notes: 'Interested in our cloud migration services.'
  },
  {
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'm.chen@securefinancial.example.com',
    phone: '+1 (555) 456-7890',
    job_title: 'Director of IT',
    status: 'Lead',
    source: 'Referral',
    notes: 'Looking for security solutions.'
  },
  {
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@healthplus.example.com',
    phone: '+1 (555) 234-5678',
    job_title: 'CIO',
    status: 'Customer',
    source: 'Email Campaign',
    notes: 'Interested in healthcare data solutions.'
  },
  {
    first_name: 'David',
    last_name: 'Wilson',
    email: 'd.wilson@ecosolutions.example.com',
    phone: '+1 (555) 876-5432',
    job_title: 'CEO',
    status: 'Prospect',
    source: 'LinkedIn',
    notes: 'Looking for sustainable tech solutions.'
  },
  {
    first_name: 'Jennifer',
    last_name: 'Lopez',
    email: 'j.lopez@techcorp.example.com',
    phone: '+1 (555) 345-6789',
    job_title: 'Product Manager',
    status: 'Customer',
    source: 'Conference',
    notes: 'Works with John Smith on product decisions.'
  },
  {
    first_name: 'Robert',
    last_name: 'Brown',
    email: 'r.brown@globalsystems.example.com',
    phone: '+1 (555) 654-3210',
    job_title: 'IT Manager',
    status: 'Lead',
    source: 'Website',
    notes: 'Technical contact for migration projects.'
  },
  {
    first_name: 'Lisa',
    last_name: 'Wang',
    email: 'l.wang@securefinancial.example.com',
    phone: '+1 (555) 789-0123',
    job_title: 'CISO',
    status: 'Lead',
    source: 'Webinar',
    notes: 'Concerned about data security compliance.'
  }
];

const sampleDeals = [
  {
    title: 'Enterprise Software License',
    description: 'Annual enterprise software license for 500 users',
    amount: 120000,
    stage: 'negotiation',
    probability: 75,
    expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    title: 'Cloud Migration Project',
    description: 'Complete cloud infrastructure migration',
    amount: 85000,
    stage: 'proposal',
    probability: 50,
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    title: 'Security Suite Implementation',
    description: 'Implementation of security software and services',
    amount: 75000,
    stage: 'qualified',
    probability: 25,
    expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    title: 'Healthcare Data Solution',
    description: 'Data analytics and management solution for healthcare provider',
    amount: 95000,
    stage: 'negotiation',
    probability: 80,
    expected_close_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    title: 'Sustainable Tech Consultation',
    description: 'Environmental impact assessment and technology recommendations',
    amount: 45000,
    stage: 'lead',
    probability: 15,
    expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    title: 'Software Upgrade Package',
    description: 'Upgrade existing systems to latest version',
    amount: 35000,
    stage: 'won',
    probability: 100,
    expected_close_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    title: 'Maintenance Contract Renewal',
    description: 'Annual maintenance and support contract',
    amount: 25000,
    stage: 'won',
    probability: 100,
    expected_close_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    title: 'Custom Development Project',
    description: 'Custom software development for specific business needs',
    amount: 150000,
    stage: 'proposal',
    probability: 40,
    expected_close_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    title: 'Hardware Procurement',
    description: 'Supply of hardware and infrastructure equipment',
    amount: 65000,
    stage: 'lost',
    probability: 0,
    expected_close_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

const sampleActivities = [
  {
    subject: 'Follow-up call with John Smith',
    type: 'call',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'high',
    description: 'Discuss contract terms and implementation timeline'
  },
  {
    subject: 'Send proposal to Sarah Johnson',
    type: 'email',
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    completed: true,
    priority: 'medium',
    description: 'Send detailed proposal for cloud migration project'
  },
  {
    subject: 'Demo session with Michael Chen',
    type: 'meeting',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'medium',
    description: 'Product demonstration and Q&A session'
  },
  {
    subject: 'Prepare contract for Emily Davis',
    type: 'task',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'high',
    description: 'Draft final contract with negotiated terms'
  },
  {
    subject: 'Initial consultation with David Wilson',
    type: 'meeting',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'low',
    description: 'Discuss requirements and potential solutions'
  },
  {
    subject: 'Weekly check-in with Jennifer Lopez',
    type: 'call',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed: true,
    priority: 'medium',
    description: 'Regular project status update'
  },
  {
    subject: 'Technical assessment for Robert Brown',
    type: 'task',
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'medium',
    description: 'Evaluate current IT infrastructure and recommend improvements'
  },
  {
    subject: 'Security briefing with Lisa Wang',
    type: 'meeting',
    due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'high',
    description: 'Present security solutions and compliance measures'
  },
  {
    subject: 'Follow up on maintenance renewal',
    type: 'email',
    due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completed: true,
    priority: 'high',
    description: 'Send maintenance contract renewal information'
  },
  {
    subject: 'Quarterly business review',
    type: 'meeting',
    due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    completed: true,
    priority: 'medium',
    description: 'Review business performance and set goals for next quarter'
  },
  {
    subject: 'Prepare sales presentation',
    type: 'task',
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'medium',
    description: 'Create presentation for new product launch'
  },
  {
    subject: 'Training session on new software',
    type: 'meeting',
    due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    priority: 'low',
    description: 'Train team on using the new software platform'
  }
];

// Function to get a user ID for foreign key references
async function getUserId() {
  try {
    // First check if any profiles exist
    const { data: existingProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profileError) {
      console.error('Error checking profiles:', profileError);
      console.log('Using mock user ID instead');
      return MOCK_USER_ID;
    }
    
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('Using existing profile ID:', existingProfiles[0].id);
      return existingProfiles[0].id;
    }
    
    // If no profiles exist, check if we can create a mock profile
    const { data: insertedProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: MOCK_USER_ID,
        email: 'demo@example.com',
        full_name: 'Demo User',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.log('Could not create profile, using mock ID:', MOCK_USER_ID);
      return MOCK_USER_ID;
    }
    
    console.log('Created mock profile with ID:', insertedProfile[0].id);
    return insertedProfile[0].id;
  } catch (error) {
    console.error('Error in getUserId:', error);
    console.log('Falling back to mock user ID');
    return MOCK_USER_ID;
  }
}

// Main function to seed data
async function seedData() {
  try {
    console.log('Starting data seeding process...');
    
    // Get a user ID for foreign key references
    const userId = await getUserId();
    console.log('Using user ID for data seeding:', userId);

    // Add companies
    console.log('Adding companies...');
    const companiesWithUser = sampleCompanies.map(company => ({
      ...company,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data: insertedCompanies, error: companiesError } = await supabase
      .from('companies')
      .insert(companiesWithUser)
      .select();
    
    if (companiesError) {
      console.error('Error inserting companies:', companiesError);
      return;
    }
    
    console.log(`Added ${insertedCompanies.length} companies.`);

    // Add contacts
    console.log('Adding contacts...');
    const contactsWithRelations = sampleContacts.map((contact, index) => ({
      ...contact,
      company_id: insertedCompanies[index % insertedCompanies.length].id,
      assigned_to: userId,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data: insertedContacts, error: contactsError } = await supabase
      .from('contacts')
      .insert(contactsWithRelations)
      .select();
    
    if (contactsError) {
      console.error('Error inserting contacts:', contactsError);
      return;
    }
    
    console.log(`Added ${insertedContacts.length} contacts.`);

    // Add deals
    console.log('Adding deals...');
    const dealsWithRelations = sampleDeals.map((deal, index) => ({
      ...deal,
      contact_id: insertedContacts[index % insertedContacts.length].id,
      company_id: insertedCompanies[index % insertedCompanies.length].id,
      assigned_to: userId,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data: insertedDeals, error: dealsError } = await supabase
      .from('deals')
      .insert(dealsWithRelations)
      .select();
    
    if (dealsError) {
      console.error('Error inserting deals:', dealsError);
      return;
    }
    
    console.log(`Added ${insertedDeals.length} deals.`);

    // Add activities
    console.log('Adding activities...');
    const activitiesWithRelations = sampleActivities.map((activity, index) => ({
      ...activity,
      contact_id: insertedContacts[index % insertedContacts.length].id,
      deal_id: insertedDeals[index % insertedDeals.length].id,
      assigned_to: userId,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data: insertedActivities, error: activitiesError } = await supabase
      .from('activities')
      .insert(activitiesWithRelations)
      .select();
    
    if (activitiesError) {
      console.error('Error inserting activities:', activitiesError);
      return;
    }
    
    console.log(`Added ${insertedActivities.length} activities.`);

    console.log('Data seeding completed successfully!');
    
  } catch (error) {
    console.error('An unexpected error occurred during data seeding:', error);
  }
}

// Run the seeding function
seedData()
  .then(() => {
    console.log('Script execution completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });