import * as admin from 'firebase-admin';

export function getDbAdmin() {
    if (!admin.apps.length) {
          try {
                  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
                  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
                  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ecodivers-61b6f';

            if (privateKey && clientEmail) {
                      admin.initializeApp({
                                  credential: admin.credential.cert({
                                                projectId,
                                                clientEmail,
                                                privateKey: privateKey.replace(/\\n/g, '\n'),
                                  }),
                      });
            } else {
                      admin.initializeApp({
                                  projectId,
                      });
            }
          } catch (error) {
                  console.error('Firebase admin initialization error', error);
                  return null;
          }
    }
    return admin.firestore()
};
}
