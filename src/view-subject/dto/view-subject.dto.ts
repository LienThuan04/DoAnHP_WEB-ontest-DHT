import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

/**
 * DTO cho các route AJAX trang "Môn học của tôi" (view_subject.js gửi $_POST).
 * Các DTO thao tác chương dùng lại của module subjects (cùng bảng `chuong`).
 */

/** Body phân trang: { args: '<json>' } — pagination.js đóng gói tham số trong args. */
export class ViewSubjectPaginationBodyDto {
  @IsString()
  args!: string;
}

/** $_POST['namhoc'] của view_subject::getHocKy() — mã năm học. */
export class ViewSubjectHocKyDto {
  @Type(() => Number)
  @IsInt()
  namhoc!: number;
}
