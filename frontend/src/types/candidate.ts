// src/types/candidate.ts

import { PastRole } from "./PastRole";

/**
 * A “Candidate” object as used by Candidate‐related components.
 * This matches what CandidateDetailsPage builds.
 */
export interface Candidate {
  firstname: string;
  lastname: string;
  email: string;
  credentials: string;
  skills: string[];
  pastRoles: PastRole[];
}
