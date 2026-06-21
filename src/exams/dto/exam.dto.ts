import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

/**
 * DTO cho các route AJAX trang Đề thi (gửi qua $_POST trong test.js / action_test.js).
 * Form gửi x-www-form-urlencoded nên số tới dạng chuỗi — ép kiểu khi cần.
 */

/** Ép giá trị form (1 phần tử → chuỗi, nhiều → mảng) về mảng số nguyên. */
const toIntArray = ({ value }: { value: unknown }): number[] => {
  if (value == null || value === '') return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((v) => parseInt(String(v), 10)).filter((n) => !isNaN(n));
};

/** Ép giá trị form về mảng chuỗi (bỏ rỗng). */
const toStringArray = ({ value }: { value: unknown }): string[] => {
  if (value == null || value === '') return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((v) => String(v).trim()).filter((s) => s !== '');
};

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

/**
 * Body của addTest() (tạo đề) — action_test.js gửi urlencoded. Số & cờ tới dạng
 * chuỗi, mảng tới qua `chuong[]`/`manhom[]`/`loaicauhoi[]`. `socau` là chuỗi JSON
 * `{ [loai]: {de,tb,kho} }`. Validate/parse chi tiết nằm ở service (như PHP).
 */
export class CreateTestDto {
  @IsOptional()
  @IsString()
  mamonhoc?: string = '';

  @IsOptional()
  @IsString()
  tende?: string = '';

  @IsOptional()
  @IsString()
  thoigianthi?: string;

  @IsOptional()
  @IsString()
  thoigianbatdau?: string;

  @IsOptional()
  @IsString()
  thoigianketthuc?: string;

  /** JSON `{ [loai]: {de,tb,kho} }`. */
  @IsOptional()
  @IsString()
  socau?: string;

  @IsOptional()
  @IsString()
  diem_tracnghiem?: string;

  @IsOptional()
  @IsString()
  diem_tuluan?: string;

  @IsOptional()
  @IsString()
  diem_dochieu?: string;

  @IsOptional()
  @Transform(toIntArray)
  @IsArray()
  chuong: number[] = [];

  @IsOptional()
  @Transform(toIntArray)
  @IsArray()
  manhom: number[] = [];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  loaicauhoi: string[] = [];

  @IsOptional()
  @IsString()
  loaide?: string;

  @IsOptional()
  @IsString()
  xemdiem?: string;

  @IsOptional()
  @IsString()
  xemdapan?: string;

  @IsOptional()
  @IsString()
  xembailam?: string;

  @IsOptional()
  @IsString()
  daocauhoi?: string;

  @IsOptional()
  @IsString()
  daodapan?: string;

  @IsOptional()
  @IsString()
  tudongnop?: string;
}

/** Body của updateTest() — như CreateTestDto kèm `made`. */
export class UpdateTestDto extends CreateTestDto {
  @Type(() => Number)
  @IsInt()
  made!: number;
}
