import type { IApiResponse } from '@/common/interceptors/transform.interceptor';
import type { GetUsersQueryDto } from '@/users/dto/GetUsersQueryDto.dto';
import type { PaginatedResult } from '@/common/pagination/pagination.interface';
import type { ISanitizedUser } from '@/auth/interfaces/auth.types';
import type { RequestUpdateUserOtpDto, VerifyUpdateUserOtpDto } from '@/users/dto/update-user.dto';
import type {
  ICreateUserDto,
  IUpdateUserDto,
  IUpdateUserRoleDto,
  IUpdateUserAvatarOrBGDto,
  IUserEntity,
  IRequestUpdateOtpApiResponse,
} from '@/users/interfaces/users.types';

export interface IUsersController {
  create(createUserDto: ICreateUserDto): Promise<IApiResponse<IUserEntity>>;
  findAll(query: GetUsersQueryDto): Promise<IApiResponse<PaginatedResult<IUserEntity>>>;
  findOne(id: string): Promise<IApiResponse<IUserEntity>>;
  update(id: string, updateUserDto: IUpdateUserDto): Promise<IApiResponse<IUserEntity>>;
  requestUpdateOtp(user: ISanitizedUser, dto: RequestUpdateUserOtpDto): Promise<IRequestUpdateOtpApiResponse>;
  verifyUpdateOtp(user: ISanitizedUser, dto: VerifyUpdateUserOtpDto): Promise<IApiResponse<IUserEntity>>;
  updateRole(id: string, updateUserRoleDto: IUpdateUserRoleDto): Promise<IApiResponse<IUserEntity>>;
  updateAvatarOrBG(id: string, currentUser: ISanitizedUser, file: Express.Multer.File, updateUserAvatarOrBGDto: IUpdateUserAvatarOrBGDto): Promise<IApiResponse<IUserEntity>>;
  remove(id: string): Promise<IApiResponse<IUserEntity>>;
}
