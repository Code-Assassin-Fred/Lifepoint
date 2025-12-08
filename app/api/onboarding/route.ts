import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await req.json();
    const { dob, country, selectedModules } = body;

    if (!dob || !Array.isArray(selectedModules) || selectedModules.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate age
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const userRef = adminDb.collection('users').doc(uid);

    // Use .set() with merge: true instead of .update()
    await userRef.set(
      {
        dob,
        age,
        country: country || 'Unknown',
        selectedModules,
        onboarded: true,
        ai_enabled: true,
        onboardingCompletedAt: new Date().toISOString(),
      },
      { merge: true } // This allows creating the doc if it doesn't exist
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}