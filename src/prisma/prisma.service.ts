import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
// Muốn nối thẳng postgres:// (không qua Accelerate) thì import lại
// `PrismaPg` từ '@prisma/adapter-pg' và bỏ chú thích khối bên dưới.

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Chỉ dùng trong constructor để đọc DATABASE_URL → KHÔNG cần giữ làm thuộc tính.
  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is not set. Please set it to your Prisma Accelerate (prisma+postgres://) connection string !!!',
      );
    }
    // Dùng Prisma Accelerate để tăng tốc query: DATABASE_URL là URL dạng
    // prisma+postgres:// (hoặc prisma://) → truyền accelerateUrl cho PrismaClient.
    // KHÔNG dùng driver adapter PrismaPg ở đây (adapter chỉ nhận postgres:// trực tiếp).
    // const prismaPg = new PrismaPg({
    //     connectionString: databaseUrl,
    //     ssl: {
    //         rejectUnauthorized: false, // For development only. In production, ensure proper SSL configuration.
    //     },
    // })
    super({
      accelerateUrl: databaseUrl, // Use the Prisma Accelerate connection string for faster queries
      // adapter: prismaPg // Uncomment this line if you want to use the PrismaPg adapter for PostgreSQL
    });
  }

  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Prisma connected via Accelerate successfully');
    } catch (error: any) {
      this.logger.error('❌ Prisma connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✅ Prisma disconnected');
  }
}
