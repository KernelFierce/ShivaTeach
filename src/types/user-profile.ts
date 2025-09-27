
export type UserRole = 
    | 'SuperAdmin'
    | 'OrganizationAdmin'
    | 'Admin'
    | 'Teacher'
    | 'Student'
    | 'Parent';

export interface UserProfile {
  displayName: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
  activeTenantId: string | null;
}
