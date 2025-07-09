<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Proposal } from '@/types/Proposal'
import { FITNESS_LEVELS } from '@/constants/niveau'
import { COACHING_MODES } from '@/constants/preference'
import { PROPOSAL_STATUS_OPTIONS } from '@/constants/status'

// Mock data for demonstration - replace with actual data fetching
const proposals = ref<Proposal[]>([
  {
    id: 1,
    client_id: 123,
    created_at: new Date('2025-07-08T10:30:00'),
    desired_start: new Date('2025-07-15'),
    location: 'Paris',
    services: ['Perte de poids', 'Remise en forme', 'Cardio training', 'Sommeil'],
    level: 'debutant',
    group_preference: 'solo',
    languages: ['français'],
    availability: 'Lundi, mercredi, vendredi 18h-20h',
    gender_preference: 'peu_importe',
    status: 'pending',
    expires_at: new Date('2025-07-15T23:59:59'),
    is_paid_for: false,
  },
  {
    id: 2,
    client_id: 456,
    created_at: new Date('2025-07-07T14:15:00'),
    desired_start: new Date('2025-07-20'),
    location: 'Lyon',
    services: ['Préparation physique', 'Nutrition sportive', 'Mental sportif'],
    level: 'intermediaire',
    group_preference: 'group',
    languages: ['français', 'anglais'],
    availability: 'Mardi, jeudi 19h-21h',
    gender_preference: 'homme',
    status: 'accepted', // Automatically accepted since coach paid for this lead
    expires_at: new Date('2025-07-20T23:59:59'),
    is_paid_for: true, // Coach paid for this specific lead
  },
  {
    id: 3,
    client_id: 789,
    created_at: new Date('2025-07-06T16:45:00'),
    desired_start: new Date('2025-07-25'),
    location: 'Marseille',
    services: ['Yoga', 'Méditation', 'Gestion du stress'],
    level: 'debutant',
    group_preference: 'solo',
    languages: ['français'],
    availability: 'Weekend 10h-12h',
    gender_preference: 'femme',
    status: 'pending',
    expires_at: new Date('2025-07-25T23:59:59'),
    is_paid_for: false,
  },
])

// Coach subscription status - replace with actual user data
const coachHasSubscription = ref(false) // Change this to test different scenarios

// Dropdown state for actions menu
const openDropdownId = ref<string | number | null>(null)
const dropdownPosition = ref({ top: 0, left: 0 })

// Helper function to toggle subscription for testing
const toggleSubscription = () => {
  coachHasSubscription.value = !coachHasSubscription.value
  console.log('Subscription status changed to:', coachHasSubscription.value)
}

// Toggle dropdown menu with smart positioning
const toggleDropdown = (proposalId: string | number, event: MouseEvent) => {
  console.log('Toggle dropdown clicked for proposal:', proposalId)
  if (openDropdownId.value === proposalId) {
    openDropdownId.value = null
    return
  }

  openDropdownId.value = proposalId

  // Check if we're in mobile mode (under 480px)
  const isMobile = window.innerWidth <= 480

  if (isMobile) {
    // For mobile, we use relative positioning in CSS, so no need to calculate
    dropdownPosition.value = { top: 0, left: 0 }

    // Add active class to the card for higher z-index
    const target = event.currentTarget as HTMLElement
    const card = target.closest('.table-row') as HTMLElement
    if (card) {
      card.classList.add('dropdown-active')
    }
  } else {
    // Calculate position for the dropdown
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 200 // Approximate dropdown height

    // Determine if dropdown should appear above or below
    const spaceBelow = viewportHeight - rect.bottom
    const shouldShowAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight

    if (shouldShowAbove) {
      dropdownPosition.value = {
        top: rect.top - dropdownHeight + window.scrollY,
        left: rect.right - 160 + window.scrollX, // 160px is approximate dropdown width
      }
    } else {
      dropdownPosition.value = {
        top: rect.bottom + 4 + window.scrollY,
        left: rect.right - 160 + window.scrollX,
      }
    }
  }

  console.log('Dropdown state:', openDropdownId.value, 'Position:', dropdownPosition.value)
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  openDropdownId.value = null
}

// Global click handler for click-outside functionality
const handleDocumentClick = (event: MouseEvent) => {
  // Check if the click is outside any dropdown
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown-menu') && !target.closest('.action-btn-dropdown')) {
    closeDropdown()
  }
}

// Set up and clean up global click listener
onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'badge-amber'
    case 'accepted':
    case 'confirmed':
      return 'badge-green'
    case 'rejected':
    case 'expired':
      return 'badge-red'
    case 'cancelled':
    case 'archived':
      return 'badge-gray'
    default:
      return 'badge-gray'
  }
}

const getLevelLabel = (level: string) => {
  switch (level) {
    case 'debutant':
      return FITNESS_LEVELS[0] // 'Débutant'
    case 'intermediaire':
      return FITNESS_LEVELS[1] // 'Intermédiaire'
    case 'avance':
      return FITNESS_LEVELS[2] // 'Avancé'
    case 'professionnel':
      return FITNESS_LEVELS[3] // 'Athlète / Professionnel'
    default:
      return FITNESS_LEVELS[4] // 'Je ne sais pas'
  }
}

const getGroupPreferenceLabel = (preference: string) => {
  const mode = COACHING_MODES.find((mode) => mode.value === preference)
  return mode ? mode.label : preference
}

const getStatusLabel = (status: string) => {
  const statusOption = PROPOSAL_STATUS_OPTIONS.find((option) => option.value === status)
  return statusOption ? statusOption.label : status
}

// Helper functions to determine button visibility - using computed for reactivity
const canAcceptReject = computed(() => (proposal: Proposal) => {
  // Only show accept/reject for subscription holders on pending proposals
  // Never show for paid individual leads (they're automatically accepted)
  return coachHasSubscription.value && proposal.status === 'pending' && !proposal.is_paid_for
})

const shouldShowPaymentButtons = computed(() => (proposal: Proposal) => {
  return !coachHasSubscription.value && !proposal.is_paid_for
})

// Action handlers
const handleSubscribe = () => {
  console.log('Redirecting to subscription page...')
  // Add subscription logic here
}

const handleBuyLead = (proposalId: string | number) => {
  console.log('Buying lead for proposal:', proposalId)
  // Add buy lead logic here
}

const handleView = (proposal: Proposal) => {
  console.log('Viewing proposal:', proposal.id)
  // Add view logic here
}

const handleAccept = (proposal: Proposal) => {
  console.log('Accepting proposal:', proposal.id)
  // Add accept logic here
}

const handleReject = (proposal: Proposal) => {
  console.log('Rejecting proposal:', proposal.id)
  // Add reject logic here
}
</script>

<template>
  <div class="proposals-container">
    <div class="proposals-wrapper">
      <h1 class="proposals-title">Propositions en attente</h1>

      <!-- Debug section - remove in production -->
      <div class="debug-section" style="text-align: center; margin-bottom: 1rem">
        <button
          @click="toggleSubscription"
          class="action-btn"
          :class="coachHasSubscription ? 'btn-reject' : 'btn-accept'"
        >
          {{ coachHasSubscription ? '❌ Désactiver abonnement' : '✅ Activer abonnement' }}
        </button>
        <p style="margin: 0.5rem 0; font-size: 0.875rem; color: #6b7280">
          Status: {{ coachHasSubscription ? 'Abonné' : 'Non abonné' }}
        </p>
      </div>

      <div class="table-container">
        <table class="proposals-table">
          <thead class="table-header">
            <tr>
              <th class="table-th">Créé</th>
              <th class="table-th">Services Recherchés</th>
              <th class="table-th">Niveau</th>
              <th class="table-th">Préférence</th>
              <th class="table-th">Status</th>
              <th class="table-th">Actions</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="proposal in proposals" :key="proposal.id" class="table-row">
              <td class="table-td">
                {{ formatDateTime(proposal.created_at) }}
              </td>
              <td class="table-td services-cell">
                <div class="services-container">
                  <span
                    v-for="(service, index) in proposal.services.slice(0, 2)"
                    :key="index"
                    class="service-tag"
                  >
                    {{ service }}
                  </span>
                  <div v-if="proposal.services.length > 2" class="services-more">
                    +{{ proposal.services.length - 2 }}
                  </div>
                </div>
              </td>
              <td class="table-td">
                <span class="badge badge-blue">
                  {{ getLevelLabel(proposal.level) }}
                </span>
              </td>
              <td class="table-td">
                <span class="badge badge-purple">
                  {{ getGroupPreferenceLabel(proposal.group_preference) }}
                </span>
              </td>
              <td class="table-td">
                <span class="badge" :class="getStatusColorClass(proposal.status)">
                  {{ getStatusLabel(proposal.status) }}
                </span>
              </td>
              <td class="table-td">
                <div class="actions-container relative">
                  <!-- Dropdown trigger button -->
                  <button
                    @click.stop="toggleDropdown(proposal.id, $event)"
                    class="action-btn-dropdown"
                    :class="{ active: openDropdownId === proposal.id }"
                    type="button"
                  >
                    ⋯
                  </button>

                  <!-- Dropdown menu -->
                  <div
                    v-if="openDropdownId === proposal.id"
                    class="dropdown-menu"
                    :style="{
                      top: dropdownPosition.top + 'px',
                      left: dropdownPosition.left + 'px',
                    }"
                    @click.stop
                  >
                    <!-- Always show View option -->
                    <button @click="(handleView(proposal), closeDropdown())" class="dropdown-item">
                      Voir
                    </button>

                    <!-- Show Accept/Reject options if coach has subscription and proposal is pending -->
                    <template v-if="canAcceptReject(proposal)">
                      <button
                        @click="(handleAccept(proposal), closeDropdown())"
                        class="dropdown-item text-green-700"
                      >
                        Accepter
                      </button>
                      <button
                        @click="(handleReject(proposal), closeDropdown())"
                        class="dropdown-item text-red-700"
                      >
                        Refuser
                      </button>
                    </template>

                    <!-- Show Payment options if coach hasn't paid -->
                    <template v-if="shouldShowPaymentButtons(proposal)">
                      <hr class="dropdown-divider" />
                      <button
                        @click="(handleSubscribe(), closeDropdown())"
                        class="dropdown-item text-blue-700"
                      >
                        S'abonner
                      </button>
                      <button
                        @click="(handleBuyLead(proposal.id), closeDropdown())"
                        class="dropdown-item text-amber-700"
                      >
                        Acheter ce lead
                      </button>
                    </template>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="proposals.length === 0">
              <td colspan="6" class="empty-state">
                <div class="empty-content">
                  <div class="empty-icon">📄</div>
                  <p class="empty-title">Aucune proposition en attente</p>
                  <p class="empty-subtitle">Les nouvelles propositions apparaîtront ici</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container Styles */
.proposals-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.proposals-wrapper {
  width: 100%;
}

.proposals-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  color: #1f2937;
  margin-bottom: 2rem;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* Table Styles */
.proposals-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table-header {
  background: linear-gradient(to right, #f9fafb, #f3f4f6);
  border-bottom: 2px solid #e5e7eb;
}

.table-th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #374151;
}

.table-th:nth-child(1) {
  width: 15%;
} /* Créé */
.table-th:nth-child(2) {
  width: 35%;
} /* Services - much wider */
.table-th:nth-child(3) {
  width: 12%;
} /* Niveau */
.table-th:nth-child(4) {
  width: 20%;
} /* Préférence */
.table-th:nth-child(5) {
  width: 15%;
} /* Status */
.table-th:nth-child(6) {
  width: 14%;
} /* Actions */

.table-body {
  background: white;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #eff6ff;
}

.table-td {
  padding: 1.25rem 1.5rem;
  font-size: 0.875rem;
  color: #1f2937;
  vertical-align: middle;
}

/* Services Cell */
.services-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: flex-start;
  max-height: 70px;
  overflow: hidden;
  line-height: 1.3;
}

.service-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.6875rem;
  font-weight: 500;
  white-space: nowrap;
  height: 24px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.services-more {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  color: #6b7280;
  border-radius: 8px;
  font-size: 0.6875rem;
  font-weight: 600;
  height: 24px;
  min-width: 35px;
  justify-content: center;
}

/* Badge Styles */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
}

.badge-blue {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.badge-purple {
  background-color: #faf5ff;
  color: #7c3aed;
  border-color: #d8b4fe;
}

.badge-amber {
  background-color: #fffbeb;
  color: #d97706;
  border-color: #fed7aa;
}

.badge-green {
  background-color: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

.badge-red {
  background-color: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.badge-gray {
  background-color: #f9fafb;
  color: #4b5563;
  border-color: #e5e7eb;
}

/* Actions */
.actions-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dropdown trigger button */
.action-btn-dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-dropdown:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.action-btn-dropdown.active {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

/* Dropdown menu */
.dropdown-menu {
  position: fixed;
  z-index: 9999;
  min-width: 10rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Dropdown items */
.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f9fafb;
}

.dropdown-item:focus {
  outline: none;
  background-color: #f3f4f6;
}

/* Dropdown divider */
.dropdown-divider {
  margin: 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

/* Empty State */
.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-title {
  color: #6b7280;
  font-weight: 500;
  margin: 0;
}

.empty-subtitle {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

/* Responsive */
@media (max-width: 768px) {
  .proposals-container {
    padding: 1rem 0.5rem;
  }

  .proposals-title {
    font-size: 1.5rem;
  }

  .table-th,
  .table-td {
    padding: 0.75rem 0.5rem;
  }

  .services-container {
    max-height: 44px;
    gap: 0.2rem;
  }

  .service-tag {
    font-size: 0.5625rem;
    padding: 0.1rem 0.25rem;
    height: 20px;
    max-width: 80px;
  }

  .services-more {
    height: 20px;
    min-width: 25px;
    font-size: 0.5625rem;
  }

  .actions-container {
    justify-content: center;
  }

  .dropdown-menu {
    min-width: 8rem;
  }

  /* Adjust column widths for mobile */
  .table-th:nth-child(1) {
    width: 18%;
  } /* Créé */
  .table-th:nth-child(2) {
    width: 32%;
  } /* Services */
  .table-th:nth-child(3) {
    width: 12%;
  } /* Niveau */
  .table-th:nth-child(4) {
    width: 12%;
  } /* Préférence */
  .table-th:nth-child(5) {
    width: 12%;
  } /* Status */
  .table-th:nth-child(6) {
    width: 14%;
  } /* Actions */
}

/* Extra small screens - Card layout */
@media (max-width: 480px) {
  .proposals-container {
    padding: 1rem 0.75rem;
    background: #f9fafb; /* Light gray background */
  }

  .proposals-title {
    font-size: 1.375rem;
    margin-bottom: 1.5rem;
  }

  /* Hide the table structure */
  .table-container {
    background: transparent;
    box-shadow: none;
    border: none;
    border-radius: 0;
    overflow: visible; /* Allow dropdowns to overflow */
  }

  .proposals-table,
  .table-header,
  .table-body,
  .table-row {
    display: block;
  }

  .table-header {
    display: none; /* Hide table headers */
  }

  .table-body {
    background: transparent !important; /* Remove white background */
  }

  .table-row {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    margin-bottom: 1.5rem; /* Increased spacing */
    padding: 1.25rem; /* More padding */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Better shadow */
    transition: all 0.2s ease;
    position: relative;
    overflow: visible;
    z-index: 1;
  }

  .table-row:last-child {
    margin-bottom: 2rem; /* Extra space for last card */
  }

  .table-row:hover {
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Enhanced shadow */
    transform: translateY(-2px); /* More lift */
    z-index: 10;
  }

  .table-row:has(.dropdown-menu) {
    z-index: 100;
  }

  .table-td {
    display: block;
    padding: 0.75rem 0; /* More spacing between fields */
    border-bottom: 1px solid #f3f4f6;
    position: relative;
  }

  .table-td:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  /* Add labels before each field */
  .table-td:nth-child(1)::before {
    content: 'Créé le: ';
    font-weight: 600;
    color: #374151;
    display: inline-block;
    margin-right: 0.5rem;
  }

  .table-td:nth-child(2)::before {
    content: 'Services: ';
    font-weight: 600;
    color: #374151;
    display: block;
    margin-bottom: 0.75rem; /* More space for services */
  }

  .table-td:nth-child(3)::before {
    content: 'Niveau: ';
    font-weight: 600;
    color: #374151;
    display: inline-block;
    margin-right: 0.5rem;
  }

  .table-td:nth-child(4)::before {
    content: 'Préférence: ';
    font-weight: 600;
    color: #374151;
    display: inline-block;
    margin-right: 0.5rem;
  }

  .table-td:nth-child(5)::before {
    content: 'Statut: ';
    font-weight: 600;
    color: #374151;
    display: inline-block;
    margin-right: 0.5rem;
  }

  .table-td:nth-child(6)::before {
    content: 'Actions: ';
    font-weight: 600;
    color: #374151;
    display: inline-block;
    margin-right: 0.5rem;
  }

  /* Services styling for cards */
  .services-container {
    max-height: none;
    gap: 0.5rem;
    margin-top: 0.75rem; /* More space above services */
  }

  .service-tag {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
    height: auto;
    max-width: none;
    line-height: 1.2;
  }

  .services-more {
    height: auto;
    min-width: auto;
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }

  /* Badge adjustments for cards */
  .badge {
    font-size: 0.8125rem;
    padding: 0.375rem 0.875rem;
  }

  /* Actions styling for cards */
  .actions-container {
    position: relative;
    justify-content: flex-start;
    margin-top: 0.5rem; /* More space above actions */
    z-index: 1;
  }

  .action-btn-dropdown {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.375rem;
  }

  /* Dropdown positioning adjustments for cards */
  .dropdown-menu {
    min-width: 12rem;
    position: absolute !important;
    z-index: 999 !important;
    top: 100% !important;
    left: 0 !important;
    margin-top: 0.25rem;
    transform: none !important;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  }

  /* Empty state adjustments */
  .empty-state {
    padding: 2rem 1rem;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin: 1rem 0; /* Add spacing around empty state */
  }

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .empty-title {
    font-size: 1.125rem;
  }

  .empty-subtitle {
    font-size: 0.875rem;
  }

  /* Debug section adjustments */
  .debug-section .action-btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  /* Sidebar handling for mobile - when sidebar is open, hide main content */
  .proposals-container.sidebar-open {
    display: none;
  }

  /* Alternative: if you want to show sidebar but hide main content differently */
  body.sidebar-open .proposals-container {
    display: none;
  }
}

/* Sidebar styles for mobile */
@media (max-width: 480px) {
  /* Assuming your sidebar has a class like .sidebar or .navigation-sidebar */
  .sidebar,
  .navigation-sidebar,
  .mobile-sidebar {
    width: 75vw !important;
    max-width: 75vw !important;
    height: 100vh !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 9999 !important;
    background: white !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3) !important;
  }

  /* Overlay when sidebar is open */
  .sidebar-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.5) !important;
    z-index: 9998 !important;
  }

  /* Hide main content when sidebar is active */
  body.sidebar-active .proposals-container,
  .main-content.sidebar-active .proposals-container {
    visibility: hidden;
  }
}
</style>
