import { INestApplication, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const setupAppConfig: (app: INestApplication) => { globalPrefix: string; version: string } = (app: INestApplication) => {
    const configService: ConfigService = app.get(ConfigService);
    const globalPrefix: string = configService.get<string>('GLOBAL_PREFIX') || 'api';
      const version: string = configService.get<string>('VERSION') || '1';
      app.setGlobalPrefix(globalPrefix);
      app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: `${version}`,
      }); 
      return { globalPrefix, version };
}