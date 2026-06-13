import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ description: 'Địa chỉ email nhận tin nhắn kiểm tra', example: 'user@example.com' })
  @IsEmail({ }, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  toEmail!: string;
}

export class TestSendRegisterOtpDto {
  @ApiProperty({ description: 'Địa chỉ email của người dùng đăng ký', example: 'user@example.com' })
  @IsEmail({ }, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email!: string;

  @ApiProperty({ description: 'Tên người dùng', example: 'John Doe' })
  @IsNotEmpty({ message: 'Username must not be empty' })
  userName!: string;

  @ApiProperty({ description: 'Mã OTP', example: '123456' })
  @IsNotEmpty({ message: 'OTP must not be empty' })
  otp!: string;

  @ApiProperty({ description: 'Thông báo hết hạn', example: 'Mã OTP sẽ hết hạn sau 10 phút' })
  @IsNotEmpty({ message: 'Expire text must not be empty' })
  expireText!: string;
}