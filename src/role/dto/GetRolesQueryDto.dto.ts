import { PaginationQueryDto } from "@/common/pagination/pagination-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GetRolesQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ description: 'Search term for filtering users by email or username', example: '' })
    @IsOptional()
    @IsString({ message: 'Search must be a string' })
    search?: string;
}