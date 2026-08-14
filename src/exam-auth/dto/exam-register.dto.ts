import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/** Cắt khoảng trắng cho field chuỗi gửi qua form. */
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * $_POST của trang đăng ký (signup) — bản PHP submit sang `user/add`.
 * KHÁC PHP: cổng đăng ký công khai KHÔNG dùng lại `/user/add` (route quản trị)
 * mà có route riêng `/auth/addUser`, và KHÔNG nhận `role`/`status` từ client —
 * tài khoản đăng ký luôn là Sinh viên (nhóm quyền 2), trạng thái hoạt động.
 */
export class ExamRegisterDto {
  @IsNotEmpty({ message: 'Vui lòng nhập mã sinh viên' })
  @IsString()
  @Transform(trim)
  masinhvien!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  @IsString()
  @Transform(trim)
  hoten!: string;

  /** `Y-m-d` từ input type=date; rỗng → mặc định như PHP. */
  @IsOptional()
  @IsString()
  ngaysinh?: string;

  /** '0' = Nam, '1' = Nữ (đúng thứ tự option của signup.php). */
  @IsOptional()
  @IsString()
  gioitinh?: string;

  @IsOptional()
  @IsString()
  sodienthoai?: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập lại mật khẩu' })
  @IsString()
  confirm_password!: string;
}

/** $_POST['reminder-credential'] của Auth::sendOptAuth(). */
export class SendOtpDto {
  @IsEmail({}, { message: 'Địa chỉ email phải đúng định dạng' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  'reminder-credential'!: string;
}

/** $_POST['otp'] của Auth::checkOpt(). */
export class CheckOtpDto {
  @IsNotEmpty({ message: 'Vui lòng nhập mã OTP' })
  @IsString()
  @Transform(trim)
  otp!: string;
}

/** $_POST['password'] của Auth::changePassword() (bước cuối khôi phục). */
export class ResetPasswordDto {
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;
}
