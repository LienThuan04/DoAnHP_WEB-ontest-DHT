import type { ISessionEntity, ICreateSessionDto } from './session.types';

export interface ISessionService {
  upsertSession(createSessionDto: ICreateSessionDto, expiresInMs: number): Promise<ISessionEntity>;
  findSessionByRefreshTokenAndDeviceId(refreshToken: string, deviceId: string): Promise<ISessionEntity | null>;
  deleteSessionByDeviceId(userId: string, deviceId: string): Promise<boolean>;
  deleteSessionsByUserId(userId: string): Promise<boolean>;
}
