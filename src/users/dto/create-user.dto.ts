import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Thay $_POST của User::add(). Lưu ý: như PHP, người dùng mới luôn vào
 * nhóm quyền 2 (sinh viên) + trạng thái hoạt động — role/status ở đây không
 * dùng khi tạo (giữ để khớp form), service hardcode manhomquyen=2, trangthai=1.
 */
export class CreateUserDto {
  @IsNotEmpty({ message: 'Vui lòng nhập mã người dùng' })
  @IsString()
  masinhvien!: string; // nguoidung.id

  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  @IsString()
  hoten!: string;

  @IsNotEmpty({ message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

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
