import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { OtpService } from '@/auth/services/otp.service';
import { ConflictException, ValidationException } from '@/common/exceptions/app.exception';
import { RequestUpdateUserOtpDto } from '@/users/dto/update-user.dto';
import { toUserEntity } from '@/users/helpers/toUserEntity.helper';
import type { IUserUpdateOtpService } from '@/auth/interfaces/auth.service.interface';
import type { IUserUpdateOtpRequestResult } from '@/auth/interfaces/auth.types';
import ms from 'ms';

@Injectable()
export class UserUpdateOtpService implements IUserUpdateOtpService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        private readonly otpService: OtpService,
    ) {}

    /**
     * Bước 1: Nhận yêu cầu update, phân tích thay đổi và gửi OTP phù hợp.
     * 
     * Luồng xử lý:
     * - Chỉ description thay đổi → cập nhật ngay, không OTP
     * - Email thay đổi → gửi OTP đến EMAIL MỚI
     * - Chỉ username thay đổi → gửi OTP đến EMAIL CŨ
     * 
     * @returns { changedFields, targetEmail } - thông tin để frontend hiển thị
     */
    async requestUpdate(userId: string, dto: RequestUpdateUserOtpDto): Promise<IUserUpdateOtpRequestResult> {
        // Lấy thông tin user hiện tại
        const currentUser = await this.prismaService.user.findUnique({
            where: { id: userId },
        });
        if (!currentUser) {
            throw new ValidationException('User not found');
        }

        // Phân tích xem có gì thay đổi
        const newEmail = dto.email !== undefined ? dto.email : undefined;
        const newUserName = dto.userName !== undefined ? dto.userName : undefined;
        const newDescription = dto.description !== undefined ? dto.description : undefined;

        // Google account: không cho đổi email và username
        if (currentUser.accountType === 'google' || currentUser.googleId) {
            if (newEmail && newEmail !== currentUser.email) {
                throw new ConflictException('Email cannot be changed for Google-authenticated accounts.');
            }
            if (newUserName && newUserName !== currentUser.userName) {
                throw new ConflictException('Username cannot be changed for Google-authenticated accounts.');
            }
        }

        // Xác định có gì thay đổi để đưa vào message và quyết định gửi OTP đến đâu
        const emailChanged = newEmail !== undefined && newEmail !== currentUser.email;
        const userNameChanged = newUserName !== undefined && newUserName !== currentUser.userName;
        const descriptionChanged = newDescription !== undefined && newDescription !== currentUser.description;

        const changes: string[] = [];
        if (emailChanged) changes.push(`Email: ${currentUser.email} → ${newEmail}`);
        if (userNameChanged) changes.push(`Username: ${currentUser.userName} → ${newUserName}`);
        if (descriptionChanged) changes.push('Description/Bio updated');

        // === TRƯỜNG HỢP 1: Chỉ description thay đổi → cập nhật ngay ===
        if (!emailChanged && !userNameChanged && descriptionChanged) {
            const updatedUser = await this.prismaService.user.update({
                where: { id: userId },
                data: { description: newDescription },
                include: { role: { select: { roleName: true } } },
            });
            return {
                skipOtp: true,
                message: 'Description updated successfully',
                data: toUserEntity(updatedUser),
            };
        }

        // === TRƯỜNG HỢP 2 & 3: Cần OTP ===
        if (!emailChanged && !userNameChanged && !descriptionChanged) {
            throw new ValidationException('No changes detected. Please provide at least one field to update.');
        }

        // Kiểm tra uniqueness nếu email hoặc username thay đổi
        if (emailChanged && newEmail) {
            const emailExists = await this.prismaService.user.findUnique({ where: { email: newEmail } });
            if (emailExists) {
                throw new ConflictException('Email already exists');
            }
        }
        if (userNameChanged && newUserName) {
            const usernameExists = await this.prismaService.user.findUnique({ where: { userName: newUserName } });
            if (usernameExists) {
                throw new ConflictException('Username already exists');
            }
        }

        if (emailChanged && currentUser.accountType === 'google') {
            throw new ConflictException('Email cannot be changed for Google-authenticated accounts.');
        }

        // Xác định email đích để gửi OTP:
        // - Nếu email thay đổi → gửi OTP đến EMAIL MỚI
        // - Nếu chỉ username thay đổi → gửi OTP đến EMAIL CŨ
        const targetEmail = emailChanged ? newEmail! : currentUser.email;

        // Kiểm tra cooldown (nếu có pending update cũ)
        const existingPending = await this.prismaService.pendingUserUpdate.findUnique({ where: { userId } });
        if (existingPending) {
            this.otpService.assertNoCooldown(existingPending.resendAfter);
            await this.prismaService.pendingUserUpdate.delete({ where: { userId } });
        }

        // Tạo OTP mới
        const { otp, otpHash, otpExpiresAt, resendAfter } = await this.otpService.generate();

        // Lưu pending update
        await this.prismaService.pendingUserUpdate.create({
            data: {
                userId,
                newEmail: emailChanged ? newEmail : undefined,
                newUserName: userNameChanged ? newUserName : undefined,
                newDescription: descriptionChanged ? newDescription : undefined,
                otpHash,
                otpExpiresAt,
                resendAfter,
            },
        });

        // Gửi OTP email
        const expireMs = ms(this.configService.get('OTP_EXPIRE')! as ms.StringValue);
        const expireText = `${Math.ceil(expireMs / 60000)} minute(s)`;

        await this.emailService.sendUpdateProfileOtp(
            targetEmail,
            currentUser.userName,
            otp,
            expireText,
            changes,
        );

        // Mask email for response
        const maskedEmail = targetEmail.replace(/(.{2}).*(@.*)/, '$1***$2');

        return {
            skipOtp: false,
            message: `OTP has been sent to ${maskedEmail}. Please verify to complete the update.`,
            data: {
                targetEmail: maskedEmail,
                changes,
            },
        };
    }

    /**
     * Bước 2: Xác nhận OTP và áp dụng thay đổi
     */
    async verifyAndApplyUpdate(userId: string, otp: string) {
        const pending = await this.prismaService.pendingUserUpdate.findUnique({ where: { userId } });
        if (!pending) throw new ValidationException('No pending update found. Please request an update first.');

        await this.otpService.verify(
            otp,
            pending,
            () => this.prismaService.pendingUserUpdate.delete({ where: { userId } }).then(() => {}),
            async () => {
                const updated = await this.prismaService.pendingUserUpdate.update({
                    where: { userId },
                    data: { attemptCount: { increment: 1 } },
                });
                return updated.attemptCount;
            },
        );

        // OTP đúng → áp dụng thay đổi
        const updateData: Record<string, string> = {};
        if (pending.newEmail) updateData.email = pending.newEmail;
        if (pending.newUserName) updateData.userName = pending.newUserName;
        if (pending.newDescription) updateData.description = pending.newDescription;

        const updatedUser = await this.prismaService.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userId },
                data: updateData,
                include: { role: { select: { roleName: true } } },
            });
            await tx.pendingUserUpdate.delete({ where: { userId } });
            return user;
        });

        return { message: 'Profile updated successfully', data: toUserEntity(updatedUser) };
    }
}
