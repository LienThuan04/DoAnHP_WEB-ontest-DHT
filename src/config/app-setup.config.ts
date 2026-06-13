import { INestApplication, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const setupAppConfig: (app: INestApplication) => { globalPrefix: string; version: string } = (app: INestApplication) => {
    const configService: ConfigService = app.get(ConfigService);
    const globalPrefix: string = configService.get<string>('GLOBAL_PREFIX') || 'api';
      const version: string = configService.get<string>('VERSION') || '1';
      // Route SSR (hệ thi) phục vụ HTML ở path gốc, KHÔNG mang prefix /api.
      // Các controller SSR đặt @Controller({ version: VERSION_NEUTRAL }) để bỏ /v1.
      app.setGlobalPrefix(globalPrefix, {
        exclude: ['/', 'auth/signin', 'auth/login', 'auth/logout', 'dashboard'],
      });
      app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: `${version}`,
      }); 
      return { globalPrefix, version };
}