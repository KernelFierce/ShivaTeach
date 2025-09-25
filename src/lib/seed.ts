
'use client';

import { Firestore, doc, writeBatch } from 'firebase/firestore';

// Hardcoded initial data for seeding
const initialUsers = [
  {
    id: 'teacher-01',
    data: {
      name: 'David Chen',
      email: 'david.c@example.com',
      role: 'Teacher',
      status: 'Active',
      joined: new Date().toLocaleDateString('en-US'),
    }
  },
  {
    id: 'student-01',
    data: {
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      role: 'Student',
      status: 'Active',
      joined: new Date().toLocaleDateString('en-US'),
    }
  },
  {
    id: 'parent-01',
    data: {
      name: 'Maria Johnson',
      email: 'maria.j@example.com',
      role: 'Parent',
      status: 'Active',
      joined: new Date().toLocaleDateString('en-US'),
    }
  },
];

/**
 * Seeds the database with an initial set of users for a given tenant.
 * Also creates the private user profile for the admin who initiates the seed.
 * @param firestore - The Firestore instance.
 * @param tenantId - The ID of the tenant to seed users for.
 * @param adminUid - The UID of the currently logged-in admin user.
 */
export async function seedInitialUserData(
  firestore: Firestore,
  tenantId: string,
  adminUid: string
) {
  const batch = writeBatch(firestore);

  // 1. Create the admin's private user profile document
  const adminUserRef = doc(firestore, 'users', adminUid);
  // We can get more admin data later, but for now role is essential
  batch.set(adminUserRef, {
      role: "OrganizationAdmin",
      displayName: "Admin User",
      email: "admin@example.com",
      activeTenantId: tenantId,
  });

  const adminTenantUserRef = doc(firestore, 'tenants', tenantId, 'users', adminUid);
  batch.set(adminTenantUserRef, {
      name: "Admin User",
      email: "admin@example.com",
      role: "OrganizationAdmin",
      status: "Active",
      joined: new Date().toLocaleDateString('en-US'),
  });

  // 2. Create the other initial users within the tenant
  initialUsers.forEach(user => {
    const userRef = doc(firestore, 'tenants', tenantId, 'users', user.id);
    batch.set(userRef, user.data);
  });

  // 3. Commit the batch
  await batch.commit();
}
