import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO cho các route AJAX của trang Năm học (gửi qua $_POST trong namhoc.js).
 * Form gửi dạng x-www-form-urlencoded nên mọi giá trị tới dưới dạng chuỗi —
 * dùng @Type(() => Number) để ép kiểu giống (int)$_POST[...] bên PHP.
 */

/** $_POST của NamHoc::getNamHoc() — {page, limit, q}. Tất cả tuỳ chọn. */
export class GetNamHocDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  q?: string = '';
}

/** $_POST của NamHoc::addNamHoc() — {tennamhoc, sohocky}. */
export class AddNamHocDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên năm học' })
  @IsString()
  tennamhoc!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sohocky?: number = 3;
}

/** $_POST của NamHoc::updateNamHoc() — {manamhoc, tennamhoc, trangthai, sohocky?}. */
export class UpdateNamHocDto {
  @Type(() => Number)
  @IsInt({ message: 'Mã năm học không hợp lệ' })
  manamhoc!: number;

  @IsNotEmpty({ message: 'Vui lòng nhập tên năm học' })
  @IsString()
  tennamhoc!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  trangthai?: number = 1;

  // null = không đổi số học kỳ (giống $sohocky !== null bên PHP).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sohocky?: number;
}

/** $_POST['manamhoc'] của NamHoc::deleteNamHoc() / getHocKy(). */
export class NamHocIdDto {
  @Type(() => Number)
  @IsInt({ message: 'Mã năm học không hợp lệ' })
  manamhoc!: number;
}
