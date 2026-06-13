import type { UserImageType } from '@/users/enums/UserImageType.enum';

export interface ICreateUserDto {
  email: string;
  userName: string;
  password: string;
  roleName?: string;
}

export interface IUpdateUserDto extends Omit<ICreateUserDto, 'roleName' | 'password'> {
  description?: string | undefined;
}

export interface IUpdateUserRoleDto {
  roleNameOrId: string;
}

export interface IUpdateUserAvatarOrBGDto {
  typeImgProfile: UserImageType;
}

export interface IUserEntity {
  id: string;
  email: string;
  userName: string;
  googleId?: string | null;
  accountType: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  description?: string | null;
  roleId: string;
  roleName: string;
}

export interface IUserEntityWithPassword extends IUserEntity {
  password: string | null;
}

export interface IRequestUpdateOtpApiResponse {
  statusCode: number;
  message: string;
  skipOtp: boolean;
  data: IUserEntity | { targetEmail: string; changes: string[] };
}
