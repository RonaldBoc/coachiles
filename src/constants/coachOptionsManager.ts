/**
 * Coach Options Management Utility
 *
 * This utility provides functions to manage coach options programmatically.
 * You can use this in an admin interface or for bulk operations.
 */

import {
  CERTIFICATION_OPTIONS,
  LANGUAGE_OPTIONS,
  SPECIALTY_OPTIONS,
  addCertificationToCategory,
  removeCertificationFromCategory,
  addSpecialtyToCategory,
  removeSpecialtyFromCategory,
  getAllCertifications,
  getAllSpecialties,
  getCertificationCategory,
  getSpecialtyCategory,
} from './coachOptions'

export class CoachOptionsManager {
  /**
   * Get statistics about current options
   */
  static getStats() {
    const totalCertifications = getAllCertifications().length
    const totalSpecialties = getAllSpecialties().length
    const totalLanguages = LANGUAGE_OPTIONS.length
    const categoriesCount = CERTIFICATION_OPTIONS.length
    const specialtyCategoriesCount = SPECIALTY_OPTIONS.length

    return {
      certifications: {
        total: totalCertifications,
        byCategory: CERTIFICATION_OPTIONS.map((group) => ({
          category: group.category,
          count: group.certifications.length,
        })),
      },
      specialties: {
        total: totalSpecialties,
        byCategory: SPECIALTY_OPTIONS.map((group) => ({
          category: group.category,
          count: group.specialties.length,
        })),
      },
      languages: {
        total: totalLanguages,
      },
      categories: {
        certifications: categoriesCount,
        specialties: specialtyCategoriesCount,
      },
    }
  }

  /**
   * Find unused or duplicate certifications
   */
  static auditCertifications() {
    const allCerts = getAllCertifications()
    const duplicates: string[] = []
    const seen = new Set<string>()

    for (const cert of allCerts) {
      if (seen.has(cert)) {
        duplicates.push(cert)
      } else {
        seen.add(cert)
      }
    }

    return {
      total: allCerts.length,
      unique: seen.size,
      duplicates,
    }
  }

  /**
   * Search for certifications by keyword
   */
  static searchCertifications(keyword: string): Array<{ cert: string; category: string }> {
    const results: Array<{ cert: string; category: string }> = []
    const searchTerm = keyword.toLowerCase()

    for (const group of CERTIFICATION_OPTIONS) {
      for (const cert of group.certifications) {
        if (cert.toLowerCase().includes(searchTerm)) {
          results.push({
            cert,
            category: group.category,
          })
        }
      }
    }

    return results
  }

  /**
   * Search for specialties by keyword
   */
  static searchSpecialties(keyword: string): Array<{ specialty: string; category: string }> {
    const results: Array<{ specialty: string; category: string }> = []
    const searchTerm = keyword.toLowerCase()

    for (const group of SPECIALTY_OPTIONS) {
      for (const specialty of group.specialties) {
        if (specialty.toLowerCase().includes(searchTerm)) {
          results.push({
            specialty,
            category: group.category,
          })
        }
      }
    }

    return results
  }

  /**
   * Get suggestions for missing certifications
   * Based on common fitness/health certifications
   */
  static getSuggestions(): Array<{ cert: string; category: string }> {
    const commonCertifications = [
      { cert: 'ACSM Certified Personal Trainer', category: 'Fitness & Musculation' },
      { cert: 'NASM Certified Personal Trainer', category: 'Fitness & Musculation' },
      { cert: 'TRX Suspension Training', category: 'Fitness & Musculation' },
      { cert: 'Kettlebell Instructor', category: 'Fitness & Musculation' },
      { cert: 'Aqua Aerobic Instructor', category: 'Spécialisations' },
      { cert: 'Pole Fitness Instructor', category: 'Spécialisations' },
      { cert: 'Zumba Instructor', category: 'Spécialisations' },
      { cert: 'Les Mills Instructor', category: 'Spécialisations' },
    ]

    // Filter out certifications that already exist
    const existing = getAllCertifications()
    return commonCertifications.filter((suggestion) => !existing.includes(suggestion.cert))
  }

  /**
   * Export current configuration to JSON
   * Useful for backup or migration
   */
  static exportConfiguration() {
    return {
      certifications: CERTIFICATION_OPTIONS,
      specialties: SPECIALTY_OPTIONS,
      languages: LANGUAGE_OPTIONS,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
  }

  /**
   * Validate certification structure
   */
  static validateConfiguration() {
    const errors: string[] = []

    // Check certification categories
    for (const group of CERTIFICATION_OPTIONS) {
      if (!group.category || group.category.trim() === '') {
        errors.push('Found certification category with empty name')
      }
      if (!group.certifications || group.certifications.length === 0) {
        errors.push(`Certification category "${group.category}" has no certifications`)
      }
    }

    // Check specialty categories
    for (const group of SPECIALTY_OPTIONS) {
      if (!group.category || group.category.trim() === '') {
        errors.push('Found specialty category with empty name')
      }
      if (!group.specialties || group.specialties.length === 0) {
        errors.push(`Specialty category "${group.category}" has no specialties`)
      }
    }

    // Check for empty languages
    if (LANGUAGE_OPTIONS.length === 0) {
      errors.push('No languages defined')
    }

    // Check for empty language entries
    for (const lang of LANGUAGE_OPTIONS) {
      if (!lang || lang.trim() === '') {
        errors.push('Found empty language entry')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// Quick access functions for common operations
export const coachOptions = {
  // Certification management
  addCertification: addCertificationToCategory,
  removeCertification: removeCertificationFromCategory,
  getCertificationCategory,
  getAllCertifications,
  searchCertifications: CoachOptionsManager.searchCertifications,

  // Specialty management
  addSpecialty: addSpecialtyToCategory,
  removeSpecialty: removeSpecialtyFromCategory,
  getSpecialtyCategory,
  getAllSpecialties,
  searchSpecialties: CoachOptionsManager.searchSpecialties,

  // Statistics and analysis
  getStats: CoachOptionsManager.getStats,
  audit: CoachOptionsManager.auditCertifications,
  validate: CoachOptionsManager.validateConfiguration,

  // Suggestions and improvements
  getSuggestions: CoachOptionsManager.getSuggestions,

  // Import/Export
  export: CoachOptionsManager.exportConfiguration,

  // Raw data access
  get certificationGroups() {
    return CERTIFICATION_OPTIONS
  },
  get specialtyGroups() {
    return SPECIALTY_OPTIONS
  },
  get languages() {
    return LANGUAGE_OPTIONS
  },
}
