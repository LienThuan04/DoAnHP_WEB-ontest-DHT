export interface ICreateRoleDto {
  roleName: string;
  description?: string;
}

export interface IRoleEntity {
  id: string;
  roleName: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
