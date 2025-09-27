
'use client';

import {
  getFirestore,
  writeBatch,
  doc,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

const TENANT_ID = 'acme-tutoring';

// --- Clean Up Function ---
async function clearCollection(db: any, collectionPath: string) {
  try {
    const collRef = collection(db, collectionPath);
    const querySnapshot = await getDocs(collRef);
    if (querySnapshot.empty) {
      console.log(`Collection ${collectionPath} is already empty.`);
      return;
    }
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Successfully cleared collection: ${collectionPath}`);
  } catch (error) {
    console.error(`Error clearing collection ${collectionPath}:`, error);
    // We can choose to throw or just log the error
  }
}

// --- Main Seeding Function ---
export async function seedAllData() {
  const db = getFirestore();
  const auth = getAuth();

  try {
    console.log('--- Starting Database Seed ---');

    // 1. Clear Existing Data
    // We must be careful about the order. Subcollections need to be cleared first
    // if we were deleting tenants, but here we just clear subcollection contents.
    console.log('Clearing existing tenant subcollections...');
    await clearCollection(db, `tenants/${TENANT_ID}/users`);
    await clearCollection(db, `tenants/${TENANT_ID}/subjects`);
    await clearCollection(db, `tenants/${TENANT_ID}/courses`);
    await clearCollection(db, `tenants/${TENANT_ID}/sessions`);
    await clearCollection(db, `tenants/${TENANT_ID}/leads`);
    
    // Clear root collections
    console.log('Clearing root user and tenant collections...');
    // Note: We are NOT clearing Firebase Auth users themselves.
    // This is harder and can lead to issues. Instead, we overwrite their
    // Firestore documents. For a true reset, you'd do this in Firebase Console.
    await clearCollection(db, 'users');
    await clearCollection(db, 'tenants');


    // 2. Initialize a new Write Batch
    const batch = writeBatch(db);

    // 3. Create Tenant
    console.log('Creating tenant...');
    const tenantRef = doc(db, 'tenants', TENANT_ID);
    batch.set(tenantRef, {
      name: 'Acme Tutors Inc.',
      description:
        'A premier tutoring service specializing in personalized education.',
      status: 'active',
      defaultHourlyRate: 60,
      noShowFeePercentage: 50,
      cancellationWindowHours: 24,
    });

    // 4. Create Users and Auth Credentials
    console.log('Creating authentication users...');

    // Function to safely create auth user and Firestore docs
    const createUser = async (
      email: string,
      name: string,
      role: string,
      tenantId: string | null = null,
      status: string = 'Active'
    ) => {
      try {
        // First, attempt to sign in. If the user exists, we don't need to create them.
        await signInWithEmailAndPassword(auth, email, 'password');
        console.log(`Auth user ${email} already exists. Skipping creation.`);
      } catch (error: any) {
        // If user does not exist, create them
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, email, 'password');
            console.log(`Created auth user for ${email}`);
          } catch (createError: any) {
             if (createError.code === 'auth/email-already-in-use') {
                console.log(`Auth user ${email} already exists. Skipping creation.`);
             } else {
                 throw createError;
             }
          }
        } else {
            // Re-throw other auth errors
            throw error;
        }
      }

      // Now, get the user to retrieve the UID
      await signInWithEmailAndPassword(auth, email, 'password');
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error(`Could not get user for ${email}`);
      const uid = currentUser.uid;

      // Create private user profile
      const userProfileRef = doc(db, 'users', uid);
      batch.set(userProfileRef, {
        displayName: name,
        email: email,
        role: role,
        activeTenantId: tenantId, // SuperAdmin has no active tenant by default
      });

      // If the user belongs to a tenant, create their public tenant profile
      if (tenantId) {
        const tenantUserRef = doc(db, `tenants/${tenantId}/users`, uid);
        batch.set(tenantUserRef, {
          name: name,
          email: email,
          role: role,
          status: status,
          joined: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
        });
      }
      return { uid, name, email, role };
    };

    // Create SuperAdmin
    const superAdmin = await createUser(
      'super@tutorhub.com',
      'Shiva Sai',
      'SuperAdmin'
    );
    
    // Create OrganizationAdmin for Acme Tutors
    const orgAdmin = await createUser(
      'admin@tutorhub.com',
      'Maria Garcia',
      'OrganizationAdmin',
      TENANT_ID
    );

    // Create other users for the Acme Tutors tenant
    const teacher = await createUser(
      'teacher@tutorhub.com',
      'David Chen',
      'Teacher',
      TENANT_ID
    );
    const student = await createUser(
      'student@tutorhub.com',
      'Alex Johnson',
      'Student',
      TENANT_ID
    );
    const parent = await createUser(
      'parent@tutorhub.com',
      'Carol Johnson',
      'Parent',
      TENANT_ID
    );
     const inactiveUser = await createUser(
      'inactive@tutorhub.com',
      'Inactive User',
      'Student',
      TENANT_ID,
      'Inactive'
    );

    // 5. Create Subjects and Courses for the Tenant
    console.log('Creating subjects and courses...');
    const subjects = [
      { id: 'math', name: 'Mathematics' },
      { id: 'science', name: 'Science' },
      { id: 'humanities', name: 'Humanities' },
    ];

    const courses = [
      {
        id: 'alg-1',
        subjectId: 'math',
        name: 'Algebra I',
        description: 'Fundamental concepts of algebra.',
        hourlyRate: 55,
      },
      {
        id: 'geom-1',
        subjectId: 'math',
        name: 'Geometry',
        description: 'Study of shapes, sizes, and properties of space.',
        hourlyRate: 55,
      },
      {
        id: 'bio-1',
        subjectId: 'science',
        name: 'Biology',
        description: 'The study of living organisms.',
        hourlyRate: 60,
      },
      {
        id: 'chem-1',
        subjectId: 'science',
        name: 'Chemistry',
        description: 'The study of matter and its properties.',
        hourlyRate: 65,
      },
       {
        id: 'wh-1',
        subjectId: 'humanities',
        name: 'World History',
        description: 'A survey of major global events.',
        hourlyRate: 50,
      },
    ];

    subjects.forEach((subject) => {
      const subjectRef = doc(db, `tenants/${TENANT_ID}/subjects`, subject.id);
      batch.set(subjectRef, { name: subject.name });
    });

    courses.forEach((course) => {
      const courseRef = doc(db, `tenants/${TENANT_ID}/courses`, course.id);
      batch.set(courseRef, course);
    });

    // 6. Create Sample Leads
    console.log('Creating sample leads...');
    const leads = [
      {
        firstName: 'Potential',
        lastName: 'Student',
        email: 'potential@example.com',
        phone: '555-123-4567',
        status: 'New',
        notes: 'Interested in SAT prep.',
      },
      {
        firstName: 'Another',
        lastName: 'Lead',
        email: 'another@example.com',
        phone: '555-987-6543',
        status: 'Contacted',
        notes: 'Followed up via email on Monday.',
      },
       {
        firstName: 'Converted',
        lastName: 'NowStudent',
        email: 'converted@example.com',
        phone: '555-555-5555',
        status: 'Converted',
        notes: 'Enrolled in Algebra I.',
      },
    ];

    leads.forEach((lead) => {
      const leadRef = doc(collection(db, `tenants/${TENANT_ID}/leads`));
      batch.set(leadRef, lead);
    });

    // 7. Commit all writes to the database
    console.log('Committing all changes...');
    await batch.commit();

    // Sign out to ensure a clean state after seeding
    await auth.signOut();

    console.log('--- Database Seed Successful ---');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('--- Database Seed Failed ---');
    console.error(error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred during seeding.' };
  }
}
