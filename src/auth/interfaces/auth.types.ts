import type { IUserEntity } from '@/users/interfaces/users.types';

export type { GoogleUser as IGoogleUser } from '@/auth/passport/google/google-user.interface';

// ─── Passport / JWT ───────────────────────────────────────────────────────────

export interface IJwtPayload {
  id: string;
  email: string;
  userName: string;
  roleName: string;
  accountType: string;
  avatarUrl?: string | null;
}

export interface IRefreshTokenPayload {
  userId: string;
  _sub: {
    roleName: string;
    email: string;
  };
  deviceId: string;
  iat?: number;
  exp?: number;
}

export interface ILocalValidateResult {
  id: string;
  email: string;
  userName: string;
  password?: string | null;
  accountType: string;
  roleName: string;
}

// ─── Shared user representation ───────────────────────────────────────────────

export interface ISanitizedUser {
  id: string;
  email: string;
  userName: string;
  accountType: string;
  roleName: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  description?: string | null;
  googleId?: string | null;
  roleId: string;
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface ILoginResult {
  accessToken: string;
  refreshToken?: string; // only present for mobile clients
  user: ISanitizedUser;
}

export interface IRegisterResult {
  otpExpire: string;
}

export interface IOtpGenerationResult {
  otp: string;
  otpHash: string;
  otpExpiresAt: Date;
  resendAfter: Date;
}


export interface IUserUpdateOtpRequestResult {
  skipOtp: boolean;
  message: string;
  data: IUserEntity | { targetEmail: string; changes: string[] };
}

// ─── DTO interfaces ───────────────────────────────────────────────────────────

export interface IRegisterDto {
  userName: string;
  email: string;
  password: string;
}

export interface IVerifyRegisterOtpDto {
  email: string;
  otp: string;
}

export interface IResendRegisterOtpDto {
  email: string;
}

export interface ILoginDto {
  userNameOrEmail: string;
  password: string;
}

export interface IVerifyEmailDto {
  email: string;
}

export interface IChangePasswordVerifyDto {
  email: string;
  otp: string;
}

export interface IResetPasswordDto {
  newPassword: string;
}

export interface IPasswordResetResult {
  expiresIn: string;
  resetToken?: string; // only present for mobile clients
}
