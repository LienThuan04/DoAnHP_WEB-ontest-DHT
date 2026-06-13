import { Module } from '@nestjs/common';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { SessionModule } from '@/session/session.module';
import { RoleModule } from '@/role/role.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ms from 'ms';
import { LocalStrategy } from '@/auth/passport/local.strategy';
import { JwtStrategy } from '@/auth/passport/jwt.strategy';
import { GoogleStrategy } from '@/auth/passport/google/google.strategy';
import { EmailModule } from '@/email/email.module';
import { TokenService } from '@/auth/services/token.service';
import { OtpService } from '@/auth/services/otp.service';
import { RegisterService } from '@/auth/services/register.service';
import { PasswordService } from '@/auth/services/password.service';
import { GoogleService } from '@/auth/services/google.service';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    SessionModule,
    RoleModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
        const expiresIn = configService.get<string>('JWT_ACCESS_EXPIRE');
        if (!secret || !expiresIn) {
          throw new Error('JWT secret or expiration configuration is missing in environment variables');
        }
        const expiresInMs: number = ms(expiresIn as ms.StringValue) / 1000; // Convert to seconds for JWT
        return {
          secret,
          signOptions: {
            expiresIn: expiresInMs
          }
        };
      },
      inject: [ConfigService], // Inject ConfigService to access environment variables
    }),
    EmailModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy, // Add LocalStrategy to providers so it can be used for validating user credentials during login
    JwtStrategy, // Add JwtStrategy to providers so it can be used globally or in specific routes to protect them with JWT authentication
    GoogleStrategy,
    // Other services like TokenService, GoogleService, PasswordService, RegisterService are provided in their respective modules, so we don't need to add them here
    TokenService,
    OtpService,
    RegisterService,
    PasswordService,
    GoogleService,
  ],
  exports: [AuthService]
})
export class AuthModule { }
