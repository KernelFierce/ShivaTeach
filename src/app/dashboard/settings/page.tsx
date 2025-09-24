"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DollarSign, Percent, Hourglass } from "lucide-react"

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

const settingsFormSchema = z.object({
  defaultHourlyRate: z.coerce.number().min(0, "Rate must be a positive number."),
  noShowFeePercentage: z.coerce.number().min(0, "Fee must be between 0 and 100.").max(100, "Fee must be between 0 and 100."),
  cancellationWindowHours: z.coerce.number().int().min(0, "Hours must be a positive integer."),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>

// This can be used a mock fetch from a database
const defaultValues: Partial<SettingsFormValues> = {
  defaultHourlyRate: 50.00,
  noShowFeePercentage: 25,
  cancellationWindowHours: 24,
}

export default function SettingsPage() {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: SettingsFormValues) {
    toast({
      title: "Settings Saved!",
      description: "Your new organization settings have been saved.",
    })
    console.log(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Organization Settings</CardTitle>
        <CardDescription>Manage your organization's billing, rates, and other settings.</CardDescription>
      </CardHeader>
      <CardContent>
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
                        <Input type="number" placeholder="50.00" className="pl-8" {...field} />
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

            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
