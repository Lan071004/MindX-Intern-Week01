import admin from 'firebase-admin';
import path from 'path';

const serviceAccountPath = path.resolve(
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json'
);

// Chỉ initialize 1 lần
if (!admin.apps.length) {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin SDK initialized');
}

export default admin;