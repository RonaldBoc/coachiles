# 🏋️ Coachiles - Coach-Centric Lead Generation Platform

A modern Vue.js platform connecting clients with qualified coaches through a subscription-based lead generation system in the French Caribbean (Martinique, Guadeloupe, Guyane).

## 🎯 Vision & Mission

**Mission:** Transform the coaching industry by providing coaches with qualified leads through subscriptions, while offering clients a simple, pressure-free way to connect with the right coach for their needs.

**Vision:** Create a coach-centric marketplace where coaches build their reputation through professional profiles, gain access to qualified leads via subscription, and clients can easily browse and request coaching services without upfront payments.

## 🚀 New Simplified Booking Flow

### 🔹 1. Client Browses Coaches

- Public coach marketplace with comprehensive filtering
- Browse by coaching specialties, location, experience, and ratings
- View coach profiles with services, credentials, and availability
- No prices displayed - focus on coach quality and fit

### 🔹 2. Simple Request Submission

- Clients submit a brief request form (no account required initially)
- Basic contact info, coaching goals, and preferences
- No payment required - completely free for clients
- Instant request submission

### 🔹 3. Coach Lead Access (Subscription-Based)

- Coaches with active subscriptions can view and unlock new leads
- Lead details include client contact, goals, and preferences
- Direct communication between coach and client
- Coaches manage their own pricing and booking

### 🔹 4. Direct Coach-Client Connection

- **Coaches reach out directly** to interested clients
- **Flexible pricing** - coaches set their own rates
- **No platform fees** on bookings - coaches keep 100% of their earnings
- **Relationship building** - direct coach-client partnerships

## ✨ Key Features

### 🎨 Modern UI/UX

- **Service-First Design** - Browse by services, not coaches
- **Intelligent Matching** - Advanced filtering and search
- **Mobile-Responsive** - Perfect experience on all devices
- **Accessibility** - Full keyboard navigation and screen reader support

### 🏋️ Comprehensive Service Taxonomy

Complete categorization system covering:

- **Fitness & Musculation** - 8 subcategories (Remise en forme, Perte de poids, etc.)
- **Cardio & Endurance** - 8 subcategories (Course à pied, Natation, etc.)
- **Sports de combat** - 8 subcategories (Boxe, MMA, Arts martiaux, etc.)
- **Yoga & Méditation** - 8 subcategories (Hatha, Vinyasa, Méditation, etc.)
- **Nutrition & Lifestyle** - 6 subcategories (Coaching nutritionnel, etc.)
- **15 total categories** with 100+ specific subcategories

### � Flexible Pricing System

- **Single Price** or **Price Range** options
- **Per Hour** or **Per Session** billing
- **Coach-defined** pricing strategy per service
- **Real-time** price matching with client budgets

### 📱 Smart Service Management

- **Auto-save** functionality for all forms
- **Searchable dropdowns** for categories/subcategories
- **Dependent selection** (subcategories filter based on category)
- **One category + one subcategory** per service rule

### 🔒 Secure Payment Flow

- **Stripe integration** for payment processing
- **Authorization-first** approach (no upfront charging)
- **Automatic capture** on coach acceptance
- **Instant refund** on decline/expiration

## 🚀 Tech Stack

- **Framework:** Vue 3 + TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Components:** Headless UI for accessibility
- **Icons:** Heroicons
- **Build Tool:** Vite
- **Package Manager:** npm

## 📦 Dependencies

### Production

```json
{
  "@headlessui/vue": "^1.7.16",
  "@heroicons/vue": "^2.0.18",
  "vue": "^3.5.17",
  "vue-router": "^4.5.1",
  "pinia": "^3.0.3"
}
```

### Development

```json
{
  "@tailwindcss/forms": "^0.5.7",
  "@tailwindcss/typography": "^0.5.10",
  "tailwindcss": "^3.4.17",
  "typescript": "~5.8.0",
  "vite": "^7.0.0"
}
```

## �️ Architecture & Implementation

### 🎯 Service-Centric Data Model

```typescript
interface Service {
  id: string
  name: string
  category: string // From comprehensive taxonomy
  subcategory: string // Dependent on category
  description: string
  price?: number // Single price
  priceRange?: {
    // Or price range
    min: number
    max: number
  }
  priceType: 'hour' | 'session'
  isPriceRange: boolean
  deliveryModes: string[] // Online, In-person
  locations: string[] // Home, Gym, Outdoor, etc.
  schedule: WeeklySchedule // Coach availability
  ageGroups: string[] // Target demographics
  sessionTypes: string[] // Individual, Group, etc.
  levels: string[] // Beginner to Advanced
  isActive: boolean
  coach: {
    // Linked coach info
    id: string
    firstName: string
    profilePhoto: string
    rating?: number
  }
}
```

### 🔄 Request Flow System

```typescript
interface ServiceRequest {
  id: string
  serviceId: string
  clientId: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  requestedDate: Date
  clientPreferences: string
  price: number
  paymentIntentId: string // Stripe payment intent
  createdAt: Date
  expiresAt: Date // 24h expiration
}
```

### 🧠 Intelligent Matching Algorithm

Service-based scoring system with weighted criteria:

- **Category/Subcategory Match** (50% weight) - Exact vs related matches
- **Location Proximity** (25% weight) - Distance-based scoring
- **Schedule Compatibility** (15% weight) - Availability overlap
- **Budget Alignment** (10% weight) - Price range matching

## 📁 Updated Project Structure

```
src/
├── components/
│   ├── service/              # Service-related components
│   │   ├── ServiceCard.vue
│   │   ├── ServiceGrid.vue
│   │   └── ServiceFilters.vue
│   ├── booking/              # Booking flow components
│   │   ├── RequestModal.vue
│   │   ├── PaymentForm.vue
│   │   └── RequestStatus.vue
│   └── coach/               # Coach management
│       └── ServiceManagement.vue
├── constants/
│   └── services.ts          # Complete service taxonomy
├── pages/
│   ├── ServiceBrowser.vue   # Public marketplace
│   ├── ServiceDetail.vue    # Individual service view
│   ├── CoachProfile.vue     # Coach service management
│   └── ClientDashboard.vue  # Client request history
├── stores/
│   ├── services.ts          # Service state management
│   ├── requests.ts          # Request flow state
│   └── payments.ts          # Payment handling
└── types/
    ├── service.ts           # Service type definitions
    ├── request.ts           # Request type definitions
    └── payment.ts           # Payment type definitions
```

## 🚧 Development Roadmap

### ✅ Phase 1: Foundation (Complete)

- [x] Service management with category/subcategory system
- [x] Flexible pricing (single price vs range, hour vs session)
- [x] Auto-save functionality for all forms
- [x] Searchable, dependent dropdown selections
- [x] Modern UI with Tailwind CSS and Headless UI

### 🔄 Phase 2: Service Marketplace (In Progress)

- [ ] Public service browsing interface
- [ ] Advanced filtering system
- [ ] Service detail pages
- [ ] Coach profile public view (limited info)

### 📅 Phase 3: Booking System (Planned)

- [ ] Service request modal with authentication
- [ ] Stripe payment authorization integration
- [ ] 24-hour coach response system
- [ ] Automatic payment capture/cancellation

### 🔔 Phase 4: Communication & Management (Planned)

- [ ] Coach request dashboard
- [ ] Client request history
- [ ] Contact detail unlock system
- [ ] Email/SMS notifications

### 📊 Phase 5: Advanced Features (Future)

- [ ] Rating and review system
- [ ] In-app messaging
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Stripe account (for payment processing)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/coachiles.git
   cd coachiles
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env.local
   # Add your Stripe keys and other environment variables
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

## 🛠️ Technical Excellence

### Modern Vue.js Patterns

- **Composition API** - Modern, reusable logic
- **TypeScript** - Full type safety throughout
- **Auto-save** - Real-time data persistence
- **Reactive Forms** - Dynamic, dependent form fields

### Performance Optimizations

- **Service-based architecture** - Efficient data modeling
- **Lazy loading** - Components loaded on demand
- **Optimized bundling** - Tree-shaking and code splitting
- **Modern JavaScript** - ES modules and modern syntax

### Developer Experience

- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Hot reload** with Vite
- **TypeScript** for better IDE support

## 🎨 Design System

### Colors

- **Primary:** Blue scale (indigo-600 focus)
- **Success:** Green for completed actions
- **Warning:** Yellow for pending states
- **Error:** Red for declined/failed states
- **Gray Scale:** Consistent UI elements

### Component Library

- **Service Cards** - Showcase services with coach info
- **Filter Components** - Advanced search capabilities
- **Modal System** - Booking and management flows
- **Payment Forms** - Secure Stripe integration
- **Status Badges** - Clear request state indicators

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile experience
- **Progressive Enhancement** - Works on all screen sizes
- **Touch Friendly** - Large touch targets
- **Adaptive Layout** - Cards on mobile, tables on desktop

## 🎯 Key Innovations

### Service-Centric Approach

Instead of matching clients with coaches, we match them with specific services. This provides:

- **More accurate matching** - Specific service details vs general coach info
- **Cleaner data model** - All relevant info in service objects
- **Better user experience** - Clients see exactly what they're booking
- **Scalable architecture** - Coaches can offer multiple specialized services

### Smart Category System

15 comprehensive categories with 100+ subcategories covering:

- Traditional fitness and sports
- Wellness and mental health
- Specialized populations (seniors, children, etc.)
- Modern trends (HIIT, functional training, etc.)
- Nutrition and lifestyle coaching

### Flexible Pricing Model

- Single price or price range per service
- Hourly or per-session billing
- Coach-defined pricing strategy
- Real-time budget matching

## 🔐 Security & Payments

### Stripe Integration

- **PCI Compliant** - Secure payment processing
- **Authorization First** - Hold funds without charging
- **Automatic Processing** - Capture on acceptance, refund on decline
- **Webhook Support** - Real-time payment status updates

### Data Privacy

- **Anonymized Requests** - Coaches see limited client info initially
- **Contact Unlock** - Full details only after acceptance
- **GDPR Compliant** - Proper data handling for EU users

## 🔧 Development Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## 🌍 Target Market

### Geographic Focus

- **Martinique** - Primary market with 34 cities
- **Guadeloupe** - Secondary market with 29 cities
- **Guyane** - Expanding market with 21 cities

### Service Categories (Top 5)

1. **Fitness & Musculation** (25% of services)
2. **Cardio & Endurance** (20% of services)
3. **Yoga & Méditation** (15% of services)
4. **Nutrition & Lifestyle** (12% of services)
5. **Sports de combat** (10% of services)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Follow coding standards**
   - Use TypeScript for type safety
   - Follow existing component patterns
   - Add tests for new functionality
5. **Submit a pull request**

### Development Guidelines

- Use Composition API for new components
- Implement auto-save for all forms
- Ensure mobile responsiveness
- Add proper TypeScript types
- Follow accessibility best practices

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vue.js team** - Amazing framework and ecosystem
- **Tailwind Labs** - Excellent CSS framework and design system
- **Headless UI** - Accessible, unstyled UI components
- **Heroicons** - Beautiful, consistent SVG icon library
- **Stripe** - Secure payment processing infrastructure
- **French Caribbean Community** - Inspiration for this local marketplace

## 📞 Support & Contact

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Community questions and ideas
- **Email** - contact@coachiles.com
- **Documentation** - Full API docs and guides (coming soon)

---

**Built with ❤️ for the French Caribbean coaching community**
