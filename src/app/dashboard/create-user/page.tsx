
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AuthError,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const createUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: CreateUserFormValues) {
    setIsSubmitting(true);
    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const { user } = userCredential;

      // 2. Create the corresponding documents in Firestore
      const tenantId = 'acme-tutoring'; // Default tenant for the first admin
      const batch = writeBatch(firestore);

      // Create the private user profile
      const userProfileRef = doc(firestore, 'users', user.uid);
      batch.set(userProfileRef, {
        displayName: data.name,
        email: data.email,
        role: 'OrganizationAdmin',
        activeTenantId: tenantId,
      });

      // Create the public user profile within the tenant
      const tenantUserRef = doc(firestore, 'tenants', tenantId, 'users', user.uid);
      batch.set(tenantUserRef, {
        name: data.name,
        email: data.email,
        role: 'OrganizationAdmin',
        status: 'Active',
        joined: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      });
      
      // Create the tenant document itself
      const tenantRef = doc(firestore, 'tenants', tenantId);
      batch.set(tenantRef, {
        id: tenantId,
        name: 'Acme Tutoring',
        description: 'The first default organization.'
      }, { merge: true });


      await batch.commit();

      toast({
        title: 'Admin User Created!',
        description: `Successfully created ${data.name}. You will be redirected to the dashboard.`,
      });

      // Redirect to the main dashboard after success
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error) {
      const e = error as AuthError;
      console.error('Error creating user:', e);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: e.message || 'There was a problem creating the user.',
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-2xl">
            <UserPlus /> Create Initial Admin User
          </CardTitle>
          <CardDescription>
            This form will create the first Organization Admin user and the necessary database collections. This is a one-time setup step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Maria Garcia" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 6 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Creating User...' : 'Create Admin User'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
