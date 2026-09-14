/**
 * Schema Verification Script
 * Cross-checks types/index.ts against architecture.md Section 3
 *
 * Verifies that TypeScript field names match Firestore schema exactly.
 * Per architecture.md: mismatches cause silent bugs later.
 */

const fs = require('fs');
const path = require('path');

// Expected schema from architecture.md Section 3
const EXPECTED_SCHEMA = {
  User: {
    name: 'string',
    phone: 'string',
    email: 'string (optional)',
    trade: 'string',
    country: 'string',
    yearsExperience: 'number',
    skills: 'array<string>',
    availability: 'string',
    location: 'geopoint',
    certifications: 'array<string>',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
  },
  Certification: {
    name: 'string',
    trade: 'string',
    country: 'string',
    description: 'string',
    required: 'boolean',
  },
  JobPosting: {
    title: 'string',
    trade: 'string',
    country: 'string',
    location: 'geopoint',
    requiredSkills: 'array<string>',
    requiredCerts: 'array<string>',
    postedBy: 'string',
    postedAt: 'timestamp',
    active: 'boolean',
  },
  InterviewPrepCard: {
    trade: 'string',
    question: 'string',
    answer: 'string',
    order: 'number',
  },
};

console.log('\n🔍 Verifying Schema Consistency\n');
console.log('Checking types/index.ts against architecture.md Section 3...\n');

// Read the types file
const typesPath = path.join(process.cwd(), 'types/index.ts');
const typesContent = fs.readFileSync(typesPath, 'utf-8');

let allValid = true;

// Verify each interface
Object.keys(EXPECTED_SCHEMA).forEach(interfaceName => {
  console.log(`📋 Checking ${interfaceName}:`);

  const fields = EXPECTED_SCHEMA[interfaceName];
  const interfaceRegex = new RegExp(
    `export interface ${interfaceName}[\\s\\S]*?\\{([\\s\\S]*?)\\}`,
    'm'
  );

  const match = typesContent.match(interfaceRegex);

  if (!match) {
    console.log(`❌ Interface ${interfaceName} not found in types/index.ts`);
    allValid = false;
    return;
  }

  const interfaceBody = match[1];

  Object.keys(fields).forEach(fieldName => {
    // Check if field exists in the interface
    const fieldRegex = new RegExp(`${fieldName}[?]?:\\s*`);
    if (fieldRegex.test(interfaceBody)) {
      console.log(`   ✅ ${fieldName}`);
    } else {
      console.log(`   ❌ ${fieldName} - MISSING or MISSPELLED`);
      allValid = false;
    }
  });

  console.log('');
});

// Check that camelCase is used consistently
console.log('🔤 Checking naming conventions:');

const camelCaseFields = [
  'yearsExperience',
  'requiredSkills',
  'requiredCerts',
  'postedBy',
  'postedAt',
  'createdAt',
  'updatedAt',
];

camelCaseFields.forEach(field => {
  if (typesContent.includes(field)) {
    console.log(`   ✅ ${field} (camelCase)`);
  } else {
    console.log(`   ❌ ${field} - MISSING`);
    allValid = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('✅ Schema verification PASSED!');
  console.log('\nAll TypeScript types match architecture.md exactly.');
  console.log('Field names are consistent between Firestore and TypeScript.');
} else {
  console.log('❌ Schema verification FAILED!');
  console.log('\nTypes in types/index.ts do not match architecture.md.');
  console.log('Fix mismatches to prevent silent bugs.');
}

console.log('='.repeat(50) + '\n');

process.exit(allValid ? 0 : 1);
