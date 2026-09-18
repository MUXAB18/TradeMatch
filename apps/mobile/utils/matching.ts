/**
 * Job Matching Utility
 * Per architecture.md Section 4.3: Rules-based matching (no ML)
 *
 * Pure function for scoring job matches based on:
 * - Skills overlap
 * - Certification match
 * - Location proximity
 *
 * Per rules.md Section 8: This is unit tested (see matching.test.ts)
 */

import { User, JobPosting } from '../types';

/**
 * Match score result
 */
export interface MatchScore {
  total: number; // 0-100 total score
  skillsScore: number; // 0-40 points
  certsScore: number; // 0-40 points
  locationScore: number; // 0-20 points
  breakdown: {
    matchedSkills: string[];
    missingSkills: string[];
    matchedCerts: string[];
    missingCerts: string[];
    distanceKm: number;
  };
}

/**
 * Calculate match score between user and job
 * Pure function - no side effects, fully testable
 *
 * Scoring breakdown:
 * - Skills: 40 points max (percentage of required skills user has)
 * - Certs: 40 points max (percentage of required certs user has)
 * - Location: 20 points max (inverse of distance, capped at 50km)
 *
 * @param user - User profile
 * @param job - Job posting
 * @returns Match score object with total and breakdown
 */
export function calculateMatchScore(
  user: User,
  job: JobPosting & { id: string }
): MatchScore {
  // Skills scoring (40 points max)
  const matchedSkills = job.requiredSkills.filter(skill =>
    user.skills.some(userSkill => 
      userSkill.toLowerCase() === skill.toLowerCase()
    )
  );
  const missingSkills = job.requiredSkills.filter(
    skill => !matchedSkills.includes(skill)
  );
  const skillsScore =
    job.requiredSkills.length > 0
      ? (matchedSkills.length / job.requiredSkills.length) * 40
      : 40; // If no skills required, full score

  // Certifications scoring (40 points max)
  const matchedCerts = job.requiredCerts.filter(cert =>
    user.certifications.includes(cert)
  );
  const missingCerts = job.requiredCerts.filter(
    cert => !matchedCerts.includes(cert)
  );
  const certsScore =
    job.requiredCerts.length > 0
      ? (matchedCerts.length / job.requiredCerts.length) * 40
      : 40; // If no certs required, full score

  // Location scoring (20 points max)
  const distanceKm = calculateDistance(
    user.location.latitude,
    user.location.longitude,
    job.location.latitude,
    job.location.longitude
  );

  // Location scoring: closer is better, capped at 50km
  // 0km = 20 points, 50km = 0 points, linear interpolation
  const locationScore = Math.max(0, 20 - (distanceKm / 50) * 20);

  const total = Math.round(skillsScore + certsScore + locationScore);

  return {
    total,
    skillsScore: Math.round(skillsScore),
    certsScore: Math.round(certsScore),
    locationScore: Math.round(locationScore),
    breakdown: {
      matchedSkills,
      missingSkills,
      matchedCerts,
      missingCerts,
      distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
    },
  };
}

/**
 * Calculate distance between two geopoints using Haversine formula
 * Returns distance in kilometers
 *
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Score and sort jobs by match quality
 * Returns jobs with scores, sorted by total score descending
 *
 * @param user - User profile
 * @param jobs - Array of job postings
 * @returns Array of jobs with scores, sorted by match quality
 */
export function scoreAndSortJobs(
  user: User,
  jobs: (JobPosting & { id: string })[]
): Array<{ job: JobPosting & { id: string }; score: MatchScore }> {
  const scored = jobs.map(job => ({
    job,
    score: calculateMatchScore(user, job),
  }));

  // Sort by total score descending (best matches first)
  return scored.sort((a, b) => b.score.total - a.score.total);
}

/**
 * Get match quality label for UI display
 * @param score - Total match score (0-100)
 * @returns Human-readable match quality label
 */
export function getMatchQualityLabel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Fair Match';
  return 'Weak Match';
}

/**
 * Get match quality color for UI display
 * @param score - Total match score (0-100)
 * @returns Color identifier for theming
 */
export function getMatchQualityColor(
  score: number
): 'success' | 'secondary' | 'warning' | 'textSecondary' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'secondary';
  if (score >= 40) return 'warning';
  return 'textSecondary';
}
