// Enhanced Availability Types for Calendar Integration
// src/types/availability.ts

export interface AvailabilityTemplate {
  id: string
  coachId: string
  dayOfWeek: number // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string // "09:00"
  endTime: string // "17:00"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AvailabilityException {
  id: string
  coachId: string
  date: string // "2024-12-25" (ISO date)
  startTime?: string // null = all day exception
  endTime?: string // null = all day exception
  isAvailable: boolean // false = blocked, true = extra availability
  reason?: string // "vacation", "sick", "extra session"
  createdAt: Date
  updatedAt: Date
}

export interface BookingSlot {
  id: string
  coachId: string
  clientEmail: string
  clientName: string
  startDatetime: Date
  endDatetime: Date
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  serviceType: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface WeeklySchedule {
  [key: number]: AvailabilityTemplate[] // dayOfWeek -> time slots
}

export interface AvailabilitySlot {
  start: Date
  end: Date
  isAvailable: boolean
  isBooked: boolean
  booking?: BookingSlot
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

// Day names for weekly schedule (0 = Sunday, 1 = Monday, etc.)
export const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

// Time slots for availability (24-hour format)
export const TIME_SLOTS = [
  '06:00',
  '06:30',
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
]

export const DEFAULT_TIME_SLOTS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
] as const
