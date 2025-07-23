# Coachiles Marketplace Expansion

This update expands the Coachiles coach platform into a full marketplace with comprehensive booking, payment, and review functionality.

## 🆕 New Features

### 1. **Services Management** 
- Coaches can create and manage service offerings
- Flexible pricing, duration, and location options
- Service categories and tags for better discovery
- Group size options (individual, small group, large group)

### 2. **Booking System**
- Complete appointment booking workflow
- Calendar integration and scheduling
- Status management (pending, confirmed, completed, cancelled)
- Meeting details for online sessions
- Conflict detection and availability checking

### 3. **Review & Rating System**
- Client reviews and ratings for completed sessions
- Detailed feedback categories (communication, professionalism, expertise, value)
- Coach response capability
- Review moderation and verification
- Automatic rating calculations

### 4. **Payment Processing**
- Complete transaction tracking
- Platform fee and commission management
- Multiple payment method support (Stripe, PayPal)
- Coach earnings and payout tracking
- Refund and dispute handling

## 📊 Database Schema

### New Tables Created:

1. **`services`** - Coach service offerings
2. **`bookings`** - Client appointments 
3. **`reviews`** - Coach ratings and feedback
4. **`payments`** - Transaction records

### Enhanced Existing Tables:
- **`coaches`** - Added performance metrics and verification
- **`leads`** - Enhanced tracking and conversion data
- **`subscriptions`** - Added usage limits and billing features

## 🔒 Security Features

### Row Level Security (RLS) Policies:
- ✅ Coaches can only manage their own content
- ✅ Clients can only access relevant booking information
- ✅ Reviews are publicly viewable when published
- ✅ Payment data is restricted to authorized users
- ✅ Admin functions for moderation and system management

### Database Functions:
- `calculate_coach_rating()` - Automatic rating updates
- `update_coach_stats()` - Performance metric calculations
- `get_coach_availability()` - Smart scheduling
- `search_coaches()` - Advanced search with relevance scoring

## 🛠 API Services

### New TypeScript API Services:

```typescript
// Service Management
import { serviceApi } from '@/services'
const services = await serviceApi.getServices()
const myServices = await serviceApi.getCoachServices(coachId)

// Booking Management  
import { bookingApi } from '@/services'
const bookings = await bookingApi.getBookings()
const conflicts = await bookingApi.checkBookingConflicts(coachId, date, duration)

// Review Management
import { reviewApi } from '@/services'
const reviews = await reviewApi.getCoachReviews(coachId)
const stats = await reviewApi.getReviewStats(coachId)

// Payment Management
import { paymentApi } from '@/services'
const payments = await paymentApi.getCoachPayments(coachId)
const balance = await paymentApi.getCoachBalance(coachId)
```

## 📁 File Structure

```
src/
├── types/
│   ├── service.ts      # Service type definitions
│   ├── booking.ts      # Booking type definitions  
│   ├── review.ts       # Review type definitions
│   ├── payment.ts      # Payment type definitions
│   └── simple.ts       # Simplified partial types
├── services/
│   ├── supabaseServiceApi.ts   # Service API calls
│   ├── supabaseBookingApi.ts   # Booking API calls
│   ├── supabaseReviewApi.ts    # Review API calls
│   └── supabasePaymentApi.ts   # Payment API calls
└── utils/
    └── supabase.ts     # Updated with new table types

database-schema-marketplace.sql  # Complete database setup
```

## 🚀 Setup Instructions

### 1. Database Setup
```sql
-- Run this in your Supabase SQL Editor
-- Copy contents from database-schema-marketplace.sql
```

### 2. Environment Variables
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USE_MOCK_DATA=false
```

### 3. Test the APIs
```bash
# Test the new marketplace APIs
node test-marketplace-apis.mjs
```

## 📋 Features Overview

### For Coaches:
- ✅ Create and manage service offerings
- ✅ View and manage bookings
- ✅ Respond to client reviews
- ✅ Track earnings and request payouts
- ✅ View performance analytics

### For Clients:
- ✅ Browse and search services
- ✅ Book appointments with coaches
- ✅ Leave reviews after sessions
- ✅ Manage their booking history

### For Platform:
- ✅ Complete transaction processing
- ✅ Automated fee calculations
- ✅ Review moderation system
- ✅ Coach verification workflow
- ✅ Advanced search and filtering

## 🔧 Integration Points

### Payment Processors:
- Stripe integration ready
- PayPal support included
- Configurable platform fees
- Automatic payout scheduling

### Calendar Integration:
- Available time slot generation
- Conflict detection
- Reminder system ready
- Timezone support

### Email/SMS Notifications:
- Booking confirmations
- Payment receipts  
- Review requests
- Payout notifications

## 📈 Analytics & Reporting

### Coach Dashboard Metrics:
- Total bookings and revenue
- Average rating and review count
- Client retention rates
- Performance trends

### Platform Analytics:
- Total marketplace volume
- Coach performance rankings
- Popular service categories
- Revenue and commission tracking

## 🧪 Testing

The new marketplace functionality includes:
- ✅ Complete TypeScript type safety
- ✅ Database constraint validation
- ✅ RLS policy enforcement
- ✅ API service integration tests
- ✅ Sample data for development

## 🎯 Next Steps

1. **Apply the database schema** using `database-schema-marketplace.sql`
2. **Test the APIs** with the provided test script
3. **Implement UI components** for the new marketplace features
4. **Configure payment processing** (Stripe/PayPal)
5. **Set up email notifications** for booking workflow
6. **Add calendar integration** for scheduling

The foundation is now complete for a full-featured coach marketplace! 🎉