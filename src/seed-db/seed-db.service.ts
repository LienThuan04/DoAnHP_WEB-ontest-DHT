// seed-db.service.ts
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  examRoles,
  examResources,
  examPermissions,
  examUsers,
} from '@/seed-db/seed/exam-sample';
import { ConfigService } from '@nestjs/config';
import { generatePasswordHash } from '@/lib/bcrypt/bcrypt';

@Injectable()
export class SeedDbService implements OnModuleInit {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) { }

    private readonly logger = new Logger(SeedDbService.name);

    // ─── Hệ thi OnTest (nguoidung / nhomquyen / chitietquyen / danhmucchucnang) ───

    private async seedExamResources() {
        const existing = await this.prisma.danhMucChucNang.count();
        if (existing > 0) {
            this.logger.warn(`danhmucchucnang đã có ${existing} bản ghi. Bỏ qua.`);
            return;
        }
        const result = await this.prisma.danhMucChucNang.createMany({
            data: examResources,
            skipDuplicates: true,
        });
        this.logger.log(`Seeded ${result.count} chức năng (danhmucchucnang).`);
    }

    private async seedExamRoles() {
        const existing = await this.prisma.nhomQuyen.count();
        if (existing > 0) {
            this.logger.warn(`nhomquyen đã có ${existing} bản ghi. Bỏ qua.`);
            return;
        }
        const result = await this.prisma.nhomQuyen.createMany({
            data: examRoles,
            skipDuplicates: true,
        });
        this.logger.log(`Seeded ${result.count} nhóm quyền (nhomquyen).`);
    }

    private async seedExamPermissions() {
        const existing = await this.prisma.chiTietQuyen.count();
        if (existing > 0) {
            this.logger.warn(`chitietquyen đã có ${existing} bản ghi. Bỏ qua.`);
            return;
        }
        const result = await this.prisma.chiTietQuyen.createMany({
            data: examPermissions,
            skipDuplicates: true,
        });
        this.logger.log(`Seeded ${result.count} chi tiết quyền (chitietquyen).`);
    }

    private async seedExamUsers() {
        const existing = await this.prisma.nguoiDung.count();
        if (existing > 0) {
            this.logger.warn(`nguoidung đã có ${existing} bản ghi. Bỏ qua.`);
            return;
        }
        const saltRounds = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS') || '10', 10);
        const defaultPassword = this.configService.get<string>('DEFAULT_PASSWORD') || '123456';
        const data = await Promise.all(
            examUsers.map(async (u) => ({
                id: u.id,
                email: u.email,
                hoten: u.hoten,
                manhomquyen: u.manhomquyen,
                matkhau: await generatePasswordHash(defaultPassword, saltRounds),
                trangthai: 1,
            })),
        );
        const result = await this.prisma.nguoiDung.createMany({
            data,
            skipDuplicates: true,
        });
        this.logger.log(`Seeded ${result.count} người dùng (nguoidung). Mật khẩu mặc định: "${defaultPassword}".`);
    }

    private async seedExam() {
        // Thứ tự dependency: resource + role trước → permission + user sau.
        await this.seedExamResources();
        await this.seedExamRoles();
        await this.seedExamPermissions();
        await this.seedExamUsers();
    }

    async seed() {
        try {
            this.logger.log('Starting database seeding...');
            // Hệ thi OnTest
            await this.seedExam();

            this.logger.log('Database seeding completed successfully.');
        } catch (error: any) {
            this.logger.error(`Error during database seeding: ${error.message}`);
            throw error;
        }
    }

    async clear() {
        try {
            // Hệ thi OnTest — xoá theo thứ tự khoá ngoại
            await this.prisma.chiTietQuyen.deleteMany();
            await this.prisma.nguoiDung.deleteMany();
            await this.prisma.nhomQuyen.deleteMany();
            await this.prisma.danhMucChucNang.deleteMany();

            this.logger.log('Cleared database records successfully.');
        } catch (error: any) {
            this.logger.error(`Error during clearing database: ${error.message}`);
            throw error;
        }
    }

    async onModuleInit() {
        const shouldSeed = this.configService.get<string>('SEED_DB') === 'true';
        const shouldClear = this.configService.get<string>('CLEAR_DB') === 'false' ? false : true; // Mặc định là true nếu không có biến môi trường CLEAR_DB hoặc nếu CLEAR_DB không phải 'false'

        // Log cấu hình
        this.logger.log(`SEED_DB: ${shouldSeed}, CLEAR_DB: ${shouldClear}`);

        if (shouldSeed) {
            try {
                if (shouldClear) {
                    await this.clear();
                    this.logger.log('Database cleared before seeding.');
                }
                await this.seed();
            } catch (error: any) {
                this.logger.error(`Seeding failed: ${error.message}`);
                // Có thể throw error để app không start nếu seed thất bại
                throw error;
            }
        } else {
            this.logger.log('SEED_DB is not enabled. Skipping database seeding.');
        }
    }
}
