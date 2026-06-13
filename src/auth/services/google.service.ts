import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { TokenService } from '@/auth/services/token.service';
import { GoogleUser } from '@/auth/passport/google/google-user.interface';
import { ConflictException, NotFoundException } from '@/common/exceptions/app.exception';
import { AccountType } from '@/common/enums/account-type.enum';
import { Response } from 'express';
import type { ISanitizedUser } from '@/auth/interfaces/auth.types';
import type { IGoogleService } from '@/auth/interfaces/auth.service.interface';

@Injectable()
export class GoogleService implements IGoogleService {
    private readonly defaultRoleName: string;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService,
    ) {
        this.defaultRoleName = this.configService.get('NAME_ROLE_USER')!;
        if (!this.defaultRoleName) {
            throw new Error('Default role name is not defined in environment variables');
        }
    }

    async login(googleUser: GoogleUser, res: Response, deviceId: string) {
        let user = await this.prismaService.user.findUnique({
            where: { email: googleUser.email },
            include: { role: { select: { roleName: true } } },
        });

        if (user && user.accountType === AccountType.LOCAL) {
            throw new ConflictException('This email is already associated with a local account. Please sign in using your email and password instead of Google Login.');
        }

        if (!user) {
            user = await this.createGoogleUser(googleUser);
        }
        //conver type user tu prisma thanh ISanitizedUser de truyen vao tokenService.login
        const sanitizedUser = {
            ...user,
            roleName: user.role?.roleName ?? null,
        } as ISanitizedUser;

        return this.tokenService.login(sanitizedUser, res, deviceId);
    }

    private async createGoogleUser(googleUser: GoogleUser) {
        const defaultRole = await this.prismaService.role.findUnique({
            where: { roleName: this.defaultRoleName },
        });
        if (!defaultRole) throw new NotFoundException('Default role not found');

        const baseUsername = googleUser.email.split('@')[0];
        const username = `${baseUsername}_${Date.now()}`;

        return this.prismaService.user.create({
            data: {
                email: googleUser.email,
                userName: username,
                googleId: googleUser.googleId,
                accountType: AccountType.GOOGLE,
                avatarUrl: googleUser.avatarUrl,
                roleId: defaultRole.id,
                password: null,
            },
            include: { role: { select: { roleName: true } } },
        });
    }
}