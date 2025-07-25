# Supabase Setup Guide for Coachiles

## 🚀 Quick Start with Supabase

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - **Name**: `Coachiles`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (like `https://xxx.supabase.co`)
   - **Public anon key** (starts with `eyJ...`)

### 3. Set Up Environment Variables

1. Create a `.env.local` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Switch to real database
VITE_USE_MOCK_DATA=false

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PAYMENTS=false
```

### 4. Set Up Database Schema

**Important**: Use the simplified schema first to avoid permission errors.

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database-schema-simple.sql` from your project (not the regular database-schema.sql)
3. Paste it in the SQL Editor and click **Run**
4. This will create all tables, indexes, sample data, and storage setup

**Note**: This simplified version doesn't include Row Level Security (RLS) policies that require authentication. You can add those later when you implement user auth.

### 5. Configure Authentication (Optional)

If you want user authentication:

1. Go to **Authentication** → **Settings** in Supabase
2. Configure your **Site URL**: `http://localhost:5173` (for development)
3. Add production URL when deployed
4. Enable email auth or social providers as needed

### 6. Test the Connection

1. Start your development server: `npm run dev`
2. Check the browser console for any connection errors
3. Visit the coaches page to see data from Supabase

## 📋 Database Schema Overview

Your database includes these main tables:

### `coaches` table

- Basic info (name, email, phone, avatar)
- Professional details (specialties, experience, rates)
- Performance metrics (rating, sessions, response time)
- Subscription status

### `leads` table

- Client contact information
- Coaching preferences and requirements
- Lead status and management
- Coach assignment and notes

### `subscriptions` table

- Subscription plans and billing
- Payment tracking
- Feature access control

## 🔄 Switching Between Mock and Real Data

To use **Mock Data** (for development):

```env
VITE_USE_MOCK_DATA=true
```

To use **Real Supabase Data**:

```env
VITE_USE_MOCK_DATA=false
```

## 📁 File Storage

Supabase Storage is configured for coach avatars:

- Bucket: `coach-avatars`
- Public access for viewing
- Authenticated upload only
- Automatic file management

## 🔒 Security Features

### Row Level Security (RLS)

- Coaches can only edit their own profiles
- Leads are only visible to assigned coaches
- Subscriptions are private to each coach

### Authentication Integration

Ready for Supabase Auth when needed:

- JWT token handling
- User session management
- Secure API calls

## 🛠 Available API Services

### Coach API (`supabaseCoachApi`)

- `getCoaches()` - Browse all active coaches
- `getCoachById()` - Get specific coach
- `getCoachByFirstName()` - Find by name (for URLs)
- `updateCoach()` - Update profile
- `uploadAvatar()` - Upload profile photo
- `getSimilarCoaches()` - Recommendations

### Lead API (`supabaseLeadApi`)

- `getLeadsForCoach()` - Coach's assigned leads
- `createLead()` - New client requests
- `updateLeadStatus()` - Status management
- `addNote()` - Coach notes
- `markAsContacted()` - Contact tracking
- `getLeadStats()` - Performance analytics

### Subscription API (`supabaseSubscriptionApi`)

- `getCoachSubscription()` - Current plan
- `createSubscription()` - New subscription
- `updateSubscription()` - Plan changes
- `cancelSubscription()` - Cancellation
- `renewSubscription()` - Billing cycle

## 🚨 Troubleshooting

### Common Issues

1. **"permission denied to set parameter 'app.jwt_secret'"**:
   - Use `database-schema-simple.sql` instead of `database-schema.sql`
   - The simple version doesn't require superuser privileges
2. **Connection Error**: Check your environment variables

3. **RLS Policy Error**: The simple schema doesn't include RLS policies initially

4. **CORS Error**: Add your domain to Supabase settings

5. **Upload Error**: Check storage bucket permissions

### Testing Tips

1. Use the sample data inserted by the schema
2. Test with browser dev tools Network tab
3. Check Supabase logs in the dashboard
4. Use the API directly in SQL Editor for debugging

## 🎯 Next Steps

1. ✅ **Setup Complete**: You now have a fully functional database
2. � **Apply Coach Services Migration**: Add dynamic service management
   - Go to **SQL Editor** in your Supabase dashboard
   - Copy the contents of `migrations/01_add_coach_services.sql`
   - Paste and run to add the coach_services table
3. �🔐 **Add Authentication**: Implement user login/signup
4. 💳 **Payment Integration**: Connect Stripe/PayPal for subscriptions
5. 📊 **Analytics**: Add performance tracking
6. 🚀 **Deploy**: Push to production with real domain

## 🆕 New Features Added

### Coach Services Management

- **Dynamic Services**: Coaches can now create their own services instead of using hardcoded ones
- **Pricing Options**: Support for both solo and group pricing
- **Location Types**: Online, outdoor, indoor, and client location options
- **Scheduling**: Available days and time slots configuration
- **Equipment Management**: Track provided and required equipment
- **Cancellation Policies**: Customizable policies for each service

To enable this feature:

1. Run the migration in `migrations/01_add_coach_services.sql`
2. Services will be loaded automatically when coaches visit their profile page
3. The public profile will display dynamic services instead of hardcoded ones

## 📞 Support

- **Supabase Docs**: [docs.supabase.com](https://docs.supabase.com)
- **Vue.js Integration**: [supabase.com/docs/guides/getting-started/tutorials/with-vue-3](https://supabase.com/docs/guides/getting-started/tutorials/with-vue-3)

Your coaching marketplace is now ready for real users! 🎉
