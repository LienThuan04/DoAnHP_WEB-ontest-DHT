import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { SeedDbModule } from '@/seed-db/seed-db.module';
import { EmailModule } from '@/email/email.module';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { JwtAuthGuard } from '@/lib/passport/jwt-auth.guard';
import { PermissionsGuard } from '@/lib/passport/permissions.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnvConfigModule } from '@/core/env-config.module';
import { ThrottlerConfigModule } from '@/core/throttler-config.module';
import { ExamAuthModule } from '@/exam-auth/exam-auth.module';
import { PagesModule } from '@/pages/pages.module';
import { RolesModule } from '@/roles/roles.module';
import { AccountModule } from '@/account/account.module';
import { UsersModule } from '@/users/users.module';
import { AcademicYearsModule } from '@/academic-years/academic-years.module';
import { SubjectsModule } from '@/subjects/subjects.module';
import { QuestionsModule } from '@/questions/questions.module';
import { ExamsModule } from '@/exams/exams.module';

/**
 * Hệ thi OnTest là stack DUY NHẤT. Bộ khung demo (users/role/session/auth/files
 * + model User/Role/Session) đã được gỡ; chỉ giữ HẠ TẦNG tái dùng:
 * prisma, common (interceptor/filter/guard), config/core, lib, email, seed-db.
 * Nghiệp vụ hệ thi nằm ở: exam-auth, roles, account, pages, users,
 * academic-years, subjects (+ phase sau).
 */
@Module({
  imports: [
    EnvConfigModule,
    PrismaModule,
    SeedDbModule,
    EmailModule,
    ThrottlerConfigModule,
    ExamAuthModule, PagesModule, RolesModule, AccountModule, UsersModule,
    AcademicYearsModule, SubjectsModule, QuestionsModule, ExamsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
