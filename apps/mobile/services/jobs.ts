/**
 * Job Postings Service
 * Per architecture.md Section 4.3 - Job Matching
 * Per rules.md Section 1: All Firestore access through services layer
 */

import { collection, query, where, getDocs, orderBy, GeoPoint, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { JobPosting, ServiceResponse } from '../types';

/**
 * Get active job postings for a specific trade and country
 * Per architecture.md Section 4.3:
 * Query: jobPostings where trade == user.trade AND country == user.country AND active == true
 *
 * @param trade - Trade type (e.g., "electrician")
 * @param country - Country code (e.g., "AE" for UAE)
 * @returns ServiceResponse with array of job postings
 */
export async function getJobsForTrade(
  trade: string,
  country: string
): Promise<ServiceResponse<JobPosting[]>> {
  try {
    const jobsRef = collection(db, 'jobPostings');
    const q = query(
      jobsRef,
      where('trade', '==', trade),
      where('country', '==', country),
      where('active', '==', true),
      orderBy('postedAt', 'desc') // Most recent first
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Mock Data for UI presentation
      const mockJobs: (JobPosting & { id: string })[] = [
        {
          id: 'job-featured',
          title: 'Master ' + (trade || 'Worker'),
          trade: trade,
          country: country,
          company: 'Premium Contracting LLC',
          location: new GeoPoint(25.2048, 55.2708), // Dubai
          requiredSkills: ['Leadership', 'Advanced Troubleshooting', 'Safety Management'],
          requiredCerts: ['Master License', 'OSHA 30', 'First Aid'],
          postedBy: 'company-premium',
          postedAt: Timestamp.fromDate(new Date()), // Just now
          active: true,
          description: 'This is a premium, featured role. We are looking for an exceptional candidate to lead our most important projects. You will be responsible for overseeing a team of 20+ workers, managing project timelines, and ensuring the highest quality of work. Full health insurance, housing allowance, and annual flights included.',
          salary: 'AED 15,000 - 20,000 / month + Benefits',
        },
        {
          id: 'job-1',
          title: 'Senior ' + (trade || 'Worker'),
          trade: trade,
          country: country,
          company: 'Gulf Construction Co.',
          location: new GeoPoint(25.2048, 55.2708), // Dubai
          requiredSkills: ['Wiring', 'Safety Protocols', 'Blueprint Reading'],
          requiredCerts: ['OSHA 30', 'State License'],
          postedBy: 'company-123',
          postedAt: Timestamp.fromDate(new Date(Date.now() - 86400000)), // 1 day ago
          active: true,
          description: 'Looking for an experienced ' + (trade || 'worker') + ' to lead high-profile commercial projects in downtown Dubai. Immediate start available.',
          salary: 'AED 8,000 - 12,000 / month',
        },
        {
          id: 'job-2',
          title: 'Maintenance ' + (trade || 'Worker'),
          trade: trade,
          country: country,
          company: 'Emirates Facilities Management',
          location: new GeoPoint(25.0657, 55.1713), // Dubai Marina
          requiredSkills: ['Troubleshooting', 'Maintenance', 'Customer Service'],
          requiredCerts: ['Basic Safety'],
          postedBy: 'company-456',
          postedAt: Timestamp.fromDate(new Date(Date.now() - 172800000)), // 2 days ago
          active: true,
          description: 'Join our facilities management team maintaining premium residential properties. Accommodation and transport provided.',
          salary: 'AED 4,500 - 6,000 / month',
        },
        {
          id: 'job-3',
          title: 'Industrial ' + (trade || 'Worker'),
          trade: trade,
          country: country,
          company: 'Abu Dhabi Heavy Industries',
          location: new GeoPoint(24.4539, 54.3773), // Abu Dhabi
          requiredSkills: ['High Voltage', 'Industrial Systems', 'Heavy Machinery'],
          requiredCerts: ['Industrial License', 'Advanced Safety'],
          postedBy: 'company-789',
          postedAt: Timestamp.fromDate(new Date(Date.now() - 400000000)), // 4+ days ago
          active: true,
          description: 'Heavy industry role requiring specialized knowledge. Shift work required. Overtime available.',
          salary: 'AED 9,000 - 15,000 / month',
        }
      ];

      return {
        data: mockJobs,
        error: undefined,
      };
    }

    const jobs: JobPosting[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // Include document ID for reference
        title: data.title,
        trade: data.trade,
        country: data.country,
        location: data.location,
        requiredSkills: data.requiredSkills || [],
        requiredCerts: data.requiredCerts || [],
        postedBy: data.postedBy,
        postedAt: data.postedAt,
        active: data.active,
        description: data.description,
        company: data.company,
        salary: data.salary,
      } as JobPosting & { id: string };
    });

    return {
      data: jobs,
      error: undefined,
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return {
      data: undefined,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load jobs. Please try again.',
    };
  }
}

/**
 * Get a single job posting by ID
 *
 * @param jobId - Job posting document ID
 * @returns ServiceResponse with job posting
 */
export async function getJobById(
  jobId: string
): Promise<ServiceResponse<JobPosting>> {
  try {
    const jobsRef = collection(db, 'jobPostings');
    const q = query(jobsRef, where('__name__', '==', jobId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        data: undefined,
        error: 'Job not found',
      };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const job: JobPosting = {
      id: doc.id,
      title: data.title,
      trade: data.trade,
      country: data.country,
      location: data.location,
      requiredSkills: data.requiredSkills || [],
      requiredCerts: data.requiredCerts || [],
      postedBy: data.postedBy,
      postedAt: data.postedAt,
      active: data.active,
      description: data.description,
      company: data.company,
      salary: data.salary,
    } as JobPosting & { id: string };

    return {
      data: job,
      error: undefined,
    };
  } catch (error) {
    console.error('Error fetching job:', error);
    return {
      data: undefined,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load job. Please try again.',
    };
  }
}
