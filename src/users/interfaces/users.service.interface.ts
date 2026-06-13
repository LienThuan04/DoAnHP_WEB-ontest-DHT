import type { UserImageType } from '@/users/enums/UserImageType.enum';
import type { GetUsersQueryDto } from '@/users/dto/GetUsersQueryDto.dto';
import type { PaginatedResult } from '@/common/pagination/pagination.interface';
import type {
  ICreateUserDto,
  IUpdateUserDto,
  IUserEntity,
  IUserEntityWithPassword,
} from '@/users/interfaces/users.types';

export interface IUsersService {
  checkEmailOrUsernameExists(email: string, userName: string, excludeId?: string): Promise<{ exists: boolean; field?: 'email' | 'username' | undefined }>;
  searchUserByEmailOrUsernameOrId(emailOrUserNameOrId: string): Promise<IUserEntityWithPassword | null>;
  create(createUserDto: ICreateUserDto): Promise<IUserEntity>;
  findAll(query: GetUsersQueryDto): Promise<PaginatedResult<IUserEntity>>;
  findOne(id: string): Promise<IUserEntity>;
  update(id: string, updateUserDto: IUpdateUserDto): Promise<IUserEntity>;
  updateRole(id: string, roleNameOrId: string): Promise<IUserEntity>;
  updateAvatarOrBG(id: string, fileUrl: string, typeImgProfile: UserImageType): Promise<IUserEntity>;
  remove(id: string): Promise<IUserEntity>;
}
