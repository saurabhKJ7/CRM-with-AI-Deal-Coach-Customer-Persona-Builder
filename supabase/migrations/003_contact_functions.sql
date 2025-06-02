-- Enable the uuid-ossp extension for generating UUIDs if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to add tags to a contact
CREATE OR REPLACE FUNCTION add_contact_tags(
  contact_id UUID,
  tags_to_add TEXT[]
) RETURNS JSONB AS $$
DECLARE
  tag TEXT;
  result JSONB := '[]'::JSONB;
  tag_record RECORD;
  tag_id UUID;
BEGIN
  -- Start transaction
  BEGIN
    -- Loop through each tag to add
    FOREACH tag IN ARRAY tags_to_add LOOP
      -- Check if tag already exists
      SELECT id INTO tag_record FROM tags WHERE name = tag LIMIT 1;
      
      IF tag_record IS NULL THEN
        -- Create new tag if it doesn't exist
        tag_id := uuid_generate_v4();
        INSERT INTO tags (id, name, created_at, updated_at)
        VALUES (tag_id, tag, NOW(), NOW());
      ELSE
        tag_id := tag_record.id;
      END IF;
      
      -- Add tag to contact if not already added
      INSERT INTO contact_tags (contact_id, tag_id, created_at)
      VALUES (add_contact_tags.contact_id, tag_id, NOW())
      ON CONFLICT (contact_id, tag_id) DO NOTHING;
      
      -- Add to result
      result := result || jsonb_build_object('tag_id', tag_id, 'tag_name', tag, 'status', 'added');
    END LOOP;
    
    -- Update contact's updated_at
    UPDATE contacts 
    SET updated_at = NOW()
    WHERE id = add_contact_tags.contact_id;
    
    RETURN jsonb_build_object('success', true, 'data', result);
    
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove tags from a contact
CREATE OR REPLACE FUNCTION remove_contact_tags(
  contact_id UUID,
  tags_to_remove TEXT[]
) RETURNS JSONB AS $$
DECLARE
  tag TEXT;
  result JSONB := '[]'::JSONB;
  tag_record RECORD;
BEGIN
  -- Start transaction
  BEGIN
    -- Loop through each tag to remove
    FOREACH tag IN ARRAY tags_to_remove LOOP
      -- Find the tag
      SELECT id INTO tag_record FROM tags WHERE name = tag LIMIT 1;
      
      IF tag_record IS NOT NULL THEN
        -- Remove tag from contact
        DELETE FROM contact_tags 
        WHERE contact_id = remove_contact_tags.contact_id 
        AND tag_id = tag_record.id;
        
        -- Add to result
        result := result || jsonb_build_object('tag_id', tag_record.id, 'tag_name', tag, 'status', 'removed');
      END IF;
    END LOOP;
    
    -- Update contact's updated_at
    UPDATE contacts 
    SET updated_at = NOW()
    WHERE id = remove_contact_tags.contact_id;
    
    RETURN jsonb_build_object('success', true, 'data', result);
    
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to merge contacts
CREATE OR REPLACE FUNCTION merge_contacts(
  primary_contact_id UUID,
  duplicate_contact_ids UUID[]
) RETURNS JSONB AS $$
DECLARE
  duplicate_id UUID;
  result JSONB := '[]'::JSONB;
  activity_record RECORD;
  deal_record RECORD;
  tag_record RECORD;
  note_record RECORD;
  field TEXT;
  primary_contact RECORD;
  duplicate_contact RECORD;
  merged_fields JSONB := '{}'::JSONB;
  field_value TEXT;
  field_type TEXT;
  columns TEXT[] := ARRAY[
    'first_name', 'last_name', 'email', 'phone', 'job_title', 
    'company_id', 'status', 'source', 'assigned_to', 'notes',
    'address', 'city', 'state', 'postal_code', 'country',
    'website', 'linkedin', 'twitter', 'facebook'
  ];
BEGIN
  -- Start transaction
  BEGIN
    -- Get primary contact
    SELECT * INTO primary_contact FROM contacts WHERE id = primary_contact_id;
    
    IF primary_contact IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Primary contact not found',
        'detail', 'The specified primary contact does not exist.'
      );
    END IF;
    
    -- Process each duplicate contact
    FOREACH duplicate_id IN ARRAY duplicate_contact_ids LOOP
      -- Skip if primary contact is in the duplicates list
      CONTINUE WHEN duplicate_id = primary_contact_id;
      
      -- Get duplicate contact
      SELECT * INTO duplicate_contact FROM contacts WHERE id = duplicate_id;
      
      IF duplicate_contact IS NOT NULL THEN
        -- Merge fields (keep non-null values from duplicate if primary is null)
        FOREACH field IN ARRAY columns LOOP
          EXECUTE format('SELECT ($1).%I IS NULL AND ($2).%I IS NOT NULL', field, field)
          INTO field_value
          USING primary_contact, duplicate_contact;
          
          IF field_value = 't' THEN
            EXECUTE format('SELECT ($1).%I', field)
            INTO field_value
            USING duplicate_contact;
            
            EXECUTE format('SELECT pg_typeof($1)') 
            INTO field_type 
            USING field_value;
            
            -- Handle different field types
            IF field_type = 'timestamp without time zone' THEN
              merged_fields := jsonb_set(merged_fields, ARRAY[field], to_jsonb(field_value::TEXT));
            ELSE
              merged_fields := jsonb_set(merged_fields, ARRAY[field], to_jsonb(field_value));
            END IF;
          END IF;
        END LOOP;
        
        -- Transfer activities
        FOR activity_record IN 
          SELECT * FROM activities 
          WHERE contact_id = duplicate_id
        LOOP
          UPDATE activities 
          SET contact_id = primary_contact_id
          WHERE id = activity_record.id;
        END LOOP;
        
        -- Transfer deals
        FOR deal_record IN 
          SELECT * FROM deals 
          WHERE contact_id = duplicate_id
        LOOP
          UPDATE deals 
          SET contact_id = primary_contact_id
          WHERE id = deal_record.id;
        END LOOP;
        
        -- Transfer tags
        FOR tag_record IN 
          SELECT t.* FROM contact_tags ct
          JOIN tags t ON ct.tag_id = t.id
          WHERE ct.contact_id = duplicate_id
        LOOP
          -- Add tag to primary contact if not already present
          INSERT INTO contact_tags (contact_id, tag_id, created_at)
          VALUES (primary_contact_id, tag_record.id, NOW())
          ON CONFLICT (contact_id, tag_id) DO NOTHING;
        END LOOP;
        
        -- Transfer notes
        FOR note_record IN 
          SELECT * FROM notes 
          WHERE contact_id = duplicate_id
        LOOP
          UPDATE notes 
          SET contact_id = primary_contact_id
          WHERE id = note_record.id;
        END LOOP;
        
        -- Delete the duplicate contact
        DELETE FROM contacts WHERE id = duplicate_id;
        
        -- Add to result
        result := result || jsonb_build_object(
          'duplicate_id', duplicate_id,
          'status', 'merged',
          'fields_merged', (SELECT jsonb_object_agg(key, value) FROM jsonb_each(merged_fields))
        );
      END IF;
    END LOOP;
    
    -- Update primary contact with merged fields if any
    IF jsonb_typeof(merged_fields) = 'object' AND jsonb_array_length(merged_fields) > 0 THEN
      UPDATE contacts 
      SET 
        updated_at = NOW(),
        first_name = COALESCE(merged_fields->>'first_name', first_name),
        last_name = COALESCE(merged_fields->>'last_name', last_name),
        email = COALESCE(merged_fields->>'email', email),
        phone = COALESCE(merged_fields->>'phone', phone),
        job_title = COALESCE(merged_fields->>'job_title', job_title),
        company_id = COALESCE(NULLIF(merged_fields->>'company_id', '')::UUID, company_id),
        status = COALESCE(merged_fields->>'status', status),
        source = COALESCE(merged_fields->>'source', source),
        assigned_to = COALESCE(NULLIF(merged_fields->>'assigned_to', '')::UUID, assigned_to),
        notes = COALESCE(merged_fields->>'notes', notes),
        address = COALESCE(merged_fields->>'address', address),
        city = COALESCE(merged_fields->>'city', city),
        state = COALESCE(merged_fields->>'state', state),
        postal_code = COALESCE(merged_fields->>'postal_code', postal_code),
        country = COALESCE(merged_fields->>'country', country),
        website = COALESCE(merged_fields->>'website', website),
        linkedin = COALESCE(merged_fields->>'linkedin', linkedin),
        twitter = COALESCE(merged_fields->>'twitter', twitter),
        facebook = COALESCE(merged_fields->>'facebook', facebook)
      WHERE id = primary_contact_id;
    END IF;
    
    -- Return success with merge details
    RETURN jsonb_build_object(
      'success', true,
      'primary_contact_id', primary_contact_id,
      'merged_contacts', result,
      'merged_fields', merged_fields
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback transaction on error
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE,
      'context', 'Error merging contacts'
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
