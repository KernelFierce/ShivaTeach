
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DollarSign, Percent, Hourglass, Loader2 } from "lucide-react"
import { useEffect, useTransition } from "react"
import { doc, updateDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { Skeleton } from "@/components/ui/skeleton"

const settingsFormSchema = z.object({
  defaultHourlyRate: z.coerce.number().min(0, "Rate must be a positive number."),
  noShowFeePercentage: z.coerce.number().min(0, "Fee must be between 0 and 100.").max(100, "Fee must be between 0 and 100."),
  cancellationWindowHours: z.coerce.number().int().min(0, "Hours must be a positive integer."),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>

export default function SettingsPage() {
  const firestore = useFirestore();
  const [isPending, startTransition] = useTransition();

  const tenantId = 'acme-tutoring'; // This would be dynamic in a real app
  const tenantDocRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return doc(firestore, 'tenants', tenantId);
  }, [firestore, tenantId]);

  const { data: tenant, isLoading, error } = useDoc<SettingsFormValues>(tenantDocRef);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
        defaultHourlyRate: 0,
        noShowFeePercentage: 0,
        cancellationWindowHours: 0,
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (tenant) {
      form.reset({
        defaultHourlyRate: tenant.defaultHourlyRate || 0,
        noShowFeePercentage: tenant.noShowFeePercentage || 0,
        cancellationWindowHours: tenant.cancellationWindowHours || 0,
      });
    }
  }, [tenant, form]);

  function onSubmit(data: SettingsFormValues) {
    if (!tenantDocRef) return;
    startTransition(async () => {
      try {
        await updateDoc(tenantDocRef, data);
        toast({
          title: "Settings Saved!",
          description: "Your new organization settings have been saved.",
        })
      } catch (error) {
        console.error("Error updating settings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save settings. Please try again.",
        })
      }
    });
  }

  const renderFormContent = () => {
    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-px w-full" />
                    <div className="max-w-sm space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
                 <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-px w-full" />
                    <div className="max-w-sm space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                     <div className="max-w-sm space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
                 <Skeleton className="h-10 w-32" />
            </div>
        )
    }

    if (error) {
         return (
            <div className="text-center text-destructive-foreground bg-destructive/80 p-4 rounded-md">
                <p className="font-bold">Error loading settings:</p>
                <p className="text-sm mt-2 font-mono">{error.message}</p>
            </div>
        );
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium font-headline">Rates & Financials</h3>
                    <Separator />
                    <FormField
                    control={form.control}
                    name="defaultHourlyRate"
                    render={({ field }) => (
                        <FormItem className="max-w-sm">
                        <FormLabel>Default Hourly Rate</FormLabel>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                            <Input type="number" step="0.01" placeholder="50.00" className="pl-8" {...field} />
                            </FormControl>
                        </div>
                        <FormDescription>
                            This is the default rate for new sessions. It can be overridden for specific students or teachers.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-lg font-medium font-headline">Billing Policies</h3>
                    <Separator />
                    <FormField
                        control={form.control}
                        name="noShowFeePercentage"
                        render={({ field }) => (
                            <FormItem className="max-w-sm">
                            <FormLabel>No-Show Fee</FormLabel>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                <Input type="number" placeholder="25" className="pl-8" {...field} />
                                </FormControl>
                            </div>
                            <FormDescription>
                                The percentage of the session fee to charge for a no-show.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cancellationWindowHours"
                        render={({ field }) => (
                            <FormItem className="max-w-sm">
                            <FormLabel>Cancellation Window</FormLabel>
                            <div className="relative">
                                <Hourglass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                <Input type="number" placeholder="24" className="pl-8" {...field} />
                                </FormControl>
                            </div>
                            <FormDescription>
                                Hours before a session that a student can cancel without a fee.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Organization Settings</CardTitle>
        <CardDescription>Manage your organization's billing, rates, and other settings.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderFormContent()}
      </CardContent>
    </Card>
  )
}
