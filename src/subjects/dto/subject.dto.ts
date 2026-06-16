import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO cho các route AJAX trang Môn học (gửi qua $_POST trong subject.js).
 * Form gửi x-www-form-urlencoded nên số tới dưới dạng chuỗi — ép kiểu bằng
 * @Type(() => Number) cho các trường số tiết/tín chỉ.
 */

/** Body phân trang: { args: '<json>' } — pagination.js đóng gói tham số trong args. */
export class PaginationBodyDto {
  @IsString()
  args!: string;
}

/** $_POST của Subject::add() — mã + tên + tín chỉ + số tiết LT/TH. */
export class AddSubjectDto {
  @IsNotEmpty({ message: 'Vui lòng nhập mã môn học' })
  @IsString()
  mamon!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập tên môn học' })
  @IsString()
  tenmon!: string;

  @Type(() => Number)
  @IsInt()
  sotinchi!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sotietlythuyet?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sotietthuchanh?: number;
}

/** $_POST của Subject::update() — như add nhưng kèm `id` (mã môn cũ làm khoá). */
export class UpdateSubjectDto {
  @IsNotEmpty()
  @IsString()
  id!: string; // mã môn dùng làm điều kiện WHERE

  @IsNotEmpty({ message: 'Vui lòng nhập mã môn học' })
  @IsString()
  mamon!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập tên môn học' })
  @IsString()
  tenmon!: string;

  @Type(() => Number)
  @IsInt()
  sotinchi!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sotietlythuyet?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sotietthuchanh?: number;
}

/** $_POST['mamon'] của checkSubject()/getDetail()/delete(). */
export class SubjectIdDto {
  @IsNotEmpty()
  @IsString()
  mamon!: string;
}

/** $_POST['input'] của Subject::search(). */
export class SearchSubjectDto {
  @IsOptional()
  @IsString()
  input?: string = '';
}

/** $_POST['mamonhoc'] của Subject::getAllChapter(). */
export class ChapterListDto {
  @IsNotEmpty()
  @IsString()
  mamonhoc!: string;
}

/** $_POST của Subject::addChapter() — {mamonhoc, tenchuong}. */
export class AddChapterDto {
  @IsNotEmpty()
  @IsString()
  mamonhoc!: string;

  @IsNotEmpty({ message: 'Tên chương không để trống' })
  @IsString()
  tenchuong!: string;
}

/** $_POST của Subject::updateChapter() — {machuong, tenchuong}. */
export class UpdateChapterDto {
  @Type(() => Number)
  @IsInt()
  machuong!: number;

  @IsNotEmpty({ message: 'Tên chương không để trống' })
  @IsString()
  tenchuong!: string;
}

/** $_POST['machuong'] của Subject::chapterDelete(). */
export class ChapterIdDto {
  @Type(() => Number)
  @IsInt()
  machuong!: number;
}
