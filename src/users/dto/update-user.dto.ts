import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/** Thay $_POST của User::update(). password trống = không đổi mật khẩu. */
export class UpdateUserDto {
  @IsNotEmpty({ message: 'Thiếu mã người dùng' })
  @IsString()
  id!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  @IsString()
  hoten!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  ngaysinh?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  gioitinh?: number;

  @IsOptional()
  @IsString()
  sodienthoai?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  role?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
