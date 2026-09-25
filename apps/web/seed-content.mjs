import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDod_AC-aowazaOGhJsbhypoHdJz5ewWkA",
  authDomain: "job-market-copilot.firebaseapp.com",
  projectId: "job-market-copilot",
  storageBucket: "job-market-copilot.firebasestorage.app",
  messagingSenderId: "310220429639",
  appId: "1:310220429639:web:e9df3fb5430182f7c35462"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const mockCerts = [
  { id: "cert_1", name: "OSHA 30", trade: "electrician", country: "US", required: true },
  { id: "cert_2", name: "Master Electrician License", trade: "electrician", country: "UAE", required: true },
  { id: "cert_3", name: "EPA 608 Universal", trade: "hvac", country: "US", required: true },
  { id: "cert_4", name: "TIG Welding Level 2", trade: "welder", country: "UK", required: false },
  { id: "cert_5", name: "First Aid & CPR", trade: "carpenter", country: "Global", required: false }
];

const mockPrepCards = [
  { id: "prep_1", trade: "electrician", order: 1, question: "What is Ohm's Law and how do you use it?", answer: "Ohm's law states that V = I * R. I use it to calculate voltage, current, or resistance in a circuit during troubleshooting." },
  { id: "prep_2", trade: "electrician", order: 2, question: "How do you test a capacitor?", answer: "First, discharge it safely. Then use a multimeter on the capacitance setting to check if the reading matches the capacitor's rating." },
  { id: "prep_3", trade: "plumber", order: 1, question: "What are the common causes of low water pressure?", answer: "Common causes include clogged aerators, a failing pressure reducing valve, partially closed shut-off valves, or hidden leaks in the pipes." },
  { id: "prep_4", trade: "hvac", order: 1, question: "What is the purpose of a TXV?", answer: "A Thermostatic Expansion Valve (TXV) regulates the flow of liquid refrigerant into the evaporator coil based on the superheat." }
];

async function run() {
  console.log('Seeding mock Certs and Prep Cards...');
  try {
    for (const cert of mockCerts) {
      await setDoc(doc(db, 'certifications', cert.id), cert, { merge: true });
      console.log(`Added cert: ${cert.name}`);
    }
    for (const prep of mockPrepCards) {
      await setDoc(doc(db, 'interviewPrep', prep.id), prep, { merge: true });
      console.log(`Added prep card: ${prep.question}`);
    }
    console.log('Seeding complete! Check your Admin Content panel.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

run();
