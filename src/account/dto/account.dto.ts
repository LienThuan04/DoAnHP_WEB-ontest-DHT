import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO các route AJAX trang cá nhân (account_setting.js gửi $_POST).
 * Form gửi x-www-form-urlencoded nên mọi trường tới dưới dạng chuỗi.
 */

/** $_POST của Account::changePassword() — {matkhaucu, matkhaumoi}. */
export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu hiện tại' })
  @IsString()
  matkhaucu!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu mới' })
  @IsString()
  matkhaumoi!: string;
}

/** $_POST của Account::changeProfile() — {hoten, email, ngaysinh, gioitinh}. */
export class ChangeProfileDto {
  @IsNotEmpty({ message: 'Vui lòng không được để trống họ tên' })
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  hoten!: string;

  @IsEmail({}, { message: 'Vui lòng nhập đúng định dạng email' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  /** Chuỗi `Y-m-d` từ flatpickr; rỗng → service dùng mặc định như PHP. */
  @IsOptional()
  @IsString()
  ngaysinh?: string;

  /** '1' = Nam, '0' = Nữ; không chọn radio nào thì field vắng mặt. */
  @IsOptional()
  @IsString()
  gioitinh?: string;
}
