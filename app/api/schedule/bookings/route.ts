import { NextResponse } from 'next/server';
import { getDbAdmin } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const db = getDbAdmin();
    if (!db) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const snapshot = await db.collection('bookings').get();
    const bookings = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((b: any) => !b.deleted && !b.cancelled);

    return NextResponse.json({ bookings }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Schedule API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
