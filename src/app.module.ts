import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { SessionModule } from '@/session/session.module';
import { RoleModule } from '@/role/role.module';
import { SeedDbModule } from '@/seed-db/seed-db.module';
import { AuthModule } from '@/auth/auth.module';
import { FilesModule } from '@/files/files.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsModule } from '@/jobs/jobs.module';
import { EmailModule } from '@/email/email.module';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { JwtAuthGuard } from '@/lib/passport/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnvConfigModule } from '@/core/env-config.module';
import { ThrottlerConfigModule } from '@/core/throttler-config.module';

@Module({
  imports: [
    EnvConfigModule,
    UsersModule, PrismaModule, SessionModule, RoleModule,
    SeedDbModule,
    ScheduleModule.forRoot(),
    AuthModule, FilesModule, JobsModule, EmailModule,
    ThrottlerConfigModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
