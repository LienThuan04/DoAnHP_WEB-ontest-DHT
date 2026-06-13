import { CreateRoleDto } from '@/role/dto/create-role.dto';
import { PartialType } from '@nestjs/swagger'; // PartialType is a utility function provided by NestJS that creates a new type based on an existing one, making all properties optional. This is particularly useful for update operations where you may not want to require all fields to be provided.

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
