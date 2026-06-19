import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO cho các route AJAX trang Câu hỏi (gửi qua $_POST trong question.js).
 * Form gửi x-www-form-urlencoded nên số tới dạng chuỗi — ép kiểu bằng
 * @Type(() => Number) khi cần.
 */

/** $_POST['args'] (JSON phân trang) của pagination()/getTotalPages(). */
export class PaginationBodyDto {
  @IsString()
  args!: string;
}

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

/**
 * Body (text fields) của addQues/editQuesion — gửi multipart/form-data kèm file.
 * Mọi field tới dạng chuỗi (kể cả số & JSON `cautraloi`); service tự parse/ép kiểu
 * như controller PHP. Tên property snake_case để khớp tên field FormData gốc.
 */
export class WriteQuestionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  mamon?: string;

  @IsOptional()
  @IsString()
  machuong?: string;

  @IsOptional()
  @IsString()
  dokho?: string;

  @IsOptional()
  @IsString()
  loai?: string;

  @IsOptional()
  @IsString()
  noidung?: string;

  @IsOptional()
  @IsString()
  doanvan_noidung?: string;

  @IsOptional()
  @IsString()
  doanvan_tieude?: string;

  @IsOptional()
  @IsString()
  cautraloi?: string;

  @IsOptional()
  @IsString()
  delete_question_image?: string;
}
