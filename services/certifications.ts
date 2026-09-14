/**
 * Certification Service
 * Per architecture.md Section 4.2 - Certification Checklist
 * Per rules.md Section 1: All Firestore access through services layer
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Certification, ServiceResponse } from '../types';

/**
 * Get certifications for a specific trade and country
 * Per architecture.md Section 4.2:
 * Query: certifications where trade == user.trade AND country == user.country
 *
 * @param trade - Trade type (e.g., "electrician")
 * @param country - Country code (e.g., "AE" for UAE)
 * @returns ServiceResponse with array of certifications
 */
export async function getCertificationsForTrade(
  trade: string,
  country: string
): Promise<ServiceResponse<Certification[]>> {
  try {
    const certsRef = collection(db, 'certifications');
    const q = query(
      certsRef,
      where('trade', '==', trade),
      where('country', '==', country)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        data: [],
        error: undefined,
      };
    }

    const certifications: Certification[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // Include document ID for reference
        name: data.name,
        trade: data.trade,
        country: data.country,
        description: data.description,
        required: data.required,
      } as Certification & { id: string };
    });

    return {
      data: certifications,
      error: undefined,
    };
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return {
      data: undefined,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load certifications. Please try again.',
    };
  }
}

/**
 * Check which certifications a user has vs. is missing
 * Cross-references trade certifications against user's certifications array
 *
 * @param trade - User's trade
 * @param country - User's country
 * @param userCertIds - Array of certification IDs the user has
 * @returns Object with have and missing certification arrays
 */
export async function getUserCertificationStatus(
  trade: string,
  country: string,
  userCertIds: string[]
): Promise<
  ServiceResponse<{
    have: (Certification & { id: string })[];
    missing: (Certification & { id: string })[];
  }>
> {
  try {
    const result = await getCertificationsForTrade(trade, country);

    if (result.error) {
      return {
        data: undefined,
        error: result.error,
      };
    }

    const allCerts = (result.data || []) as (Certification & { id: string })[];
    const have = allCerts.filter(cert => userCertIds.includes(cert.id));
    const missing = allCerts.filter(cert => !userCertIds.includes(cert.id));

    return {
      data: { have, missing },
      error: undefined,
    };
  } catch (error) {
    console.error('Error checking certification status:', error);
    return {
      data: undefined,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to check certification status. Please try again.',
    };
  }
}
