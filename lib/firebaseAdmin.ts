import * as admin from 'firebase-admin';

let _app: admin.app.App | null = null;
let _db: admin.firestore.Firestore | null = null;

function getAdminApp(): admin.app.App | null {
  if (_app) return _app;

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKeyRaw) {
      console.warn('[FirebaseAdmin] Missing env vars:', {
        projectId: !!projectId,
        clientEmail: !!clientEmail,
        privateKey: !!privateKeyRaw,
      });
      return null;
    }

    const privateKey = privateKeyRaw.split(String.fromCharCode(92) + 'n').join('\n');

    const existingApp = admin.apps.find(a => a?.name === '[DEFAULT]');
    if (existingApp) {
      _app = existingApp;
    } else {
      _app = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        storageBucket: storageBucket || `${projectId}.firebasestorage.app`,
      });
      console.log('[FirebaseAdmin] Initialized for project:', projectId);
    }

    return _app;
  } catch (error) {
    console.error('[FirebaseAdmin] Initialization Error:', error);
    return null;
  }
}

export function getDbAdmin(): admin.firestore.Firestore | null {
  if (_db) return _db;
  const app = getAdminApp();
  if (!app) return null;
  _db = app.firestore();
  return _db;
}

export function getStorageAdmin(): admin.storage.Storage | null {
  const app = getAdminApp();
  if (!app) return null;
  return admin.storage(app);
}
