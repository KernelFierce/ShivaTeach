
'use client';

import { Firestore, doc, writeBatch } from 'firebase/firestore';

const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

const initialData = {
  subjects: [
    { id: 'subj-math', name: 'Mathematics', description: 'From basic algebra to advanced calculus.' },
    { id: 'subj-sci', name: 'Science', description: 'Covering biology, chemistry, and physics.' },
    { id: 'subj-eng', name: 'English', description: 'Literature, writing, and grammar.' },
    { id: 'subj-hist', name: 'History', description: 'World history and social studies.' },
    { id: 'subj-cs', name: 'Computer Science', description: 'Programming and technology.' },
    { id: 'subj-art', name: 'Art', description: 'Creative expression and techniques.' },
  ],
  courses: [
    { id: 'course-alg1', subjectId: 'subj-math', name: 'Algebra I', hourlyRate: 45 },
    { id: 'course-phy1', subjectId: 'subj-sci', name: 'Physics 101', hourlyRate: 50 },
    { id: 'course-lit1', subjectId: 'subj-eng', name: 'American Literature', hourlyRate: 40 },
    { id: 'course-whist', subjectId: 'subj-hist', name: 'World History II', hourlyRate: 40 },
    { id: 'course-python', subjectId: 'subj-cs', name: 'Intro to Python', hourlyRate: 55 },
    { id: 'course-paint', subjectId: 'subj-art', name: 'Digital Painting', hourlyRate: 48 },
  ],
  users: [
    // Teachers
    {
      id: 'teacher-01',
      profile: { displayName: 'David Chen', email: 'david.c@example.com', role: 'Teacher', activeTenantId: 'acme-tutoring' },
      tenantProfile: { name: 'David Chen', email: 'david.c@example.com', role: 'Teacher', status: 'Active', joined: today }
    },
    {
      id: 'teacher-02',
      profile: { displayName: 'Sarah Wilson', email: 'sarah.w@example.com', role: 'Teacher', activeTenantId: 'acme-tutoring' },
      tenantProfile: { name: 'Sarah Wilson', email: 'sarah.w@example.com', role: 'Teacher', status: 'Active', joined: today }
    },
    // Students and Parents
    {
      id: 'student-01',
      profile: { displayName: 'Alex Johnson', email: 'alex.j@example.com', role: 'Student', activeTenantId: 'acme-tutoring' },
      tenantProfile: { name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Student', status: 'Active', joined: today }
    },
    {
      id: 'parent-01',
      profile: { displayName: 'Maria Johnson', email: 'maria.j@example.com', role: 'Parent', activeTenantId: 'acme-tutoring' },
      tenantProfile: { name: 'Maria Johnson', email: 'maria.j@example.com', role: 'Parent', status: 'Active', joined: today }
    },
     {
      id: 'student-02',
      profile: { displayName: 'Emily Carter', email: 'emily.c@example.com', role: 'Student', activeTenantId: 'acme-tutoring' },
      tenantProfile: { name: 'Emily Carter', email: 'emily.c@example.com', role: 'Student', status: 'Active', joined: today }
    },
    {
      id: 'parent-02',
      profile: { displayName: 'John Carter', email: 'john.c@example.com', role: 'Parent', activeTenantId: 'acme-tutoring' },
      tenantProfile: { name: 'John Carter', email: 'john.c@example.com', role: 'Parent', status: 'Active', joined: today }
    },
    {
      id: 'student-03',
      profile: { displayName: 'Ben Miller', email: 'ben.m@example.com', role: 'Student', activeTenantId: 'acme-tutoring' },
      tenantProfile: { name: 'Ben Miller', email: 'ben.m@example.com', role: 'Student', status: 'Inactive', joined: '2023-01-15' }
    },
    // Admin
     {
      id: 'admin-01',
      profile: { displayName: 'Laura Smith', email: 'laura.s@example.com', role: 'Admin', activeTenantId: 'acme-tutoring' },
      tenantProfile: { name: 'Laura Smith', email: 'laura.s@example.com', role: 'Admin', status: 'Active', joined: today }
    },
  ],
  sessions: [
    { id: 'sess-01', courseId: 'course-alg1', teacherId: 'teacher-01', studentId: 'student-01', startTime: '10:00 AM', status: 'Scheduled' },
    { id: 'sess-02', courseId: 'course-phy1', teacherId: 'teacher-01', studentId: 'student-02', startTime: '2:00 PM', status: 'Completed' },
    { id: 'sess-03', courseId: 'course-python', teacherId: 'teacher-02', studentId: 'student-01', startTime: '11:00 AM', status: 'Scheduled' },
    { id: 'sess-04', courseId: 'course-paint', teacherId: 'teacher-02', studentId: 'student-02', startTime: '3:00 PM', status: 'Cancelled' },
  ],
  leads: [
      { id: 'lead-01', firstName: 'Jessica', lastName: 'Williams', email: 'j.williams@email.com', status: 'New', notes: 'Interested in Math tutoring for 8th grader.'},
      { id: 'lead-02', firstName: 'Michael', lastName: 'Brown', email: 'm.brown@email.com', status: 'Contacted', notes: 'Left voicemail. Follow up in 2 days.'},
      { id: 'lead-03', firstName: 'Chloe', lastName: 'Davis', email: 'c.davis@email.com', status: 'Converted', notes: 'Signed up for SAT Prep course.'},
      { id: 'lead-04', firstName: 'Daniel', lastName: 'Rodriguez', email: 'd.rod@email.com', status: 'New', notes: 'Inquiring about English literature for a high school junior.'},
  ]
};

/**
 * Seeds the database with a comprehensive set of initial data for a given tenant.
 * Creates documents across all major collections.
 * @param firestore - The Firestore instance.
 * @param tenantId - The ID of the tenant to seed data for.
 * @param adminUid - The UID of the currently logged-in admin user.
 * @param adminEmail - The email of the currently logged-in admin user.
 */
export async function seedAllData(
  firestore: Firestore,
  tenantId: string,
  adminUid: string,
  adminEmail: string,
) {
  const batch = writeBatch(firestore);

  // 1. Create the Tenant document itself
  const tenantRef = doc(firestore, 'tenants', tenantId);
  batch.set(tenantRef, { name: 'Acme Tutoring', description: 'Your premier tutoring service.' });

  // 2. Create the admin's private user profile document
  const adminUserRef = doc(firestore, 'users', adminUid);
  batch.set(adminUserRef, {
      role: 'OrganizationAdmin',
      displayName: 'Shiva',
      email: adminEmail,
      activeTenantId: tenantId,
  });

  // 3. Create the admin's public profile within the tenant
  const adminTenantUserRef = doc(firestore, 'tenants', tenantId, 'users', adminUid);
  batch.set(adminTenantUserRef, {
      name: 'Shiva',
      email: adminEmail,
      role: 'OrganizationAdmin',
      status: 'Active',
      joined: today,
  });

  // 4. Create other users (teachers, students, parents, admins)
  initialData.users.forEach(user => {
    // Private profile
    const userRef = doc(firestore, 'users', user.id);
    batch.set(userRef, user.profile);
    // Public profile in tenant
    const tenantUserRef = doc(firestore, 'tenants', tenantId, 'users', user.id);
    batch.set(tenantUserRef, user.tenantProfile);
  });

  // 5. Create subjects
  initialData.subjects.forEach(subject => {
    const subjectRef = doc(firestore, 'tenants', tenantId, 'subjects', subject.id);
    batch.set(subjectRef, {name: subject.name, description: subject.description});
  });

  // 6. Create courses
  initialData.courses.forEach(course => {
    const courseRef = doc(firestore, 'tenants', tenantId, 'courses', course.id);
    batch.set(courseRef, {subjectId: course.subjectId, name: course.name, hourlyRate: course.hourlyRate});
  });

  // 7. Create sessions
  initialData.sessions.forEach(session => {
    const sessionRef = doc(firestore, 'tenants', tenantId, 'sessions', session.id);
    batch.set(sessionRef, {courseId: session.courseId, teacherId: session.teacherId, studentId: session.studentId, startTime: session.startTime, status: session.status});
  });

  // 8. Create leads
  initialData.leads.forEach(lead => {
      const leadRef = doc(firestore, 'tenants', tenantId, 'leads', lead.id);
      batch.set(leadRef, {firstName: lead.firstName, lastName: lead.lastName, email: lead.email, status: lead.status, notes: lead.notes});
  });
  
  // 9. Commit the entire batch
  await batch.commit();
}
