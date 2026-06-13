import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSessionDto {
    @ApiProperty({ example: 'user123', description: 'The ID of the user associated with the session' })
    @IsNotEmpty({ message: 'User ID must not be empty' })
    @IsString({ message: 'User ID must be a string' })
    userId!: string;

    @ApiProperty({ example: 'abcdef123456', description: 'The session token' })
    @IsNotEmpty({ message: 'Refresh token must not be empty' })
    @IsString({ message: 'Refresh token must be a string' })
    refreshToken!: string;

    @ApiProperty({ example: 'device123', description: 'The ID of the device associated with the session' })
    @IsNotEmpty({ message: 'Device ID must not be empty' })
    @IsString({ message: 'Device ID must be a string' })
    deviceId!: string;

}
