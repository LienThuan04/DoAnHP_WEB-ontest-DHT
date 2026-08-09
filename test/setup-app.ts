import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from '@/app.module';
import { setupAppConfig } from '@/config/app-setup.config';
import { validationConfig } from '@/config/validation.config';

/**
 * Dựng app cho e2e ĐÚNG NHƯ `src/main.ts` (global prefix + exclude, ValidationPipe,
 * cookie-parser, EJS + thư mục views). Thiếu một trong số này thì trang SSR sẽ
 * render hỏng hoặc route ở path gốc bị đẩy sang `/api/v1` → test sai lệch với thật.
 *
 * LƯU Ý: e2e chạy trên CSDL thật (`DATABASE_URL`) vì `AppModule` cần Prisma kết nối
 * mới init được. Hàm này ÉP `SEED_DB=false` (và CLEAR_DB/SEED_DEMO_DATA) để test
 * KHÔNG BAO GIỜ xoá/ghi đè dữ liệu — `@nestjs/config` không ghi đè biến đã có sẵn
 * trong `process.env` nên phải đặt TRƯỚC khi compile module.
 */
export async function createTestApp(): Promise<NestExpressApplication> {
  process.env.SEED_DB = 'false';
  process.env.CLEAR_DB = 'false';
  process.env.SEED_DEMO_DATA = 'false';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  // `rawBody: true` y `main.ts` — vài route đọc body thô (chấm tự luận).
  const app = moduleFixture.createNestApplication<NestExpressApplication>({
    rawBody: true,
  });

  setupAppConfig(app);
  validationConfig(app);
  app.use(cookieParser()); // phải có: JwtStrategy đọc token từ cookie
  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/public/' });
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('ejs');

  await app.init();
  return app;
}

/**
 * Đăng nhập và trả về cookie phiên để gắn vào request tiếp theo
 * (`.set('Cookie', cookie)`). Trả `null` nếu tài khoản không tồn tại/sai mật khẩu
 * — CSDL chưa seed thì test phụ thuộc đăng nhập sẽ tự bỏ qua thay vì đỏ oan.
 */
export async function login(
  app: NestExpressApplication,
  id: string,
  password = process.env.DEFAULT_PASSWORD || '123456',
): Promise<string | null> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ id, password });

  if (res.status >= 400) return null;

  const setCookie = res.headers['set-cookie'];
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.filter(Boolean).map((c: string) => c.split(';')[0]).join('; ');
}
