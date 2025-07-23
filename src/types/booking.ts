// Booking types for appointment management
export interface Booking {
  id: string
  createdAt: Date
  updatedAt: Date
  
  // Booking Details
  serviceId: string
  coachId: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  
  // Schedule
  scheduledAt: Date
  durationMinutes: number
  timezone: string
  
  // Status & Management
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  
  // Details
  totalAmount: number
  currency: string
  notes?: string
  internalNotes?: string
  
  // Confirmation & Communication
  confirmedAt?: Date
  cancelledAt?: Date
  cancellationReason?: string
  reminderSentAt?: Date
  
  // Meeting Details (for online sessions)
  meetingUrl?: string
  meetingId?: string
  meetingPassword?: string
  
  // Related data (populated in queries)
  service?: import('./simple').SimpleService
  coach?: import('./simple').SimpleCoach
}

export interface CreateBookingData {
  serviceId: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  scheduledAt: Date
  notes?: string
  timezone?: string
}

export interface UpdateBookingData {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed'
  scheduledAt?: Date
  notes?: string
  internalNotes?: string
  cancellationReason?: string
  meetingUrl?: string
  meetingId?: string
  meetingPassword?: string
}

export interface BookingFilters {
  coachId?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed'
  startDate?: Date
  endDate?: Date
  clientEmail?: string
}

export interface BookingStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  cancelledBookings: number
  totalRevenue: number
  thisMonth: {
    bookings: number
    revenue: number
    newClients: number
  }
  lastMonth: {
    bookings: number
    revenue: number
    newClients: number
  }
}

export interface AvailableSlot {
  date: string
  times: string[]
}

export interface BookingConflict {
  conflictingBookingId: string
  conflictingTime: Date
  reason: string
}