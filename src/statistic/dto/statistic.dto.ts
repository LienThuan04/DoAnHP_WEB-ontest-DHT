import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * DTO cho các route AJAX trang Thống kê (statistic.js gửi qua $_POST urlencoded).
 * Số tới dạng chuỗi nên ép kiểu; giá trị rỗng/"null" (jQuery serialize null → "")
 * coi như KHÔNG lọc để khớp `!empty(...)` của PHP.
 */

/** '' | 'null' | null → undefined; còn lại → Number. */
const toOptionalInt = ({ value }: { value: unknown }): number | undefined =>
  value === '' || value === 'null' || value == null
    ? undefined
    : Number(value);

/** '' | 'null' | null → undefined; còn lại → String. */
const toOptionalString = ({ value }: { value: unknown }): string | undefined =>
  value === '' || value === 'null' || value == null
    ? undefined
    : String(value);

/** $_POST[made,manhom] — thống kê chi tiết 1 đề (getStatictical). */
export class StatDetailDto {
  @Type(() => Number)
  @IsInt()
  made!: number;

  @Type(() => Number)
  @IsInt()
  manhom!: number;
}

/** $_POST[mahocky,namhoc] — nạp môn học + nhóm cho lọc tổng hợp (getFilters). */
export class StatFiltersDto {
  @Type(() => Number)
  @IsInt()
  mahocky!: number;

  @Type(() => Number)
  @IsInt()
  namhoc!: number;
}

/** $_POST[mahocky,namhoc,mamonhoc] — nhóm theo môn học (getGroupsBySubject). */
export class StatGroupsBySubjectDto extends StatFiltersDto {
  @IsString()
  mamonhoc!: string;
}

/** $_POST[mahocky,namhoc,mamonhoc?,manhom?] — thống kê tổng hợp (getAggregatedStatistical). */
export class StatAggregatedDto extends StatFiltersDto {
  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  mamonhoc?: string;

  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  manhom?: number;
}
