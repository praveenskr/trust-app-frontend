export interface RoleDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: PermissionDTO[];
}

export interface PermissionDTO {
  id: number;
  code: string;
  name: string;
  description?: string;
  module?: string;
}

