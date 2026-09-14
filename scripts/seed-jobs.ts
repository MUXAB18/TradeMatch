/**
 * Job Postings Seed Data
 * Per prd.md Section 5.4: 20-30 manually sourced job postings for MVP
 * Per architecture.md Section 4.3: Rules-based matching
 *
 * ⚠️ IMPORTANT: These are sample job postings for testing
 * Production would need real job data from agencies/employers
 */

import { doc, setDoc, GeoPoint, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface JobSeedData {
  id: string;
  title: string;
  trade: string; // "electrician", "plumber", "hvac", "carpenter"
  country: string; // "AE"
  location: { lat: number; lng: number }; // Will convert to GeoPoint
  requiredSkills: string[];
  requiredCerts: string[];
  postedBy: string;
  active: boolean;
  description: string;
  company: string;
  salary?: string;
}

/**
 * Dubai area coordinates for job locations
 * Distributed across different areas to test distance scoring
 */
const DUBAI_LOCATIONS = {
  downtown: { lat: 25.2048, lng: 55.2708 }, // Downtown Dubai
  marina: { lat: 25.0805, lng: 55.1411 }, // Dubai Marina
  deira: { lat: 25.2697, lng: 55.3095 }, // Deira
  jumeirah: { lat: 25.2326, lng: 55.2574 }, // Jumeirah
  businessBay: { lat: 25.1864, lng: 55.2662 }, // Business Bay
  silicon: { lat: 25.1164, lng: 55.3777 }, // Dubai Silicon Oasis
  jebel: { lat: 25.0657, lng: 55.1394 }, // Jebel Ali
};

/**
 * Electrician job postings (UAE)
 */
const ELECTRICIAN_JOBS: JobSeedData[] = [
  {
    id: 'elec-job-001',
    title: 'Residential Electrician',
    trade: 'electrician',
    country: 'AE',
    location: DUBAI_LOCATIONS.downtown,
    requiredSkills: ['Residential Wiring', 'Circuit Breakers', 'Lighting Systems'],
    requiredCerts: ['elec-uae-001', 'elec-uae-002'],
    postedBy: 'Gulf Construction LLC',
    active: true,
    description:
      'Seeking experienced residential electrician for villa projects in Downtown Dubai. Must have experience with UAE electrical codes and residential wiring standards.',
    company: 'Gulf Construction LLC',
    salary: 'AED 4,000 - 6,000/month',
  },
  {
    id: 'elec-job-002',
    title: 'Commercial Electrician - Shopping Mall',
    trade: 'electrician',
    country: 'AE',
    location: DUBAI_LOCATIONS.marina,
    requiredSkills: ['Commercial Wiring', 'Power Distribution', 'Blueprint Reading'],
    requiredCerts: ['elec-uae-001', 'elec-uae-002', 'elec-uae-003'],
    postedBy: 'Emirates Facilities Management',
    active: true,
    description:
      'Large shopping mall in Dubai Marina requires commercial electrician for maintenance and installation work. 2+ years experience required.',
    company: 'Emirates Facilities Management',
    salary: 'AED 5,500 - 7,500/month',
  },
  {
    id: 'elec-job-003',
    title: 'Solar Panel Installation Technician',
    trade: 'electrician',
    country: 'AE',
    location: DUBAI_LOCATIONS.silicon,
    requiredSkills: ['Solar Panel Installation', 'Electrical Safety', 'Circuit Breakers'],
    requiredCerts: ['elec-uae-001', 'elec-uae-002', 'elec-uae-005'],
    postedBy: 'Dubai Solar Energy',
    active: true,
    description:
      'Join our growing solar installation team. Training provided for qualified electricians. Must have basic electrical certification and interest in renewable energy.',
    company: 'Dubai Solar Energy',
    salary: 'AED 5,000 - 8,000/month',
  },
  {
    id: 'elec-job-004',
    title: 'Industrial Electrician - Manufacturing',
    trade: 'electrician',
    country: 'AE',
    location: DUBAI_LOCATIONS.jebel,
    requiredSkills: [
      'Industrial Electrical',
      'Power Distribution',
      'Transformer Maintenance',
    ],
    requiredCerts: ['elec-uae-001', 'elec-uae-002', 'elec-uae-004'],
    postedBy: 'Jebel Ali Industries',
    active: true,
    description:
      'Industrial facility in Jebel Ali Free Zone seeks experienced industrial electrician. High voltage certification required. Shift work.',
    company: 'Jebel Ali Industries',
    salary: 'AED 6,500 - 9,000/month',
  },
  {
    id: 'elec-job-005',
    title: 'Maintenance Electrician - Hotels',
    trade: 'electrician',
    country: 'AE',
    location: DUBAI_LOCATIONS.jumeirah,
    requiredSkills: [
      'Electrical Troubleshooting',
      'Lighting Systems',
      'Circuit Breakers',
    ],
    requiredCerts: ['elec-uae-001', 'elec-uae-002'],
    postedBy: 'Luxury Hotels Group',
    active: true,
    description:
      '5-star hotel in Jumeirah requires maintenance electrician for general electrical repairs and troubleshooting. Good English communication required.',
    company: 'Luxury Hotels Group',
    salary: 'AED 4,500 - 6,500/month',
  },
  {
    id: 'elec-job-006',
    title: 'Fire Alarm Systems Specialist',
    trade: 'electrician',
    country: 'AE',
    location: DUBAI_LOCATIONS.businessBay,
    requiredSkills: ['Fire Alarm Systems', 'Electrical Safety', 'Cable Installation'],
    requiredCerts: ['elec-uae-001', 'elec-uae-002', 'elec-uae-006'],
    postedBy: 'Safety First Systems',
    active: true,
    description:
      'Fire safety company seeks electrician specialized in fire alarm systems. Installation and maintenance of commercial fire detection systems.',
    company: 'Safety First Systems',
    salary: 'AED 5,500 - 7,000/month',
  },
  {
    id: 'elec-job-007',
    title: 'Entry Level Electrician Helper',
    trade: 'electrician',
    country: 'AE',
    location: DUBAI_LOCATIONS.deira,
    requiredSkills: ['Residential Wiring', 'Cable Installation'],
    requiredCerts: ['elec-uae-001'],
    postedBy: 'City Electrical Services',
    active: true,
    description:
      'Entry level position for electrician helper. Will work alongside experienced electricians on residential and small commercial projects. Training provided.',
    company: 'City Electrical Services',
    salary: 'AED 3,000 - 4,000/month',
  },
];

/**
 * Plumber job postings (UAE)
 */
const PLUMBER_JOBS: JobSeedData[] = [
  {
    id: 'plumb-job-001',
    title: 'Residential Plumber',
    trade: 'plumber',
    country: 'AE',
    location: DUBAI_LOCATIONS.downtown,
    requiredSkills: ['Pipe Installation', 'Leak Repair', 'Fixture Installation'],
    requiredCerts: ['plumb-uae-001', 'plumb-uae-002'],
    postedBy: 'Dubai Home Services',
    active: true,
    description:
      'Experienced plumber needed for residential maintenance and repair work. Must have own basic tools and UAE driving license preferred.',
    company: 'Dubai Home Services',
    salary: 'AED 3,500 - 5,500/month',
  },
  {
    id: 'plumb-job-002',
    title: 'Commercial Plumber - Hotels',
    trade: 'plumber',
    country: 'AE',
    location: DUBAI_LOCATIONS.marina,
    requiredSkills: [
      'Pipe Installation',
      'Drain Cleaning',
      'Water Heater Installation',
    ],
    requiredCerts: ['plumb-uae-001', 'plumb-uae-002', 'plumb-uae-003'],
    postedBy: 'Marina Hotels Group',
    active: true,
    description:
      'Hotel maintenance team seeks experienced plumber for guest room and facility plumbing. Must be available for emergency calls.',
    company: 'Marina Hotels Group',
    salary: 'AED 4,500 - 6,000/month',
  },
  {
    id: 'plumb-job-003',
    title: 'Gas Line Installation Technician',
    trade: 'plumber',
    country: 'AE',
    location: DUBAI_LOCATIONS.jumeirah,
    requiredSkills: ['Gas Line Installation', 'Pipe Welding', 'Leak Repair'],
    requiredCerts: ['plumb-uae-001', 'plumb-uae-004'],
    postedBy: 'Gulf Gas Services',
    active: true,
    description:
      'Specialized gas line installation for residential and commercial properties. Gas certification required. Competitive salary for qualified candidates.',
    company: 'Gulf Gas Services',
    salary: 'AED 5,500 - 7,500/month',
  },
  {
    id: 'plumb-job-004',
    title: 'Bathroom Plumbing Specialist',
    trade: 'plumber',
    country: 'AE',
    location: DUBAI_LOCATIONS.businessBay,
    requiredSkills: ['Bathroom Plumbing', 'Fixture Installation', 'Pipe Installation'],
    requiredCerts: ['plumb-uae-001', 'plumb-uae-002'],
    postedBy: 'Modern Interiors LLC',
    active: true,
    description:
      'Interior design company needs plumber specialized in high-end bathroom installations. Experience with luxury fixtures preferred.',
    company: 'Modern Interiors LLC',
    salary: 'AED 4,000 - 6,000/month',
  },
  {
    id: 'plumb-job-005',
    title: 'Drainage Systems Technician',
    trade: 'plumber',
    country: 'AE',
    location: DUBAI_LOCATIONS.silicon,
    requiredSkills: ['Sewer Line Repair', 'Drain Cleaning', 'Pipe Installation'],
    requiredCerts: ['plumb-uae-001', 'plumb-uae-003'],
    postedBy: 'Dubai Drainage Solutions',
    active: true,
    description:
      'Drainage specialist needed for commercial and residential projects. Equipment and vehicle provided. Must have drainage systems certification.',
    company: 'Dubai Drainage Solutions',
    salary: 'AED 4,500 - 6,500/month',
  },
];

/**
 * HVAC job postings (UAE)
 */
const HVAC_JOBS: JobSeedData[] = [
  {
    id: 'hvac-job-001',
    title: 'AC Technician - Residential',
    trade: 'hvac',
    country: 'AE',
    location: DUBAI_LOCATIONS.jumeirah,
    requiredSkills: ['AC Installation', 'AC Repair', 'System Maintenance'],
    requiredCerts: ['hvac-uae-001', 'hvac-uae-002', 'hvac-uae-003'],
    postedBy: 'Cool Air Services',
    active: true,
    description:
      'Busy AC maintenance company seeks experienced technician for residential service calls. Must have refrigerant handling certification and own tools.',
    company: 'Cool Air Services',
    salary: 'AED 4,000 - 6,000/month',
  },
  {
    id: 'hvac-job-002',
    title: 'Commercial HVAC Technician',
    trade: 'hvac',
    country: 'AE',
    location: DUBAI_LOCATIONS.businessBay,
    requiredSkills: ['Commercial HVAC', 'Chilled Water Systems', 'System Maintenance'],
    requiredCerts: ['hvac-uae-001', 'hvac-uae-002', 'hvac-uae-005'],
    postedBy: 'Emirates Cooling Systems',
    active: true,
    description:
      'Large-scale commercial HVAC company needs experienced technician for office buildings and shopping malls. Chilled water systems experience required.',
    company: 'Emirates Cooling Systems',
    salary: 'AED 6,000 - 8,500/month',
  },
  {
    id: 'hvac-job-003',
    title: 'Refrigeration Technician',
    trade: 'hvac',
    country: 'AE',
    location: DUBAI_LOCATIONS.deira,
    requiredSkills: ['Refrigeration', 'AC Repair', 'System Maintenance'],
    requiredCerts: ['hvac-uae-001', 'hvac-uae-002'],
    postedBy: 'Cold Storage Solutions',
    active: true,
    description:
      'Commercial refrigeration specialist needed for restaurant and supermarket equipment. Walk-in cooler experience preferred.',
    company: 'Cold Storage Solutions',
    salary: 'AED 5,000 - 7,000/month',
  },
  {
    id: 'hvac-job-004',
    title: 'HVAC Installation Specialist',
    trade: 'hvac',
    country: 'AE',
    location: DUBAI_LOCATIONS.marina,
    requiredSkills: [
      'AC Installation',
      'Ductwork Installation',
      'Ventilation Systems',
    ],
    requiredCerts: ['hvac-uae-001', 'hvac-uae-003', 'hvac-uae-004'],
    postedBy: 'New Build HVAC',
    active: true,
    description:
      'New construction projects in Dubai Marina. HVAC installation for residential towers. Ductwork and ventilation experience required.',
    company: 'New Build HVAC',
    salary: 'AED 5,500 - 7,500/month',
  },
  {
    id: 'hvac-job-005',
    title: 'AC Maintenance Technician - Hotels',
    trade: 'hvac',
    country: 'AE',
    location: DUBAI_LOCATIONS.downtown,
    requiredSkills: ['AC Repair', 'System Maintenance', 'Energy Efficiency'],
    requiredCerts: ['hvac-uae-001', 'hvac-uae-002', 'hvac-uae-003'],
    postedBy: 'Downtown Hotels LLC',
    active: true,
    description:
      '5-star hotel maintenance team. Preventive maintenance and emergency repairs. Must be available for shift work including weekends.',
    company: 'Downtown Hotels LLC',
    salary: 'AED 4,500 - 6,500/month',
  },
];

/**
 * Carpenter job postings (UAE)
 */
const CARPENTER_JOBS: JobSeedData[] = [
  {
    id: 'carp-job-001',
    title: 'Finish Carpenter',
    trade: 'carpenter',
    country: 'AE',
    location: DUBAI_LOCATIONS.downtown,
    requiredSkills: ['Finish Carpentry', 'Trim Work', 'Cabinet Making'],
    requiredCerts: ['carp-uae-001', 'carp-uae-003'],
    postedBy: 'Luxury Interiors Dubai',
    active: true,
    description:
      'High-end residential finish carpentry. Custom millwork and trim installation for luxury villas. Attention to detail essential.',
    company: 'Luxury Interiors Dubai',
    salary: 'AED 4,500 - 7,000/month',
  },
  {
    id: 'carp-job-002',
    title: 'Construction Carpenter - Framing',
    trade: 'carpenter',
    country: 'AE',
    location: DUBAI_LOCATIONS.silicon,
    requiredSkills: ['Framing', 'Structural Carpentry', 'Blueprint Reading'],
    requiredCerts: ['carp-uae-001', 'carp-uae-002'],
    postedBy: 'Dubai Construction Group',
    active: true,
    description:
      'Large construction project needs experienced framing carpenters. New residential tower development. Long-term project.',
    company: 'Dubai Construction Group',
    salary: 'AED 3,500 - 5,500/month',
  },
  {
    id: 'carp-job-003',
    title: 'Cabinet Maker',
    trade: 'carpenter',
    country: 'AE',
    location: DUBAI_LOCATIONS.deira,
    requiredSkills: ['Cabinet Making', 'Furniture Making', 'Finish Carpentry'],
    requiredCerts: ['carp-uae-001', 'carp-uae-004'],
    postedBy: 'Custom Cabinets Workshop',
    active: true,
    description:
      'Custom cabinet shop seeks skilled cabinet maker. Kitchen and bathroom cabinetry for residential and commercial projects.',
    company: 'Custom Cabinets Workshop',
    salary: 'AED 4,000 - 6,500/month',
  },
  {
    id: 'carp-job-004',
    title: 'Maintenance Carpenter - Hotels',
    trade: 'carpenter',
    country: 'AE',
    location: DUBAI_LOCATIONS.marina,
    requiredSkills: ['Door Installation', 'Window Installation', 'Trim Work'],
    requiredCerts: ['carp-uae-001'],
    postedBy: 'Marina Resort & Spa',
    active: true,
    description:
      'Hotel maintenance carpenter for general repairs and installations. Must be able to work independently and handle guest room maintenance.',
    company: 'Marina Resort & Spa',
    salary: 'AED 3,500 - 5,000/month',
  },
  {
    id: 'carp-job-005',
    title: 'Deck Builder',
    trade: 'carpenter',
    country: 'AE',
    location: DUBAI_LOCATIONS.jumeirah,
    requiredSkills: ['Deck Building', 'Framing', 'Power Tools'],
    requiredCerts: ['carp-uae-001', 'carp-uae-002'],
    postedBy: 'Outdoor Living Spaces',
    active: true,
    description:
      'Outdoor deck and pergola construction for luxury villas. Must have experience with composite materials and outdoor structures.',
    company: 'Outdoor Living Spaces',
    salary: 'AED 4,000 - 6,000/month',
  },
];

// Combine all jobs
const ALL_JOBS: JobSeedData[] = [
  ...ELECTRICIAN_JOBS,
  ...PLUMBER_JOBS,
  ...HVAC_JOBS,
  ...CARPENTER_JOBS,
];

/**
 * Seed job postings to Firestore
 * Run with: npm run seed:jobs
 */
export async function seedJobs() {
  console.log('🌱 Starting job postings seed...');
  console.log(`   Seeding ${ALL_JOBS.length} job postings...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const job of ALL_JOBS) {
    try {
      const jobRef = doc(db, 'jobPostings', job.id);
      await setDoc(jobRef, {
        title: job.title,
        trade: job.trade,
        country: job.country,
        location: new GeoPoint(job.location.lat, job.location.lng),
        requiredSkills: job.requiredSkills,
        requiredCerts: job.requiredCerts,
        postedBy: job.postedBy,
        postedAt: Timestamp.now(),
        active: job.active,
        description: job.description,
        company: job.company,
        salary: job.salary,
      });
      console.log(`✅ ${job.id}: ${job.title}`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${job.id}: ${error}`);
      errorCount++;
    }
  }

  console.log(`\n✨ Seed complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('\n📊 Jobs by trade:');
  console.log(`   Electrician: ${ELECTRICIAN_JOBS.length}`);
  console.log(`   Plumber: ${PLUMBER_JOBS.length}`);
  console.log(`   HVAC: ${HVAC_JOBS.length}`);
  console.log(`   Carpenter: ${CARPENTER_JOBS.length}\n`);
}

// @ts-ignore - Node.js module check
// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  seedJobs()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { ALL_JOBS };
