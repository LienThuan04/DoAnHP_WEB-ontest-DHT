import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO cho các route AJAX trang Câu hỏi (gửi qua $_POST trong question.js).
 * Form gửi x-www-form-urlencoded nên số tới dạng chuỗi — ép kiểu bằng
 * @Type(() => Number) khi cần.
 */

/** $_POST['id'] của getQuestionById()/getAnswerById(). */
export class QuestionIdDto {
  @Type(() => Number)
  @IsInt()
  id!: number;
}

/** $_POST['macauhoi'] của delete(). */
export class DeleteQuestionDto {
  @Type(() => Number)
  @IsInt()
  macauhoi!: number;
}

/**
 * $_POST của getQuestionBySubject()/getTotalPageQuestionBySubject().
 * machuong/dokho = 0 nghĩa là "tất cả" (không lọc) — giữ đúng quy ước PHP.
 */
export class QuestionBySubjectDto {
  @IsNotEmpty({ message: 'Thiếu mã môn học' })
  @IsString()
  mamonhoc!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  machuong?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dokho?: number = 0;

  @IsOptional()
  @IsString()
  content?: string = '';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;
}
