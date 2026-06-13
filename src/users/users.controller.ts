import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserAvatarOrBGDto, UpdateUserDto, UpdateUserRoleDto, RequestUpdateUserOtpDto, VerifyUpdateUserOtpDto } from '@/users/dto/update-user.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ForbiddenException, ValidationException } from '@/common/exceptions/app.exception';
import { AdminOnly, SkipAdminOnly } from '@/common/decorators/metadata';
import { User } from '@/common/decorators/user.decorator';
import { UserImageType } from '@/users/enums/UserImageType.enum';
import type { IUsersController } from '@/users/interfaces/users.controller.interface';
import { GetUsersQueryDto } from '@/users/dto/GetUsersQueryDto.dto';
import { UserUpdateOtpService } from '@/auth/services/user-update-otp.service';
import type { ISanitizedUser } from '@/auth/interfaces/auth.types';
import { FilesService } from '@/files/files.service';

@AdminOnly()
@Controller('users')
export class UsersController implements IUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userUpdateOtpService: UserUpdateOtpService,
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
  ) { }

  // method this helps to check if the current user is admin or is modifying their own profile, used in OTP-protected update endpoints
  private assertSelfOrAdmin(currentUser: ISanitizedUser, targetId: string): void {
    const adminRole = this.configService.get<string>('NAME_ROLE_ADMIN');
    if (currentUser.roleName !== adminRole && currentUser.id !== targetId) {
      throw new ForbiddenException('You can only modify your own profile');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return { statusCode: 200, message: 'User created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Query() query: GetUsersQueryDto) {
    const result = await this.usersService.findAll(query);
    return { statusCode: 200, message: 'Users retrieved successfully', data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  async findOne(@Param('id') id: string) {
    const result = await this.usersService.findOne(id);
    return { statusCode: 200, message: 'User retrieved successfully', data: result };
  }

  // Admin-only direct update (no OTP, for admin user management)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update a user directly (no OTP required)' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.usersService.update(id, updateUserDto);
    return { statusCode: 200, message: 'User updated successfully', data: result };
  }

  // ============ OTP-protected profile update (replaces PATCH /users/:id) ============
  @SkipAdminOnly()
  @Post('update-profile/request-otp')
  @ApiOperation({
    summary: 'Request OTP to update profile (email/username/description)',
    description: `Sends OTP to verify identity before updating sensitive fields:
- If only description changed → updates immediately, no OTP needed.
- If email changed → OTP sent to the NEW email.
- If username changed (email unchanged) → OTP sent to the CURRENT email.`,
  })
  async requestUpdateOtp(
    @User() user: ISanitizedUser,
    @Body() dto: RequestUpdateUserOtpDto,
  ) {
    const result = await this.userUpdateOtpService.requestUpdate(user.id, dto);
    return {
      statusCode: 200,
      message: result.skipOtp ? 'Description updated successfully' : 'OTP sent to your email. Please verify to complete the update.',
      skipOtp: result.skipOtp, // Frontend uses this flag to know if OTP verification is needed or if update was applied immediately
      data: result.data,
    };
  }

  @SkipAdminOnly()
  @Post('update-profile/verify-otp')
  @ApiOperation({
    summary: 'Verify OTP and apply profile changes',
    description: 'After receiving OTP from request-otp, call this endpoint with the OTP to apply the changes.',
  })
  async verifyUpdateOtp(
    @User() user: ISanitizedUser,
    @Body() dto: VerifyUpdateUserOtpDto,
  ) {
    const result = await this.userUpdateOtpService.verifyAndApplyUpdate(user.id, dto.otp);
    return {
      statusCode: 200,
      message: result.message,
      data: result.data,
    };
  }
  // ============ End OTP-protected update ============

  @Patch('role/:id')
  @ApiOperation({ summary: 'Update a user\'s role' })
  async updateRole(@Param('id') id: string, @Body() role: UpdateUserRoleDto) {
    const result = await this.usersService.updateRole(id, role.roleNameOrId);
    return { statusCode: 200, message: 'User role updated successfully', data: result };
  }

  @SkipAdminOnly()
  @Patch('avatarorbg/:id')
  @ApiOperation({ summary: 'Update a user\'s avatar or background' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imgProfile: { type: 'string', format: 'binary' },
        typeImgProfile: { type: 'string', enum: ['avatar', 'background'] },
      },
      required: ['imgProfile', 'typeImgProfile'],
    },
  })
  @UseInterceptors(FileInterceptor('imgProfile')) // Tên trường file trong form-data phải trùng với tên này
  async updateAvatarOrBG(
    @Param('id') id: string,
    @User() user: ISanitizedUser,
    @UploadedFile() imgProfile: Express.Multer.File,
    @Body() updateUserAvatarOrBGDto: UpdateUserAvatarOrBGDto,
  ) {
    this.assertSelfOrAdmin(user, id);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!imgProfile) {
      throw new ValidationException('Image file is required.');
    }
    if (!allowedMimeTypes.includes(imgProfile.mimetype)) {
      throw new ValidationException('Invalid file type. Only JPEG, JPG, PNG, WEBP, and GIF images are allowed.');
    }
    if (imgProfile.size > 10 * 1024 * 1024) { // 10MB
      throw new ValidationException('File size exceeds the maximum limit of 10MB.');
    }
    if (updateUserAvatarOrBGDto.typeImgProfile !== UserImageType.AVATAR && updateUserAvatarOrBGDto.typeImgProfile !== UserImageType.BACKGROUND) {
      throw new ValidationException('Invalid image type. Only avatar and background images are allowed.');
    }
    const uploadedFile = await this.filesService.uploadSingleFile(
      `users/${id}/profile`,
      updateUserAvatarOrBGDto.typeImgProfile,
      imgProfile,
      id,
    );
    if (!uploadedFile.fileUrl) {
      throw new ValidationException('File uploaded but public URL is unavailable.');
    }
    const result = await this.usersService.updateAvatarOrBG(id, uploadedFile.fileUrl, updateUserAvatarOrBGDto.typeImgProfile);
    return { statusCode: 200, message: 'User avatar updated successfully', data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(id);
    return { statusCode: 200, message: 'User deleted successfully', data: result };
  }
}
