/**
 * Job Postings Service
 * Per architecture.md Section 4.3 - Job Matching
 * Per rules.md Section 1: All Firestore access through services layer
 */

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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
      return {
        data: [],
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
