import { supabase } from '../lib/supabase/client';

// Test data
const testContact = {
  first_name: 'Test',
  last_name: 'User',
  email: `test.${Date.now()}@example.com`,
  phone: '+1234567890',
  job_title: 'QA Tester',
  status: 'active',
  source: 'website',
  notes: 'Test contact created by API test',
};

const BASE_URL = 'http://localhost:3000/api';

async function testContactsAPI() {
  console.log('Starting Contacts API Tests...\n');
  
  let contactId: string;
  
  // Test 1: Create a new contact
  console.log('1. Testing POST /api/contacts');
  try {
    const createResponse = await fetch(`${BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testContact),
    });
    
    const createData = await createResponse.json();
    console.log('Create Response:', createResponse.status, createData);
    
    if (createResponse.ok) {
      contactId = createData.data.id;
      console.log(`✅ Contact created with ID: ${contactId}`);
    } else {
      throw new Error(createData.error || 'Failed to create contact');
    }
  } catch (error) {
    console.error('❌ Create contact failed:', error);
    return;
  }
  
  // Test 2: Get all contacts
  console.log('\n2. Testing GET /api/contacts');
  try {
    const listResponse = await fetch(`${BASE_URL}/contacts`);
    const listData = await listResponse.json();
    console.log('List Response:', listResponse.status, 'Total:', listData.pagination?.total);
    
    if (listResponse.ok) {
      console.log(`✅ Retrieved ${listData.data?.length || 0} contacts`);
    } else {
      throw new Error(listData.error || 'Failed to list contacts');
    }
  } catch (error) {
    console.error('❌ List contacts failed:', error);
    return;
  }
  
  // Test 3: Get single contact
  console.log(`\n3. Testing GET /api/contacts/${contactId}`);
  try {
    const getResponse = await fetch(`${BASE_URL}/contacts/${contactId}`);
    const getData = await getResponse.json();
    console.log('Get Response:', getResponse.status, getData);
    
    if (getResponse.ok) {
      console.log(`✅ Retrieved contact: ${getData.data.first_name} ${getData.data.last_name}`);
    } else {
      throw new Error(getData.error || 'Failed to get contact');
    }
  } catch (error) {
    console.error('❌ Get contact failed:', error);
    return;
  }
  
  // Test 4: Update contact
  console.log(`\n4. Testing PUT /api/contacts/${contactId}`);
  try {
    const updateResponse = await fetch(`${BASE_URL}/contacts/${contactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_title: 'Senior QA Tester' }),
    });
    
    const updateData = await updateResponse.json();
    console.log('Update Response:', updateResponse.status, updateData);
    
    if (updateResponse.ok) {
      console.log(`✅ Contact updated successfully`);
    } else {
      throw new Error(updateData.error || 'Failed to update contact');
    }
  } catch (error) {
    console.error('❌ Update contact failed:', error);
    return;
  }
  
  // Test 5: Add tags to contact
  console.log(`\n5. Testing PATCH /api/contacts/${contactId} (add-tags)`);
  try {
    const tagsResponse = await fetch(`${BASE_URL}/contacts/${contactId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add-tags',
        data: { tags: ['test', 'premium'] },
      }),
    });
    
    const tagsData = await tagsResponse.json();
    console.log('Add Tags Response:', tagsResponse.status, tagsData);
    
    if (tagsResponse.ok) {
      console.log('✅ Tags added successfully');
    } else {
      throw new Error(tagsData.error || 'Failed to add tags');
    }
  } catch (error) {
    console.error('❌ Add tags failed:', error);
    return;
  }
  
  // Test 6: Remove tag from contact
  console.log(`\n6. Testing PATCH /api/contacts/${contactId} (remove-tags)`);
  try {
    const removeTagsResponse = await fetch(`${BASE_URL}/contacts/${contactId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'remove-tags',
        data: { tags: ['test'] },
      }),
    });
    
    const removeTagsData = await removeTagsResponse.json();
    console.log('Remove Tags Response:', removeTagsResponse.status, removeTagsData);
    
    if (removeTagsResponse.ok) {
      console.log('✅ Tags removed successfully');
    } else {
      throw new Error(removeTagsData.error || 'Failed to remove tags');
    }
  } catch (error) {
    console.error('❌ Remove tags failed:', error);
    return;
  }
  
  // Test 7: Delete contact
  console.log(`\n7. Testing DELETE /api/contacts/${contactId}`);
  try {
    const deleteResponse = await fetch(`${BASE_URL}/contacts/${contactId}`, {
      method: 'DELETE',
    });
    
    const deleteData = await deleteResponse.json();
    console.log('Delete Response:', deleteResponse.status, deleteData);
    
    if (deleteResponse.ok) {
      console.log('✅ Contact deleted successfully');
    } else {
      throw new Error(deleteData.error || 'Failed to delete contact');
    }
  } catch (error) {
    console.error('❌ Delete contact failed:', error);
    return;
  }
  
  console.log('\n✅ All tests completed successfully!');
}

// Run the tests
testContactsAPI().catch(console.error);
