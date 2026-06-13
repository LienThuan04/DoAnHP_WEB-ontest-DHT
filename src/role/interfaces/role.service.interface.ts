import type { PaginatedResult } from '@/common/pagination/pagination.interface';
import type { GetRolesQueryDto } from '@/role/dto/GetRolesQueryDto.dto';
import type { ICreateRoleDto, IRoleEntity } from '@/role/interfaces/role.types';

export interface IRoleService {
  findRoleIdByName(roleNameOrId: string): Promise<string | null>;
  create(createRoleDto: ICreateRoleDto): Promise<IRoleEntity>;
  findAll(query: GetRolesQueryDto): Promise<PaginatedResult<IRoleEntity>>;
  findOne(id: string): Promise<IRoleEntity | null>;
  update(id: string, updateRoleDto: Partial<ICreateRoleDto>): Promise<IRoleEntity | null>;
  remove(id: string): Promise<IRoleEntity | null>;
}
