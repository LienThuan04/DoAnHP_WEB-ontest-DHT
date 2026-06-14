import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

/** Một quyền được tick trên form (checkbox) — { name: chucnang, action: hanhdong }. */
export class RolePermissionDto {
  @IsNotEmpty()
  @IsString()
  name!: string; // chucnang (vd 'cauhoi', 'dethi')

  @IsNotEmpty()
  @IsString()
  action!: string; // hanhdong (vd 'view','create','update','delete','join')
}

/** Thay $_POST['name'] + $_POST['roles'] của Roles::add(). */
export class CreateRoleDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên nhóm quyền' })
  @IsString()
  name!: string; // tennhomquyen

  @IsArray()
  @ArrayNotEmpty({ message: 'Bạn phải chọn quyền' })
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  roles!: RolePermissionDto[];
}
