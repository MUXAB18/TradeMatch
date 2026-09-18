/**
 * Certification Seed Data
 * Per architecture.md Section 8 - Open Questions:
 * "Certification/license verification — manual review or integrate with a third-party service?"
 *
 * ⚠️ IMPORTANT: THIS DATA REQUIRES MANUAL VERIFICATION
 * These certifications are based on common requirements but MUST be verified against
 * actual licensing requirements for each trade + country before production use.
 * Inaccurate requirements directly undermine user trust.
 *
 * Data sources to verify against:
 * - UAE: Dubai Municipality (DM) licensing, ESMA (Emirates Authority for Standardization)
 * - Saudi Arabia: Saudi Council of Engineers (SCE), TVTC (Technical and Vocational Training Corporation)
 * - Qatar: Qatar General Organization for Standards and Metrology (QS)
 *
 * MVP Focus: Electrician in UAE (per prd.md Section 4)
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface CertificationSeedData {
  id: string; // Document ID
  name: string;
  trade: string; // "electrician", "plumber", "hvac", "carpenter"
  country: string; // "AE", "SA", "QA", "KW", "OM", "BH"
  description: string; // Short "why it matters" line
  required: boolean;
}

/**
 * ⚠️ VERIFY BEFORE PRODUCTION USE
 * Electrician certifications for UAE
 * Sources to verify:
 * - Dubai Municipality electrical contractor licensing
 * - DEWA (Dubai Electricity and Water Authority) requirements
 * - ESMA certification standards
 */
const ELECTRICIAN_UAE: CertificationSeedData[] = [
  {
    id: 'elec-uae-001',
    name: 'Dubai Municipality Electrician License',
    trade: 'electrician',
    country: 'AE',
    description: 'Required to work as an electrician in Dubai',
    required: true,
  },
  {
    id: 'elec-uae-002',
    name: 'ESMA Electrical Safety Certificate',
    trade: 'electrician',
    country: 'AE',
    description: 'UAE safety standards certification',
    required: true,
  },
  {
    id: 'elec-uae-003',
    name: 'Low Voltage Installation Certificate',
    trade: 'electrician',
    country: 'AE',
    description: 'Qualification for residential and commercial wiring',
    required: true,
  },
  {
    id: 'elec-uae-004',
    name: 'High Voltage Certification',
    trade: 'electrician',
    country: 'AE',
    description: 'Required for industrial electrical work',
    required: false,
  },
  {
    id: 'elec-uae-005',
    name: 'Solar Panel Installation Certificate',
    trade: 'electrician',
    country: 'AE',
    description: 'Specialized certification for solar installations',
    required: false,
  },
  {
    id: 'elec-uae-006',
    name: 'Fire Alarm Systems Certification',
    trade: 'electrician',
    country: 'AE',
    description: 'Installation and maintenance of fire safety systems',
    required: false,
  },
];

/**
 * ⚠️ VERIFY BEFORE PRODUCTION USE
 * Plumber certifications for UAE
 */
const PLUMBER_UAE: CertificationSeedData[] = [
  {
    id: 'plumb-uae-001',
    name: 'Dubai Municipality Plumber License',
    trade: 'plumber',
    country: 'AE',
    description: 'Required to work as a plumber in Dubai',
    required: true,
  },
  {
    id: 'plumb-uae-002',
    name: 'Water Supply Systems Certificate',
    trade: 'plumber',
    country: 'AE',
    description: 'Qualification for water distribution systems',
    required: true,
  },
  {
    id: 'plumb-uae-003',
    name: 'Drainage Systems Certificate',
    trade: 'plumber',
    country: 'AE',
    description: 'Qualification for sewage and drainage work',
    required: true,
  },
  {
    id: 'plumb-uae-004',
    name: 'Gas Line Installation Certificate',
    trade: 'plumber',
    country: 'AE',
    description: 'Required for natural gas piping work',
    required: false,
  },
  {
    id: 'plumb-uae-005',
    name: 'Backflow Prevention Certification',
    trade: 'plumber',
    country: 'AE',
    description: 'Water contamination prevention systems',
    required: false,
  },
];

/**
 * ⚠️ VERIFY BEFORE PRODUCTION USE
 * HVAC certifications for UAE
 */
const HVAC_UAE: CertificationSeedData[] = [
  {
    id: 'hvac-uae-001',
    name: 'Dubai Municipality HVAC License',
    trade: 'hvac',
    country: 'AE',
    description: 'Required to work as an HVAC technician in Dubai',
    required: true,
  },
  {
    id: 'hvac-uae-002',
    name: 'Refrigerant Handling Certificate',
    trade: 'hvac',
    country: 'AE',
    description: 'Required for handling refrigerants safely',
    required: true,
  },
  {
    id: 'hvac-uae-003',
    name: 'Air Conditioning Installation Certificate',
    trade: 'hvac',
    country: 'AE',
    description: 'Qualification for AC system installation',
    required: true,
  },
  {
    id: 'hvac-uae-004',
    name: 'Ventilation Systems Certificate',
    trade: 'hvac',
    country: 'AE',
    description: 'Ducting and ventilation installation',
    required: false,
  },
  {
    id: 'hvac-uae-005',
    name: 'Chilled Water Systems Certificate',
    trade: 'hvac',
    country: 'AE',
    description: 'Large-scale commercial HVAC systems',
    required: false,
  },
];

/**
 * ⚠️ VERIFY BEFORE PRODUCTION USE
 * Carpenter certifications for UAE
 */
const CARPENTER_UAE: CertificationSeedData[] = [
  {
    id: 'carp-uae-001',
    name: 'Dubai Municipality Carpenter License',
    trade: 'carpenter',
    country: 'AE',
    description: 'Required to work as a carpenter in Dubai',
    required: true,
  },
  {
    id: 'carp-uae-002',
    name: 'Structural Carpentry Certificate',
    trade: 'carpenter',
    country: 'AE',
    description: 'Framing and load-bearing construction',
    required: true,
  },
  {
    id: 'carp-uae-003',
    name: 'Finish Carpentry Certificate',
    trade: 'carpenter',
    country: 'AE',
    description: 'Trim work, cabinetry, and fine woodwork',
    required: false,
  },
  {
    id: 'carp-uae-004',
    name: 'Cabinet Making Certificate',
    trade: 'carpenter',
    country: 'AE',
    description: 'Custom cabinet design and installation',
    required: false,
  },
  {
    id: 'carp-uae-005',
    name: 'Scaffolding Safety Certificate',
    trade: 'carpenter',
    country: 'AE',
    description: 'Safe erection and use of scaffolding',
    required: false,
  },
];

// Combine all seed data
const ALL_CERTIFICATIONS: CertificationSeedData[] = [
  ...ELECTRICIAN_UAE,
  ...PLUMBER_UAE,
  ...HVAC_UAE,
  ...CARPENTER_UAE,
];

/**
 * Seed certifications to Firestore
 * Run with: npx ts-node scripts/seed-certifications.ts
 */
export async function seedCertifications() {
  console.log('🌱 Starting certification seed...');
  console.log(
    '⚠️  WARNING: This data requires manual verification before production use!'
  );
  console.log(`   Seeding ${ALL_CERTIFICATIONS.length} certifications...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const cert of ALL_CERTIFICATIONS) {
    try {
      const certRef = doc(db, 'certifications', cert.id);
      await setDoc(certRef, {
        name: cert.name,
        trade: cert.trade,
        country: cert.country,
        description: cert.description,
        required: cert.required,
      });
      console.log(`✅ ${cert.id}: ${cert.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${cert.id}: ${error}`);
      errorCount++;
    }
  }

  console.log(`\n✨ Seed complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(
    '\n⚠️  NEXT STEP: Manually verify all certifications against official sources'
  );
  console.log('   - UAE: Dubai Municipality, DEWA, ESMA');
  console.log('   - Consult with local licensing authorities');
  console.log('   - Update data in Firebase Console as needed\n');
}

// @ts-ignore - Node.js module check
// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  seedCertifications()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { ALL_CERTIFICATIONS };
