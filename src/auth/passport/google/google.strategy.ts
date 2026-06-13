import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { GoogleUser } from '@/auth/passport/google/google-user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
    Strategy,
    'google',
) {
    constructor(
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
            scope: ['email', 'profile'], // Add more scopes if needed
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<any> {
        const user: GoogleUser = {
            email: profile.emails?.[0]?.value || '',
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value || null,
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
        };

        done(null, user);
    }
}