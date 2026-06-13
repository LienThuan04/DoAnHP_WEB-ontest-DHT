<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).


# ![NOTE](https://img.shields.io/badge/NOTE-Important-orange) The library materials used for this project are below.

## Table of Contents

| # | Topic |
|---|---|
| [1](#1-use-prismaclient-with-db-on-cloud-consoleprismaio-for-nestjs) | Prisma with Cloud DB |
| [2](#2-configure-swagger-openapi-documentation-see-details-here) | Swagger OpenAPI Documentation |
| [3](#3-validate-the-data-we-need-to-load-additional-libraries-you-can-refer-to-here) | Validation with class-validator |
| [4](#4-add-debug-code-to-nestjs-with-visual-code) | Debug Configuration |
| [5](#5-set-up-authentication-users-for-the-nestjs-passport-library) | Passport Authentication Setup |
| [6](#6-debug-nestjs-with-visual-code) | Debug with VS Code launch.json |
| [7](#7-connect-with-supabase-storage-save-image-for-project) | Supabase Storage |
| [8](#8-login-with-passport-google-oauth20) | Google OAuth2 Login |
| [9](#9-send-email-with-nodemailer-and-ejs-template) | Email with Nodemailer + EJS |
| [10](#10-add-redis-cache-with-nestjs-and-prisma) | Redis Cache |
| [11](#11-password-reset-flow--forgot-password-with-otp) | Password Reset Flow (OTP) |
| [12](#12-app-configuration-global-prefix-uri-versioning-and-cors) | App Configuration (Prefix, Versioning, CORS) |
| [13](#13-global-exception-filter--custom-appexception) | Global Exception Filter |
| [14](#14-global-transform-interceptor--standardize-api-response) | Global Transform Interceptor |
| [15](#15-global-http-logging-interceptor) | HTTP Logging Interceptor |
| [16](#16-custom-route-decorators) | Custom Route Decorators |
| [17](#17-jwtauthguard--global-guard-with-admin-role-check) | JwtAuthGuard |
| [18](#18-jwt-token-system--access-token--refresh-token--session) | JWT Token System |
| [19](#19-session-management--device-limit) | Session Management (Device Limit) |
| [20](#20-cron-jobs--scheduled-tasks-with-nestjsschedule) | Cron Jobs |
| [21](#21-database-seeding--seed-initial-data-on-startup) | Database Seeding |
| [22](#22-otp-registration-flow--email-verified-registration) | OTP Registration Flow |
| [23](#23-otp-profile-update--change-email-or-username-with-otp) | OTP Profile Update |
| [24](#24-path-alias--absolute-import-configuration) | Path Alias `@/` |
| [25](#25-typescript-interfaces--complete-reference) | TypeScript Interfaces |
| [26](#26-rate-limiting--request-throttling-with-nestjsthrottler) | Rate Limiting (`@nestjs/throttler`) |

---

## 1 Use Prisma/client with DB on Cloud [console.prisma.io](https://console.prisma.io/) for NestJS

```bash
  npm install @prisma/client
  npx prisma init
```
- After installing and setting up Prisma, we proceed to retrieve the DATABASE_URL from this [page](https://console.prisma.io).
- Write the table structure for the database in the schema.prisma file, and then run the command below to generate the client code.
```bash
  npx prisma generate
```

- Now we create resources for the nest with services and modules using the command below.
```bash
  nest g module prisma
  nest g service prisma
```
- It will create two files, `prisma.module.ts` and `prisma.service.ts`, inside the prisma directory.
- In the `prisma.module.ts` file, write it according to the following structure below.
```bash
  import { Global, Module } from '@nestjs/common';
  import { PrismaService } from '@/prisma/prisma.service';

  @Global() // Make PrismaModule global so that PrismaService can be injected anywhere without needing to import PrismaModule
  @Module({
    imports: [],
    providers: [PrismaService],
    exports: [PrismaService], // Export PrismaService so it can be used in other modules that import PrismaModule
  })
  export class PrismaModule {}
```
- And the file `prisma.service.ts` is also written as follows.
```bash
  import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import {  } from '@prisma/client';
  import { PrismaClient } from '@prisma/client';

  @Injectable()
  export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
      constructor(
          private readonly configService: ConfigService
      ) {
          const databaseUrl = configService.get<string>('DATABASE_URL');
          if (!databaseUrl) {
              throw new Error('DATABASE_URL environment variable is not set. Please set it to your Prisma Data API URL !!!');
          }
          super({ accelerateUrl: databaseUrl });
      }
      
      private readonly logger = new Logger(PrismaService.name);

      async onModuleInit() {
          try {
              await this.$connect();
              this.logger.log('✅ Prisma connected to PostgreSQL successfully');
          } catch (error: any) {
              this.logger.error('❌ Prisma connection failed:', error);
              throw error;
          }
      }

      async onModuleDestroy() {
          await this.$disconnect();
          this.logger.log('✅ Prisma disconnected from PostgreSQL');
      }
  }
```

- If you want to connect PostgreSQL with DBeaver, follow the instructions below:
  ### - 1: After obtaining the Prisma connection URL like this: `postgres://<username>:<password>@db.prisma.io:5432/postgres?sslmode=require`
  ### - 2: In DBeaver, establish a connection with PostgreSQL, change Connect by from `Host` to `URL` and fill in the information below: ***jdbc:postgresql://***`db.prisma.io:5432/postgres?sslmode=require`
    - With `jdbc:postgresql://`: DBeaver uses the Java PostgreSQL driver, so the link starts with this.
    - And `db.prisma.io:5432/postgres?sslmode=require`: This is the component taken from after the @ symbol in the previously obtained prisma connect URL link.
  ### - 3: For the username and password sections, enter the key obtained from the Prisma URL above, following the tag formats mentioned earlier.

## 2 Configure Swagger OpenAPI Documentation, [see details here](https://docs.nestjs.com/openapi/introduction)
- Swagger file configuration
```bash
  import { NestExpressApplication } from '@nestjs/platform-express';
  import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

  //config swagger
  export default class ConfigSwagger {
      public static setup = (app: NestExpressApplication): void => {
          const config = new DocumentBuilder()
              .setTitle('ToDoList API')
              .setDescription('The ToDoList API description')
              .setVersion('1.0')
              .addBearerAuth({
                  type: 'http',
                  scheme: 'Bearer',
                  bearerFormat: 'JWT',
                  in: 'header',
              }, 'access-token')
              .addSecurityRequirements('access-token')
              .build();
          const documentFactory = () => SwaggerModule.createDocument(app, config);
          SwaggerModule.setup('swagger', app, documentFactory, { //route swagger http://localhost:3000/swagger
              swaggerOptions: {
                  persistAuthorization: true, //keep authorization token after refresh page and f5
              },
          });
      }
  }
```
- In the `main.ts` file, call the following function to use it.
```bash
  ConfigSwagger.setup(app);
```

## 3 `Validate` the data we need to load additional libraries (you can refer to [here](https://docs.nestjs.com/techniques/validation)):
```bash
  npm i --save class-validator class-transformer
```
- All details can be found [here](https://docs.nestjs.com/techniques/validation).
- To use the library, you need to declare it in `main.ts` as shown in the example below and format the message for BadRequestException:
```bash
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // automatically strip properties not defined in the DTO
        forbidNonWhitelisted: true, // throw an error if undeclared properties are present
        transform: true, // automatically transform payload into DTO class instances

        exceptionFactory: (errors) => { // factory for custom validation error responses
          // Format validation errors
          const formattedErrors = errors.map((error) => ({
            field: error.property, // the field that failed validation
            messages: Object.values(error.constraints || {}), // all error messages for that field
          }));
          throw new BadRequestException({ // return a structured error object
            statusCode: 400,
            message: 'Validation failed',
            errors: formattedErrors
          });
        },
      }),
    );
```

## 4 Add `debug` code to NestJS with visual code:
- Create a `launch.json` file of the `visual code` and modify the components as shown below:
```bash
 "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Nest Debug",
            "runtimeExecutable": "npm",
            "runtimeArgs": [
                "run",
                "start:debug",
                "--",
                "--inspect-brk"
            ],
            "console": "integratedTerminal",
            "restart": true,
            "protocol": "auto",
            "port": 9229,
            "autoAttachChildProcesses": true
        }
    ]
```

## 5 Set up authentication users for the [NestJS Passport](https://docs.nestjs.com/recipes/passport#authentication-requirements) library.

- We will create a resource for authentication.
```bash
  nest g resource auth
```

- Create the file auth/`local-auth.guard.ts`
```bash

  import { Injectable } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';

  @Injectable()
  export class LocalAuthGuard extends AuthGuard('local') {

  }
```

- Install the lib Passport for Project
```bash
  npm install --save @nestjs/passport passport passport-local ms cookie-parser @nestjs/jwt passport-jwt
  npm install --save-dev @types/passport-local @types/passport-jwt @types/ms @types/cookie-parser
```

- Add the following code to `main.ts`
```bash
    app.useGlobalGuards(new JwtAuthGuard(reflector)); 
    app.use(cookieParser());
```

## 6 Debug NestJS with Visual code
- Create a **.vscode** folder in the root directory and create a **`launch.json`** file in the **.vscode** folder with the content as shown below.
```bash
  {
      // Use IntelliSense to learn about possible attributes.
      // Hover to view descriptions of existing attributes.
      // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
      "version": "0.2.0",
      "configurations": [
          {
              "type": "node",
              "request": "launch",
              "name": "Nest Debug",
              "runtimeExecutable": "npm",
              "runtimeArgs": [
                  "run",
                  "start:debug",
                  "--",
                  "--inspect-brk"
              ],
              "console": "integratedTerminal",
              "restart": true,
              "protocol": "auto",
              "port": 9229,
              "autoAttachChildProcesses": true
          }
      ]
  }
```

## 7 Connect With Supabase Storage Save Image for project
- You need to download the Supabase library to be able to use it.
```bash
  npm i @supabase/supabase-js multer
  npm i -D @types/multer
```
- Next, go to the `Integrations` section in Supabase, select `Data API`, and copy the `API_URL` (excluding the components after `.co`) into your .env file using the `SUPABASE_URL` variable.

## 8 Login with Passport google oauth20
- First we need install two library
```bash
  npm install passport-google-oauth20
  npm install -D @types/passport-google-oauth20
```
- **Step 1: Obtain Google Credentials**

1. Access the Google Cloud Console (https://console.cloud.google.com/).

2. Create a new project or select an existing one.

3. Open APIs & Services > OAuth consent screen to set up the consent screen (Select External and fill in the required information).

4. Switch to the Credentials tab > Click Create Credentials > Select OAuth client ID.

5. Application type: Select Web application.

6. Authorized JavaScript origins: Add the frontend URL (e.g., `http://localhost:5173`).

7. Authorized redirect URIs: Add the backend callback URL. NOTE: Must include the full Global Prefix and Version (e.g., `http://localhost:3000/api/v1/auth/google/callback`).

8. Click **Create**, then copy the `Client ID` and `Client Secret`.

- **Step 2: Configure environment variables (.env)**
Open the `.env` file and fill in the parameters you just obtained:
```env
  GOOGLE_CLIENT_ID=paste_your_client_id_here
  GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
  GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

- **Step 3: Frontend Integration Instructions**
Because the backend requires a `deviceId` stored in a **cookie** at the callback function, the frontend must proactively create and store this cookie **before** redirecting to the Google login page.

Sample code for the "Login with Google" button in the frontend:

```javascript
  const handleGoogleLogin = () => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem('deviceId', deviceId);
        }

        document.cookie = `deviceId=${deviceId}; path=/; max-age=31536000`; // Store for 1 year

        window.location.href = "http://localhost:3000/api/v1/auth/google";
    };
```
- **Step 4: Set up login with google oauth20**
In the `passport` directory of the auth application, create a new folder named `google` and then create a file inside that folder with the name `google.strategy.ts` and use the sample code below!
```typescript
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
              scope: ['email', 'profile'],
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
              avatar: profile.photos?.[0]?.value || null,
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
          };

          done(null, user);
      }
  }
```
and create another file in the same directory with the name `google-user.interface.ts` with the sample code below!
```typescript
  export interface GoogleUser {
      email: string;
      googleId: string;
      avatar?: string | null;
      firstName?: string | null;
      lastName?: string | null;
  }
```
and another file, `google-auth.guard.ts`, in the lib/passport directory. with the sample code below!
```typescript
  import { Injectable } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';

  @Injectable()
  export class GoogleAuthGuard extends AuthGuard('google') { }
```

## 9 Send Email with Nodemailer and EJS Template

- First, install the required libraries:
```bash
  npm install nodemailer ejs
  npm install -D @types/nodemailer @types/ejs
```

- Create Email module using NestJS CLI:
```bash
  nest g module email
  nest g service email
  nest g controller email
```

- **Step 1: Create Email Module** (`email.module.ts`)

The module should look like this:

```typescript
  import { Module } from '@nestjs/common';
  import { EmailService } from './email.service';
  import { EmailController } from './email.controller';

  @Module({
    controllers: [EmailController],
    providers: [EmailService],
    exports: [EmailService], // Export so other modules can use it
  })
  export class EmailModule {}
```

- **Step 2: Create Email Service** (`email.service.ts`)

The service handles email sending with Nodemailer:

```typescript
  import { Injectable, Logger } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import nodemailer from 'nodemailer';
  import ejs from 'ejs';
  import path from 'path';

  @Injectable()
  export class EmailService {
      private readonly logger = new Logger(EmailService.name);
      private readonly transporter: nodemailer.Transporter;
      private readonly appName: string;
      private readonly supportEmail: string;
      private readonly fromEmail: string;

      constructor(private readonly configService: ConfigService) {
          const host = this.configService.get<string>('EMAIL_HOST');
          const port = Number(this.configService.get<string>('EMAIL_PORT') || '587');
          const authUser = this.configService.get<string>('EMAIL_AUTH_USER');
          const authPass = this.configService.get<string>('EMAIL_AUTH_PASS');
          this.fromEmail = this.configService.get<string>('EMAIL_FROM')!;
          this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL')!;
          this.appName = this.configService.get<string>('APP_NAME') || 'Project UMC';

          if (!host || !port || !authUser || !authPass || !this.fromEmail || !this.supportEmail) {
              throw new Error('Missing email configuration in environment variables');
          }

          this.transporter = nodemailer.createTransport({
              host,
              port,
              secure: false, // true for 465, false for other ports
              auth: {
                  user: authUser,
                  pass: authPass,
              },
          });
      }

      // Send OTP verification email
      async sendRegisterOtp(
          email: string,
          userName: string,
          otp: string,
          expireText: string,
      ): Promise<void> {
          const templatePath = path.join(
              process.cwd(),
              'src',
              'email',
              'templates',
              'register-otp.ejs',
          );
          
          // Render EJS template with data
          const html = await ejs.renderFile(templatePath, {
              appName: this.appName,
              supportEmail: this.supportEmail,
              userName,
              otp,
              expireText,
          });

          const info = await this.transporter.sendMail({
              from: this.fromEmail,
              to: email,
              subject: `${this.appName} - OTP Verification`,
              html,
          });

          this.logger.log(`OTP email sent successfully: ${info.messageId}`);
      }

      // Send test email (for verifying SMTP setup)
      async sendTestEmail(toEmail: string): Promise<void> {
          const info = await this.transporter.sendMail({
              from: this.fromEmail,
              to: toEmail,
              subject: `${this.appName} - Test Email`,
              html: `
                <div style="font-family:Arial,sans-serif;padding:24px">
                  <h2>Test email sent successfully</h2>
                  <p>If you received this email, your SMTP setup is working.</p>
                </div>
              `,
          });

          this.logger.log(`Test email sent successfully: ${info.messageId}`);
      }
  }
```

- **Step 3: Add Environment Variables** (`.env`)

Add these configurations for email service:

```env
  EMAIL_HOST="smtp.gmail.com"
  EMAIL_PORT=587
  EMAIL_AUTH_USER="your_email@gmail.com"
  EMAIL_AUTH_PASS="your_app_password"  # NOT your regular Gmail password
  EMAIL_FROM="Project UMC <your_email@gmail.com>"
  SUPPORT_EMAIL="support@yourdomain.com"
  APP_NAME="Project UMC"
```

**To get Gmail App Password:**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable `2-Step Verification`
3. Find `App passwords`
4. Select "Mail" and "Windows Computer" (or your OS)
5. Copy the generated password to `EMAIL_AUTH_PASS`

- **Step 4: Create DTOs** (`email/dto/create-email.dto.ts`)

```typescript
  import { ApiProperty } from '@nestjs/swagger';
  import { IsEmail, IsNotEmpty } from 'class-validator';

  export class SendEmailDto {
    @ApiProperty({ description: 'Email address to receive test email', example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    toEmail!: string;
  }

  export class TestSendRegisterOtpDto {
    @ApiProperty({ description: 'User email', example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ description: 'Username', example: 'John Doe' })
    @IsNotEmpty()
    userName!: string;

    @ApiProperty({ description: 'OTP code', example: '123456' })
    @IsNotEmpty()
    otp!: string;

    @ApiProperty({ description: 'Expiration message', example: 'Code expires in 10 minutes' })
    @IsNotEmpty()
    expireText!: string;
  }
```

- **Step 5: Create Email Controller** (`email.controller.ts`)

```typescript
  import { Body, Controller, Post } from '@nestjs/common';
  import { EmailService } from './email.service';
  import { Public } from '@/lib/decorator/metadata';
  import { ApiOperation } from '@nestjs/swagger';
  import { SendEmailDto, TestSendRegisterOtpDto } from './dto/create-email.dto';

  @Controller('email')
  export class EmailController {
      constructor(private readonly emailService: EmailService) {}

      @Public()
      @ApiOperation({ summary: 'Send a test email to verify email configuration' })
      @Post('test-email')
      async testEmail(@Body() body: SendEmailDto) {
          await this.emailService.sendTestEmail(body.toEmail);
          return { message: 'Test email sent successfully' };
      }

      @Public()
      @ApiOperation({ summary: 'Send a registration OTP email to a user' })
      @Post('send-register-otp')
      async sendRegisterOtp(@Body() body: TestSendRegisterOtpDto) {
          await this.emailService.sendRegisterOtp(
              body.email,
              body.userName,
              body.otp,
              body.expireText,
          );
          return { message: 'Registration OTP email sent successfully' };
      }
  }
```

- **Step 6: Create EJS Email Template** (`email/templates/register-otp.ejs`)
Create a folder named `email/templates/` and add the HTML email template, such as the register-otp.ejs file in the GitHub source.

- **Step 7: Use Email Service in Auth Module**
In your `auth.service.ts`, inject and use the EmailService:

```typescript
  import { EmailService } from '@/email/email.service';

  @Injectable()
  export class AuthService {
      constructor(
          private readonly emailService: EmailService,
          // ... other dependencies
      ) {}

      async register(registerDto: RegisterDto): Promise<any> {
          // Your registration logic...

          // Generate OTP
          const otp = generateNumericOtp(6);
          const expireTime = ms(this.otpExpire) / 1000 / 60; // Convert to minutes

          // Send OTP email
          await this.emailService.sendRegisterOtp(
              registerDto.email,
              registerDto.userName,
              otp,
              `OTP expires in ${expireTime} minutes`,
          );

          // Rest of your logic...
      }
  }
```

- **Step 8: Test Email Configuration**

Use Swagger or Postman to test:

```http
  POST /api/v1/email/test-email
  Content-Type: application/json

  {
      "toEmail": "your_email@gmail.com"
  }
```

Expected response:
```json
  {
      "message": "Test email sent successfully"
  }
```

- **Step 9: Creating Custom Email Templates**

To create additional email templates:

1. Create new `.ejs` file in `email/templates/`:
   ```bash
     email/templates/
     ├── register-otp.ejs          # OTP verification
     ├── password-reset.ejs        # Password reset (example)
     └── welcome.ejs               # Welcome email (example)
   ```

2. Add method in `EmailService`:
   ```typescript
     async sendPasswordReset(email: string, resetLink: string): Promise<void> {
         const templatePath = path.join(
             process.cwd(),
             'src',
             'email',
             'templates',
             'password-reset.ejs',
         );

         const html = await ejs.renderFile(templatePath, {
             appName: this.appName,
             supportEmail: this.supportEmail,
             resetLink,
         });

         await this.transporter.sendMail({
             from: this.fromEmail,
             to: email,
             subject: `${this.appName} - Reset Your Password`,
             html,
         });
     }
   ```

3. Call in appropriate service (e.g., AuthService for password reset)

- **Step 10: Email Module Import**

Make sure EmailModule is imported in `app.module.ts`:

```typescript
  import { EmailModule } from '@/email/email.module';

  @Module({
    imports: [
      // ... other modules
      EmailModule,
    ],
  })
  export class AppModule {}
```

**Key Points:**

- Email service uses Nodemailer for SMTP configuration
- EJS templates allow dynamic content injection
- OTP emails include expiration time and support contact
- Test email endpoint helps verify SMTP setup
- Templates follow Apple-style email design for better appearance
- Service is exported from module for use in other modules
- All email methods are logged for debugging

## 10 Add Redis Cache with NestJS and Prisma
- With redis I will use serverless database service from Upstash, you can create a Redis database on Upstash and get the connection URL to use in your NestJS application.
- First, install the required libraries:
```bash
  pnpm i @upstash/redis
  pnpm add -D @types/jest
```
- Create a new module for Redis:
```bash
  nest g module redis
  nest g service redis
```

- Testing for project, we need to install some libraries:
```bash
  pnpm add -D @types/jest
```
and setup tsconfig for testing in `tsconfig.json`:
```json
  {
    "compilerOptions": {
      // ... other options
      "types": ["jest", "node"]
    }
  }
```

## 11 Password Reset Flow — Forgot Password with OTP

### Current Implementation (JWT Reset Token in httpOnly Cookie)

After OTP verification, the server signs a short-lived JWT reset token and stores it in an **httpOnly cookie** rather than returning it in the response body.
The reset step only requires `newPassword` in the body — the token is read from the cookie automatically.

```
POST /auth/change-password/send-otp
  Body: { email }
  → Sends OTP to email. Returns: { otpExpire }

POST /auth/change-password/verify-otp
  Body: { email, otp }
  → Verifies OTP. Sets httpOnly cookie 'resetPassToken'. Returns: { expiresIn }
    Cookie contains a JWT signed with JWT_PASSWORD_RESET_SECRET, expires after PASSWORD_RESET_EXPIRE (default 10m)
    Browser automatically sends this cookie on the next /reset request

POST /auth/change-password/reset
  Cookie: [NAME_COOKIE_RESET_PASS_TOKEN] (httpOnly, sent automatically by browser)
  Body: { newPassword }
  → Reads JWT from cookie, verifies it, sets new password, invalidates all sessions, clears cookie
  → Returns: user info (ISanitizedUser)
```

**Required env vars:**
```env
JWT_PASSWORD_RESET_SECRET="your_secret_here"
NAME_COOKIE_RESET_PASS_TOKEN="resetPassToken"
PASSWORD_RESET_EXPIRE="10m"
```

**Notes:** Token stored in httpOnly cookie → not accessible by JS (XSS-safe).
On successful password change, all active sessions are deleted (force logout from all devices) and the cookie is cleared immediately.
JWT is stateless → cannot be revoked before expiry, but the short 10-minute window makes this acceptable.

---

### Option B: Redis Reset Token (not implemented — reference for future upgrade)

Replace JWT with a random token stored in Redis with TTL. Each token is single-use and deleted immediately after a successful password change. More secure for production.

**Step 1: Add RedisModule to AuthModule** (`auth.module.ts`)

```typescript
import { RedisModule } from '@/redis/redis.module';

@Module({
  imports: [
    ...,
    RedisModule,
  ],
  ...
})
export class AuthModule {}
```

**Step 2: Inject RedisService into PasswordService** (`password.service.ts`)

```typescript
import { RedisService } from '@/redis/redis.service';
import { randomBytes } from 'crypto';

constructor(
    // ... existing dependencies
    private readonly redisService: RedisService,
) { ... }
```

**Step 3: Replace `verifyOtp` — generate random token instead of JWT**

```typescript
async verifyOtp(dto: ChangePasswordVerifyDto): Promise<IPasswordResetResult> {
    const { email, otp } = dto;

    const pending = await this.prismaService.pendingRegistration.findUnique({ where: { email } });
    if (!pending) throw new ConflictException('No OTP request found for this email.');

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
    await this.prismaService.pendingRegistration.deleteMany({ where: { email } });

    // Generate random token instead of JWT
    const resetToken = randomBytes(32).toString('hex'); // 64-char hex string
    const ttlSeconds = ms(this.resetTokenExpire as ms.StringValue) / 1000;

    // Store in Redis: key = "pwd_reset:<token>", value = email, auto-expires with TTL
    await this.redisService.set(`pwd_reset:${resetToken}`, email, ttlSeconds);

    return { resetToken, expiresIn: this.resetTokenExpire };
}
```

**Step 4: Replace `resetPassword` — read email from Redis instead of decoding JWT**

```typescript
async resetPassword(dto: ResetPasswordDto): Promise<ISanitizedUser> {
    const { resetToken, newPassword } = dto;

    // Get email from Redis using the token
    const email = await this.redisService.get<string>(`pwd_reset:${resetToken}`);
    if (!email) {
        throw new ConflictException('Reset token is invalid or has expired. Please request a new OTP.');
    }

    // Delete token immediately — ensures single-use
    await this.redisService.del(`pwd_reset:${resetToken}`);

    const newPasswordHash = await generatePasswordHash(newPassword, this.saltRounds);

    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found.');

    const updatedUser = await this.prismaService.user.update({
        where: { email },
        data: { password: newPasswordHash },
        include: { role: { select: { roleName: true } } },
    });

    return sanitizeUser({
        ...updatedUser,
        roleName: updatedUser.role?.roleName ?? null,
    } as ISanitizedUser);
}
```

**Step 5: Remove JwtService from PasswordService** (no longer needed with Option B)
- Remove `private readonly jwtService: JwtService` from the constructor
- Remove `JWT_PASSWORD_RESET_SECRET` from `.env` (keep only `PASSWORD_RESET_EXPIRE` for Redis TTL)

**Current vs Option B:**

| Criterion | Current (JWT Cookie) | Option B (Redis) |
|---|---|---|
| Token revocable | No | Yes |
| Single-use | No | Yes |
| Token exposed in body | No (httpOnly cookie) | No (httpOnly cookie) |
| External storage needed | No | Redis (already available) |
| Stateless | Yes | No |
| Best for | Starter / typical app | High-security production |

---

## 12 App Configuration: Global Prefix, URI Versioning, and CORS

Extract configuration into separate files under `src/config/` to keep `main.ts` clean.

- **Install** `@nestjs/config` if not already present:
```bash
  pnpm add @nestjs/config
```

- **Step 1: `src/config/app.config.ts`** — configure global prefix and URI versioning
```typescript
  import { VersioningType } from "@nestjs/common";
  import { ConfigService } from "@nestjs/config";
  import { NestExpressApplication } from "@nestjs/platform-express";

  export const setupAppConfig = (app: NestExpressApplication): { globalPrefix: string; version: string } => {
      const configService = app.get(ConfigService);
      const globalPrefix = configService.get<string>('GLOBAL_PREFIX') || 'api';
      const version = configService.get<string>('VERSION') || '1';
      app.setGlobalPrefix(globalPrefix);
      app.enableVersioning({
          type: VersioningType.URI,
          defaultVersion: version,
      });
      return { globalPrefix, version };
  };
```

- **Step 2: `src/config/cors.config.ts`** — read allowed origins from env
```typescript
  import { ConfigService } from "@nestjs/config";
  import { NestExpressApplication } from "@nestjs/platform-express";

  export const setupCors = (app: NestExpressApplication) => {
      const configService = app.get(ConfigService);
      app.enableCors({
          origin: configService.get<string>('LIST_ORIGIN_CORS')?.split(','),
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
          credentials: true, // required for cookie-based refresh tokens to work cross-origin
      });
  };
```

- **Step 3: call from `main.ts`**
```typescript
  const { globalPrefix, version } = setupAppConfig(app);
  setupCors(app);
  // Route will be: http://localhost:8080/api/v1/...
```

- **Required env vars:**
```env
  GLOBAL_PREFIX="api"       # prefix for all routes
  VERSION="1"               # API version number (currently v1)
  LIST_ORIGIN_CORS="http://localhost:3000,http://localhost:5173"  # comma-separated list of allowed frontend origins
```

---

## 13 Global Exception Filter + Custom AppException

Create a custom exception class and a global filter so all errors return a consistent JSON structure.

- **Step 1: `src/common/exceptions/app.exception.ts`** — custom exception classes
```typescript
  export class AppException extends Error {
    constructor(
      public readonly statusCode: number,
      public readonly message: string,
      public readonly code: string,
      public readonly details?: Record<string, any>,
    ) {
      super(message);
      this.name = this.constructor.name;
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }

  export class ValidationException extends AppException {
    constructor(message: string, details?: Record<string, any>) {
      super(400, message, 'VALIDATION_ERROR', details);
    }
  }

  export class NotFoundException extends AppException {
    constructor(resource: string, id?: string) {
      super(404, id ? `${resource} with ID ${id} not found` : `${resource} not found`, 'NOT_FOUND');
    }
  }

  export class ConflictException extends AppException {
    constructor(message: string) {
      super(409, message, 'CONFLICT');
    }
  }

  export class UnauthorizedException extends AppException {
    constructor(message = 'Unauthorized') {
      super(401, message, 'UNAUTHORIZED');
    }
  }

  export class ForbiddenException extends AppException {
    constructor(message = 'Forbidden') {
      super(403, message, 'FORBIDDEN');
    }
  }

  export class InternalServerException extends AppException {
    constructor(message = 'Internal Server Error') {
      super(500, message, 'INTERNAL_SERVER_ERROR');
    }
  }
```

- **Step 2: `src/common/filters/all-exceptions.filter.ts`** — catch all exceptions and format the response
```typescript
  import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { AppException } from '@/common/exceptions/app.exception';

  @Catch() // catch all exception types
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest<Request>();
      const response = ctx.getResponse<Response>();

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal Server Error';
      let code = 'INTERNAL_SERVER_ERROR';
      let details: any;

      if (exception instanceof AppException) {
        statusCode = exception.statusCode;
        message = exception.message;
        code = exception.code;
        details = exception.details;
      } else if (exception instanceof HttpException) {
        statusCode = exception.getStatus();
        const res = exception.getResponse() as any;
        message = Array.isArray(res.message) ? res.message.join(', ') : res.message || message;
        if (res.errors) details = res.errors; // preserve validation errors from ValidationPipe
        code = 'HTTP_EXCEPTION';
      } else if (exception instanceof Error) {
        message = exception.message;
      }

      this.logger.error({ method: request.method, path: request.url, statusCode, message, code });

      response.status(statusCode).json({
        statusCode, message, code,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(details && { details }),
      });
    }
  }
```

- **Step 3: register globally in `app.module.ts`**
```typescript
  import { APP_FILTER } from '@nestjs/core';
  import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ]
```

**Key Points:**
- Use `AppException` instead of `throw new Error()` to ensure responses always have the correct structure
- `@Catch()` with no arguments → catches everything, including non-HttpException errors
- `details` only appears in the response when present (conditional spread)

---

## 14 Global Transform Interceptor — Standardize API Response

All successful responses return a unified JSON structure with `statusCode`, `message`, `data`, `timestamp`, and `path`.

- **`src/common/interceptors/transform.interceptor.ts`**
```typescript
  import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { Request } from 'express';

  export interface IApiResponse<T> {
    statusCode: number;
    message: string;
    code?: string;
    data?: T;
    timestamp?: string;
    path?: string;
  }

  @Injectable()
  export class TransformInterceptor<T> implements NestInterceptor<T, IApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<IApiResponse<T>> {
      const request = context.switchToHttp().getRequest<Request>();

      return next.handle().pipe(
        map((data) => {
          // if controller already returned the correct structure, just add timestamp and path
          if (data && typeof data === 'object' && 'statusCode' in data && 'message' in data) {
            return { ...data, code: data.code || 'SUCCESS', timestamp: new Date().toISOString(), path: request.url };
          }
          // if controller returned raw data, wrap it in the standard structure
          return { statusCode: HttpStatus.OK, message: 'Request successful', code: 'SUCCESS', data, timestamp: new Date().toISOString(), path: request.url };
        }),
      );
    }
  }
```

- **Register globally in `app.module.ts`**
```typescript
  import { APP_INTERCEPTOR } from '@nestjs/core';
  import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';

  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ]
```

---

## 15 Global HTTP Logging Interceptor

Logs every incoming request and outgoing response with method, URL, status code, and processing time.

- **`src/common/interceptors/logging.interceptor.ts`**
```typescript
  import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap, catchError } from 'rxjs/operators';
  import { Request, Response } from 'express';

  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();
      const startTime = Date.now();

      return next.handle().pipe(
        tap(() => {
          this.logger.log(`${request.method} ${request.url} → ${response.statusCode} | ${Date.now() - startTime}ms`);
        }),
        catchError((error) => {
          this.logger.error(`${request.method} ${request.url} → ERROR | ${Date.now() - startTime}ms`);
          throw error;
        }),
      );
    }
  }
```

- **Register globally in `app.module.ts`** (place before TransformInterceptor to log in the correct order)
```typescript
  import { APP_INTERCEPTOR } from '@nestjs/core';
  import { ClassSerializerInterceptor } from '@nestjs/common';
  import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';

  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }, // strip @Exclude() fields
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ]
```

---

## 16 Custom Route Decorators

Create reusable decorators to mark routes as public, admin-only, and to extract user/deviceId from the request.

- **`src/common/decorators/metadata.ts`** — decorators used with JWT Guard
```typescript
  import { SetMetadata } from '@nestjs/common';

  export const IS_PUBLIC_KEY = 'isPublic';
  export const IS_ADMIN_ONLY_KEY = 'isAdminOnly';

  // @Public() — skip JWT authentication, use on routes that don't require login
  export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

  // @AdminOnly() — place on controller class, only admins can access
  export const AdminOnly = () => SetMetadata(IS_ADMIN_ONLY_KEY, true);

  // @SkipAdminOnly() — place on a specific method to override @AdminOnly() on the class
  // getAllAndOverride means false at method level overrides true at class level
  export const SkipAdminOnly = () => SetMetadata(IS_ADMIN_ONLY_KEY, false);
```

- **`src/common/decorators/user.decorator.ts`** — extract user/deviceId/clientType from request
```typescript
  import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
  import { Request } from 'express';
  import { ClientType as ClientTypeEnum } from '@/common/enums/client-type.enum';

  // @User() — extract the authenticated user from request (attached by JwtStrategy)
  export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  });

  // @UserGoogle() — extract Google user info in the Google OAuth2 callback
  export const UserGoogle = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  });

  // @ClientType() — resolves to ClientType.MOBILE when X-Client-Type: mobile header is present,
  // otherwise defaults to ClientType.WEB. Set once in your HTTP client base config — not per request.
  export const ClientType = createParamDecorator((data: unknown, ctx: ExecutionContext): ClientTypeEnum => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.headers['x-client-type'] === 'mobile'
      ? ClientTypeEnum.MOBILE
      : ClientTypeEnum.WEB;
  });

  // @DeviceId() — reads from X-Device-ID header (mobile) first, falls back to cookie (web)
  export const DeviceId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
    const deviceIdEnv = process.env.NAME_DEVICEID_CLIENT!;
    const request = ctx.switchToHttp().getRequest<Request>();
    const fromHeader = request.headers['x-device-id'] as string | undefined;
    if (fromHeader?.trim()) return fromHeader.trim();
    const deviceId = request.cookies?.[deviceIdEnv];
    if (!deviceId?.trim()) throw new BadRequestException('Device ID not found in X-Device-ID header or cookies');
    return deviceId;
  });
```

- **`src/common/enums/client-type.enum.ts`**
```typescript
  export enum ClientType {
    WEB = 'web',
    MOBILE = 'mobile',
  }
```

- **Required env var:**
```env
  NAME_DEVICEID_CLIENT="deviceId"   # name of the cookie that carries deviceId from the web frontend
```

- **Web: send deviceId via cookie (set once before login):**
```javascript
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  document.cookie = `deviceId=${deviceId}; path=/; max-age=31536000`;
  // No X-Client-Type header needed — web is the default
```

- **Mobile: send via headers (configure once in HTTP client):**
```typescript
  // React Native — Axios example
  axios.defaults.headers.common['X-Client-Type'] = 'mobile';
  axios.defaults.headers.common['X-Device-ID'] = await SecureStore.getItemAsync('deviceId');
  // After login, store refreshToken from response body and attach as:
  axios.defaults.headers.common['X-Refresh-Token'] = storedRefreshToken;
```

---

## 17 JwtAuthGuard — Global Guard with Admin Role Check

Guard registered globally in `AppModule`. All routes require JWT unless decorated with `@Public()`. Routes with `@AdminOnly()` only allow users with the admin role.

- **`src/lib/passport/jwt-auth.guard.ts`**
```typescript
  import { IS_ADMIN_ONLY_KEY, IS_PUBLIC_KEY } from '@/common/decorators/metadata';
  import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { AuthGuard } from '@nestjs/passport';
  import { ConfigService } from '@nestjs/config';

  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
      private reflector: Reflector,
      private readonly configService: ConfigService,
    ) { super(); }

    canActivate(context: ExecutionContext) {
      // if route has @Public(), skip JWT check
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(), context.getClass(),
      ]);
      if (isPublic) return true;
      return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
      if (err || !user) throw err || new UnauthorizedException('Invalid or expired token');
      if (info) throw new UnauthorizedException(info.message);

      // check @AdminOnly() — if set, only admins are allowed
      const isAdminOnly = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_ONLY_KEY, [
        context.getHandler(), context.getClass(),
      ]);
      if (isAdminOnly) {
        const adminRoleName = this.configService.get<string>('NAME_ROLE_ADMIN');
        if (user.roleName !== adminRoleName) {
          throw new ForbiddenException('Access denied: Administrators only.');
        }
      }
      return user;
    }
  }
```

- **Register globally in `app.module.ts`**
```typescript
  import { APP_GUARD } from '@nestjs/core';
  import { JwtAuthGuard } from '@/lib/passport/jwt-auth.guard';

  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ]
```

- **Usage in controller:**
```typescript
  @Public()                  // → no JWT required (register, login...)
  @AdminOnly()               // → entire class is admin-only
  @SkipAdminOnly()           // → specific method bypasses @AdminOnly() on the class
```

**Key Points:**
- `getAllAndOverride` prioritizes handler (method) over class → `@SkipAdminOnly()` on a method overrides `@AdminOnly()` on the class
- Guard runs before interceptors and pipes, so guard errors bypass TransformInterceptor and go directly to ExceptionFilter

---

## 18 JWT Token System — Access Token + Refresh Token + Session

- **Access token** stored in frontend memory (Authorization header), short-lived (60 minutes)
- **Refresh token** stored in `httpOnly` cookie to prevent XSS, long-lived (1 day)
- **Session** stored in the DB by `(userId, deviceId)` pair — limits concurrent device logins

- **`src/auth/passport/jwt.strategy.ts`** — decode access token from header
```typescript
  import { Injectable } from '@nestjs/common';
  import { PassportStrategy } from '@nestjs/passport';
  import { ExtractJwt, Strategy } from 'passport-jwt';
  import { ConfigService } from '@nestjs/config';

  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET')!,
      });
    }

    async validate(payload: any) {
      return payload; // payload is attached to request.user by Passport
    }
  }
```

- **`src/auth/services/token.service.ts`** — create tokens and manage sessions
```typescript
  async login(user: ISanitizedUser, res: Response, deviceId: string) {
    // 1. Create refresh token (signed with separate secret, longer expiry)
    const refreshToken = this.jwtService.sign(
      { userId: user.id, _sub: { roleName: user.roleName, email: user.email }, deviceId },
      { secret: this.refreshTokenSecret, expiresIn: expiresInSeconds }
    );

    // 2. Save session to DB (upsert — update if device already has a session)
    await this.sessionService.upsertSession({ userId: user.id, refreshToken, deviceId });

    // 3. Attach refresh token to httpOnly cookie
    res.cookie(this.refreshTokenName, refreshToken, {
      httpOnly: true,  // not accessible by JS → XSS-safe
      secure: true,    // only sent over HTTPS
      sameSite: 'lax',
      maxAge: ms(this.expiresInRefresh),
    });

    // 4. Create access token (signed with JwtModule default secret, short expiry)
    return { accessToken: this.jwtService.sign(sanitizeUser(user)), user: sanitizeUser(user) };
  }
```

- **Required env vars:**
```env
  JWT_ACCESS_TOKEN_SECRET="your_access_secret"
  JWT_ACCESS_EXPIRE="60m"
  JWT_REFRESH_TOKEN_SECRET="your_refresh_secret"
  JWT_REFRESH_EXPIRE="1d"
  NAME_COOKIE_REFRESH_TOKEN_BROWSER="refreshToken"   # cookie name for the refresh token
  NUMBER_OF_DEVICES=2                                # max concurrent devices per user
```

---

## 19 Session Management — Device Limit

Sessions are stored in the DB by `(userId, deviceId)`. When a new device login exceeds the limit, the oldest session is automatically deleted.

- **`src/session/session.service.ts`** — upsert logic with device limit
```typescript
  async upsertSession(dto: { userId: string; deviceId: string; refreshToken: string }) {
    return this.prismaService.$transaction(async (tx) => {
      // device already has a session → update token
      const existing = await tx.session.findUnique({
        where: { userId_deviceId: { userId: dto.userId, deviceId: dto.deviceId } },
      });
      if (existing) {
        return tx.session.update({ where: { userId_deviceId: { userId: dto.userId, deviceId: dto.deviceId } }, data: { refreshToken: dto.refreshToken, expiresAt } });
      }

      // new device → check device limit
      const sessions = await tx.session.findMany({ where: { userId: dto.userId, expiresAt: { gt: new Date() } }, orderBy: { expiresAt: 'asc' } });
      if (sessions.length >= limit) {
        await tx.session.delete({ where: { id: sessions[0].id } }); // delete oldest session
      }

      return tx.session.create({ data: { userId: dto.userId, deviceId: dto.deviceId, refreshToken: dto.refreshToken, expiresAt } });
    });
  }
```

- **Create Prisma model `Session`** with a unique constraint on `(userId, deviceId)`:
```prisma
  model Session {
    id           String   @id @default(cuid())
    userId       String
    deviceId     String
    refreshToken String   @unique
    expiresAt    DateTime
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt
    user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([userId, deviceId])   // each (user, device) pair has exactly one session
  }
```

---

## 20 Cron Jobs — Scheduled Tasks with @nestjs/schedule

Automatically clean up expired sessions and stale pending registrations every minute.

- **Install:**
```bash
  pnpm add @nestjs/schedule
  pnpm add -D @types/cron
```

- **Register in `app.module.ts`:**
```typescript
  import { ScheduleModule } from '@nestjs/schedule';

  imports: [
    ScheduleModule.forRoot(), // enable scheduler app-wide
    ...
  ]
```

- **Create module and service:**
```bash
  nest g module jobs
  nest g service jobs
```

- **`src/jobs/jobs.service.ts`** — define cron jobs
```typescript
  import { Injectable, Logger } from '@nestjs/common';
  import { Cron, CronExpression } from '@nestjs/schedule';
  import { PrismaService } from '@/prisma/prisma.service';

  @Injectable()
  export class JobsService {
    private readonly logger = new Logger(JobsService.name);

    constructor(private readonly prisma: PrismaService) {}

    // runs every minute — deletes expired sessions
    @Cron(CronExpression.EVERY_MINUTE, { name: 'handleExpiredSessions', timeZone: 'Asia/Ho_Chi_Minh', waitForCompletion: true })
    async handleExpiredSessions() {
      const result = await this.prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      if (result.count > 0) this.logger.log(`✅ Deleted ${result.count} expired sessions`);
    }

    // runs every minute — deletes pending registrations with expired OTPs
    @Cron(CronExpression.EVERY_MINUTE, { name: 'cleanupExpiredPendingRegistrations', timeZone: 'Asia/Ho_Chi_Minh', waitForCompletion: true })
    async cleanupExpiredPendingRegistrations() {
      const result = await this.prisma.pendingRegistration.deleteMany({ where: { otpExpiresAt: { lt: new Date() } } });
      if (result.count > 0) this.logger.log(`✅ Deleted ${result.count} expired pending registrations`);
    }
  }
```

- **`src/jobs/jobs.module.ts`:**
```typescript
  import { Module } from '@nestjs/common';
  import { JobsService } from './jobs.service';

  @Module({ providers: [JobsService] })
  export class JobsModule {}
```

**Key Points:**
- `waitForCompletion: true` — ensures the previous run completes before the next one starts
- `CronExpression.EVERY_MINUTE` — fires at the start of every minute (cron: `0 * * * * *`)
- Timezone `Asia/Ho_Chi_Minh` — ensures cron runs on Vietnam time

---

## 21 Database Seeding — Seed Initial Data on Startup

`SeedDbService` implements `OnModuleInit` to automatically seed the database on startup, controlled by env vars.

- **`src/seed-db/seed/sample.ts`** — sample data
```typescript
  export const roles = [
    { roleName: 'ADMIN' },
    { roleName: 'USER' },
  ];

  export const users = [
    { email: 'admin@example.com', userName: 'admin', password: null, roleName: 'ADMIN' },
    { email: 'user@example.com',  userName: 'user',  password: null, roleName: 'USER'  },
  ];
```

- **`src/seed-db/seed-db.service.ts`** — seed and clear logic
```typescript
  @Injectable()
  export class SeedDbService implements OnModuleInit {
    async onModuleInit() {
      const shouldSeed  = this.configService.get<string>('SEED_DB')  === 'true';
      const shouldClear = this.configService.get<string>('CLEAR_DB') !== 'false'; // defaults to true

      if (shouldSeed) {
        if (shouldClear) await this.clear(); // clear entire DB before seeding
        await this.seed();                   // seed roles then users in correct dependency order
      }
    }
  }
```

- **Env vars to control seeding:**
```env
  SEED_DB=true     # true → run seeding on startup
  CLEAR_DB=false   # false → seed without clearing existing data
                   # true  → clear entire DB before seeding (DANGEROUS in production!)
  DEFAULT_PASSWORD="123456"  # default password for seeded accounts
```

**Key Points:**
- `CLEAR_DB=false` in production to avoid accidentally wiping real data
- Seed in order: roles first, users second (users require a roleId)
- `skipDuplicates: true` in `createMany` — no error if data already exists

---

## 22 OTP Registration Flow — Email-Verified Registration

Two-step registration flow: send OTP to verify email before creating the account.

```
POST /auth/register
  Body: { userName, email, password }
  → Saves to pendingRegistration table (no user created yet), sends OTP via email
  → Returns: { otpExpire }

POST /auth/verify-register-otp
  Body: { email, otp }
  → Verifies OTP, creates user in the user table, removes pendingRegistration
  → Returns: newly created user info (ISanitizedUser)

POST /auth/resend-register-otp
  Body: { email }
  → Generates a new OTP and resends (only after cooldown expires)
  → Returns: { otpExpire }
```

- **Required Prisma model `PendingRegistration`**:
```prisma
  model PendingRegistration {
    id            String    @id @default(cuid())
    email         String    @unique
    userName      String    @unique
    passwordHash  String
    otpHash       String
    otpExpiresAt  DateTime
    attemptCount  Int       @default(0)
    resendAfter   DateTime?
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
  }
```

- **OtpService** (pure — no DB access) shared across all OTP flows:
```typescript
  // Generate new OTP
  async generate(): Promise<{ otp, otpHash, otpExpiresAt, resendAfter }>

  // Validate OTP format (length check)
  assertFormat(otp: string): void

  // Check cooldown from Date — throws if still within the cooldown window
  assertNoCooldown(resendAfter: Date | null | undefined): void

  // Verify OTP — caller provides callbacks to handle DB operations
  // (delete on expired/locked, increment attempt count on wrong input)
  async verify(otp, record, onCleanup: () => Promise<void>, onIncrementAttempt: () => Promise<number>): Promise<void>
```

- **Required env vars:**
```env
  OTP_EXPIRE=5m             # OTP validity window
  OTP_LENGTH=6              # OTP digit length
  OTP_MAX_ATTEMPTS=5        # max wrong attempts before locking
  OTP_RESEND_COOLDOWN=60s   # cooldown between OTP resend requests
```

---

## 23 OTP Profile Update — Change Email or Username with OTP

Users can change their email, username, or description with OTP protection. Changing only the description updates immediately without OTP.

```
POST /users/update-profile/request-otp       (requires JWT)
  Body: { email?, userName?, description? }
  → If only description changes: updates immediately, returns { skipOtp: true, data: userEntity }
  → If email/username changes:
      - Sends OTP to the NEW EMAIL if email is changing
      - Sends OTP to the CURRENT EMAIL if only username is changing
      - Returns: { skipOtp: false, data: { targetEmail (masked), changes } }

POST /users/update-profile/verify-otp        (requires JWT)
  Body: { otp }
  → Verifies OTP, applies changes, returns updated userEntity
```

- **Required Prisma model `PendingUserUpdate`**:
```prisma
  model PendingUserUpdate {
    id            String    @id @default(cuid())
    userId        String    @unique
    newEmail      String?
    newUserName   String?
    newDescription String?
    otpHash       String
    otpExpiresAt  DateTime
    attemptCount  Int       @default(0)
    resendAfter   DateTime?
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
    user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  }
```

- **Google accounts are restricted:** cannot change email or username (description only)
- **`@SkipAdminOnly()`** on these endpoints — because `UsersController` has `@AdminOnly()` at class level but profile update must be accessible to regular users

**Key Points:**
- OTP is sent to the NEW EMAIL (not the old one) when changing email → verifies the user actually owns the new address
- Email is masked in the response (e.g. `li***@gmail.com`) to avoid exposing the new email before it is verified
- Uses a transaction when applying the update for atomicity: update user + delete pending in one operation

---

## 24 Path Alias — Absolute Import Configuration

Instead of `../../common/exceptions`, use `@/common/exceptions` for cleaner imports.

- **Configure in `tsconfig.json`:**
```json
  {
    "compilerOptions": {
      "baseUrl": "./",
      "paths": {
        "@/*": ["src/*"]
      }
    }
  }
```

- **If using NestJS CLI build (webpack), also configure in `nest-cli.json`:**
```json
  {
    "compilerOptions": {
      "webpack": false,
      "plugins": [],
      "assets": [],
      "deleteOutDir": true
    }
  }
```

- **If building to JS and running directly** (not via ts-node), install `tsconfig-paths`:
```bash
  pnpm add tsconfig-paths
```
and add to `package.json` scripts:
```json
  "start:prod": "node -r tsconfig-paths/register dist/main"
```

**Key Points:**
- `@/` maps to `src/` — all absolute imports start from the `src` directory
- Avoids hard-to-read `../../../` imports when files are nested deep in the directory tree

---

## 25 TypeScript Interfaces — Complete Reference

All interfaces are centralized in `*/interfaces/*.ts` files and always imported with `import type` to prevent circular dependencies and support tree-shaking. Below is the complete list organized by file.

---

### `src/auth/interfaces/auth.types.ts`

**Passport / JWT payloads:**
```typescript
// access token payload — attached to request.user by JwtStrategy
export interface IJwtPayload {
  id: string;
  email: string;
  userName: string;
  roleName: string;
  accountType: string;
  avatarUrl?: string | null;
}

// refresh token payload stored in httpOnly cookie
export interface IRefreshTokenPayload {
  userId: string;
  _sub: { roleName: string; email: string };
  deviceId: string;
  iat?: number;
  exp?: number;
}

// return type of LocalStrategy.validate() — only fields needed for login
export interface ILocalValidateResult {
  id: string;
  email: string;
  userName: string;
  password?: string | null;
  accountType: string;
  roleName: string;
}
```

**User representation:**
```typescript
// user data safe to return to the client (no password, no hash)
export interface ISanitizedUser {
  id: string;
  email: string;
  userName: string;
  accountType: string;
  roleName: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  description?: string | null;
  googleId?: string | null;
  roleId: string;
}
```

**Result types:**
```typescript
export interface ILoginResult {
  accessToken: string;
  refreshToken?: string; // only present for mobile clients (X-Client-Type: mobile)
  user: ISanitizedUser;
}

export interface IRegisterResult {
  otpExpire: string;
}

export interface IOtpGenerationResult {
  otp: string;
  otpHash: string;
  otpExpiresAt: Date;
  resendAfter: Date;
}

export interface IUserUpdateOtpRequestResult {
  skipOtp: boolean;
  message: string;
  data: IUserEntity | { targetEmail: string; changes: string[] };
}

// returned after OTP verification for password reset
// web: reset token stored in httpOnly cookie, only expiresIn in body
// mobile: resetToken also returned in body
export interface IPasswordResetResult {
  expiresIn: string;
  resetToken?: string; // only present for mobile clients (X-Client-Type: mobile)
}
```

**DTO interfaces:**
```typescript
export interface IRegisterDto {
  userName: string;
  email: string;
  password: string;
}

export interface IVerifyRegisterOtpDto {
  email: string;
  otp: string;
}

export interface IResendRegisterOtpDto {
  email: string;
}

export interface ILoginDto {
  userNameOrEmail: string;
  password: string;
}

export interface IVerifyEmailDto {
  email: string;
}

export interface IChangePasswordVerifyDto {
  email: string;
  otp: string;
}

// token is read from httpOnly cookie → body only needs newPassword
export interface IResetPasswordDto {
  newPassword: string;
}
```

---

### `src/auth/interfaces/auth.service.interface.ts`

```typescript
// ClientType enum — used across service/controller signatures
// WEB (default): cookie-based token transport
// MOBILE: header-based token transport (X-Refresh-Token, X-Reset-Token)
import { ClientType } from '@/common/enums/client-type.enum';

export interface IAuthService {
  registerWithOTP(dto: IRegisterDto): Promise<IRegisterResult>;
  verifyRegisterOtp(dto: IVerifyRegisterOtpDto): Promise<ISanitizedUser>;
  resendRegisterOtp(dto: IResendRegisterOtpDto): Promise<IRegisterResult>;
  sendChangePasswordOtp(dto: IVerifyEmailDto): Promise<IRegisterResult>;
  verifyChangePasswordOtp(res: Response, dto: IChangePasswordVerifyDto, clientType: ClientType): Promise<IPasswordResetResult>;
  resetPassword(resetToken: string, res: Response, dto: IResetPasswordDto, clientType: ClientType): Promise<ISanitizedUser>;
  validateUser(userNameOrEmail: string, password: string): Promise<ILocalValidateResult | null>;
  login(user: ISanitizedUser, res: Response, deviceId: string, clientType: ClientType): Promise<ILoginResult>;
  refreshToken(oldRefreshToken: string, res: Response, clientType: ClientType): Promise<ILoginResult>;
  googleLogin(googleUser: IGoogleUser, res: Response, deviceId: string): Promise<ILoginResult>;
  logout(user: ISanitizedUser, refreshToken: string, res: Response, clientType: ClientType): Promise<boolean>;
  logoutAll(user: ISanitizedUser, res: Response, clientType: ClientType): Promise<boolean>;
}

export interface ITokenService {
  login(user: ISanitizedUser, res: Response, deviceId: string, clientType: ClientType): Promise<ILoginResult>;
  logout(userId: string, refreshToken: string, res: Response, clientType: ClientType): Promise<boolean>;
  logoutAll(userId: string, res: Response, clientType: ClientType): Promise<boolean>;
}

// pure OTP logic — no DB access; caller handles DB operations via callbacks
export interface IOtpService {
  generate(): Promise<IOtpGenerationResult>;
  assertFormat(otp: string): void;
  assertNoCooldown(resendAfter: Date | null | undefined): void;
  verify(
    otp: string,
    record: { otpHash: string; otpExpiresAt: Date; attemptCount: number },
    onCleanup: () => Promise<void>,
    onIncrementAttempt: () => Promise<number>,
  ): Promise<void>;
}

export interface IRegisterService {
  register(dto: IRegisterDto): Promise<IRegisterResult>;
  verifyOtp(dto: IVerifyRegisterOtpDto): Promise<ISanitizedUser>;
  resendOtp(email: string): Promise<IRegisterResult>;
}

export interface IPasswordService {
  sendOtp(dto: IVerifyEmailDto): Promise<IRegisterResult>;
  verifyOtp(res: Response, dto: IChangePasswordVerifyDto, clientType: ClientType): Promise<IPasswordResetResult>;
  resetPassword(resetToken: string, res: Response, dto: IResetPasswordDto, clientType: ClientType): Promise<ISanitizedUser>;
}

export interface IGoogleService {
  login(googleUser: IGoogleUser, res: Response, deviceId: string): Promise<ILoginResult>;
}

export interface IUserUpdateOtpService {
  requestUpdate(userId: string, dto: RequestUpdateUserOtpDto): Promise<IUserUpdateOtpRequestResult>;
  verifyAndApplyUpdate(userId: string, otp: string): Promise<{ message: string; data: IUserEntity }>;
}
```

---

### `src/auth/interfaces/auth.controller.interface.ts`

```typescript
export interface IAuthController {
  register(dto: IRegisterDto): Promise<IApiResponse<{ otpExpire: string }>>;
  verifyRegisterOtp(dto: IVerifyRegisterOtpDto): Promise<IApiResponse<ISanitizedUser>>;
  resendRegisterOtp(dto: IResendRegisterOtpDto): Promise<IApiResponse<{ otpExpire: string }>>;
  login(res: Response, user: ISanitizedUser, dto: ILoginDto, deviceId: string, clientType: ClientType): Promise<IApiResponse<ILoginResult>>;
  refreshToken(res: Response, req: Request, clientType: ClientType): Promise<IApiResponse<ILoginResult>>;
  getProfile(user: ISanitizedUser): Promise<IApiResponse<{ user: ISanitizedUser }>>;
  changePasswordWithOtp(dto: IVerifyEmailDto): Promise<IApiResponse<{ otpExpire: string }>>;
  verifyChangePasswordOtp(res: Response, dto: IChangePasswordVerifyDto, clientType: ClientType): Promise<IApiResponse<IPasswordResetResult>>;
  resetPassword(req: Request, res: Response, dto: IResetPasswordDto, clientType: ClientType): Promise<IApiResponse<ISanitizedUser>>;
  logout(res: Response, req: Request, user: ISanitizedUser, clientType: ClientType): Promise<IApiResponse<{ result: boolean }>>;
  logoutAll(res: Response, user: ISanitizedUser, clientType: ClientType): Promise<IApiResponse<{ result: boolean }>>;
  googleAuth(): void;
  googleAuthRedirect(googleUser: IGoogleUser, deviceId: string, res: Response): Promise<void | IApiResponse<ILoginResult>>;
}
```

---

### `src/users/interfaces/users.types.ts`

```typescript
export interface ICreateUserDto {
  email: string;
  userName: string;
  password: string;
  roleName?: string;
}

// for profile update — excludes password and roleName
export interface IUpdateUserDto extends Omit<ICreateUserDto, 'roleName' | 'password'> {
  description?: string | undefined;
}

export interface IUpdateUserRoleDto {
  roleNameOrId: string;
}

export interface IUpdateUserAvatarOrBGDto {
  typeImgProfile: UserImageType; // enum: 'avatar' | 'background'
}

// full user data returned by UsersService (no password field)
export interface IUserEntity {
  id: string;
  email: string;
  userName: string;
  googleId?: string | null;
  accountType: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  description?: string | null;
  roleId: string;
  roleName: string;
}

export interface IUserEntityWithPassword extends IUserEntity {
  password: string | null;
}

// special response for the request-otp endpoint — has extra skipOtp field outside the standard structure
export interface IRequestUpdateOtpApiResponse {
  statusCode: number;
  message: string;
  skipOtp: boolean;
  data: IUserEntity | { targetEmail: string; changes: string[] };
}
```

**Key Points:**
- Always use `import type` when importing interfaces to prevent circular dependencies and avoid emitting unnecessary JS
- `ISanitizedUser` is used everywhere user data needs to be returned — never return raw Prisma objects outside the service layer
- `ILoginResult.refreshToken?` and `IPasswordResetResult.resetToken?` are optional — only populated for mobile clients (`X-Client-Type: mobile`); web clients receive tokens via httpOnly cookies instead
- `IOtpService.verify()` uses the **callback pattern** — the service has no direct DB access; the caller provides cleanup and attempt-increment callbacks
- `IAuthService.resetPassword()` receives `resetToken: string` (extracted from cookie or `X-Reset-Token` header by the controller before calling the service) rather than the full `Request` object
- All token-sending methods (`login`, `logout`, `logoutAll`, `verifyOtp`, `resetPassword`) accept `clientType: ClientType` to conditionally set/clear cookies (web) or skip cookie ops (mobile)

---

## 26 Rate Limiting — Request Throttling with `@nestjs/throttler`

Protect endpoints from brute-force attacks and email spam by limiting the number of requests per IP per time window.

- **Install:**
```bash
pnpm add @nestjs/throttler
```

- **Version used in this project:** `@nestjs/throttler ^6.5.0`
- **Official docs:** [Rate Limiting - NestJS](https://docs.nestjs.com/security/rate-limiting)

---

### Step 1: Create `ThrottlerConfigModule` in `src/core/throttler-config.module.ts`

Wrap `ThrottlerModule.forRoot()` in a `@Module` class to keep `AppModule` imports clean and follow NestJS naming conventions.

```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'default',     ttl: 60,   limit: 100  },
        { name: 'short-term',  ttl: 10,   limit: 20   },
        { name: 'medium-term', ttl: 300,  limit: 500  },
        { name: 'long-term',   ttl: 3600, limit: 1000 },
      ],
      errorMessage(context, throttlerLimitDetail) {
        return `You have made ${throttlerLimitDetail.totalHits} requests. Rate limit exceeded, Try again in ${throttlerLimitDetail.ttl} seconds.`;
      },
    }),
  ],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}
```

---

### Step 2: Register `ThrottlerGuard` globally in `app.module.ts`

```typescript
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerConfigModule } from '@/core/throttler-config.module';

@Module({
  imports: [
    ThrottlerConfigModule,
    // ... other modules
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // all routes use 'default' throttler unless overridden
  ],
})
export class AppModule {}
```

---

### Step 3: Override per route with `@Throttle()`

In v6+, `@Throttle()` accepts an object keyed by throttler name. Only the specified throttlers are overridden — others still apply.

```typescript
import { Throttle } from '@nestjs/throttler';

// Brute-force protection: max 5 attempts per 10 seconds
@Throttle({ 'short-term': { ttl: 10, limit: 5 } })
@Post('login')
async login() { ... }

// Email spam prevention: max 3 sends per 10 seconds
@Throttle({ 'short-term': { ttl: 10, limit: 3 } })
@Post('resend-register-otp')
async resendRegisterOtp() { ... }
```

---

### Step 4: Skip throttling with `@SkipThrottle()`

```typescript
import { SkipThrottle } from '@nestjs/throttler';

// Skip all throttlers on this route
@SkipThrottle()
@Get('health')
healthCheck() { ... }

// Skip only 'default', keep 'short-term' active
@SkipThrottle({ default: true })
@Get('some-route')
someRoute() { ... }
```

---

### Named throttlers in this project

| Name | TTL | Limit | Use case |
|---|---|---|---|
| `default` | 60s | 100 req | Applied globally to every route |
| `short-term` | 10s | 20 req | Auth endpoints — brute-force / email spam |
| `medium-term` | 300s | 500 req | Bulk or moderate-frequency operations |
| `long-term` | 3600s | 1000 req | Hourly ceiling across all requests |

---

### Applied limits on auth controller

| Endpoint | Override | Limit |
|---|---|---|
| `POST /auth/register` | `short-term` | 5 / 10s |
| `POST /auth/verify-register-otp` | `short-term` | 5 / 10s |
| `POST /auth/resend-register-otp` | `short-term` | 3 / 10s |
| `POST /auth/login` | `short-term` | 5 / 10s |
| `POST /auth/change-password/send-otp` | `short-term` | 3 / 10s |
| `POST /auth/change-password/verify-otp` | `short-term` | 5 / 10s |
| `POST /auth/change-password/reset` | `short-term` | 5 / 10s |
| All other routes | `default` | 100 / 60s |

---

### Rate limit exceeded response — `429 Too Many Requests`

```json
{
  "statusCode": 429,
  "message": "You have made 6 requests. Rate limit exceeded, Try again in 10 seconds.",
  "code": "HTTP_EXCEPTION",
  "timestamp": "2026-06-05T10:00:00.000Z",
  "path": "/api/v1/auth/login"
}
```

---

**Key Points:**
- `ThrottlerGuard` tracks requests **per client IP** by default. Behind a reverse proxy (Nginx, etc.), add `app.set('trust proxy', 1)` in `main.ts` so `req.ip` resolves to the real client IP instead of the proxy's IP
- All named throttlers run **simultaneously** — a request must pass every configured throttler
- `@Throttle({ name: { ttl, limit } })` overrides only the listed throttler(s); un-listed throttlers still apply with their original values
- `ttl` unit in `@nestjs/throttler` v6+ is **seconds** (not milliseconds)
