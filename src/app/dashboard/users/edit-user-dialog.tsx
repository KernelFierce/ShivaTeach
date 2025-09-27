
'use client';

import { useState, useEffect } from 'react';
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
  FormDescription,
} from '@/components/ui/form';
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
import type { TenantUser } from '@/types/tenant-user';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { Checkbox } from "@/components/ui/checkbox"

const editUserSchema = z.object({
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one role.',
  }),
  status: z.string().min(1, 'Status is required'),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tenantId: string;
  user: TenantUser;
}

const availableRoles: UserRole[] = [
  'OrganizationAdmin',
  'Admin',
  'Teacher',
  'Student',
  'Parent',
];

export function EditUserDialog({
  isOpen,
  onOpenChange,
  tenantId,
  user
}: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      roles: user.roles,
      status: user.status,
    },
  });
  
  useEffect(() => {
    form.reset({
      roles: user.roles || [],
      status: user.status || 'Inactive',
    });
  }, [user, form]);


  const onSubmit = async (values: EditUserFormValues) => {
    setIsSubmitting(true);
    const db = getFirestore();
    const rolesTyped = values.roles as UserRole[];

    try {
      const batch = writeBatch(db);

      // Update the tenant-specific user profile
      const tenantUserRef = doc(db, `tenants/${tenantId}/users`, user.id);
      batch.update(tenantUserRef, {
        roles: rolesTyped,
        status: values.status,
      });

      // Update the global user profile
      const userProfileRef = doc(db, 'users', user.id);
      batch.update(userProfileRef, {
        roles: rolesTyped,
        // We only update activeRole if it's no longer in the list of roles
        // A more sophisticated approach might be needed later
        activeRole: rolesTyped.includes(user.activeRole as UserRole) ? user.activeRole : rolesTyped[0],
      });

      await batch.commit();

      toast({
        title: 'User Updated!',
        description: `Successfully updated user: ${user.name}`,
      });
      onOpenChange(false);
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Error Updating User',
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
          <DialogTitle>Edit User: {user.name}</DialogTitle>
          <DialogDescription>
            Update the roles and status for this user.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">User Roles</FormLabel>
                    <FormDescription>
                      Select the roles this user will have.
                    </FormDescription>
                  </div>
                  {availableRoles.map((role) => (
                    <FormField
                      key={role}
                      control={form.control}
                      name="roles"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={role}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(role)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, role])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== role
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {role}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
