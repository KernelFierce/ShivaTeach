

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword, type AuthError, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, LogIn } from 'lucide-react';
import { Logo } from '@/components/logo';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// This is the default admin user that was created during the seeding process.
const defaultAdmin = {
  email: 'admin@tutorhub.com',
  password: 'password'
}

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultAdmin.email,
      password: defaultAdmin.password,
    },
  });

  const handleAuthError = (error: AuthError) => {
    console.error('Authentication Error:', error.code, error.message);
    let description = 'An unexpected authentication error occurred.';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      description = 'Invalid email or password. Please try again.';
    } else if (error.code === 'auth/email-already-in-use') {
      description = 'This email is already in use. Please try logging in.';
    }
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description,
    });
  }

  async function onSignIn(data: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // Let the root page redirect handle success
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo className="mb-4 justify-center" />
          <CardTitle className="font-headline text-2xl">
            Welcome to TutorHub
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSignIn)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@tutorhub.com"
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-4 text-center">
             <p className="text-xs text-muted-foreground">
                Don't have an account? Contact support to get started.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
