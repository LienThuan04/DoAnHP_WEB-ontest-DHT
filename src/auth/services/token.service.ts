import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from '@/session/session.service';
import { Response } from 'express';
import { ValidationException } from '@/common/exceptions/app.exception';
import { CookieSameSite } from '@/common/enums/cookie-same-site.enum';
import { ClientType } from '@/common/enums/client-type.enum';
import ms from 'ms';
import type { ISanitizedUser, ILoginResult } from '@/auth/interfaces/auth.types';
import type { ITokenService } from '@/auth/interfaces/auth.service.interface';
import { sanitizeUser } from '@/auth/helpers/sanitize.helper';

@Injectable()
export class TokenService implements ITokenService {
    private readonly refreshTokenName: string;
    private readonly expiresInRefresh: string;
    private readonly refreshTokenSecret: string;
    private readonly cookieSameSite: CookieSameSite;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
    ) {
        this.refreshTokenName = this.configService.get('NAME_COOKIE_REFRESH_TOKEN_BROWSER')!;
        this.expiresInRefresh = this.configService.get('JWT_REFRESH_EXPIRE')!;
        this.refreshTokenSecret = this.configService.get('JWT_REFRESH_TOKEN_SECRET')!;
        if (!this.refreshTokenName || this.refreshTokenName.trim() === '') {
            throw new Error('Refresh token cookie name is not defined in environment variables');
        }
        if (!this.expiresInRefresh || this.expiresInRefresh.trim() === '') {
            throw new Error('JWT_REFRESH_EXPIRE is not defined in environment variables');
        }
        if (!this.refreshTokenSecret || this.refreshTokenSecret.trim() === '') {
            throw new Error('JWT_REFRESH_TOKEN_SECRET is not defined in environment variables');
        }
        this.cookieSameSite = CookieSameSite.LAX;
    }

    private async generateRefreshToken(payload: { userId: string; _sub: { roleName: string; email: string }; deviceId: string }): Promise<string> {
        const expiresInMs = ms(this.expiresInRefresh as ms.StringValue) / 1000;
        return this.jwtService.sign(payload, { expiresIn: expiresInMs, secret: this.refreshTokenSecret });
    }

    async login(user: ISanitizedUser, res: Response, deviceId: string, clientType: ClientType = ClientType.WEB): Promise<ILoginResult> {
        const refreshToken = await this.generateRefreshToken({
            userId: user.id,
            _sub: {
                roleName: user.roleName,
                email: user.email
            },
            deviceId
        });

        const setSessionDB = await this.sessionService.upsertSession({ userId: user.id, refreshToken, deviceId });
        if (!setSessionDB) {
            throw new ValidationException('Failed to create session for the user');
        }

        if (clientType === ClientType.WEB) {
            res.cookie(this.refreshTokenName, refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: this.cookieSameSite,
                maxAge: ms(this.expiresInRefresh as ms.StringValue)
            });
        }

        const payload = sanitizeUser(user);
        const result: ILoginResult = { accessToken: this.jwtService.sign(payload), user: payload };
        if (clientType === ClientType.MOBILE) {
            result.refreshToken = refreshToken;
        }
        return result;
    }

    async logout(userId: string, refreshToken: string, res: Response, clientType: ClientType = ClientType.WEB): Promise<boolean> {
        const decodedRefreshToken = this.jwtService.verify(refreshToken, { secret: this.refreshTokenSecret });
        if (!decodedRefreshToken || typeof decodedRefreshToken === 'string' || !decodedRefreshToken.userId ||
            !decodedRefreshToken._sub || !decodedRefreshToken.deviceId || typeof decodedRefreshToken.userId !== 'string' ||
            typeof decodedRefreshToken._sub !== 'object' || typeof decodedRefreshToken._sub.email !== 'string' ||
            typeof decodedRefreshToken._sub.roleName !== 'string' || typeof decodedRefreshToken.deviceId !== 'string'
        ) {
            console.error('Decoded refresh token payload is invalid:', decodedRefreshToken);
            throw new ValidationException('Invalid refresh token payload');
        }
        if (decodedRefreshToken.userId !== userId) {
            throw new ValidationException('Token does not belong to this user');
        }
        const result = await this.sessionService.deleteSessionByDeviceId(userId, decodedRefreshToken.deviceId);
        if (!result) {
            throw new ValidationException('Failed to delete session');
        }
        if (clientType === ClientType.WEB) {
            res.clearCookie(this.refreshTokenName, {
                httpOnly: true,
                secure: true,
                sameSite: this.cookieSameSite
            });
        }
        return result;
    }

    async logoutAll(userId: string, res: Response, clientType: ClientType = ClientType.WEB): Promise<boolean> {
        const result = await this.sessionService.deleteSessionsByUserId(userId);
        if (!result) {
            throw new ValidationException('Failed to delete sessions');
        }
        if (clientType === ClientType.WEB) {
            res.clearCookie(this.refreshTokenName);
        }
        return result;
    }

}