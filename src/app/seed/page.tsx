
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Database } from 'lucide-react';
import { seedAllData } from '@/lib/seed';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SeedPage() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    setIsSeeding(true);
    const result = await seedAllData();
    setIsSeeding(false);

    if (result.success) {
      toast({
        title: "Database Seeded!",
        description: "Your database has been successfully populated with fresh sample data.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: result.message || "An unknown error occurred.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Database className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="font-headline text-2xl mt-4">
            Database Seeding
          </CardTitle>
          <CardDescription>
            Use this tool to wipe and repopulate your Firestore database with a clean set of sample data for testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg">
                <Database className="mr-2 h-4 w-4" />
                Seed Sample Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will **completely wipe all existing data** in your Firestore database and replace it with a fresh set of sample data. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSeedData} disabled={isSeeding}>
                  {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSeeding ? 'Seeding...' : 'Yes, seed the database'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
