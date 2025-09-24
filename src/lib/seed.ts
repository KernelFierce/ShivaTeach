
'use client';

import { collection, doc, writeBatch, type Firestore } from "firebase/firestore";
import { format } from "date-fns";

// NOTE: The user IDs here are placeholders. In a real application,
// these would correspond to actual Firebase Auth UIDs.
const MOCK_USERS = [
  {
    uid: 'org-admin-01',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    role: 'OrganizationAdmin',
    status: 'Active',
  },
  {
    uid: 'teacher-01',
    name: 'David Chen',
    email: 'david.chen@example.com',
    role: 'Teacher',
    status: 'Active',
  },
  {
    uid: 'student-01',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    role: 'Student',
    status: 'Active',
  },
  {
    uid: 'parent-01',
    name: 'Brenda Johnson',
    email: 'brenda.j@example.com',
    role: 'Parent',
    status: 'Active',
  },
   {
    uid: 'inactive-teacher-01',
    name: 'Charles Davis',
    email: 'charles.d@example.com',
    role: 'Teacher',
    status: 'Inactive',
  },
];


/**
 * Seeds the Firestore database with initial user data for a specific tenant.
 * This includes a public record in `/tenants/{tenantId}/users/{userId}` and
 * a private profile in `/users/{userId}` for each user.
 * @param firestore The Firestore instance.
 * @param tenantId The ID of the tenant to seed data for.
 */
export async function seedInitialUserData(firestore: Firestore, tenantId: string) {
  const batch = writeBatch(firestore);
  const joinedDate = format(new Date(), 'yyyy-MM-dd');

  MOCK_USERS.forEach(user => {
    // 1. Reference to the public user document within the tenant
    const tenantUserRef = doc(firestore, 'tenants', tenantId, 'users', user.uid);
    batch.set(tenantUserRef, {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        joined: joinedDate,
    });

    // 2. Reference to the private user profile document
    const privateUserRef = doc(firestore, 'users', user.uid);
    batch.set(privateUserRef, {
        displayName: user.name,
        email: user.email,
        role: user.role,
        activeTenantId: tenantId,
    });
  });

  // Commit the batch
  await batch.commit();
}
