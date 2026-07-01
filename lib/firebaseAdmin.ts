import * as admin from 'firebase-admin';

let _db: admin.firestore.Firestore | null = null;

export function getDbAdmin(): admin.firestore.Firestore | null {
  if (_db) return _db;

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKeyRaw) {
      console.warn('[FirebaseAdmin] Missing env vars:', {
        projectId: !!projectId,
        clientEmail: !!clientEmail,
        privateKey: !!privateKeyRaw,
      });
      return null;
    }

    // 실제 개행(\n)으로 저장된 키를 그대로 사용.
    // 혹시 이스케이프된 \n(백슬래시+n)이 섞여있어도 모두 개행으로 변환.
    const privateKey = privateKeyRaw.split(String.fromCharCode(92) + 'n').join('\n');

    const existingApp = admin.apps.find(a => a?.name === '[DEFAULT]');
    if (existingApp) {
      _db = existingApp.firestore();
    } else {
      const app = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      _db = app.firestore();
      console.log('[FirebaseAdmin] Initialized for project:', projectId);
    }

    return _db;
  } catch (error) {
    console.error('[FirebaseAdmin] Initialization Error:', error);
    return null;
  }
}
