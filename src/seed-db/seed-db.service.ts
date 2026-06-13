// seed-db.service.ts
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { roles, users } from '@/seed-db/seed/sample';
import { ConfigService } from '@nestjs/config';
import { generatePasswordHash } from '@/lib/bcrypt/bcrypt';

@Injectable()
export class SeedDbService implements OnModuleInit {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) { }

    private readonly logger = new Logger(SeedDbService.name);

    private async seedRoles() {
        try {
            const existingRoles = await this.prisma.role.findMany();

            if (existingRoles.length > 0) {
                this.logger.warn(`Roles already exist (${existingRoles.length} roles found). Skipping seeding roles.`);
                return;
            }

            // Sử dụng createMany để tối ưu performance
            const result = await this.prisma.role.createMany({
                data: roles,
                skipDuplicates: true, // Bỏ qua nếu trùng
            });

            this.logger.log(`Seeded ${result.count} roles successfully.`);

            // Log chi tiết từng role (optional)
            for (const role of roles) {
                this.logger.debug(`Seeded role: ${role.roleName}`);
            }
        } catch (error: any) {
            this.logger.error(`Error seeding roles: ${error.message}`);
            throw error; // Ném lỗi để dừng quá trình seed
        }
    }

    private async seedUsers() {
        try {
            const existingUsers = await this.prisma.user.findMany();
            if (existingUsers.length > 0) {
                this.logger.warn(`Users already exist (${existingUsers.length} users found). Skipping seeding users.`);
                return;
            }
            // Lấy số salt rounds từ config, mặc định là 10 nếu không có biến môi trường
            const saltRounds = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS') || '10', 10);
            //find role id for USER and ADMIN
            const ID_ROLE_USER = await this.prisma.role.findUnique({
                where: { roleName: this.configService.get<string>('NAME_ROLE_USER') || 'USER' },
            });
            const ID_ROLE_ADMIN = await this.prisma.role.findUnique({
                where: { roleName: this.configService.get<string>('NAME_ROLE_ADMIN') || 'ADMIN' },
            });
            if (!ID_ROLE_USER || !ID_ROLE_ADMIN) {
                throw new Error('One or more required roles not found. Please ensure the roles are seeded before seeding users.');
            }
            const LIST_USERS = await Promise.all(users.map(async user => ({
                email: user.email,
                userName: user.userName,
                password: await generatePasswordHash(user.password || this.configService.get<string>('DEFAULT_PASSWORD')!, saltRounds),
                roleId: user.roleName === (this.configService.get<string>('NAME_ROLE_ADMIN') || 'ADMIN') ? ID_ROLE_ADMIN.id : ID_ROLE_USER.id,
            })));
            const result = await this.prisma.user.createMany({
                data: LIST_USERS,
                skipDuplicates: true, // Bỏ qua nếu trùng
            });
            this.logger.log(`Seeded ${result.count} users successfully.`);
            // Log chi tiết từng user (optional)
            for (const user of LIST_USERS) {
                this.logger.debug(`Seeded user: ${user.email} with roleId: ${user.roleId}`);
            }

        } catch (error: any) {
            this.logger.error(`Error seeding users: ${error.message}`);
            throw error;
        }
    }

    async seed() {
        try {
            this.logger.log('Starting database seeding...');
            // Seed theo thứ tự dependency
            await this.seedRoles();
            await this.seedUsers();

            this.logger.log('Database seeding completed successfully.');
        } catch (error: any) {
            this.logger.error(`Error during database seeding: ${error.message}`);
            throw error;
        }
    }

    async clear() {
        try {
            await this.prisma.pendingRegistration.deleteMany();
            await this.prisma.pendingUserUpdate.deleteMany();
            await this.prisma.session.deleteMany();
            await this.prisma.user.deleteMany();
            await this.prisma.role.deleteMany();

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
