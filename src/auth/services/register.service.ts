import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import { EmailService } from '@/email/email.service';
import { RegisterDto, VerifyRegisterOtpDto } from '@/auth/dto/create-auth.dto';
import { generatePasswordHash } from '@/lib/bcrypt/bcrypt';
import { ConflictException, NotFoundException } from '@/common/exceptions/app.exception';
import { AccountType } from '@/common/enums/account-type.enum';
import { OtpService } from '@/auth/services/otp.service';
import type { ISanitizedUser } from '@/auth/interfaces/auth.types';
import type { IRegisterService } from '@/auth/interfaces/auth.service.interface';
import { sanitizeUser } from '@/auth/helpers/sanitize.helper';

@Injectable()
export class RegisterService implements IRegisterService {
    private readonly defaultRoleName: string;
    private readonly saltRounds: number;
    private readonly otpExpire: string;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly emailService: EmailService,
        private readonly otpService: OtpService,
    ) {
        this.saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS') || '10');
        this.defaultRoleName = this.configService.get('NAME_ROLE_USER')!;
        this.otpExpire = this.configService.get('OTP_EXPIRE')!;

        if (!this.defaultRoleName) throw new Error('Default role name is not defined');
        if (!this.otpExpire?.trim()) throw new Error('OTP_EXPIRE is not defined');
    }

    async register(dto: RegisterDto): Promise<{ otpExpire: string }> {
        const { userName, email, password } = dto;
        const now = new Date();

        // Block if email or username already in user table
        const existed = await this.usersService.checkEmailOrUsernameExists(email, userName);
        if (existed.exists) throw new ConflictException(`${existed.field} already exists`);

        // Fetch any existing pending records for this email and username in parallel
        const [pendingByEmail, pendingByUsername] = await Promise.all([
            this.prismaService.pendingRegistration.findUnique({ where: { email } }),
            this.prismaService.pendingRegistration.findUnique({ where: { userName } }),
        ]);

        // Handle existing pending for this email
        if (pendingByEmail) {
            if (pendingByEmail.otpExpiresAt > now) {
                // Still active — enforce cooldown
                this.otpService.assertNoCooldown(pendingByEmail.resendAfter);
            } else {
                // Expired — clean it up so we can create a fresh one
                await this.prismaService.pendingRegistration.delete({ where: { email } });
            }
        }

        // Handle a different pending that is occupying the same username
        if (pendingByUsername && pendingByUsername.email !== email) {
            if (pendingByUsername.otpExpiresAt > now) {
                this.otpService.assertNoCooldown(pendingByUsername.resendAfter);
                // Still within cooldown — username is temporarily taken
                const remaining = pendingByUsername.resendAfter
                    ? Math.ceil((pendingByUsername.resendAfter.getTime() - now.getTime()) / 1000)
                    : 0;
                if (remaining > 0) {
                    throw new ConflictException(`Username "${userName}" is temporarily taken. Please try again after ${remaining} seconds.`);
                }
            }
            // Expired or cooldown passed — free the username
            await this.prismaService.pendingRegistration.delete({ where: { email: pendingByUsername.email } });
        }

        // Create / refresh the pending record
        const passwordHash = await generatePasswordHash(password, this.saltRounds);
        const { otp, otpHash, otpExpiresAt, resendAfter } = await this.otpService.generate();

        await this.prismaService.pendingRegistration.upsert({
            where: { email },
            update: { userName, passwordHash, otpHash, otpExpiresAt, attemptCount: 0, resendAfter },
            create: { email, userName, passwordHash, otpHash, otpExpiresAt, attemptCount: 0, resendAfter },
        });

        try {
            await this.emailService.sendRegisterOtp(email, userName, otp, this.otpExpire);
        } catch {
            await this.prismaService.pendingRegistration.deleteMany({ where: { email } });
            throw new ConflictException('Failed to send OTP email. Please try again.');
        }

        return { otpExpire: this.otpExpire };
    }

    async verifyOtp(dto: VerifyRegisterOtpDto): Promise<ISanitizedUser> {
        const { email, otp } = dto;

        const pending = await this.prismaService.pendingRegistration.findUnique({ where: { email } });
        if (!pending) throw new ConflictException('No pending registration found for this email');

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

        // Guard: ensure no race condition created a user between OTP send and verify
        const existingUser = await this.prismaService.user.findFirst({
            where: { OR: [{ email: pending.email }, { userName: pending.userName }] },
        });
        if (existingUser) throw new ConflictException('User already exists with this email or username');

        const defaultRole = await this.prismaService.role.findUnique({ where: { roleName: this.defaultRoleName } });
        if (!defaultRole) throw new NotFoundException('Default role not found');

        const createdUser = await this.prismaService.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: pending.email,
                    userName: pending.userName,
                    password: pending.passwordHash,
                    roleId: defaultRole.id,
                    accountType: AccountType.LOCAL,
                },
            });
            await tx.pendingRegistration.delete({ where: { email: pending.email } });
            return user;
        });

        return sanitizeUser({ ...createdUser, roleName: this.defaultRoleName } as ISanitizedUser);
    }

    async resendOtp(email: string): Promise<{ otpExpire: string }> {
        const pending = await this.prismaService.pendingRegistration.findUnique({ where: { email } });
        if (!pending) throw new ConflictException('No pending registration found. Please register first.');

        if (pending.otpExpiresAt <= new Date()) {
            await this.prismaService.pendingRegistration.delete({ where: { email } });
            throw new ConflictException('OTP has expired. Please register again.');
        }

        this.otpService.assertNoCooldown(pending.resendAfter);

        const { otp, otpHash, otpExpiresAt, resendAfter } = await this.otpService.generate();

        const updated = await this.prismaService.pendingRegistration.update({
            where: { email },
            data: { otpHash, otpExpiresAt, resendAfter, attemptCount: 0 },
        });

        await this.emailService.sendRegisterOtp(email, updated.userName, otp, this.otpExpire);

        return { otpExpire: this.otpExpire };
    }
}
