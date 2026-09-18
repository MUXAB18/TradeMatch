/**
 * Unit tests for job matching logic
 * Per rules.md Section 8: Pure function testing (highest value at MVP stage)
 *
 * Run with: npm test utils/matching.test.ts
 */

import { GeoPoint, Timestamp } from 'firebase/firestore';
import {
  calculateMatchScore,
  calculateDistance,
  scoreAndSortJobs,
  getMatchQualityLabel,
  getMatchQualityColor,
} from './matching';
import { User, JobPosting } from '../types';

// Mock user for testing
const mockUser: User = {
  name: 'Test User',
  phone: '+971501234567',
  trade: 'electrician',
  country: 'AE',
  yearsExperience: 5,
  skills: ['Residential Wiring', 'Commercial Wiring', 'Solar Panel Installation'],
  certifications: ['elec-uae-001', 'elec-uae-002'],
  availability: 'immediate',
  location: new GeoPoint(25.2048, 55.2708), // Dubai coordinates
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

// Mock job posting for testing
const mockJob: JobPosting & { id: string } = {
  id: 'job-001',
  title: 'Residential Electrician',
  trade: 'electrician',
  country: 'AE',
  location: new GeoPoint(25.2048, 55.2708), // Same location as user
  requiredSkills: ['Residential Wiring', 'Commercial Wiring'],
  requiredCerts: ['elec-uae-001'],
  postedBy: 'Test Company',
  postedAt: Timestamp.now(),
  active: true,
  description: 'Test job',
  company: 'Test Company',
};

describe('calculateDistance', () => {
  test('calculates zero distance for same location', () => {
    const distance = calculateDistance(25.2048, 55.2708, 25.2048, 55.2708);
    expect(distance).toBe(0);
  });

  test('calculates correct distance between Dubai and Abu Dhabi', () => {
    // Dubai: 25.2048°N, 55.2708°E
    // Abu Dhabi: 24.4539°N, 54.3773°E
    const distance = calculateDistance(25.2048, 55.2708, 24.4539, 54.3773);
    // Should be approximately 120-130km
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(150);
  });

  test('calculates correct distance for short distances', () => {
    // ~10km apart in Dubai
    const distance = calculateDistance(25.2048, 55.2708, 25.2, 55.18);
    expect(distance).toBeGreaterThan(5);
    expect(distance).toBeLessThan(15);
  });
});

describe('calculateMatchScore', () => {
  test('perfect match scores close to 100', () => {
    const score = calculateMatchScore(mockUser, mockJob);
    
    // User has 2/2 required skills (40 points)
    expect(score.skillsScore).toBe(40);
    
    // User has 1/1 required cert (40 points)
    expect(score.certsScore).toBe(40);
    
    // Same location (20 points)
    expect(score.locationScore).toBe(20);
    
    // Total should be 100
    expect(score.total).toBe(100);
  });

  test('partial skills match scores proportionally', () => {
    const jobWithMoreSkills: JobPosting & { id: string } = {
      ...mockJob,
      requiredSkills: [
        'Residential Wiring',
        'Commercial Wiring',
        'Industrial Electrical',
        'High Voltage',
      ],
    };

    const score = calculateMatchScore(mockUser, jobWithMoreSkills);
    
    // User has 2/4 required skills = 50% = 20 points
    expect(score.skillsScore).toBe(20);
    expect(score.breakdown.matchedSkills).toHaveLength(2);
    expect(score.breakdown.missingSkills).toHaveLength(2);
  });

  test('missing certifications reduce score', () => {
    const jobWithMoreCerts: JobPosting & { id: string } = {
      ...mockJob,
      requiredCerts: ['elec-uae-001', 'elec-uae-002', 'elec-uae-004'],
    };

    const score = calculateMatchScore(mockUser, jobWithMoreCerts);
    
    // User has 2/3 required certs = 66.7% ≈ 27 points
    expect(score.certsScore).toBeGreaterThan(25);
    expect(score.certsScore).toBeLessThan(30);
    expect(score.breakdown.matchedCerts).toHaveLength(2);
    expect(score.breakdown.missingCerts).toHaveLength(1);
  });

  test('distant location reduces score', () => {
    const distantJob: JobPosting & { id: string } = {
      ...mockJob,
      location: new GeoPoint(24.4539, 54.3773), // Abu Dhabi
    };

    const score = calculateMatchScore(mockUser, distantJob);
    
    // Distance ~120km should give 0 location score (>50km)
    expect(score.locationScore).toBe(0);
    expect(score.breakdown.distanceKm).toBeGreaterThan(100);
  });

  test('no required skills gives full skills score', () => {
    const jobNoSkills: JobPosting & { id: string } = {
      ...mockJob,
      requiredSkills: [],
    };

    const score = calculateMatchScore(mockUser, jobNoSkills);
    
    // No skills required = full 40 points
    expect(score.skillsScore).toBe(40);
  });

  test('no required certs gives full certs score', () => {
    const jobNoCerts: JobPosting & { id: string } = {
      ...mockJob,
      requiredCerts: [],
    };

    const score = calculateMatchScore(mockUser, jobNoCerts);
    
    // No certs required = full 40 points
    expect(score.certsScore).toBe(40);
  });

  test('case-insensitive skill matching', () => {
    const userLowerCase: User = {
      ...mockUser,
      skills: ['residential wiring', 'commercial wiring'],
    };

    const jobMixedCase: JobPosting & { id: string } = {
      ...mockJob,
      requiredSkills: ['Residential Wiring', 'COMMERCIAL WIRING'],
    };

    const score = calculateMatchScore(userLowerCase, jobMixedCase);
    
    // Should match despite case differences
    expect(score.skillsScore).toBe(40);
    expect(score.breakdown.matchedSkills).toHaveLength(2);
  });
});

describe('scoreAndSortJobs', () => {
  const job1: JobPosting & { id: string } = {
    ...mockJob,
    id: 'job-001',
    title: 'Perfect Match',
    requiredSkills: ['Residential Wiring'],
    requiredCerts: ['elec-uae-001'],
    location: new GeoPoint(25.2048, 55.2708), // Same location
  };

  const job2: JobPosting & { id: string } = {
    ...mockJob,
    id: 'job-002',
    title: 'Distant Job',
    requiredSkills: ['Residential Wiring'],
    requiredCerts: ['elec-uae-001'],
    location: new GeoPoint(24.4539, 54.3773), // Abu Dhabi
  };

  const job3: JobPosting & { id: string } = {
    ...mockJob,
    id: 'job-003',
    title: 'Missing Skills',
    requiredSkills: ['Industrial Electrical', 'High Voltage'],
    requiredCerts: ['elec-uae-001'],
    location: new GeoPoint(25.2048, 55.2708),
  };

  test('sorts jobs by total score descending', () => {
    const jobs = [job2, job3, job1]; // Intentionally unsorted
    const sorted = scoreAndSortJobs(mockUser, jobs);

    // job1 should be first (perfect match)
    expect(sorted[0].job.id).toBe('job-001');
    expect(sorted[0].score.total).toBeGreaterThan(sorted[1].score.total);

    // job2 should be second (distant but has skills)
    expect(sorted[1].job.id).toBe('job-002');

    // job3 should be last (missing skills)
    expect(sorted[2].job.id).toBe('job-003');
  });

  test('returns all jobs with scores', () => {
    const jobs = [job1, job2, job3];
    const sorted = scoreAndSortJobs(mockUser, jobs);

    expect(sorted).toHaveLength(3);
    sorted.forEach(item => {
      expect(item.job).toBeDefined();
      expect(item.score).toBeDefined();
      expect(item.score.total).toBeGreaterThanOrEqual(0);
      expect(item.score.total).toBeLessThanOrEqual(100);
    });
  });
});

describe('getMatchQualityLabel', () => {
  test('returns correct labels for score ranges', () => {
    expect(getMatchQualityLabel(95)).toBe('Excellent Match');
    expect(getMatchQualityLabel(80)).toBe('Excellent Match');
    expect(getMatchQualityLabel(75)).toBe('Good Match');
    expect(getMatchQualityLabel(60)).toBe('Good Match');
    expect(getMatchQualityLabel(55)).toBe('Fair Match');
    expect(getMatchQualityLabel(40)).toBe('Fair Match');
    expect(getMatchQualityLabel(30)).toBe('Weak Match');
    expect(getMatchQualityLabel(0)).toBe('Weak Match');
  });
});

describe('getMatchQualityColor', () => {
  test('returns correct colors for score ranges', () => {
    expect(getMatchQualityColor(95)).toBe('success');
    expect(getMatchQualityColor(80)).toBe('success');
    expect(getMatchQualityColor(75)).toBe('secondary');
    expect(getMatchQualityColor(60)).toBe('secondary');
    expect(getMatchQualityColor(55)).toBe('warning');
    expect(getMatchQualityColor(40)).toBe('warning');
    expect(getMatchQualityColor(30)).toBe('textSecondary');
    expect(getMatchQualityColor(0)).toBe('textSecondary');
  });
});
