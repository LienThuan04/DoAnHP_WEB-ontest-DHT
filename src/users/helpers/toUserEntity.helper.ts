import { plainToInstance } from 'class-transformer';
import { UserEntity } from '@/users/entities/user.entity';
import type { IUserEntity } from '@/users/interfaces/users.types';

/** Map Prisma user (with role) to IUserEntity and strip runtime-only fields */
export function toUserEntity(user: { role?: { roleName: string } }): IUserEntity {
  const { role, ...userData } = user;
  return plainToInstance(UserEntity, {
    ...userData,
    roleName: role?.roleName ?? null,
  }, { excludeExtraneousValues: false });
}