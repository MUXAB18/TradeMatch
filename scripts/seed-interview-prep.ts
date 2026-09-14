/**
 * Interview Prep Seed Data
 * Per prd.md Section 5.5: At least 15 accurate, trade-specific flashcards
 *
 * ⚠️ IMPORTANT: This content should be reviewed by someone with real knowledge
 * of trade hiring practices in UAE, per prd.md acceptance criteria
 *
 * Content focuses on:
 * - Technical competency questions
 * - Safety and compliance
 * - Work experience and approach
 * - UAE-specific requirements
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface InterviewPrepSeedData {
  id: string;
  trade: string; // "electrician", "plumber", "hvac", "carpenter"
  question: string;
  answer: string;
  order: number;
}

/**
 * Electrician interview questions (UAE context)
 * ⚠️ Review with electrical hiring managers or recruiters
 */
const ELECTRICIAN_QUESTIONS: InterviewPrepSeedData[] = [
  {
    id: 'elec-q-001',
    trade: 'electrician',
    question: 'What electrical certifications do you currently hold in the UAE?',
    answer:
      'Mention specific certifications like Dubai Municipality Electrician License, ESMA certification, and any specialized training. Highlight if you have low voltage or high voltage certifications. Emphasize that you keep all certifications current and understand UAE electrical codes.',
    order: 1,
  },
  {
    id: 'elec-q-002',
    trade: 'electrician',
    question:
      'Describe your experience with UAE electrical standards and regulations.',
    answer:
      'Discuss familiarity with ESMA standards, Dubai Municipality codes, and DEWA requirements. Mention specific projects where you followed UAE regulations. Explain how you stay updated on code changes and ensure all work meets local standards.',
    order: 2,
  },
  {
    id: 'elec-q-003',
    trade: 'electrician',
    question:
      'How do you ensure electrical safety on a job site, especially in hot UAE climate conditions?',
    answer:
      'Emphasize proper PPE, lockout/tagout procedures, testing before work, and hydration in extreme heat. Mention regular equipment checks, understanding of UAE safety regulations, and communication with team about hazards. Explain your process for identifying and mitigating electrical risks.',
    order: 3,
  },
  {
    id: 'elec-q-004',
    trade: 'electrician',
    question:
      'Tell me about a challenging electrical problem you solved. How did you diagnose and fix it?',
    answer:
      'Use STAR method (Situation, Task, Action, Result). Describe a specific technical problem, your diagnostic process (testing, troubleshooting steps), the solution you implemented, and the positive outcome. Show problem-solving skills and technical knowledge.',
    order: 4,
  },
  {
    id: 'elec-q-005',
    trade: 'electrician',
    question:
      'What is your experience with reading and interpreting electrical blueprints?',
    answer:
      'Explain your ability to read schematics, wiring diagrams, and floor plans. Give examples of projects where blueprint reading was critical. Mention any CAD or technical drawing software familiarity. Emphasize accuracy in following specifications.',
    order: 5,
  },
  {
    id: 'elec-q-006',
    trade: 'electrician',
    question: 'How do you handle working at heights or in confined spaces?',
    answer:
      'Discuss safety training, proper equipment use (harnesses, scaffolding), and following safety protocols. Mention any height safety or confined space certifications. Explain pre-work safety checks and communication procedures. Emphasize safety-first mindset.',
    order: 6,
  },
  {
    id: 'elec-q-007',
    trade: 'electrician',
    question:
      'What types of electrical systems have you worked on? (Residential, commercial, industrial)',
    answer:
      'Be specific about your experience level in each area. Mention voltage levels, system types (single-phase, three-phase), and complexity of projects. Highlight relevant experience for the job you\'re applying for. Give concrete examples.',
    order: 7,
  },
  {
    id: 'elec-q-008',
    trade: 'electrician',
    question: 'Are you available for emergency call-outs or shift work if needed?',
    answer:
      'Be honest about your availability. If yes, confirm you understand response time expectations and have reliable transportation. If limited availability, explain constraints clearly. Many UAE employers value flexibility for maintenance roles.',
    order: 8,
  },
  {
    id: 'elec-q-009',
    trade: 'electrician',
    question:
      'What is your approach to preventive maintenance on electrical systems?',
    answer:
      'Describe systematic inspection routines, testing procedures, documentation practices, and identifying potential issues before they become problems. Mention specific equipment you maintain and your schedule approach. Emphasize reliability and preventing downtime.',
    order: 9,
  },
  {
    id: 'elec-q-010',
    trade: 'electrician',
    question: 'How do you stay current with new electrical technologies and methods?',
    answer:
      'Mention training courses, manufacturer certifications, industry publications, and learning from experienced colleagues. Show willingness to learn new skills. Discuss any recent training in solar, smart systems, or energy efficiency.',
    order: 10,
  },
  {
    id: 'elec-q-011',
    trade: 'electrician',
    question:
      'Describe your experience working as part of a construction or maintenance team.',
    answer:
      'Emphasize communication skills, coordination with other trades, following project schedules, and respecting site management. Give examples of successful teamwork. Mention experience with multicultural teams common in UAE.',
    order: 11,
  },
  {
    id: 'elec-q-012',
    trade: 'electrician',
    question: 'What hand tools and testing equipment are you most proficient with?',
    answer:
      'List specific tools you use regularly and demonstrate knowledge of proper use. Mention multimeters, cable testers, power tools, and any specialized equipment. Confirm you have your own basic tool set if required.',
    order: 12,
  },
  {
    id: 'elec-q-013',
    trade: 'electrician',
    question: 'How do you prioritize tasks when you have multiple jobs to complete?',
    answer:
      'Explain your system for assessing urgency, safety considerations, and coordinating with supervisors. Discuss time management, clear communication about delays, and delivering quality work efficiently. Show organizational skills.',
    order: 13,
  },
  {
    id: 'elec-q-014',
    trade: 'electrician',
    question:
      'Tell me about your experience with solar panel or renewable energy installations.',
    answer:
      'If experienced: Detail specific projects, system sizes, and your role. If not: Express interest in learning as UAE emphasizes renewable energy. Mention any related electrical knowledge that transfers to solar work.',
    order: 14,
  },
  {
    id: 'elec-q-015',
    trade: 'electrician',
    question: 'Why do you want to work for our company specifically?',
    answer:
      'Research the company beforehand. Mention their reputation, project types, or values that align with your career goals. Show genuine interest. Connect your skills to their needs. Avoid generic answers - be specific about what attracted you to this employer.',
    order: 15,
  },
];

/**
 * Plumber interview questions (UAE context)
 * ⚠️ Review with plumbing hiring managers or recruiters
 */
const PLUMBER_QUESTIONS: InterviewPrepSeedData[] = [
  {
    id: 'plumb-q-001',
    trade: 'plumber',
    question: 'What plumbing certifications and licenses do you hold in the UAE?',
    answer:
      'List specific licenses like Dubai Municipality Plumber License, water supply and drainage certifications. Mention any specialized training in gas lines or backflow prevention. Emphasize compliance with UAE plumbing codes and current certification status.',
    order: 1,
  },
  {
    id: 'plumb-q-002',
    trade: 'plumber',
    question:
      'How familiar are you with UAE plumbing codes and water conservation requirements?',
    answer:
      'Discuss knowledge of Dubai Municipality standards, water efficiency requirements, and local regulations. Mention awareness of water scarcity issues in UAE and experience with water-saving fixtures. Show commitment to code compliance.',
    order: 2,
  },
  {
    id: 'plumb-q-003',
    trade: 'plumber',
    question:
      'Describe a difficult plumbing repair you completed. What was your approach?',
    answer:
      'Use STAR method: Describe the problem, your diagnostic steps, solution implemented, and outcome. Show technical knowledge and problem-solving. Include how you minimized disruption and ensured quality repair.',
    order: 3,
  },
  {
    id: 'plumb-q-004',
    trade: 'plumber',
    question:
      'What experience do you have with different types of piping materials? (PVC, copper, PEX)',
    answer:
      'Detail your hands-on experience with various materials. Explain appropriate uses for each, installation methods, and joining techniques. Mention any material preferences common in UAE construction.',
    order: 4,
  },
  {
    id: 'plumb-q-005',
    trade: 'plumber',
    question:
      'How do you diagnose and locate hidden water leaks in walls or underground?',
    answer:
      'Explain your process: visual inspection, pressure testing, listening devices, moisture meters, or thermal imaging. Emphasize methodical approach to minimize property damage while finding leaks efficiently.',
    order: 5,
  },
  {
    id: 'plumb-q-006',
    trade: 'plumber',
    question:
      'What is your experience with bathroom and kitchen fixture installations?',
    answer:
      'Describe types of fixtures installed (toilets, sinks, faucets, showers). Mention high-end or specialized fixtures if applicable. Emphasize attention to detail, proper sealing, and testing for leaks.',
    order: 6,
  },
  {
    id: 'plumb-q-007',
    trade: 'plumber',
    question: 'Are you certified for gas line installation? Describe your experience.',
    answer:
      'If certified: Detail specific gas projects and safety protocols followed. If not: Express interest in obtaining certification. Emphasize understanding of gas safety regardless of certification status.',
    order: 7,
  },
  {
    id: 'plumb-q-008',
    trade: 'plumber',
    question:
      'How do you handle emergency plumbing calls, such as burst pipes or severe leaks?',
    answer:
      'Explain your response process: shutting off water, assessing damage, temporary repairs, and permanent solutions. Emphasize quick response, clear communication with customer, and minimizing water damage.',
    order: 8,
  },
  {
    id: 'plumb-q-009',
    trade: 'plumber',
    question:
      'What preventive maintenance do you recommend for commercial or residential plumbing?',
    answer:
      'Discuss regular inspections, drain cleaning schedules, water heater maintenance, checking for corrosion, and testing pressure. Show proactive approach that prevents expensive emergency repairs.',
    order: 9,
  },
  {
    id: 'plumb-q-010',
    trade: 'plumber',
    question:
      'Describe your experience reading plumbing blueprints and rough-in specifications.',
    answer:
      'Explain ability to interpret drawings, understand symbols, and follow specifications accurately. Give examples where blueprint reading was critical for project success.',
    order: 10,
  },
  {
    id: 'plumb-q-011',
    trade: 'plumber',
    question: 'How do you work alongside other trades on a construction site?',
    answer:
      'Emphasize coordination, communication, respecting schedules, and understanding how plumbing interfaces with other systems. Mention experience in multicultural UAE work environments.',
    order: 11,
  },
  {
    id: 'plumb-q-012',
    trade: 'plumber',
    question: 'What tools and equipment do you have or are you proficient with?',
    answer:
      'List pipe wrenches, threading machines, soldering equipment, drain snakes, testing equipment, and any specialized tools. Confirm tool ownership if job requires it.',
    order: 12,
  },
  {
    id: 'plumb-q-013',
    trade: 'plumber',
    question:
      'How do you ensure quality and prevent callbacks on your plumbing work?',
    answer:
      'Discuss thorough testing, proper installation techniques, using quality materials, and attention to detail. Explain your quality control process and commitment to first-time-right work.',
    order: 13,
  },
  {
    id: 'plumb-q-014',
    trade: 'plumber',
    question: 'Do you have experience with water treatment or filtration systems?',
    answer:
      'If yes: Detail system types and installation experience. If no: Express willingness to learn as water quality is important in UAE. Mention related plumbing knowledge.',
    order: 14,
  },
  {
    id: 'plumb-q-015',
    trade: 'plumber',
    question: 'Why are you interested in this plumbing position with our company?',
    answer:
      'Show you researched the company. Mention their projects, reputation, or values that appeal to you. Connect your experience to their needs. Be specific about what attracted you to this opportunity.',
    order: 15,
  },
];

// Combine all questions
const ALL_QUESTIONS: InterviewPrepSeedData[] = [
  ...ELECTRICIAN_QUESTIONS,
  ...PLUMBER_QUESTIONS,
];

/**
 * Seed interview prep cards to Firestore
 * Run with: npm run seed:interview
 */
export async function seedInterviewPrep() {
  console.log('🌱 Starting interview prep seed...');
  console.log('⚠️  WARNING: This content should be reviewed by hiring professionals!');
  console.log(`   Seeding ${ALL_QUESTIONS.length} interview questions...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const card of ALL_QUESTIONS) {
    try {
      const cardRef = doc(db, 'interviewPrep', card.id);
      await setDoc(cardRef, {
        trade: card.trade,
        question: card.question,
        answer: card.answer,
        order: card.order,
      });
      console.log(`✅ ${card.id}: ${card.question.substring(0, 50)}...`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${card.id}: ${error}`);
      errorCount++;
    }
  }

  console.log(`\n✨ Seed complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('\n📊 Questions by trade:');
  console.log(`   Electrician: ${ELECTRICIAN_QUESTIONS.length}`);
  console.log(`   Plumber: ${PLUMBER_QUESTIONS.length}`);
  console.log(`   HVAC: 0 (add next)`);
  console.log(`   Carpenter: 0 (add next)`);
  console.log(
    '\n⚠️  NEXT STEP: Have hiring managers review questions for accuracy\n'
  );
}

// @ts-ignore - Node.js module check
// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  seedInterviewPrep()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { ALL_QUESTIONS };
