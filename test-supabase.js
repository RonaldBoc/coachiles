// Test Supabase connection
import { supabase } from './src/utils/supabase.js'

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')

    // Test basic connection
    const { data, error } = await supabase.from('coaches').select('id, first_name, email').limit(1)

    if (error) {
      console.error('Supabase Error:', error)
      return
    }

    console.log('✅ Supabase connection successful!')
    console.log('Sample data:', data)
  } catch (err) {
    console.error('❌ Connection failed:', err)
  }
}

testConnection()
