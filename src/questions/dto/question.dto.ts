import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/** Ép giá trị form (1 phần tử → chuỗi, nhiều → mảng) về mảng số nguyên. */
const toIntArray = ({ value }: { value: unknown }): number[] => {
  if (value == null || value === '') return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((v) => parseInt(String(v), 10)).filter((n) => !isNaN(n));
};

/** Ép giá trị form về mảng chuỗi (giữ nguyên giá trị, bỏ rỗng). */
const toStringArray = ({ value }: { value: unknown }): string[] => {
  if (value == null || value === '') return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((v) => String(v).trim()).filter((s) => s !== '');
};

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

/** $_POST['questions'] (JSON mảng câu hỏi preview) của updateQuestionJSON(). */
export class UpdateQuestionJsonDto {
  @IsNotEmpty({ message: 'Không có dữ liệu' })
  @IsString()
  questions!: string;
}

/** $_POST của addQuesFile(): môn/chương + JSON mảng câu hỏi đã preview. */
export class AddQuesFileDto {
  @IsNotEmpty({ message: 'Thiếu môn học' })
  @IsString()
  monhoc!: string;

  @IsNotEmpty({ message: 'Thiếu chương' })
  @IsString()
  chuong!: string;

  @IsNotEmpty({ message: 'Không có dữ liệu' })
  @IsString()
  questions!: string;
}

/**
 * $_POST của getsoluongcauhoi() — đếm số câu theo loại/mức độ cho trang tạo đề.
 * `chuong[]` & `loaicauhoi[]` tới dạng mảng (urlencoded); `dokho` bị bỏ qua như
 * PHP (controller tính cả 3 mức). chuong rỗng = đếm toàn môn.
 */
export class QuestionCountDto {
  @IsOptional()
  @Transform(toIntArray)
  @IsArray()
  chuong: number[] = [];

  @IsNotEmpty({ message: 'Thiếu mã môn học' })
  @IsString()
  monhoc!: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  loaicauhoi: string[] = [];

  /** action_test.js gửi kèm nhưng controller bỏ qua (tính cả 3 mức). */
  @IsOptional()
  @IsString()
  dokho?: string;
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
