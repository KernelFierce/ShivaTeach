
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
  role: UserRole;
  activeTenantId: string | null;
}
