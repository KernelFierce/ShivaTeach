
export type UserRole = 
    | 'SuperAdmin'
    | 'OrganizationAdmin'
    | 'Admin'
    | 'Teacher'
    | 'Student'
    | 'Parent';

export interface UserPermissions {
    canManageUsers: boolean;
    canManageSchedules: boolean;
    canViewFinancials: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
  activeTenantId: string | null;
  permissions: UserPermissions;
  assignedStudentIds: string[];
  assignedTeacherIds: string[];
  tenantId?: string;
}
