import { NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    await setDoc(doc(db, 'settings', 'global'), {
      maintenanceMode: true,
      maintenanceMessage: 'System upgrades are currently underway! We are bringing you new and improved features.',
      maintenanceEndTime: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
      supportEmail: 'admin@tradematch.com',
      platformFee: 5,
      announcementBanner: ''
    }, { merge: true });
    
    return NextResponse.json({ success: true, message: 'Maintenance mode forcefully enabled via API!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
