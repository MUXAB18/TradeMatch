import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

const mockUsers = [
  {
    id: "user_verify_pending_1",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    role: "worker",
    trade: "electrician",
    country: "UAE",
    verificationStatus: {
      identity: "submitted",
      certificate: "submitted"
    }
  },
  {
    id: "user_verify_pending_2",
    name: "Mohammad Ali",
    email: "m.ali99@example.com",
    role: "worker",
    trade: "plumber",
    country: "Qatar",
    verificationStatus: {
      identity: "submitted",
      certificate: "unverified"
    }
  },
  {
    id: "user_verify_verified_1",
    name: "Sarah Jones",
    email: "sarah.jones@example.com",
    role: "worker",
    trade: "welder",
    country: "Saudi Arabia",
    verificationStatus: {
      identity: "verified",
      certificate: "verified"
    }
  },
  {
    id: "user_verify_rejected_1",
    name: "Raj Patel",
    email: "raj.patel@example.com",
    role: "worker",
    trade: "carpenter",
    country: "Oman",
    verificationStatus: {
      identity: "rejected",
      certificate: "submitted"
    }
  }
];

async function run() {
  console.log('Seeding mock verification users...');
  try {
    for (const user of mockUsers) {
      await setDoc(doc(db, 'users', user.id), {
        name: user.name,
        email: user.email,
        role: user.role,
        trade: user.trade,
        country: user.country,
        verificationStatus: user.verificationStatus,
        createdAt: new Date()
      }, { merge: true });
      console.log(`Added user: ${user.name}`);
    }
    console.log('Seeding complete! Check your Admin Verification panel.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

run();
