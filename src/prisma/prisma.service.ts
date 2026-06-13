import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {  } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(
        private readonly configService: ConfigService
     ) {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set. Please set it to your Prisma Data API URL !!!');
        }
        const adapter = new PrismaPg({
            connectionString: databaseUrl,
            ssl: {
                rejectUnauthorized: false, // For development only. In production, ensure proper SSL configuration.
            },
        })
        super({ adapter: adapter }); // use the Prisma Data API URL from the environment variable for connection


    }

    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Prisma connected to PostgreSQL successfully');
        } catch (error: any) {
            this.logger.error('❌ Prisma connection failed:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('✅ Prisma disconnected from PostgreSQL');
    }
}