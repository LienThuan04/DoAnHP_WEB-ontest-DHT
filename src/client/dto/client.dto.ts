import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * DTO cho các route AJAX phía sinh viên (client_group.js gửi qua $_POST
 * x-www-form-urlencoded — số tới dạng chuỗi nên ép kiểu khi cần).
 */

/** POST /client/joinGroup — tham gia nhóm bằng mã mời. */
export class JoinGroupDto {
  @IsString()
  mamoi!: string;
}

/** POST /client/loadDataGroups — danh sách nhóm SV theo trạng thái hiển thị. */
export class LoadDataGroupsDto {
  @Type(() => Number)
  @IsInt()
  hienthi!: number;
}

/** POST /client/getFriendList — bạn cùng nhóm. */
export class ClientManhomDto {
  @Type(() => Number)
  @IsInt()
  manhom!: number;
}

/** POST /client/hide — SV ẩn/hiện nhóm (giatri 0|1). */
export class ClientHideDto {
  @Type(() => Number)
  @IsInt()
  manhom!: number;

  @Type(() => Number)
  @IsInt()
  giatri!: number;
}

/** Body phân trang lịch thi (pagination.js gửi `args` là chuỗi JSON). */
export class ClientPaginationBodyDto {
  @IsOptional()
  @IsString()
  args?: string;
}
