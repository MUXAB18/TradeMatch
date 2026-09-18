/**
 * Mock data for TradeMatch web app
 * Mirrors the fallback mock data in apps/mobile/services/jobs.ts
 * Replace individual exports with real API calls as data becomes available.
 */

export interface MockJob {
  id: string;
  title: string;
  company: string;
  trade: string;
  country: string;
  location: string; // human-readable for web
  requiredSkills: string[];
  requiredCerts: string[];
  description: string;
  salary: string;
  employmentType: string;
  postedAt: Date;
  active: boolean;
  matchScore: number; // 0-100
}

export const MOCK_JOBS: MockJob[] = [
  {
    id: 'job-featured',
    title: 'Master Electrician',
    company: 'Premium Contracting LLC',
    trade: 'electrician',
    country: 'AE',
    location: 'Dubai, UAE',
    requiredSkills: ['Leadership', 'Advanced Troubleshooting', 'Safety Management', 'Blueprint Reading'],
    requiredCerts: ['Master License', 'OSHA 30', 'First Aid'],
    description:
      'This is a premium, featured role. We are looking for an exceptional candidate to lead our most important projects. You will be responsible for overseeing a team of 20+ workers, managing project timelines, and ensuring the highest quality of work. Full health insurance, housing allowance, and annual flights included.',
    salary: 'AED 15,000 – 20,000 / month + Benefits',
    employmentType: 'Full-time',
    postedAt: new Date(),
    active: true,
    matchScore: 94,
  },
  {
    id: 'job-1',
    title: 'Senior Electrician',
    company: 'Gulf Construction Co.',
    trade: 'electrician',
    country: 'AE',
    location: 'Dubai, UAE',
    requiredSkills: ['Wiring', 'Safety Protocols', 'Blueprint Reading'],
    requiredCerts: ['OSHA 30', 'State License'],
    description:
      'Looking for an experienced electrician to lead high-profile commercial projects in downtown Dubai. Immediate start available. Accommodation and transport allowance provided.',
    salary: 'AED 8,000 – 12,000 / month',
    employmentType: 'Full-time',
    postedAt: new Date(Date.now() - 86400000),
    active: true,
    matchScore: 88,
  },
  {
    id: 'job-2',
    title: 'Maintenance Electrician',
    company: 'Emirates Facilities Management',
    trade: 'electrician',
    country: 'AE',
    location: 'Dubai Marina, UAE',
    requiredSkills: ['Troubleshooting', 'Maintenance', 'Customer Service'],
    requiredCerts: ['Basic Safety'],
    description:
      'Join our facilities management team maintaining premium residential properties. Accommodation and transport provided.',
    salary: 'AED 4,500 – 6,000 / month',
    employmentType: 'Full-time',
    postedAt: new Date(Date.now() - 172800000),
    active: true,
    matchScore: 76,
  },
  {
    id: 'job-3',
    title: 'Industrial Electrician',
    company: 'Abu Dhabi Heavy Industries',
    trade: 'electrician',
    country: 'AE',
    location: 'Abu Dhabi, UAE',
    requiredSkills: ['High Voltage', 'Industrial Systems', 'Heavy Machinery'],
    requiredCerts: ['Industrial License', 'Advanced Safety'],
    description:
      'Heavy industry role requiring specialized knowledge. Shift work required. Overtime available. OSHA certification preferred.',
    salary: 'AED 9,000 – 15,000 / month',
    employmentType: 'Contract',
    postedAt: new Date(Date.now() - 400000000),
    active: true,
    matchScore: 68,
  },
  {
    id: 'job-4',
    title: 'Electrical Supervisor',
    company: 'Aramco Projects Division',
    trade: 'electrician',
    country: 'SA',
    location: 'Riyadh, Saudi Arabia',
    requiredSkills: ['Team Leadership', 'Project Management', 'HV Systems'],
    requiredCerts: ['OSHA 30', 'PMP', 'Saudi License'],
    description:
      'Supervise a team of 15 electricians on large-scale oil & gas infrastructure projects. Strong safety culture required.',
    salary: 'SAR 18,000 – 25,000 / month',
    employmentType: 'Full-time',
    postedAt: new Date(Date.now() - 518400000),
    active: true,
    matchScore: 72,
  },
];

export interface MockPrepCard {
  id: string;
  trade: string;
  question: string;
  answer: string;
  order: number;
  category: string;
}

export const MOCK_PREP_CARDS: MockPrepCard[] = [
  {
    id: 'prep-1',
    trade: 'electrician',
    question: 'What is the purpose of a Ground Fault Circuit Interrupter (GFCI)?',
    answer:
      'A GFCI is designed to protect people from electrical shock by interrupting a household circuit when there is a difference in the currents in the "hot" and neutral wires. This difference indicates that current is leaking, potentially through a person who is grounded. GFCIs trip within 1/40th of a second.',
    order: 1,
    category: 'Safety',
  },
  {
    id: 'prep-2',
    trade: 'electrician',
    question: 'How do you calculate voltage drop in a circuit?',
    answer:
      'Voltage Drop = 2 × K × I × D / CM, where K is the conductor material constant (12.9 for copper, 21.2 for aluminum), I is current in amperes, D is one-way distance in feet, and CM is the wire size in circular mils. The NEC recommends keeping voltage drop below 3% for branch circuits.',
    order: 2,
    category: 'Theory',
  },
  {
    id: 'prep-3',
    trade: 'electrician',
    question: 'What are the "Fatal Four" hazards on a construction site according to OSHA?',
    answer:
      'The "Fatal Four" per OSHA: 1) Falls (from heights — leading cause of death), 2) Struck-by accidents (falling objects or equipment), 3) Caught-in/between hazards (equipment or materials), 4) Electrocution. Together they account for over 60% of construction worker deaths. Always wear proper PPE including hard hats, safety glasses, and steel-toed boots.',
    order: 3,
    category: 'Safety',
  },
  {
    id: 'prep-4',
    trade: 'electrician',
    question: 'Explain the difference between single-phase and three-phase power.',
    answer:
      'Single-phase power uses two wires (one hot and one neutral) and is common in residential settings. Three-phase power uses three or four wires and provides more consistent, efficient power delivery for heavy equipment and industrial applications. Three-phase is more economical for larger loads and is standard in commercial/industrial settings.',
    order: 4,
    category: 'Theory',
  },
  {
    id: 'prep-5',
    trade: 'electrician',
    question: 'What is the National Electrical Code (NEC) and why is it important?',
    answer:
      "The NEC (NFPA 70) is a set of standards for safe electrical design, installation, and inspection updated every three years. It's adopted by most US states and many international jurisdictions. Following the NEC ensures installations are safe, reduces fire hazards, and protects people from electrical shock. Non-compliance can result in failed inspections, liability, and danger to occupants.",
    order: 5,
    category: 'Regulations',
  },
  {
    id: 'prep-6',
    trade: 'electrician',
    question: 'What is the difference between a circuit breaker and a fuse?',
    answer:
      'Both protect circuits from overcurrent, but differently. A fuse contains a metal element that melts when too much current passes through, requiring replacement. A circuit breaker uses a mechanical switch that trips and can be reset. Circuit breakers are preferred in modern installations because they are reusable, easier to identify the tripped circuit, and can provide additional features like GFCI/AFCI protection.',
    order: 6,
    category: 'Theory',
  },
  {
    id: 'prep-7',
    trade: 'electrician',
    question: 'How do you safely test a circuit before working on it?',
    answer:
      "Follow Lockout/Tagout (LOTO) procedures: 1) Notify affected employees, 2) Identify all energy sources, 3) Shut off the equipment, 4) Apply lockout/tagout device on the energy isolating device, 5) Release or restrain stored energy, 6) Verify de-energization with a non-contact voltage tester. The golden rule: 'Test before touch.' Never assume a circuit is dead.",
    order: 7,
    category: 'Safety',
  },
  {
    id: 'prep-8',
    trade: 'electrician',
    question: 'What wire gauge should be used for a 20-amp circuit?',
    answer:
      'A 20-amp circuit requires 12 AWG copper wire (or 10 AWG aluminum). The general rule is: 15A → 14 AWG, 20A → 12 AWG, 30A → 10 AWG, 40A → 8 AWG, 50A → 6 AWG. Always check local codes as requirements can vary. Using undersized wire is a fire hazard.',
    order: 8,
    category: 'Practical',
  },
];

export const PREP_CATEGORIES = [
  { id: 'safety', label: 'Safety & OSHA', icon: '🦺', count: 3, color: '#FF3B30' },
  { id: 'theory', label: 'Electrical Theory', icon: '⚡', count: 3, color: '#007AFF' },
  { id: 'regulations', label: 'Codes & Regulations', icon: '📋', count: 1, color: '#34C759' },
  { id: 'practical', label: 'Practical Skills', icon: '🔧', count: 1, color: '#FF9500' },
];
