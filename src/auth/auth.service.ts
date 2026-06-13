import { SessionService } from '@/session/session.service';
import { UsersService } from '@/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, VerifyRegisterOtpDto, ResendRegisterOtpDto, VerifyEmailDto, ChangePasswordVerifyDto, ResetPasswordDto } from '@/auth/dto/create-auth.dto';
import type { GoogleUser } from '@/auth/passport/google/google-user.interface';
import { comparePassword } from '@/lib/bcrypt/bcrypt';
import type { Response } from 'express';
import { AppException, ConflictException, InternalServerException, NotFoundException, UnauthorizedException, ValidationException } from '@/common/exceptions/app.exception';
import { TokenService } from '@/auth/services/token.service';
import { GoogleService } from '@/auth/services/google.service';
import { PasswordService } from '@/auth/services/password.service';
import { RegisterService } from '@/auth/services/register.service';
import { ClientType } from '@/common/enums/client-type.enum';
import type { ISanitizedUser } from '@/auth/interfaces/auth.types';
import type { IAuthService } from '@/auth/interfaces/auth.service.interface';

@Injectable()
export class AuthService implements IAuthService {
    private readonly refreshTokenName: string;
    private readonly refreshTokenSecret: string;


    constructor(
        // Services for specific features
        private readonly tokenService: TokenService,
        private readonly googleService: GoogleService,
        private readonly passwordService: PasswordService,
        private readonly registerService: RegisterService,
        // Common services
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly sessionService: SessionService
    ) {
        this.refreshTokenName = this.configService.get<string>('NAME_COOKIE_REFRESH_TOKEN_BROWSER')!;
        this.refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')!;

        if (!this.refreshTokenName || this.refreshTokenName.trim() === '') {
            throw new Error('Refresh token cookie name is not defined in environment variables');
        }
        if (!this.refreshTokenSecret || this.refreshTokenSecret.trim() === '') {
            throw new Error('JWT refresh token secret is not defined in environment variables');
        }
    }

    async registerWithOTP(registerDto: RegisterDto) {
        try {
            return await this.registerService.register(registerDto);
        } catch (error: any) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerException(`Failed to register user: ${error.message}`);
        }
    }

    async verifyRegisterOtp(verifyRegisterOtpDto: VerifyRegisterOtpDto) {
        try {
            return await this.registerService.verifyOtp(verifyRegisterOtpDto);
        } catch (error: any) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerException(`Failed to verify registration OTP: ${error.message}`);
        }
    }

    async resendRegisterOtp(resendRegisterOtpDto: ResendRegisterOtpDto) {
        try {
            return await this.registerService.resendOtp(resendRegisterOtpDto.email);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerException(`Failed to resend OTP: ${(error as Error).message}`);
        }
    }

    async sendChangePasswordOtp(verifyEmailDto: VerifyEmailDto) {
        try {
            return await this.passwordService.sendOtp(verifyEmailDto);
        } catch (error: any) {
            if (error instanceof ConflictException || error instanceof ValidationException) {
                throw error;
            }
            throw new InternalServerException(`Failed to send change password OTP: ${error.message}`);
        }
    }

    async verifyChangePasswordOtp(res: Response, changePasswordVerifyDto: ChangePasswordVerifyDto, clientType: ClientType) {
        try {
            return await this.passwordService.verifyOtp(res, changePasswordVerifyDto, clientType);
        } catch (error: any) {
            if (error instanceof ConflictException ||
                error instanceof NotFoundException ||
                error instanceof ValidationException) {
                throw error;
            }
            throw new InternalServerException(`Failed to verify change password OTP: ${error.message}`);
        }
    }

    async resetPassword(resetToken: string, res: Response, resetPasswordDto: ResetPasswordDto, clientType: ClientType) {
        try {
            return await this.passwordService.resetPassword(resetToken, res, resetPasswordDto, clientType);
        } catch (error: any) {
            if (error instanceof ConflictException ||
                error instanceof NotFoundException ||
                error instanceof ValidationException) {
                throw error;
            }
            throw new InternalServerException(`Failed to reset password: ${error.message}`);
        }
    }

    async validateUser(userNameOrEmail: string, password: string) {
        const user = await this.usersService.searchUserByEmailOrUsernameOrId(userNameOrEmail);
        if (!user) {
            return null;
        }
        if (user.accountType !== 'local') {
            throw new ConflictException('This account uses Google Sign-In',);
        }
        if (!user.password) {
            throw new ConflictException('This account does not support password login');
        }
        const authPass = await comparePassword(password, user.password);
        if (!authPass) {
            return null;
        }
        return user as ISanitizedUser;
    }

    async login(user: ISanitizedUser, res: Response, deviceId: string, clientType: ClientType) {
        try {
            return await this.tokenService.login(user, res, deviceId, clientType);
        } catch (error: any) {
            throw new InternalServerException(`Failed to login user: ${error.message}`);
        }
    }

    async refreshToken(oldRefreshToken: string, res: Response, clientType: ClientType) {
        try {
            if (!oldRefreshToken || oldRefreshToken.trim() === '' || oldRefreshToken === 'undefined') {
                throw new ValidationException('Refresh token is missing !');
            }
            const decodedRefreshToken = this.jwtService.verify(oldRefreshToken, { secret: this.refreshTokenSecret });
            if (!decodedRefreshToken || typeof decodedRefreshToken === 'string' || !decodedRefreshToken.userId ||
                !decodedRefreshToken._sub || !decodedRefreshToken.deviceId || typeof decodedRefreshToken.userId !== 'string' ||
                typeof decodedRefreshToken._sub !== 'object' || typeof decodedRefreshToken._sub.email !== 'string' ||
                typeof decodedRefreshToken._sub.roleName !== 'string' || typeof decodedRefreshToken.deviceId !== 'string'
            ) {
                console.error('Decoded refresh token payload is invalid:', decodedRefreshToken);
                throw new ValidationException('Invalid refresh token payload');
            }
            const session = await this.sessionService.findSessionByRefreshTokenAndDeviceId(oldRefreshToken, decodedRefreshToken.deviceId);
            if (!session) {
                if (clientType === ClientType.WEB) res.clearCookie(this.refreshTokenName);
                throw new ValidationException('Invalid refresh token or session not found');
            }
            const userFetch = await this.usersService.searchUserByEmailOrUsernameOrId(decodedRefreshToken.userId);
            if (!userFetch || userFetch.id !== decodedRefreshToken.userId) {
                if (clientType === ClientType.WEB) res.clearCookie(this.refreshTokenName);
                throw new ValidationException('User not found for the given refresh token');
            }
            if (clientType === ClientType.WEB) res.clearCookie(this.refreshTokenName);
            return await this.login(userFetch as ISanitizedUser, res, decodedRefreshToken.deviceId, clientType);
        } catch (error: any) {
            if (error instanceof AppException) throw error;
            if (error?.name === 'TokenExpiredError') throw new UnauthorizedException('Refresh token has expired');
            if (error?.name === 'JsonWebTokenError') throw new UnauthorizedException('Invalid refresh token');
            throw new InternalServerException(`Failed to refresh token: ${error.message}`);
        }
    }

    // Google login flow:
    async googleLogin(googleUser: GoogleUser, res: Response, deviceId: string) {
        try {
            return await this.googleService.login(googleUser, res, deviceId);
        } catch (error) {
            throw new InternalServerException(`Failed to login with Google: ${(error as Error).message}`);
        }
    }

    async logout(user: ISanitizedUser, refreshToken: string, res: Response, clientType: ClientType) {
        try {
            return await this.tokenService.logout(user.id, refreshToken, res, clientType);
        } catch (error: any) {
            throw new InternalServerException(`Failed to logout user: ${error.message}`);
        }
    }

    async logoutAll(user: ISanitizedUser, res: Response, clientType: ClientType) {
        try {
            return await this.tokenService.logoutAll(user.id, res, clientType);
        } catch (error: any) {
            throw new InternalServerException(`Failed to logout user from all sessions: ${error.message}`);
        }
    }
}
