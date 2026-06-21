import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

/**
 * DTO cho các route AJAX trang Đề thi (gửi qua $_POST trong test.js / action_test.js).
 * Form gửi x-www-form-urlencoded nên số tới dạng chuỗi — ép kiểu khi cần.
 */

/** $_POST['args'] (JSON phân trang) của pagination()/getTotalPages(). */
export class ExamPaginationBodyDto {
  @IsString()
  args!: string;
}

/** $_POST['made'] của delete(). */
export class DeleteExamDto {
  @Type(() => Number)
  @IsInt()
  made!: number;
}

/** $_POST['made'] của getDetail(). */
export class ExamIdDto {
  @Type(() => Number)
  @IsInt()
  made!: number;
}
