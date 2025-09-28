const admin = require('firebase-admin');

// Load the service account key
const serviceAccount = require('./service-account-key.json');

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const tenantId = 'acme-tutoring';
const newUser = {
  email: 'admin.employee@acme.com',
  password: 'password123', // A temporary password
  displayName: 'Admin Employee',
};

async function createUser() {
  try {
    // 1. Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser(newUser);
    console.log('Successfully created new user in Auth:', userRecord.uid);

    // 2. Create the user document in Firestore
    const userDocRef = admin.firestore().collection('tenants').doc(tenantId).collection('users').doc(userRecord.uid);

    await userDocRef.set({
      uid: userRecord.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      roles: ['admin'],
      permissions: {
        canViewFinancials: false,
        canManageSchedules: true,
        canManageUsers: true,
      },
      assignedStudentIds: [],
      assignedTeacherIds: [],
      tenantId: tenantId,
    });

    console.log('Successfully created user document in Firestore');

  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createUser();
