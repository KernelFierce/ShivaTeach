
"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
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
    if (!isUserLoading && user) {
      const fetchUserRoleAndRedirect = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userRole = userDoc.data()?.role;
          const dashboardPath = ROLE_DASHBOARD_MAP[userRole] || '/dashboard';
          router.replace(dashboardPath);
        } else {
          // Fallback if profile doesn't exist for some reason
          router.replace('/dashboard');
        }
      };
      fetchUserRoleAndRedirect();
    }
  }, [user, isUserLoading, router, firestore]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;
          
          const userProfileRef = doc(firestore, "users", newUser.uid);
          const tenantUserRef = doc(firestore, "tenants", "acme-tutoring", "users", newUser.uid);
          const userDisplayName = newUser.email?.split('@')[0] || 'New User';
          
          // Create the private user profile
          setDocumentNonBlocking(userProfileRef, {
            email: newUser.email,
            displayName: userDisplayName,
            role: 'OrganizationAdmin', // Assign a default role
            activeTenantId: 'acme-tutoring',
          }, {});

          // Create the public user record within the tenant
          setDocumentNonBlocking(tenantUserRef, {
            name: userDisplayName,
            email: newUser.email,
            role: 'OrganizationAdmin',
            status: 'Active',
            joined: format(new Date(), 'yyyy-MM-dd'),
          }, {});

          toast({
            title: "Account Created",
            description: "We've created a new account for you and logged you in.",
          });
        } catch (signUpError: any) {
          console.error("Sign-up Error:", signUpError);
          let description = "Could not create a new account.";
          if (signUpError.code === 'auth/weak-password') {
            description = 'The password is too weak. Please use at least 6 characters.';
          } else if (signUpError.code === 'auth/email-already-in-use') {
            description = 'The email or password you entered is incorrect.';
          } else if (signUpError.message) {
            description = signUpError.message;
          }
          toast({
            variant: "destructive",
            title: "Sign-Up Failed",
            description: description,
          });
        }
      } else {
        console.error("Login Error:", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "An unknown error occurred during login.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold font-headline mt-2">Welcome Back</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Login</CardTitle>
              <CardDescription>
                Use any email and password to sign up or log in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login or Create Account
                  </Button>
                  <Button variant="outline" className="w-full" disabled={isLoading}>
                    Login with SSO
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="#" className="underline">
              Contact Sales
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

    