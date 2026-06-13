import { Type } from 'class-transformer';
import type { ISessionEntity } from '@/session/interfaces/session.types';

export class SessionEntity implements ISessionEntity {
  id!: string;
  userId!: string;

  refreshToken!: string;

  deviceId!: string;

  @Type(() => Date)
  expiresAt!: Date;

  @Type(() => Date)
  createdAt!: Date;

  @Type(() => Date)
  updatedAt!: Date;
}
