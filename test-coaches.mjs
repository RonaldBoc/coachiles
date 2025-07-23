// Test Supabase coaches data
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hthdhkyyiymlrlvmpnhy.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aGRoa3l5aXltbHJsdm1wbmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTA2MjEsImV4cCI6MjA2Nzg2NjYyMX0.BpIr2awtwm4XlJ00ZhcLaKiVOBPBBzymTHZzSFE2Guc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCoaches() {
  try {
    console.log('🔍 Testing coaches data...')

    // Test connection
    const { data, error } = await supabase.from('coaches').select('*').limit(5)

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log('✅ Success! Found', data?.length || 0, 'coaches')
    console.log('Sample data:', JSON.stringify(data?.[0], null, 2))

    // Test with search functionality
    const { data: searchData, error: searchError } = await supabase
      .from('coaches')
      .select('*')
      .eq('is_active', true)
      .limit(3)

    if (searchError) {
      console.error('❌ Search error:', searchError)
    } else {
      console.log('✅ Active coaches found:', searchData?.length || 0)
    }
  } catch (err) {
    console.error('❌ Connection failed:', err)
  }
}

testCoaches()
