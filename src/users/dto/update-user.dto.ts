import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserImageType } from '@/users/enums/UserImageType.enum';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password', 'roleName'] as const)) {
    @ApiProperty({ description: 'The description of the user', example: 'This is a user description' })
    @IsString({ message: 'Role ID must be a string' })
    @MaxLength(500, { message: 'Role ID must be at most 500 characters' })
    description?: string;
}

export class UpdateUserRoleDto {
    @ApiProperty({ description: 'The new role name or ID of the user', example: 'ADMIN' })
    @IsString({ message: 'Role name or ID must be a string' })
    @MaxLength(100, { message: 'Role name or ID must be at most 100 characters' })
    roleNameOrId!: string;
}


export class UpdateUserAvatarOrBGDto {
    @ApiProperty({
        description: 'Choose image type',
        enum: UserImageType,
        example: UserImageType.AVATAR,
    })
    @IsEnum(UserImageType, { message: 'Type must be either avatar or background' })
    typeImgProfile!: UserImageType;
}

// --- OTP Update Flow DTOs ---

export class RequestUpdateUserOtpDto {
    @ApiProperty({ description: 'New email (optional)', example: 'newemail@example.com', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email address' })
    email?: string;

    @ApiProperty({ description: 'New username (optional)', example: 'newusername', required: false })
    @IsOptional()
    @IsString({ message: 'Username must be a string' })
    @MinLength(6, { message: 'Username must be at least 6 characters' })
    @MaxLength(50, { message: 'Username must be at most 50 characters' })
    userName?: string;

    @ApiProperty({ description: 'New description/bio (optional)', example: 'Hello, this is my bio', required: false })
    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @MaxLength(500, { message: 'Description must be at most 500 characters' })
    description?: string;
}

export class VerifyUpdateUserOtpDto {
    @ApiProperty({ description: 'The OTP code sent to email', example: '123456' })
    @IsString({ message: 'OTP must be a string' })
    @MinLength(6, { message: 'OTP must be at least 6 digits' })
    otp!: string;
}
