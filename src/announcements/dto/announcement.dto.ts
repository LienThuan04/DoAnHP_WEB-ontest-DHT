import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * DTO các route AJAX trang Thông báo (announcement.js / update_announce.js gửi
 * $_POST urlencoded). `manhom` tới dưới dạng mảng chuỗi (`manhom[]`) → ép về int[].
 */

/** Chuẩn hoá về mảng số: nhận number[] | string[] | string(JSON) | string đơn. */
function toIntArray(value: unknown): number[] {
  const raw: unknown[] = Array.isArray(value)
    ? value
    : typeof value === 'string' && value.trim().startsWith('[')
      ? ((): unknown[] => {
          try {
            const parsed: unknown = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : value === undefined || value === null || value === ''
        ? []
        : [value];
  return raw.map((v) => Number(v)).filter((n) => Number.isInteger(n));
}

/** Body phân trang: { args: '<json>' } (pagination.js). */
export class AnnouncementPaginationBodyDto {
  @IsString()
  args!: string;
}

/** $_POST của teacher_announcement::sendAnnouncement(). */
export class SendAnnouncementDto {
  @IsNotEmpty()
  @IsString()
  noticeText!: string;

  /** PHP nhận `mamonhoc` nhưng AnnouncementModel::create KHÔNG dùng — giữ để qua whitelist. */
  @IsOptional()
  @IsString()
  mamonhoc?: string;

  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  @IsInt({ each: true })
  manhom!: number[];

  /** Chuỗi 'YYYY/M/D H:m:s' do JS sinh; rỗng → dùng thời điểm hiện tại. */
  @IsOptional()
  @IsString()
  thoigiantao?: string;
}

/** $_POST của teacher_announcement::updateAnnounce(). */
export class UpdateAnnouncementDto {
  @Type(() => Number)
  @IsInt()
  matb!: number;

  @IsNotEmpty()
  @IsString()
  noidung!: string;

  @IsOptional()
  @IsString()
  mamonhoc?: string;

  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  @IsInt({ each: true })
  manhom!: number[];

  @IsOptional()
  @IsString()
  thoigiantao?: string;
}

/** $_POST chỉ có mã thông báo (getDetail / deleteAnnounce). */
export class MatbDto {
  @Type(() => Number)
  @IsInt()
  matb!: number;
}

/** $_POST chỉ có mã nhóm (getAnnounce — offcanvas nhóm). */
export class AnnouncementManhomDto {
  @Type(() => Number)
  @IsInt()
  manhom!: number;
}
