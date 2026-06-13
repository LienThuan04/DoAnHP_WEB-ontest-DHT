import { Injectable, Logger } from '@nestjs/common';
import { CreateFileDto } from '@/files/dto/create-file.dto';
import { UpdateFileDto } from '@/files/dto/update-file.dto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { Multer } from 'multer';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '@/prisma/prisma.service';
import { FileEntity } from '@/files/entities/file.entity';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private supabaseClient: SupabaseClient;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    const supabaseNameBucket = this.configService.get<string>('SUPABASE_NAME_BUCKET');

    if (!supabaseUrl || !supabaseKey || !supabaseNameBucket) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    this.bucketName = supabaseNameBucket;
  }

  private sanitizedFolder = (folder: string): string => {
    return folder.trim()
      .replace(/^\/+/, '')   // Remove leading slashes
      .replace(/\/+$/, '');  // Remove trailing slashes
  };

  private standardizeFileName = (fileName: string, fileExtension: string) => {
    return fileName
      .replace(fileExtension, '') // bỏ phần extension 
      .replace(/\s+/g, '-') // space -> "-" 
      .toLowerCase(); // chuyển về lowercase ham nay lam gi
  };

  // Đệ quy để thu thập tất cả file paths trong bucket, bao gồm cả file trong các folder con
  private async collectBucketFilePaths(folder: string = ''): Promise<string[]> {
    const normalizedFolder = folder.trim().replace(/^\/+/, '').replace(/\/+$/, '');
    const { data, error } = await this.supabaseClient.storage
      .from(this.bucketName)
      .list(normalizedFolder, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      throw new Error(`Failed to list Supabase Storage objects: ${error.message}`);
    }

    const filePaths: string[] = [];

    for (const item of data ?? []) {
      const itemPath = normalizedFolder ? `${normalizedFolder}/${item.name}` : item.name;
      const isFolder = item.id === null;

      if (isFolder) {
        const nestedPaths = await this.collectBucketFilePaths(itemPath);
        filePaths.push(...nestedPaths);
        continue;
      }

      filePaths.push(itemPath);
    }

    return filePaths;
  }

  // Xóa tất cả file trong bucket. Sử dụng đệ quy để đảm bảo xóa cả file trong các folder con nếu có.
  async clearBucketStorage(): Promise<number> {
    try {
      const filePaths = await this.collectBucketFilePaths();

      if (filePaths.length === 0) {
        this.logger.log(`Supabase bucket "${this.bucketName}" is already empty.`);
        return 0;
      }

      for (let index = 0; index < filePaths.length; index += 100) {
        const batch = filePaths.slice(index, index + 100);
        const { error } = await this.supabaseClient.storage
          .from(this.bucketName)
          .remove(batch);

        if (error) {
          throw new Error(`Failed to remove files from Supabase Storage: ${error.message}`);
        }
      }

      this.logger.log(`Deleted ${filePaths.length} file(s) from Supabase bucket "${this.bucketName}".`);
      return filePaths.length;
    } catch (error: any) {
      this.logger.error(`Error clearing Supabase bucket "${this.bucketName}": ${error.message}`);
      throw error;
    }
  }

  async uploadFile(folder: string, file: Express.Multer.File, userId?: string,): Promise<FileEntity> {
    try {
      const fileExtension = extname(file.originalname);

      const originalName = this.standardizeFileName(file.originalname, fileExtension); // bỏ extension và chuẩn hóa tên file gốc (ví dụ: "My Avatar.png" -> "my-avatar")

      // uuid + tên file gốc
      const fileName = `${randomUUID()}_${originalName}${fileExtension}`;

      // đảm bảo folder không có dấu / đầu hoặc cuối để tránh lỗi đường dẫn
      const sanitizedFolder = this.sanitizedFolder(folder);

      // ví dụ: users/avatar/uuid_avatar.png
      const filePath = `${sanitizedFolder}/${fileName}`;

      /*Upload file lên Supabase Storage*/
      const { data, error } = await this.supabaseClient.storage
        .from(this.bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Error uploading file to Supabase Storage:', error);
        throw new Error(error.message);
      }

      /*Lấy public URL để frontend đọc file*/
      const { data: publicUrl } = this.supabaseClient.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      /*Lưu metadata vào bảng File trong Prisma*/
      const savedFile = await this.prisma.file.create({
        data: {
          fileName,
          originalName: file.originalname,
          path: data.path,
          mimeType: file.mimetype,
          size: file.size,
          bucket: this.bucketName,
          userId,
        },
      });

      /*Return cho client*/
      return plainToInstance(FileEntity, {
        ...savedFile,
        fileUrl: publicUrl.publicUrl,
      });
    } catch (error: any) {
      throw new Error('Error uploading file', error.message);
    }
  }

  async uploadSingleFile(
    folder: string,
    fixedFileName: string, /*Tên file cố định, ví dụ: "avatar_userId" để mỗi user có 1 avatar duy nhất*/
    file: Express.Multer.File,
    userId?: string,
  ): Promise<FileEntity> {
    try {
      // Lấy extension từ file upload
      const fileExtension = extname(file.originalname);

      const fileName = `${fixedFileName}${fileExtension}`;

      // sanitize folder tránh lỗi path
      const sanitizedFolder = this.sanitizedFolder(folder);

      /* Tìm file cũ theo folder + fixed name*/
      const existingFile =
        await this.prisma.file.findFirst({
          where: {
            ...(userId ? { userId } : {}), // nếu có userId thì thêm điều kiện tìm theo userId để tránh xóa nhầm file của người khác
            path: {
              startsWith: `${sanitizedFolder}/${fixedFileName}`, // tìm file có path bắt đầu bằng folder + fixed name
            },
          },
        });

      /* Nếu có file cũ → xóa khỏi Supabase*/
      if (existingFile) {
        const { error: removeError } = await this.supabaseClient.storage
          .from(this.bucketName)
          .remove([existingFile.path]);

        await this.prisma.file.delete({
          where: {
            id: existingFile.id,
          },
        });
        if (removeError) {
          console.error('Error removing existing file from Supabase Storage:', removeError);
          throw new Error(`Failed to remove existing file from Supabase Storage: ${removeError.message}`);
        }
      }

      // path cố định → upsert mới có ý nghĩa
      const filePath = `${sanitizedFolder}/${fileName}`;

      const { data, error } =
        await this.supabaseClient.storage
          .from(this.bucketName)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true, // cho phép ghi đè file nếu đã tồn tại (với path cố định thì sẽ luôn là ghi đè)
          });

      if (error) {
        console.error(
          'Error uploading single file:',
          error,
        );
        throw new Error(error.message);
      }

      const { data: publicUrl } =
        this.supabaseClient.storage
          .from(this.bucketName)
          .getPublicUrl(filePath);

      const savedFile =
        await this.prisma.file.upsert({
          where: {
            path: data.path,
          },
          update: {
            fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            bucket: this.bucketName,
            userId,
          },
          create: {
            fileName,
            originalName: file.originalname,
            path: data.path,
            mimeType: file.mimetype,
            size: file.size,
            bucket: this.bucketName,
            userId,
          },
        });

      return plainToInstance(FileEntity, {
        ...savedFile,
        fileUrl: publicUrl.publicUrl,
      });
    } catch (error: any) {
      console.error(error);

      throw new Error(
        `Upload single file failed: ${error.message}`,
      );
    }
  }
}
