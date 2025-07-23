// Test the searchCoaches functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hthdhkyyiymlrlvmpnhy.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aGRoa3l5aXltbHJsdm1wbmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTA2MjEsImV4cCI6MjA2Nzg2NjYyMX0.BpIr2awtwm4XlJ00ZhcLaKiVOBPBBzymTHZzSFE2Guc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to map Supabase data to our Coach interface
const mapSupabaseToCoach = (supabaseData) => {
  return {
    id: supabaseData.id,
    firstName: supabaseData.first_name,
    lastName: '', // Not stored in Supabase for privacy
    email: supabaseData.email,
    phone: supabaseData.phone || '',
    photo: supabaseData.avatar_url || undefined,
    bio: supabaseData.bio || '',
    location: supabaseData.locations?.[0] || 'Martinique', // Take first location
    specialties: supabaseData.specialties || [],
    certifications: supabaseData.certifications || [],
    experience: supabaseData.experience_years || 0,
    availability: supabaseData.availability?.join(', ') || '',
    rating: supabaseData.rating || 0,
    totalClients: supabaseData.total_sessions || 0,
    subscriptionStatus: supabaseData.subscription_type === 'free' ? 'inactive' : 'active',
    services: [], // Not implemented yet
    createdAt: new Date(supabaseData.created_at),
    updatedAt: new Date(supabaseData.updated_at),
    isActive: supabaseData.is_active,
  }
}

async function testSearch() {
  try {
    console.log('🔍 Testing search functionality...')

    // Test basic query without filters
    let query = supabase.from('coaches').select('*').eq('is_active', true)

    const page = 1
    const limit = 12
    const offset = (page - 1) * limit

    // Get total count first
    const { count, error: countError } = await supabase
      .from('coaches')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (countError) {
      console.error('❌ Count error:', countError)
      return
    }

    console.log('📊 Total active coaches:', count)

    // Get data with pagination
    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order('rating', { ascending: false })

    if (error) {
      console.error('❌ Query error:', error)
      return
    }

    console.log('✅ Query successful:', { totalCount: count, pageResults: data?.length })

    // Map data
    const mappedCoaches = data?.map(mapSupabaseToCoach) || []
    console.log('✅ Mapped coaches:', mappedCoaches.length)
    console.log('Sample mapped coach:', mappedCoaches[0])

    // Test search with a query
    console.log('\n🔍 Testing search with query "Marie"...')
    const searchQuery = supabase
      .from('coaches')
      .select('*')
      .eq('is_active', true)
      .or(`first_name.ilike.%Marine%,bio.ilike.%Marine%`)

    const { data: searchData, error: searchError } = await searchQuery
      .range(0, 11)
      .order('rating', { ascending: false })

    if (searchError) {
      console.error('❌ Search error:', searchError)
    } else {
      console.log('✅ Search results:', searchData?.length)
      console.log(
        'Search results:',
        searchData?.map((coach) => ({ name: coach.first_name, bio: coach.bio?.substring(0, 50) })),
      )
    }
  } catch (err) {
    console.error('❌ Test failed:', err)
  }
}

testSearch()
