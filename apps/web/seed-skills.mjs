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

const skills = [
  "Wiring", "Circuit Breakers", "Panel Upgrades", "Conduit Bending", "High Voltage", "Low Voltage", "Troubleshooting", "Motors & Controls", "Lighting Installation",
  "Pipefitting", "Drain Cleaning", "Water Heaters", "PEX Piping", "Copper Brazing", "Sewer Repair", "Fixture Installation", "Backflow Testing", "Commercial Plumbing", "Gas Lines",
  "Refrigeration", "AC Repair", "Furnace Installation", "Ductwork", "EPA Certified", "Thermostats", "Heat Pumps", "Ventilation", "HVAC Maintenance", "Boilers",
  "Framing", "Drywall", "Finish Carpentry", "Roofing", "Concrete Finishing", "Masonry", "Tile Setting", "Blueprint Reading", "Scaffolding", "Cabinetry",
  "MIG Welding", "TIG Welding", "Stick Welding", "Fabrication", "Pipe Welding", "Structural Welding", "Metal Cutting", "Aluminum Welding", "Steel Erection",
  "Diesel Engine Repair", "Hydraulics", "Diagnostics", "Preventative Maintenance", "Brake Systems", "Transmission Repair", "Electrical Systems", "Heavy Machinery", "Pneumatics", "Fleet Maintenance",
  "OSHA 10", "OSHA 30", "First Aid/CPR", "Heavy Equipment Operation", "Forklift Operation", "CDL", "Power Tools", "Hand Tools", "Site Safety", "Team Leadership"
];

skills.sort();

async function run() {
  try {
    await setDoc(doc(db, 'taxonomies', 'skills'), { items: skills }, { merge: true });
    console.log("Successfully seeded " + skills.length + " skills to taxonomies/skills");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
