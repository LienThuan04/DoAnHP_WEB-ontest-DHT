import { PaginationQueryDto } from "@/common/pagination/pagination-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for filtering users by email or username', example: '' })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ApiPropertyOptional({ description: 'Filter users by role name', example: '' })
  @IsOptional()
  @IsString({ message: 'Role name must be a string' })
  roleName?: string;
}
