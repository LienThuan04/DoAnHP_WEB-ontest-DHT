import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { OtpService } from '@/auth/services/otp.service';
import { VerifyEmailDto, ChangePasswordVerifyDto, ResetPasswordDto } from '@/auth/dto/create-auth.dto';
import { generatePasswordHash } from '@/lib/bcrypt/bcrypt';
import { ConflictException, NotFoundException, ValidationException } from '@/common/exceptions/app.exception';
import { AccountType } from '@/common/enums/account-type.enum';
import { ClientType } from '@/common/enums/client-type.enum';
import type { ISanitizedUser, IPasswordResetResult } from '@/auth/interfaces/auth.types';
import type { IPasswordService } from '@/auth/interfaces/auth.service.interface';
import { sanitizeUser } from '@/auth/helpers/sanitize.helper';
import { CookieSameSite } from '@/common/enums/cookie-same-site.enum';
import type { Response } from 'express';
import ms from 'ms';

interface IPasswordResetJwtPayload {
    email: string;
    purpose: 'password-reset';
    iat?: number;
    exp?: number;
}

@Injectable()
export class PasswordService implements IPasswordService {
    private readonly saltRounds: number;
    private readonly otpExpire: string;
    private readonly resetTokenSecret: string;
    private readonly resetTokenExpire: string;
    private readonly resetPassNameToken: string;
    private readonly cookieSameSite: CookieSameSite;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly otpService: OtpService,
        private readonly jwtService: JwtService,
    ) {
        this.saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS') || '10');
        this.otpExpire = this.configService.get('OTP_EXPIRE')!;
        this.resetTokenSecret = this.configService.get('JWT_PASSWORD_RESET_SECRET')!;
        this.resetTokenExpire = this.configService.get('PASSWORD_RESET_EXPIRE') || '10m';
        this.resetPassNameToken = this.configService.get('NAME_COOKIE_RESET_PASS_TOKEN')!;
        this.cookieSameSite = CookieSameSite.LAX;

        if (!this.otpExpire || this.otpExpire.trim() === '') {
            throw new Error('OTP_EXPIRE is not defined in environment variables');
        }
        if (!this.resetTokenSecret || this.resetTokenSecret.trim() === '') {
            throw new Error('JWT_PASSWORD_RESET_SECRET is not defined in environment variables');
        }
        if (!this.resetPassNameToken || this.resetPassNameToken.trim() === '') {
            throw new Error('NAME_COOKIE_RESET_PASS_TOKEN is not defined in environment variables');
        }
    }

    async sendOtp(dto: VerifyEmailDto): Promise<{ otpExpire: string }> {
        const { email } = dto;

        // Fetch pending first to check cooldown (avoids a separate query)
        const [pending, user] = await Promise.all([
            this.prismaService.pendingRegistration.findUnique({ where: { email } }),
            this.prismaService.user.findUnique({ where: { email } }),
        ]);

        this.otpService.assertNoCooldown(pending?.resendAfter);

        if (!user) return { otpExpire: this.otpExpire };

        if (user.accountType !== AccountType.LOCAL) {
            throw new ConflictException('Password reset is only available for local accounts. Please use Google login for your account.');
        }

        const { otp, otpHash, otpExpiresAt, resendAfter } = await this.otpService.generate();

        await this.prismaService.pendingRegistration.upsert({
            where: { email },
            update: { userName: user.userName, otpHash, otpExpiresAt, attemptCount: 0, resendAfter, passwordHash: '' },
            create: { email, userName: user.userName, passwordHash: '', otpHash, otpExpiresAt, attemptCount: 0, resendAfter },
        });

        try {
            await this.emailService.sendRegisterOtp(email, user.userName, otp, this.otpExpire);
        } catch {
            await this.prismaService.pendingRegistration.deleteMany({ where: { email } });
            throw new ConflictException('Failed to send OTP email. Please try again.');
        }

        return { otpExpire: this.otpExpire };
    }

    // Step 2: verify OTP only — returns a short-lived JWT reset token
    async verifyOtp(res: Response, dto: ChangePasswordVerifyDto, clientType: ClientType = ClientType.WEB): Promise<IPasswordResetResult> {
        const { email, otp } = dto;

        const pending = await this.prismaService.pendingRegistration.findUnique({ where: { email } });
        if (!pending) throw new ConflictException('No OTP request found for this email. Please request a new OTP.');

        await this.otpService.verify(
            otp,
            pending,
            () => this.prismaService.pendingRegistration.delete({ where: { email } }).then(() => {}),
            async () => {
                const updated = await this.prismaService.pendingRegistration.update({
                    where: { email },
                    data: { attemptCount: { increment: 1 } },
                });
                return updated.attemptCount;
            },
        );

        // OTP consumed — delete pending
        await this.prismaService.pendingRegistration.deleteMany({ where: { email } });

        const expiresInSeconds = ms(this.resetTokenExpire as ms.StringValue) / 1000;
        const resetPassToken = this.jwtService.sign(
            { email, purpose: 'password-reset' } satisfies Omit<IPasswordResetJwtPayload, 'iat' | 'exp'>,
            { secret: this.resetTokenSecret, expiresIn: expiresInSeconds },
        );

        if (clientType === ClientType.WEB) {
            res.cookie(this.resetPassNameToken, resetPassToken, {
                httpOnly: true,
                secure: true,
                sameSite: this.cookieSameSite,
                maxAge: ms(this.resetTokenExpire as ms.StringValue)
            });
            return { expiresIn: this.resetTokenExpire };
        }

        return { expiresIn: this.resetTokenExpire, resetToken: resetPassToken };
    }

    // Step 3: use reset token to set the new password
    async resetPassword(resetToken: string, res: Response, dto: ResetPasswordDto, clientType: ClientType = ClientType.WEB): Promise<ISanitizedUser> {
        const { newPassword } = dto;
        let payload: IPasswordResetJwtPayload;

        try {
            payload = this.jwtService.verify<IPasswordResetJwtPayload>(resetToken, { secret: this.resetTokenSecret });
        } catch {
            throw new ConflictException('Reset token is invalid or has expired. Please request a new OTP.');
        }

        if (payload.purpose !== 'password-reset') {
            throw new ConflictException('Invalid reset token.');
        }

        const newPasswordHash = await generatePasswordHash(newPassword, this.saltRounds);

        const user = await this.prismaService.user.findUnique({ where: { email: payload.email } });
        if (!user) {
            throw new NotFoundException('User not found.');
        }

        const updatedUser = await this.prismaService.user.update({
            where: { email: payload.email },
            data: { password: newPasswordHash },
            include: { role: { select: { roleName: true } } },
        });
        if (updatedUser) {
            // Invalidate all existing sessions (force logout from all devices)
            await this.prismaService.session.deleteMany({ where: { userId: updatedUser.id } });
            if (clientType === ClientType.WEB) {
                res.clearCookie(this.resetPassNameToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: this.cookieSameSite
                });
            }
        } else {
            throw new ConflictException('Failed to reset password. Please try again.');
        }

        return sanitizeUser({
            ...updatedUser,
            roleName: updatedUser.role?.roleName ?? null,
        } as ISanitizedUser);
    }
}
