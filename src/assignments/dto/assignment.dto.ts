import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * DTO cho các route AJAX trang Phân công (assignment.js gửi qua $_POST urlencoded).
 * listSubject tới dưới dạng mảng urlencoded (`listSubject[]`) hoặc chuỗi JSON — chuẩn
 * hoá về string[] bằng @Transform. namhoc/hocky (mã) là số → @Type(() => Number).
 */

/** Chuẩn hoá về mảng chuỗi: nhận string[] | string(JSON) | string đơn. */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === 'string') {
    const s = value.trim();
    if (s.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v));
      } catch {
        /* rơi xuống trả 1 phần tử */
      }
    }
    return s ? [s] : [];
  }
  return [];
}

/** Body phân trang: { args: '<json>' } (pagination.js). */
export class AssignmentPaginationBodyDto {
  @IsString()
  args!: string;
}

/** $_POST của Assignment::getHocKy() — mã năm học. */
export class GetHocKyDto {
  @Type(() => Number)
  @IsInt()
  manamhoc!: number;
}

/** $_POST của Assignment::addAssignment() / checkDuplicate(). */
export class AddAssignmentDto {
  @IsNotEmpty()
  @IsString()
  magiangvien!: string;

  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  listSubject!: string[];

  @Type(() => Number)
  @IsInt()
  namhoc!: number;

  @Type(() => Number)
  @IsInt()
  hocky!: number;
}

/** $_POST của Assignment::checkDuplicateForUpdate(). */
export class CheckDuplicateForUpdateDto {
  @IsNotEmpty()
  @IsString()
  magiangvien!: string;

  @IsNotEmpty()
  @IsString()
  old_mamonhoc!: string;

  @Type(() => Number)
  @IsInt()
  namhoc!: number;

  @Type(() => Number)
  @IsInt()
  hocky!: number;
}

/** $_POST của Assignment::update(). */
export class UpdateAssignmentDto {
  @IsNotEmpty()
  @IsString()
  old_mamonhoc!: string;

  @IsNotEmpty()
  @IsString()
  old_manguoidung!: string;

  @Type(() => Number)
  @IsInt()
  old_namhoc!: number;

  @Type(() => Number)
  @IsInt()
  old_hocky!: number;

  @IsNotEmpty()
  @IsString()
  magiangvien!: string;
}

/** $_POST của Assignment::delete(). */
export class DeleteAssignmentDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  mamon!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  namhoc?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hocky?: number;
}
