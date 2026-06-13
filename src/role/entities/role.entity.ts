import { Exclude, Type } from 'class-transformer';
import type { IRoleEntity } from '@/role/interfaces/role.types';

export class RoleEntity implements IRoleEntity {
  //   @Expose() //if not using excludeExtraneousValues, this is not needed, but it's good practice to be explicit about what should be included in the response
  id!: string;

  //   @Expose() // if you want to include name in the response when excludeExtraneousValues is true
  roleName!: string;

  description?: string;

  @Type(() => Date)
  createdAt!: Date;

  @Type(() => Date)
  updatedAt!: Date;

  @Exclude() // Hide users from response to avoid circular reference and large payloads
  users?: any[]; // You can define a UserEntity type if you want to be more specific

}
