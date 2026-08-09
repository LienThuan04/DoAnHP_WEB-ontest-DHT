import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import SwaggerConfig from '@/config/swagger.config';
import cookieParser from 'cookie-parser';
import { setupCors } from '@/config/cors.config';
import { validationConfig } from '@/config/validation.config';
import { setupAppConfig } from '@/config/app-setup.config';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // rawBody: giữ lại body thô của request để đọc được các tham số kiểu PHP
  // `ten[<khoá số>]` mà body-parser làm mất (xem parseScoreMapFromRawBody).
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  // Enable shutdown hooks to allow for graceful shutdown of the application, ensuring that resources are properly released and cleanup tasks are performed when the application is terminated.
  app.enableShutdownHooks();

  if (configService.get<string>('MODE') === 'development') {
    SwaggerConfig.setup(app);
    logger.log('Swagger documentation is enabled in development mode');
  }

  // setup the versioning and global prefix for all routes
  const { globalPrefix, version } = setupAppConfig(app);
 // Custom Validation Pipe with error formatting and automatic transformation
  validationConfig(app);

  // Add cookie-parser middleware to handle cookies in requests and responses, which is essential for managing refresh tokens stored in cookies.
  app.use(cookieParser());

  // ─── SSR (hệ thi OnTest) ──────────────────────────────────────────────
  // Render HTML phía server bằng EJS (thay view PHP), phục vụ tài nguyên tĩnh
  // trong public/ (theme/css/js bê từ DHT_OneTest). Xem docs/07.
  // Phục vụ theme Dashmix (css/fonts/media/js) dưới prefix /public/ — khớp đường
  // dẫn tài nguyên trong markup gốc của DHT_OneTest (./public/...).
  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/public/' });
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('ejs');

  // Call the CORS setup function to configure CORS for the application
  setupCors(app);

  const host = configService.get<string>('HOST');
  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
  logger.log(`Application is running on: http://${host}:${port}/${globalPrefix}/v${version}`);
  logger.log(`Swagger is running on: http://${host}:${port}/swagger`);
  logger.warn(`Server is running, page Home is url: http://${host}:${port}/`);
}

bootstrap().catch((err) => {
  new Logger('Bootstrap').error('Failed to start application', err);
  process.exit(1);
});
