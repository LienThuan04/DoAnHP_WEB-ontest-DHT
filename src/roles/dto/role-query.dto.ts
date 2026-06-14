import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

/** Thay $_POST['manhomquyen'] của Roles::getDetail()/getUsers(). */
export class RoleQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'Mã nhóm quyền không hợp lệ' })
  manhomquyen!: number;
}

/** Thay $_POST['id'] của Roles::delete(). */
export class RoleIdDto {
  @Type(() => Number)
  @IsInt({ message: 'Mã nhóm quyền không hợp lệ' })
  id!: number; // manhomquyen
}
