import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { comparePassword, generatePasswordHash } from '@/lib/bcrypt/bcrypt';
import { generateNumericOtp } from '@/common/otp/generate-otp';
import { ConflictException } from '@/common/exceptions/app.exception';
import ms from 'ms';
import type { IOtpService } from '@/auth/interfaces/auth.service.interface';
import type { IOtpGenerationResult } from '@/auth/interfaces/auth.types';

@Injectable()
export class OtpService implements IOtpService {
    private readonly saltRounds: number;
    private readonly otpExpire: string;
    private readonly otpLength: number;
    private readonly otpMaxAttempts: number;
    private readonly otpResendCooldown: string;

    constructor(private readonly configService: ConfigService) {
        this.saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS') || '10');
        this.otpExpire = this.configService.get('OTP_EXPIRE')!;
        this.otpLength = Number(this.configService.get('OTP_LENGTH'));
        this.otpMaxAttempts = Number(this.configService.get('OTP_MAX_ATTEMPTS'));
        this.otpResendCooldown = this.configService.get('OTP_RESEND_COOLDOWN')!;

        if (!this.otpExpire?.trim()) throw new Error('OTP_EXPIRE is not defined');
        if (!Number.isInteger(this.otpLength) || this.otpLength < 6) throw new Error('OTP_LENGTH must be an integer >= 6');
        if (!Number.isInteger(this.otpMaxAttempts) || this.otpMaxAttempts <= 0) throw new Error('OTP_MAX_ATTEMPTS must be a positive integer');
        if (!this.otpResendCooldown?.trim()) throw new Error('OTP_RESEND_COOLDOWN is not defined');
    }

    async generate(): Promise<IOtpGenerationResult> {
        const otp = generateNumericOtp(this.otpLength);
        const otpHash = await generatePasswordHash(otp, this.saltRounds);
        return {
            otp,
            otpHash,
            otpExpiresAt: new Date(Date.now() + ms(this.otpExpire as ms.StringValue)),
            resendAfter: new Date(Date.now() + ms(this.otpResendCooldown as ms.StringValue)),
        };
    }

    // Validate OTP format — throws if wrong length
    assertFormat(otp: string): void {
        if (otp.length !== this.otpLength) {
            throw new ConflictException(`OTP must be exactly ${this.otpLength} digits`);
        }
    }

    // Check cooldown from a Date value — throws if still in cooldown window
    assertNoCooldown(resendAfter: Date | null | undefined): void {
        const now = new Date();
        if (resendAfter && resendAfter > now) {
            const remaining = Math.ceil((resendAfter.getTime() - now.getTime()) / 1000);
            throw new ConflictException(`Please wait ${remaining} seconds before requesting a new OTP.`);
        }
    }

    /**
     * Verify an OTP against a stored record. Pure logic — no DB access.
     * The caller provides two callbacks to handle DB side effects:
     *
     * @param onCleanup          — called when expired or locked: should DELETE the pending record
     * @param onIncrementAttempt — called on wrong OTP: should INCREMENT attemptCount and return the new value
     */
    async verify(
        otp: string,
        record: { otpHash: string; otpExpiresAt: Date; attemptCount: number },
        onCleanup: () => Promise<void>,
        onIncrementAttempt: () => Promise<number>,
    ): Promise<void> {
        this.assertFormat(otp);

        if (record.otpExpiresAt <= new Date()) {
            await onCleanup();
            throw new ConflictException('OTP has expired');
        }

        if (record.attemptCount >= this.otpMaxAttempts) {
            await onCleanup();
            throw new ConflictException('Too many incorrect attempts. Please request a new OTP.');
        }

        const isValid = await comparePassword(otp, record.otpHash);
        if (!isValid) {
            const newCount = await onIncrementAttempt();
            const remaining = this.otpMaxAttempts - newCount;
            if (remaining <= 0) {
                await onCleanup();
                throw new ConflictException('OTP has been locked due to too many incorrect attempts.');
            }
            throw new ConflictException(`Invalid OTP. You have ${remaining} attempt(s) remaining.`);
        }
    }
}
