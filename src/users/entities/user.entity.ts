import { Exclude, Type } from 'class-transformer';
import type { IUserEntity } from '@/users/interfaces/users.types';

export class UserEntity implements IUserEntity {
  id!: string;
  email!: string;
  userName!: string;

  @Exclude() // Hide password from response
  password?: string | null;

  googleId?: string | null;
  accountType!: string;

  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  description?: string | null;

  roleId!: string;

  roleName!: string;

  @Type(() => Date)
  createdAt!: Date;
  @Type(() => Date)
  updatedAt!: Date;

  @Exclude()
  sessions?: any[]; // Add sessions property to hold user sessions

}
