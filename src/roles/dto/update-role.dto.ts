import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { CreateRoleDto } from '@/roles/dto/create-role.dto';

/** Thay $_POST['id'] + name + roles của Roles::edit(). */
export class UpdateRoleDto extends CreateRoleDto {
  @Type(() => Number)
  @IsInt({ message: 'Mã nhóm quyền không hợp lệ' })
  id!: number; // manhomquyen
}
