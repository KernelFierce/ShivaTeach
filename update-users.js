const admin = require('firebase-admin');

// Load the service account key
const serviceAccount = require('./service-account-key.json');

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

async function updateUserDocuments() {
  const usersRef = firestore.collection('users');
  const snapshot = await usersRef.get();

  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }

  snapshot.forEach(async (doc) => {
    console.log(`Updating doc ${doc.id}`);
    const userRef = usersRef.doc(doc.id);
    await userRef.update({
      assignedTeacherIds: [],
      assignedStudentIds: [],
      permissions: {
        canViewFinancials: false,
        canManageSchedules: false,
        canManageUsers: false,
      }
    });
  });

  console.log('Finished updating documents');
}

updateUserDocuments().catch(console.error);
