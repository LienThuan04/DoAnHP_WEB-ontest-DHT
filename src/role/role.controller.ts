import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { RoleService } from '@/role/role.service';
import { CreateRoleDto } from '@/role/dto/create-role.dto';
import { UpdateRoleDto } from '@/role/dto/update-role.dto';
import { RoleEntity } from '@/role/entities/role.entity';
import { IApiResponse } from '@/common/interceptors/transform.interceptor';
import { AdminOnly } from '@/common/decorators/metadata';
import type { IRoleController } from '@/role/interfaces/role.controller.interface';
import { GetRolesQueryDto } from '@/role/dto/GetRolesQueryDto.dto';

@AdminOnly()
@Controller('role')
export class RoleController implements IRoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<IApiResponse<RoleEntity>> {
    const result = await this.roleService.create(createRoleDto);
    return { statusCode: 201, message: 'Role created successfully', data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  async findAll(@Query() query: GetRolesQueryDto) {
    const result =  await this.roleService.findAll(query);
    return { statusCode: 200, message: 'Roles retrieved successfully', data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  async findOne(@Param('id') id: string): Promise<IApiResponse<RoleEntity>> {
     const result = await this.roleService.findOne(id);
     return { statusCode: 200, message: 'Role retrieved successfully', data: result };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<IApiResponse<RoleEntity>> {
    const result = await this.roleService.update(id, updateRoleDto);
    return { statusCode: 200, message: 'Role updated successfully', data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  async remove(@Param('id') id: string): Promise<IApiResponse<RoleEntity>> {
    const result = await this.roleService.remove(id);
    return { statusCode: 200, message: 'Role deleted successfully', data: result };
  }
}
 