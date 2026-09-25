import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import { addAudit } from './admin'; // or something similar

export async function createCompanyUser(data: any, adminEmail: string) {
  const secondaryApp = initializeApp(app.options, 'SecondaryAdminApp');
  const secondaryAuth = getAuth(secondaryApp);
  
  // Create user
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
  const uid = userCredential.user.uid;
  
  // Set user doc
  await setDoc(doc(db, 'users', uid), {
    email: data.email,
    name: data.name,
    role: 'agency',
    accountStatus: 'approved',
    adminStatus: 'active',
    createdAt: serverTimestamp(),
  });
  
  // Set agency profile
  await setDoc(doc(db, 'agencies', uid), {
    name: data.name,
    industry: data.industry || '',
    website: data.website || '',
    location: data.location || '',
    verified: true,
  });
  
  // We can signOut secondary auth to clear it, but secondaryAuth instance will be GC'd.
  await secondaryAuth.signOut();
  
  return uid;
}
