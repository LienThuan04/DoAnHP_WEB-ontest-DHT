export interface ISessionEntity {
  id: string;
  userId: string;
  refreshToken: string;
  deviceId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSessionDto {
  userId: string;
  refreshToken: string;
  deviceId: string;
}
