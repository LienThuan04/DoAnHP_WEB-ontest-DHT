import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.development.local',
        '.env.development',
        '.env.local',
        '.env',
      ],
    }),
  ],
})
export class EnvConfigModule {}
