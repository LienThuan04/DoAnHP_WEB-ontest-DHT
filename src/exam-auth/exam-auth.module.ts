import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExamAuthController } from '@/exam-auth/exam-auth.controller';
import { ExamAuthService } from '@/exam-auth/exam-auth.service';
import { JwtStrategy } from '@/exam-auth/passport/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_ACCESS_EXPIRE') || '60m') as `${number}m`,
        },
      }),
    }),
  ],
  controllers: [ExamAuthController],
  providers: [ExamAuthService, JwtStrategy],
})
export class ExamAuthModule {}
