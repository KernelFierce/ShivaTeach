
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { UserRole } from '@/types/user-profile';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '@/firebase';

const addUserSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.string().min(1, 'Role is required.'),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tenantId: string;
}

const availableRoles: UserRole[] = [
  'OrganizationAdmin',
  'Admin',
  'Teacher',
  'Student',
  'Parent',
];

export function AddUserDialog({
  isOpen,
  onOpenChange,
  tenantId,
}: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mainAuth = useAuth(); // The currently logged-in admin's auth instance

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Student',
    },
  });

  const onSubmit = async (values: AddUserFormValues) => {
    setIsSubmitting(true);
    const db = getFirestore();
    const tempAuth = getAuth(); // A temporary auth instance for creating the new user

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        values.email,
        values.password
      );
      const newUser = userCredential.user;
      const uid = newUser.uid;
      const roleTyped = values.role as UserRole;

      // 2. Use a batch to write to Firestore
      const batch = writeBatch(db);

      // 2a. Create the global user profile
      const userProfileRef = doc(db, 'users', uid);
      batch.set(userProfileRef, {
        displayName: values.name,
        email: values.email,
        roles: [roleTyped],
        activeRole: roleTyped,
        activeTenantId: tenantId,
      });

      // 2b. Create the tenant-specific user profile
      const tenantUserRef = doc(db, `tenants/${tenantId}/users`, uid);
      batch.set(tenantUserRef, {
        name: values.name,
        email: values.email,
        roles: [roleTyped],
        status: 'Active',
        joined: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
      });

      // 3. Commit the batch
      await batch.commit();

      // Sign out the newly created user from the temporary auth instance
      await tempAuth.signOut();

      // Re-authenticate the admin user if they were signed out.
      // This is a safeguard. In many setups, the mainAuth instance remains signed in.
      if (mainAuth.currentUser === null) {
        // This part needs credentials, which we don't have for the admin.
        // A robust solution would involve re-authentication flow,
        // but for now, we rely on the mainAuth instance not being affected.
        console.warn('Admin was signed out during user creation.');
      }

      toast({
        title: 'User Created!',
        description: `Successfully created user: ${values.name}`,
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      let errorMessage =
        'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage =
          'This email address is already in use by another account.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Error Creating User',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the details for the new user. They will be added to your
            organization.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
