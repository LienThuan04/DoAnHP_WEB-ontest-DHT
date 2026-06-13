import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JobsService {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,

    ) { }
    private readonly logger = new Logger(JobsService.name);

    @Cron(CronExpression.EVERY_MINUTE, {
        name: 'handleExpiredSessions',
        timeZone: 'Asia/Ho_Chi_Minh',
        waitForCompletion: true,
    })
    async handleExpiredSessions() {
        try {
            const now = new Date();

            // Lấy thông tin sessions sắp xóa
            const expiredSessions = await this.prisma.session.findMany({
                where: {
                    expiresAt: { lt: now },
                },
                select: {
                    id: true,
                    userId: true,
                    deviceId: true,
                    expiresAt: true,
                    createdAt: true,
                }
            });

            if (expiredSessions.length > 0) {
                this.logger.log(`Found ${expiredSessions.length} expired sessions:`);

                // Log chi tiết từng session
                expiredSessions.forEach(session => {
                    this.logger.log(`
                                    - Session ID: ${session.id}
                                        User ID: ${session.userId}
                                        Device ID: ${session.deviceId}
                                        Expired at: ${session.expiresAt.toISOString()}
                                        Created at: ${session.createdAt.toISOString()}
                                    `);
                });

                // Thực hiện xóa
                const result = await this.prisma.session.deleteMany({
                    where: {
                        expiresAt: { lt: now },
                    },
                });

                this.logger.log(`✅ Deleted ${result.count} expired sessions successfully`);
            } else {
                this.logger.log('No expired sessions found');
            }

        } catch (error: any) {
            this.logger.error(`Error handling expired sessions: ${error.message}`);
        }
    }

    @Cron(CronExpression.EVERY_MINUTE, {
        name: 'cleanupExpiredPendingRegistrations',
        waitForCompletion: true,
        timeZone: 'Asia/Ho_Chi_Minh',
    })
    async cleanupExpiredPendingRegistrations() {
        try {
            const result = await this.prisma.pendingRegistration.deleteMany({
                where: { otpExpiresAt: { lt: new Date() } },
            });
            if (result.count > 0) {
                this.logger.log(`✅ Deleted ${result.count} expired pending registrations`);
            }
        } catch (error: any) {
            this.logger.error(`Failed to cleanup pending registrations: ${error.message}`);
        }
    }

}
