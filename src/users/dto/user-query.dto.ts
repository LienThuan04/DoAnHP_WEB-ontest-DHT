import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Body phân trang: pagination.js gửi { args: JSON.stringify(...) }. */
export class PaginationBodyDto {
  @IsNotEmpty()
  @IsString()
  args!: string;
}

/** Thay $_POST['mssv'] + $_POST['email'] của User::checkUser(). */
export class CheckUserDto {
  @IsOptional()
  @IsString()
  mssv?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

/** Thay $_POST['id'] của getDetail/deleteData. */
export class UserIdDto {
  @IsNotEmpty({ message: 'Thiếu mã người dùng' })
  @IsString()
  id!: string;
}

/** Thay $_POST['id'] + $_POST['status'] của User::setStatus(). */
export class SetStatusDto {
  @IsNotEmpty({ message: 'Thiếu mã người dùng' })
  @IsString()
  id!: string;

  @Type(() => Number)
  @IsInt()
  status!: number;
}
