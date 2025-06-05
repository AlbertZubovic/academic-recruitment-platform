// src/types/Metrics.ts

/**
 * Response item from GET /api/metrics/availability
 */
export interface AvailabilityMetric {
  availability: string; // "Full-Time" or "Part-Time"
  count:       number;
}
export type AvailabilityMetricResponse = AvailabilityMetric[];

/**
 * Response item from GET /api/metrics/selection-counts
 */
export interface SelectionCount {
  userId:        string;
  firstName:     string;
  lastName:      string;
  selectedCount: number;
}
export type SelectionCountResponse = SelectionCount[];

/**
 * Response item from GET /api/metrics/common-skills
 */
export interface CommonSkill {
  skillName: string;
  count:     number;
}
export type CommonSkillResponse = CommonSkill[];
