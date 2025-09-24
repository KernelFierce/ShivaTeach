

"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { useAuth, useUser, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const ROLE_DASHBOARD_MAP: { [key: string]: string } = {
  OrganizationAdmin: '/dashboard',
  Admin: '/dashboard',
  Teacher: '/dashboard/teacher',
  Student: '/dashboard/student',
  Parent: '/dashboard/parent',
  SuperAdmin: '/dashboard/superadmin',
};

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-background');
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user && firestore) {
      const fetchUserRoleAndRedirect = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userRole = userDoc.data()?.role;
            const dashboardPath = ROLE_DASHBOARD_MAP[userRole] || '/dashboard';
            router.replace(dashboardPath);
          } else {
             // If the user profile doesn't exist, they can't log in.
             // This can happen if signup fails midway. We log them out.
            toast({
              variant: "destructive",
              title: "Profile Incomplete",
              description: "Your user profile was not found. Please contact support or try signing up again.",
            });
            auth.signOut();
          }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Fallback if firestore is unavailable
            router.replace('/dashboard');
        }
      };
      fetchUserRoleAndRedirect();
    }
  }, [user, isUserLoading, router, firestore, auth, toast]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On successful login, the useEffect will handle the redirection.
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "The email or password you entered is incorrect.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        // On successful sign-up, the useEffect will redirect.
        // We no longer create documents here. That's handled by seeding.
        toast({
            title: "Account Created",
            description: "Please ask your Organization Administrator to create your user profile before you can log in.",
        });
        // Log the user out immediately so they can't access a broken state.
        await auth.signOut();

    } catch (error: any) {
        let description = "An unknown error occurred during sign-up.";
        if (error.code === 'auth/weak-password') {
            description = 'The password is too weak. Please use at least 6 characters.';
        } else if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already in use. Please try logging in instead.';
        }
        toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: description,
        });
    } finally {
        setIsLoading(false);
    }
  }


  if (isUserLoading || user) {
    return (
       <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <Logo className="mx-auto text-2xl" />
            <h1 className="text-3xl font-bold font-headline mt-2">Welcome</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Login</CardTitle>
              <CardDescription>
                Use an administrator-provided account to log in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={handleSignUp} disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Auth Account
                    </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-sm">
            Need an account?{' '}
            <Link href="#" className="underline">
              Contact your administrator
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            data-ai-hint={loginImage.imageHint}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-primary/30" />
         <div className="absolute bottom-10 left-10 right-10">
          <Card className="bg-black/50 text-white backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className='font-headline'>"The beautiful thing about learning is that no one can take it away from you."</CardTitle>
              <CardDescription className="text-gray-300">- B.B. King</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
