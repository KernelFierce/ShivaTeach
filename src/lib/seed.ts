
'use client';

import { collection, doc, writeBatch, type Firestore } from "firebase/firestore";
import { format } from "date-fns";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
 * It now includes non-blocking error handling to emit contextual permission errors.
 * @param firestore The Firestore instance.
 * @param tenantId The ID of the tenant to seed data for.
 */
export function seedInitialUserData(firestore: Firestore, tenantId: string) {
  const batch = writeBatch(firestore);
  const joinedDate = format(new Date(), 'yyyy-MM-dd');
  const allUsersData: Record<string, any> = {};

  MOCK_USERS.forEach(user => {
    const tenantUserData = {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        joined: joinedDate,
    };
    const privateUserData = {
        displayName: user.name,
        email: user.email,
        role: user.role,
        activeTenantId: tenantId,
    };

    // 1. Reference to the public user document within the tenant
    const tenantUserRef = doc(firestore, 'tenants', tenantId, 'users', user.uid);
    batch.set(tenantUserRef, tenantUserData);

    // 2. Reference to the private user profile document
    const privateUserRef = doc(firestore, 'users', user.uid);
    batch.set(privateUserRef, privateUserData);
    
    // Collate data for error reporting
    allUsersData[tenantUserRef.path] = tenantUserData;
    allUsersData[privateUserRef.path] = privateUserData;
  });

  // Commit the batch and handle errors without blocking
  return batch.commit().catch(serverError => {
    // A batch write can fail for many reasons, but for this context,
    // we'll create a permission error that represents the overall failed operation.
    const permissionError = new FirestorePermissionError({
      path: `tenants/${tenantId}/users (and associated /users)`,
      operation: 'write', // Batch write is a 'write' operation
      requestResourceData: allUsersData,
    });
    
    // Emit the rich, contextual error for the development overlay to catch.
    errorEmitter.emit('permission-error', permissionError);
    
    // We can also re-throw the original error if we want the promise to be rejected.
    // In this case, the `handleSeedData` function's catch block will also execute.
    throw serverError;
  });
}
