import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO cho các route AJAX trang Nhóm học phần (module.js gửi qua $_POST urlencoded).
 * Số (namhoc=manamhoc, hocky=mahocky, manhom, giatri) tới dưới dạng chuỗi nên ép
 * kiểu bằng @Type(() => Number). Tên field khớp $_POST của module.php.
 */

/** $_POST của Module::add() — tennhom/ghichu/monhoc/namhoc/hocky. */
export class AddGroupDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên nhóm' })
  @IsString()
  tennhom!: string;

  @IsOptional()
  @IsString()
  ghichu?: string;

  @IsNotEmpty({ message: 'Vui lòng chọn môn học' })
  @IsString()
  monhoc!: string;

  @Type(() => Number)
  @IsInt()
  namhoc!: number;

  @Type(() => Number)
  @IsInt()
  hocky!: number;
}

/** $_POST của Module::update() — như add + manhom. */
export class UpdateGroupDto extends AddGroupDto {
  @Type(() => Number)
  @IsInt()
  manhom!: number;
}

/** $_POST của Module::checkDuplicate() — thiếu ghichu; manhom optional để loại trừ. */
export class CheckDuplicateDto {
  @IsNotEmpty()
  @IsString()
  tennhom!: string;

  @IsNotEmpty()
  @IsString()
  monhoc!: string;

  @Type(() => Number)
  @IsInt()
  namhoc!: number;

  @Type(() => Number)
  @IsInt()
  hocky!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  manhom?: number;
}

/** $_POST chỉ có mã nhóm (delete / getDetail). */
export class ManhomDto {
  @Type(() => Number)
  @IsInt()
  manhom!: number;
}

/** $_POST của Module::hide() — manhom + giatri (0 ẩn, 1 hiện). */
export class HideGroupDto {
  @Type(() => Number)
  @IsInt()
  manhom!: number;

  @Type(() => Number)
  @IsInt()
  giatri!: number;
}

/** $_POST của Module::getHocKy() — chỉ mã năm học. */
export class GetHocKyDto {
  @Type(() => Number)
  @IsInt()
  namhoc!: number;
}

/** Body phân trang danh sách SV: { args: '<json>' } (pagination.js, model=NhomModel). */
export class GroupPaginationBodyDto {
  @IsString()
  args!: string;
}

/** $_POST của Module::checkAcc() — mssv + manhom. */
export class CheckAccDto {
  @IsNotEmpty()
  @IsString()
  mssv!: string;

  @Type(() => Number)
  @IsInt()
  manhom!: number;
}

/** $_POST của Module::addSvGroup() — thêm SV có sẵn vào nhóm. */
export class AddSvGroupDto {
  @Type(() => Number)
  @IsInt()
  manhom!: number;

  @IsNotEmpty()
  @IsString()
  mssv!: string;
}

/** $_POST của Module::addSV() — tạo tài khoản SV rồi thêm vào nhóm. */
export class AddSvDto {
  @Type(() => Number)
  @IsInt()
  manhom!: number;

  @IsNotEmpty()
  @IsString()
  mssv!: string;

  @IsNotEmpty()
  @IsString()
  hoten!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}

/** $_POST của Module::addStudentsByClassCode() — malop + manhom. */
export class AddByClassCodeDto {
  @IsNotEmpty()
  @IsString()
  malop!: string;

  @Type(() => Number)
  @IsInt()
  manhom!: number;
}

/** $_POST của Module::kickUser() — manhom + manguoidung (mssv). */
export class KickUserDto {
  @Type(() => Number)
  @IsInt()
  manhom!: number;

  @IsNotEmpty()
  @IsString()
  manguoidung!: string;
}
