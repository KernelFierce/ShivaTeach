
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
require('server-only');

let app;

function getFirebaseAdminApp() {
  if (app) {
    return app;
  }

  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    try {
      const decodedString = Buffer.from(serviceAccountString, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decodedString);
    } catch (e2) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not a valid JSON string or a base64 encoded JSON string.');
    }
  }

  app = initializeApp({
    credential: cert(serviceAccount),
  });

  return app;
}

function getFirebaseAdmin() {
  const adminApp = getFirebaseAdminApp();
  return {
    auth: getAuth(adminApp),
    firestore: getFirestore(adminApp),
  };
}

module.exports = { getFirebaseAdmin };
