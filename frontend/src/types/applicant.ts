/**
 * Applicant Type
 * Represents a tutor applicant extended with availability information.
 * Guaranteed availability.
 *
 * Used in: applicant cards, charts, modals, and sorting/filtering logic.
 */

// Applicant type represents people applying to tutor positions
// Used in applicant cards, charts, and filtering

export interface Applicant {
    userId: string; // ID of the tutor applying for the role
    appliedSkills: string[]; // Skills submitted with this application
    appliedAvailability: string; // Availability for this specific role
  }