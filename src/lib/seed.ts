
'use client';

import {
  getFirestore,
  writeBatch,
  doc,
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import type { UserRole } from '@/types/user-profile';

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
    console.log('Clearing existing tenant subcollections...');
    await clearCollection(db, `tenants/${TENANT_ID}/users`);
    await clearCollection(db, `tenants/${TENANT_ID}/subjects`);
    await clearCollection(db, `tenants/${TENANT_ID}/courses`);
    await clearCollection(db, `tenants/${TENANT_ID}/sessions`);
    await clearCollection(db, `tenants/${TENANT_ID}/leads`);
    await clearCollection(db, `tenants/${TENANT_ID}/availabilities`);
    await clearCollection(db, `tenants/${TENANT_ID}/assignments`);
    // Note: We need a more robust way to clear nested subcollections in the future
    
    console.log('Clearing root user and tenant collections...');
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

    const createUser = async (
      email: string,
      name: string,
      roles: UserRole[],
      activeRole: UserRole,
      tenantId: string | null = null,
      status: string = 'Active'
    ) => {
      try {
        await signInWithEmailAndPassword(auth, email, 'password');
        console.log(`Auth user ${email} already exists. Skipping creation.`);
      } catch (error: any) {
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
            throw error;
        }
      }

      await signInWithEmailAndPassword(auth, email, 'password');
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error(`Could not get user for ${email}`);
      const uid = currentUser.uid;

      const userProfileRef = doc(db, 'users', uid);
      batch.set(userProfileRef, {
        displayName: name,
        email: email,
        roles: roles,
        activeRole: activeRole,
        activeTenantId: tenantId,
      });

      if (tenantId) {
        const tenantUserRef = doc(db, `tenants/${tenantId}/users`, uid);
        batch.set(tenantUserRef, {
          name: name,
          email: email,
          roles: roles,
          status: status,
          joined: new Date().toLocaleDateString('en-CA'),
        });
      }
      return { uid, name, email, roles };
    };

    const superAdmin = await createUser('super@tutorhub.com', 'Shiva Sai', ['SuperAdmin'], 'SuperAdmin');
    const orgAdmin = await createUser('admin@tutorhub.com', 'Maria Garcia', ['OrganizationAdmin', 'Teacher'], 'OrganizationAdmin', TENANT_ID);
    const ankur = await createUser('ankur@kakkar.com', 'Ankur Kakkar', ['OrganizationAdmin', 'Teacher'], 'OrganizationAdmin', TENANT_ID);
    const teacher = await createUser('teacher@tutorhub.com', 'David Chen', ['Teacher'], 'Teacher', TENANT_ID);
    const student1 = await createUser('student@tutorhub.com', 'Alex Johnson', ['Student'], 'Student', TENANT_ID);
    const student2 = await createUser('student2@tutorhub.com', 'Sarah Lee', ['Student'], 'Student', TENANT_ID);
    const parent = await createUser('parent@tutorhub.com', 'Carol Johnson', ['Parent'], 'Parent', TENANT_ID);
    const inactiveUser = await createUser('inactive@tutorhub.com', 'Bob Smith', ['Student'], 'Student', TENANT_ID, 'Inactive');

    // 5. Create Subjects and Courses
    console.log('Creating subjects and courses...');
    const subjects = [
      { id: 'math', name: 'Mathematics' },
      { id: 'science', name: 'Science' },
      { id: 'humanities', name: 'Humanities' },
    ];

    const courses = [
      { id: 'alg-1', subjectId: 'math', name: 'Algebra I', hourlyRate: 55 },
      { id: 'geom-1', subjectId: 'math', name: 'Geometry', hourlyRate: 55 },
      { id: 'bio-1', subjectId: 'science', name: 'Biology', hourlyRate: 60 },
      { id: 'chem-1', subjectId: 'science', name: 'Chemistry', hourlyRate: 65 },
      { id: 'wh-1', subjectId: 'humanities', name: 'World History', hourlyRate: 50 },
    ];

    subjects.forEach((subject) => {
      const subjectRef = doc(db, `tenants/${TENANT_ID}/subjects`, subject.id);
      batch.set(subjectRef, { name: subject.name });
    });

    courses.forEach((course) => {
      const courseRef = doc(db, `tenants/${TENANT_ID}/courses`, course.id);
      batch.set(courseRef, course);
    });

    // 6. Create Sample Sessions
    console.log('Creating sample sessions and user-specific references...');
    const sessions = [
        // Today's sessions
        { startTime: Timestamp.fromDate(new Date(new Date().setHours(10, 0, 0, 0))), courseId: 'alg-1', teacherId: teacher.uid, studentId: student1.uid, status: 'Scheduled' },
        { startTime: Timestamp.fromDate(new Date(new Date().setHours(14, 0, 0, 0))), courseId: 'chem-1', teacherId: orgAdmin.uid, studentId: student2.uid, status: 'Scheduled' },
        // Future sessions
        { startTime: Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)), courseId: 'wh-1', teacherId: teacher.uid, studentId: student1.uid, status: 'Scheduled' },
        { startTime: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), courseId: 'bio-1', teacherId: orgAdmin.uid, studentId: student2.uid, status: 'Scheduled' },
    ];

    sessions.forEach((sessionData) => {
        const sessionRef = doc(collection(db, `tenants/${TENANT_ID}/sessions`));
        batch.set(sessionRef, sessionData);

        // Create reference for the student
        const studentSessionRef = doc(collection(db, `tenants/${TENANT_ID}/users/${sessionData.studentId}/sessionsAsStudent`));
        batch.set(studentSessionRef, { sessionId: sessionRef.id, startTime: sessionData.startTime });

        // Create reference for the teacher
        const teacherSessionRef = doc(collection(db, `tenants/${TENANT_ID}/users/${sessionData.teacherId}/sessionsAsTeacher`));
        batch.set(teacherSessionRef, { sessionId: sessionRef.id, startTime: sessionData.startTime });
    });


    // 7. Create Sample Leads
    console.log('Creating sample leads...');
    const leads = [
      { firstName: 'Potential', lastName: 'Student', email: 'potential@example.com', status: 'New' },
      { firstName: 'Another', lastName: 'Lead', email: 'another@example.com', status: 'Contacted' },
      { firstName: 'Converted', lastName: 'NowStudent', email: 'converted@example.com', status: 'Converted' },
    ];

    leads.forEach((lead) => {
      const leadRef = doc(collection(db, `tenants/${TENANT_ID}/leads`));
      batch.set(leadRef, lead);
    });

    // 8. Create Sample Availabilities
    console.log('Creating sample availabilities...');
    const availabilities = [
        // David Chen (teacher)
        { teacherId: teacher.uid, dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }, // Monday
        { teacherId: teacher.uid, dayOfWeek: 1, startTime: '13:00', endTime: '17:00' }, // Monday
        { teacherId: teacher.uid, dayOfWeek: 3, startTime: '10:00', endTime: '15:00' }, // Wednesday
        // Maria Garcia (orgAdmin, also a teacher)
        { teacherId: orgAdmin.uid, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
        { teacherId: orgAdmin.uid, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    ];

    availabilities.forEach(avail => {
        const availRef = doc(collection(db, `tenants/${TENANT_ID}/availabilities`));
        batch.set(availRef, {
            teacherId: avail.teacherId,
            tenantId: TENANT_ID,
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
        });
    });

    // 9. Create Sample Assignments
    console.log('Creating sample assignments...');
    const assignments = [
        { 
            title: 'Algebra Homework 1', 
            courseId: 'alg-1', 
            studentId: student1.uid, 
            dueDate: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
        },
        { 
            title: 'Lab Report: Photosynthesis', 
            courseId: 'bio-1', 
            studentId: student2.uid, 
            dueDate: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
        },
        { 
            title: 'Essay: The Roman Empire', 
            courseId: 'wh-1', 
            studentId: student1.uid, 
            dueDate: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // Overdue
        },
    ];

    assignments.forEach((assignment) => {
        const assignmentRef = doc(collection(db, `tenants/${TENANT_ID}/assignments`));
        batch.set(assignmentRef, assignment);
    });


    // 10. Commit all writes
    console.log('Committing all changes...');
    await batch.commit();

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
