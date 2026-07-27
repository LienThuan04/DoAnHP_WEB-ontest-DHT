import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

/**
 * DTO cho AJAX onboarding email ở trang tổng quan (dashboard.js gửi
 * `$_POST[email]` dạng urlencoded). PHP không validate phía server (chỉ regex ở
 * JS) — ở đây thêm @IsEmail cho chắc, và trim khoảng trắng thừa.
 */
export class DashboardEmailDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;
}
