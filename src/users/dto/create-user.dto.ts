import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ description: 'The email of the user', example: 'user@example.com' })
    @IsEmail({}, { message: 'Invalid email address' })
    email!: string;

    @ApiProperty({ description: 'The password of the user', example: 'P@ssw0rd' })
    @IsNotEmpty({ message: 'Password is required' })
    @MaxLength(100, { message: 'Password must be at most 100 characters' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @IsString({ message: 'Password must be a string' })
    password!: string;

    @ApiProperty({ description: 'The username of the user', example: 'johndoe' })
    @IsNotEmpty({ message: 'Username is required' })
    @MaxLength(50, { message: 'Username must be at most 50 characters' })
    @MinLength(6, { message: 'Username must be at least 6 characters' })
    @IsString({ message: 'Username must be a string' })
    userName!: string;

    @ApiProperty({ description: 'The role of the user', example: 'USER' })
    @IsString({ message: 'Role name must be a string' })
    @IsOptional({ message: 'Role name is optional if is null then default role will be user' })
    roleName?: string;


}
