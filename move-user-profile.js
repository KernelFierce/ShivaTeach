
const admin = require('firebase-admin');

// Load the service account key
const serviceAccount = require('./service-account-key.json');

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();
const oldPath = 'tenants/acme-tutoring/users/lrOF3LqqIEYQjt3866FCoILsTfB2';
const newPath = 'users/lrOF3LqqIEYQjt3866FCoILsTfB2';

async function moveUserProfile() {
  try {
    // 1. Read the user profile from the old location
    const oldDocRef = firestore.doc(oldPath);
    const docSnap = await oldDocRef.get();

    if (!docSnap.exists) {
      console.error('Error: Source document does not exist at path:', oldPath);
      // As a fallback, let's try to create the user directly in the correct location,
      // in case it was never created properly in the first place.
      const userDoc = {
          uid: 'lrOF3LqqIEYQjt3866FCoILsTfB2',
          email: 'admin.employee@acme.com',
          displayName: 'Admin Employee',
          roles: ['admin'],
          permissions: {
            canViewFinancials: false,
            canManageSchedules: true,
            canManageUsers: true,
          },
          assignedStudentIds: [],
          assignedTeacherIds: [],
          tenantId: 'acme-tutoring',
      };
      await firestore.doc(newPath).set(userDoc);
      console.log('Created user document directly in new path:', newPath);
      return;
    }

    const userData = docSnap.data();
    console.log('Successfully read user data from old path');

    // 2. Write the user profile to the new location
    const newDocRef = firestore.doc(newPath);
    await newDocRef.set(userData);
    console.log('Successfully wrote user data to new path');

    // 3. Delete the user profile from the old location
    await oldDocRef.delete();
    console.log('Successfully deleted user data from old path');

  } catch (error) {
    console.error('Error moving user profile:', error);
  }
}

moveUserProfile();
