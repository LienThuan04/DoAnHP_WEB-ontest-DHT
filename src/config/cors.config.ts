import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const setupCors = (app: INestApplication) => {
  const configService: ConfigService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('LIST_ORIGIN_CORS')?.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
};