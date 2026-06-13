import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ description: 'The RoleName of the role', example: 'Admin' })
    @IsNotEmpty({ message: 'RoleName is required' })
    @IsString({ message: 'RoleName must be a string' })
    @MaxLength(50, { message: 'RoleName must be at most 50 characters' })
    @MinLength(2, { message: 'RoleName must be at least 2 characters' })
    roleName!: string;

    @ApiProperty({ description: 'The description of the role', example: 'Administrator role with full access' })
    @IsOptional({ message: 'Description is optional' })
    @IsString({ message: 'Description must be a string' })
    description?: string;
}
