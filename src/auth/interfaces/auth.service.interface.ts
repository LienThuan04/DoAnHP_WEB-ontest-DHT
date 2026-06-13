import type { Response } from 'express';
import type { RequestUpdateUserOtpDto } from '@/users/dto/update-user.dto';
import type { IUserEntity } from '@/users/interfaces/users.types';
import { ClientType } from '@/common/enums/client-type.enum';
import type {
  ISanitizedUser,
  IGoogleUser,
  ILoginResult,
  IRegisterResult,
  ILocalValidateResult,
  IOtpGenerationResult,
  IUserUpdateOtpRequestResult,
  IRegisterDto,
  IVerifyRegisterOtpDto,
  IResendRegisterOtpDto,
  IVerifyEmailDto,
  IChangePasswordVerifyDto,
  IResetPasswordDto,
  IPasswordResetResult,
} from '@/auth/interfaces/auth.types';

export interface IAuthService {
  registerWithOTP(dto: IRegisterDto): Promise<IRegisterResult>;
  verifyRegisterOtp(dto: IVerifyRegisterOtpDto): Promise<ISanitizedUser>;
  resendRegisterOtp(dto: IResendRegisterOtpDto): Promise<IRegisterResult>;
  sendChangePasswordOtp(dto: IVerifyEmailDto): Promise<IRegisterResult>;
  verifyChangePasswordOtp(res: Response, dto: IChangePasswordVerifyDto, clientType: ClientType): Promise<IPasswordResetResult>;
  resetPassword(resetToken: string, res: Response, dto: IResetPasswordDto, clientType: ClientType): Promise<ISanitizedUser>;
  validateUser(userNameOrEmail: string, password: string): Promise<ILocalValidateResult | null>;
  login(user: ISanitizedUser, res: Response, deviceId: string, clientType: ClientType): Promise<ILoginResult>;
  refreshToken(oldRefreshToken: string, res: Response, clientType: ClientType): Promise<ILoginResult>;
  googleLogin(googleUser: IGoogleUser, res: Response, deviceId: string): Promise<ILoginResult>;
  logout(user: ISanitizedUser, refreshToken: string, res: Response, clientType: ClientType): Promise<boolean>;
  logoutAll(user: ISanitizedUser, res: Response, clientType: ClientType): Promise<boolean>;
}

export interface ITokenService {
  login(user: ISanitizedUser, res: Response, deviceId: string, clientType: ClientType): Promise<ILoginResult>;
  logout(userId: string, refreshToken: string, res: Response, clientType: ClientType): Promise<boolean>;
  logoutAll(userId: string, res: Response, clientType: ClientType): Promise<boolean>;
}

export interface IOtpService {
  generate(): Promise<IOtpGenerationResult>;
  assertFormat(otp: string): void;
  assertNoCooldown(resendAfter: Date | null | undefined): void;
  verify(
    otp: string,
    record: { otpHash: string; otpExpiresAt: Date; attemptCount: number },
    onCleanup: () => Promise<void>,
    onIncrementAttempt: () => Promise<number>,
  ): Promise<void>;
}

export interface IRegisterService {
  register(dto: IRegisterDto): Promise<IRegisterResult>;
  verifyOtp(dto: IVerifyRegisterOtpDto): Promise<ISanitizedUser>;
  resendOtp(email: string): Promise<IRegisterResult>;
}

export interface IPasswordService {
  sendOtp(dto: IVerifyEmailDto): Promise<IRegisterResult>;
  verifyOtp(res: Response, dto: IChangePasswordVerifyDto, clientType: ClientType): Promise<IPasswordResetResult>;
  resetPassword(resetToken: string, res: Response, dto: IResetPasswordDto, clientType: ClientType): Promise<ISanitizedUser>;
}

export interface IGoogleService {
  login(googleUser: IGoogleUser, res: Response, deviceId: string): Promise<ILoginResult>;
}

export interface IUserUpdateOtpService {
  requestUpdate(userId: string, dto: RequestUpdateUserOtpDto): Promise<IUserUpdateOtpRequestResult>;
  verifyAndApplyUpdate(userId: string, otp: string): Promise<{ message: string; data: IUserEntity }>;
}
