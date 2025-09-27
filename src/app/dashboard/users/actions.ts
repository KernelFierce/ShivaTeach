
'use server';

import { getFirebaseAdmin } from '@/firebase/server';
import { z } from 'zod';
import type { UserRole } from '@/types/user-profile';
import { revalidatePath } from 'next/cache';

const createNewUserSchema = z.object({
  tenantId: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string(),
});

type CreateNewUserParams = z.infer<typeof createNewUserSchema>;

/**
 * A server action to create a new user.
 * It handles both Firebase Authentication and Firestore document creation.
 */
export async function createNewUser(params: CreateNewUserParams) {
  try {
    const validatedParams = createNewUserSchema.parse(params);
    const { tenantId, name, email, password, role } = validatedParams;

    const { auth, firestore } = getFirebaseAdmin();

    // 1. Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });
    const uid = userRecord.uid;

    const roleTyped = role as UserRole;
    
    // Use a batch to ensure atomic writes
    const batch = firestore.batch();

    // 2. Create the global user profile document
    const userProfileRef = firestore.doc(`users/${uid}`);
    batch.set(userProfileRef, {
      displayName: name,
      email: email,
      roles: [roleTyped],
      activeRole: roleTyped,
      activeTenantId: tenantId,
    });
    
    // 3. Create the tenant-specific user document
    const tenantUserRef = firestore.doc(`tenants/${tenantId}/users/${uid}`);
    batch.set(tenantUserRef, {
      name: name,
      email: email,
      roles: [roleTyped],
      status: 'Active',
      joined: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
    });
    
    // 4. Commit the batch
    await batch.commit();

    // Revalidate the users page to show the new user immediately
    revalidatePath('/dashboard/users');

    return { success: true, uid };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred.';
    // Provide more specific error messages for common Firebase admin errors
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'This email address is already in use by another account.';
    } else if (error.code === 'auth/invalid-password') {
      errorMessage = 'The password must be at least 8 characters long.';
    }
    console.error('Error creating new user:', error);
    return { error: errorMessage };
  }
}
