
import type { UserRole } from './user-profile';

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: string;
  joined: string;
  activeRole?: UserRole;
}
