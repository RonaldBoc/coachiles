// Test script to verify RPC functions are created in Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRpcFunctions() {
  console.log('🧪 Testing if RPC functions exist...')

  try {
    // Test cancel function with dummy UUID
    const { data, error } = await supabase.rpc('cancel_coach_subscription', {
      coach_id_param: '00000000-0000-0000-0000-000000000000',
    })

    if (error) {
      if (error.code === '42883') {
        console.error('❌ RPC functions NOT created yet!')
        console.error('Please execute create-subscription-functions.sql in Supabase SQL Editor')
        return false
      } else {
        console.log('✅ RPC functions exist (got expected error for dummy UUID)')
        return true
      }
    }

    console.log('✅ RPC functions exist and working')
    return true
  } catch (err) {
    console.error('❌ Error testing RPC functions:', err)
    return false
  }
}

// Usage:
// 1. Update supabaseUrl and supabaseKey above
// 2. Run: node test-rpc-functions.js
testRpcFunctions()
