import type { IApiResponse } from '@/common/interceptors/transform.interceptor';
import type { PaginatedResult } from '@/common/pagination/pagination.interface';
import type { GetRolesQueryDto } from '@/role/dto/GetRolesQueryDto.dto';
import type { ICreateRoleDto, IRoleEntity } from '@/role/interfaces/role.types';

export interface IRoleController {
  create(createRoleDto: ICreateRoleDto): Promise<IApiResponse<IRoleEntity>>;
  findAll(query: GetRolesQueryDto): Promise<IApiResponse<PaginatedResult<IRoleEntity>>>;
  findOne(id: string): Promise<IApiResponse<IRoleEntity | null>>;
  update(id: string, updateRoleDto: Partial<ICreateRoleDto>): Promise<IApiResponse<IRoleEntity | null>>;
  remove(id: string): Promise<IApiResponse<IRoleEntity | null>>;
}
