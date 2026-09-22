import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const docRef = doc(collection(db, 'promotions'));
    
    const dummyPromo = {
      title: 'Spring Special Offer!',
      message: 'Get 50% off on all premium subscriptions this week only. Elevate your profile and get matched with top clients instantly!',
      icon: 'Gift',
      themeColor: 'primary',
      actionText: 'Claim Offer',
      actionUrl: '/pricing',
      startDate: Date.now() - 1000 * 60 * 60 * 24, // Started yesterday
      endDate: Date.now() + 1000 * 60 * 60 * 24 * 7, // Ends in a week
      isActive: true,
      target: 'all',
      createdAt: Date.now()
    };

    await setDoc(docRef, dummyPromo);
    
    return NextResponse.json({ success: true, message: 'Dummy popup created successfully!', data: dummyPromo });
  } catch (error: any) {
    console.error('Error creating dummy promo:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
