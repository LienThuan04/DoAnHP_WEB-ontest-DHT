import { IsNotEmpty, IsString } from 'class-validator';

/** Thay $_POST['id'] / $_POST['password'] của auth.php — có validate. */
export class ExamLoginDto {
  @IsNotEmpty({ message: 'Vui lòng nhập mã đăng nhập' })
  @IsString()
  id!: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  @IsString()
  password!: string;
}
