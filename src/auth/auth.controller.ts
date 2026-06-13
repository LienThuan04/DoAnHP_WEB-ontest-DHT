import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { Public } from '@/common/decorators/metadata';
import { LoginDto, RegisterDto, VerifyRegisterOtpDto, ResendRegisterOtpDto, VerifyEmailDto, ChangePasswordVerifyDto, ResetPasswordDto } from '@/auth/dto/create-auth.dto';
import type { Request, Response } from 'express';
import { UserGoogle, User, DeviceId, ClientType } from '@/common/decorators/user.decorator';
import type { GoogleUser } from '@/auth/passport/google/google-user.interface';
import { LocalAuthGuard } from '@/lib/passport/local-auth.guard';
import { GoogleAuthGuard } from '@/lib/passport/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { ApiOperation } from '@nestjs/swagger';
import { UnauthorizedException, InternalServerException, NotFoundException } from '@/common/exceptions/app.exception';
import type { IPasswordResetResult, ISanitizedUser } from '@/auth/interfaces/auth.types';
import type { IAuthController } from '@/auth/interfaces/auth.controller.interface';
import { Throttle } from '@nestjs/throttler';
import { ClientType as ClientTypeEnum } from '@/common/enums/client-type.enum';

@Controller('auth')
export class AuthController implements IAuthController {
    private readonly refreshTokenName: string;
    private readonly resetPassNameToken: string;
    private readonly urlClient: string;
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService
    ) {
        this.refreshTokenName = this.configService.get<string>('NAME_COOKIE_REFRESH_TOKEN_BROWSER')!;
        this.resetPassNameToken = this.configService.get<string>('NAME_COOKIE_RESET_PASS_TOKEN')!;
        this.urlClient = this.configService.get<string>('URL_CLIENT')!;
        if (!this.refreshTokenName || this.refreshTokenName.trim() === '') {
            throw new Error('Refresh token cookie name is not defined in environment variables');
        }
        if (!this.resetPassNameToken || this.resetPassNameToken.trim() === '') {
            throw new Error('Reset password token cookie name is not defined in environment variables');
        }
        if (!this.urlClient || this.urlClient.trim() === '') {
            throw new Error('URL_CLIENT is not defined in environment variables');
        }
    }

    @Public()
    @Throttle({ 'short-term': { ttl: 10, limit: 5 } })
    @ApiOperation({ summary: 'Register a new user' })
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const result = await this.authService.registerWithOTP(registerDto);
        return { statusCode: 201, message: 'Registration initiated successfully. Please verify the OTP sent to your email to complete registration.', data: result };
    }

    @Public()
    @Throttle({ 'short-term': { ttl: 10, limit: 5 } })
    @Post('verify-register-otp')
    @ApiOperation({ summary: 'Verify OTP and complete account registration' })
    async verifyRegisterOtp(@Body() verifyRegisterOtpDto: VerifyRegisterOtpDto) {
        const user = await this.authService.verifyRegisterOtp(verifyRegisterOtpDto);
        return { statusCode: 200, message: 'Account verified and created successfully', data: user };
    }

    @Public()
    @Throttle({ 'short-term': { ttl: 10, limit: 3 } })
    @Post('resend-register-otp')
    @ApiOperation({ summary: 'Resend OTP to registered email during registration process' })
    async resendRegisterOtp(@Body() resendRegisterOtpDto: ResendRegisterOtpDto) {
        const data = await this.authService.resendRegisterOtp(resendRegisterOtpDto);
        return { statusCode: 200, message: 'OTP has been resent successfully to your email', data };
    }

    @Public()
    @Throttle({ 'short-term': { ttl: 10, limit: 5 } })
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: 'Login a user for a session and cookie management' })
    @Post('login')
    async login(@Res({ passthrough: true }) res: Response, @User() user: ISanitizedUser, @Body() _loginDto: LoginDto, @DeviceId() deviceId: string, @ClientType() clientType: ClientTypeEnum) {
        const result = await this.authService.login(user, res, deviceId, clientType);
        return {
            statusCode: 200,
            message: 'Login successful',
            data: {
                accessToken: result.accessToken,
                ...(result.refreshToken && { refreshToken: result.refreshToken }),
                user: result.user,
            },
        };
    }

    @Public()
    @ApiOperation({ summary: 'Refresh access token using a valid refresh token stored in cookies (web) or X-Refresh-Token header (mobile)' })
    @Post('refresh')
    async refreshToken(@Res({ passthrough: true }) res: Response, @Req() req: Request, @ClientType() clientType: ClientTypeEnum) {
        let oldRefreshToken: string;
        if (clientType === ClientTypeEnum.MOBILE) {
            oldRefreshToken = req.headers['x-refresh-token'] as string;
            if (!oldRefreshToken) throw new UnauthorizedException('Refresh token is missing in X-Refresh-Token header');
        } else {
            oldRefreshToken = req.cookies[this.refreshTokenName];
            if (!oldRefreshToken) throw new UnauthorizedException('Refresh token is missing in cookies');
        }
        const result = await this.authService.refreshToken(oldRefreshToken, res, clientType);
        return {
            statusCode: 200,
            message: 'Token refreshed successfully',
            data: {
                accessToken: result.accessToken,
                ...(result.refreshToken && { refreshToken: result.refreshToken }),
                user: result.user,
            },
        };
    }

    @Get('profile')
    @ApiOperation({ summary: 'Get the profile of the currently authenticated user' }) // Add Swagger documentation for this endpoint
    async getProfile(@User() user: ISanitizedUser) {
        try {
            return {
                statusCode: 200,
                message: 'Profile retrieved successfully',
                data: {
                    user,
                },
            };
        } catch (error) {
            throw new InternalServerException(`Failed to retrieve profile, ${(error as Error).message}`);
        }
    }

    @Public()
    @Throttle({ 'short-term': { ttl: 10, limit: 3 } })
    @Post('change-password/send-otp')
    @ApiOperation({ summary: 'Change password for the currently authenticated user' })
    async changePasswordWithOtp(@Body() verifyEmailDto: VerifyEmailDto) {
        const result = await this.authService.sendChangePasswordOtp(verifyEmailDto);
        return {
            statusCode: 200,
            message: 'If your email exists in our system, you will receive an OTP to reset your password. Please check your email.',
            data: result,
        };
    }
    
    @Public()
    @Throttle({ 'short-term': { ttl: 10, limit: 5 } })
    @Post('change-password/verify-otp')
    @ApiOperation({ summary: 'Verify OTP for password reset — returns a short-lived reset token to use in /change-password/reset' })
    async verifyChangePasswordOtp(@Res({ passthrough: true }) res: Response, @Body() changePasswordVerifyDto: ChangePasswordVerifyDto, @ClientType() clientType: ClientTypeEnum) {
        const result: IPasswordResetResult = await this.authService.verifyChangePasswordOtp(res, changePasswordVerifyDto, clientType);
        return {
            statusCode: 200,
            message: `OTP verified. Use the reset token to set your new password within ${result.expiresIn}.`,
            data: result,
        };
    }

    @Public()
    @Throttle({ 'short-term': { ttl: 10, limit: 5 } })
    @Post('change-password/reset')
    @ApiOperation({ summary: 'Set new password using the reset token received after OTP verification' })
    async resetPassword(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() resetPasswordDto: ResetPasswordDto, @ClientType() clientType: ClientTypeEnum) {
        let resetToken: string;
        if (clientType === ClientTypeEnum.MOBILE) {
            resetToken = req.headers['x-reset-token'] as string;
            if (!resetToken) throw new UnauthorizedException('Reset token is missing in X-Reset-Token header');
        } else {
            resetToken = req.cookies[this.resetPassNameToken] as string;
            if (!resetToken) throw new UnauthorizedException('Reset password token is missing in cookies');
        }
        const user = await this.authService.resetPassword(resetToken, res, resetPasswordDto, clientType);
        return {
            statusCode: 200,
            message: 'Password changed successfully.',
            data: user,
        };
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout the currently authenticated user' })
    async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request, @User() user: ISanitizedUser, @ClientType() clientType: ClientTypeEnum) {
        let refreshToken: string;
        if (clientType === ClientTypeEnum.MOBILE) {
            refreshToken = req.headers['x-refresh-token'] as string;
            if (!refreshToken) throw new UnauthorizedException('Refresh token is missing in X-Refresh-Token header');
        } else {
            refreshToken = req.cookies[this.refreshTokenName];
            if (!refreshToken) throw new UnauthorizedException('Refresh token is missing in cookies');
        }
        const result: boolean = await this.authService.logout(user, refreshToken, res, clientType);
        return {
            statusCode: 200,
            message: 'Logout successful',
            data: { result },
        };
    }

    @Post('logout-all')
    @ApiOperation({ summary: 'Logout the currently authenticated user from all devices' })
    async logoutAll(@Res({ passthrough: true }) res: Response, @User() user: ISanitizedUser, @ClientType() clientType: ClientTypeEnum) {
        const result: boolean = await this.authService.logoutAll(user, res, clientType);
        return {
            statusCode: 200,
            message: 'All sessions logged out successfully',
            data: { result },
        };
    }

    @Public()
    @UseGuards(GoogleAuthGuard)
    @Get('google')
    @ApiOperation({ summary: 'Initiate Google Login', description: 'With this endpoint, you can set cookie deviceId and then start google login' })
    async googleAuth() {
        // Guard redirects to Google, no implementation needed here
    }

    @Public()
    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    @ApiOperation({ summary: 'Google Auth Callback' })
    async googleAuthRedirect(@UserGoogle() googleUser: GoogleUser, @DeviceId() deviceId: string, @Res({ passthrough: true }) res: Response) {
        try {
            const result = await this.authService.googleLogin(googleUser, res, deviceId); 
            // Sau khi đăng nhập thành công, bạn thường sẽ muốn redirect người dùng về giao diện Frontend
            // Ví dụ: return res.redirect('http://localhost:3000/dashboard');
            const data = { accessToken: result.accessToken, user: result.user };
            const encodedData = Buffer.from(JSON.stringify(data)).toString('base64');
            res.redirect(`${this.urlClient}/google/callback?data=${encodeURIComponent(encodedData)}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Google login failed';
            res.redirect(`${this.urlClient}/login?error=${encodeURIComponent(message)}`);
        }
        // return {
        //     statusCode: 200,
        //     message: 'Google Login successful',
        //     data: {
        //         accessToken: result.accessToken,
        //         user: result.user,
        //     },
        // };
    }
}
