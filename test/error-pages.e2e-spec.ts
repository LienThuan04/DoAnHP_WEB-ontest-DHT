import request from 'supertest';
import { NestExpressApplication } from '@nestjs/platform-express';
import { createTestApp, login } from './setup-app';

/**
 * Trang lỗi hệ thi (thay `myerror.php` + `error/page_404.php`/`page_403.php`).
 * Quy tắc trong `AllExceptionsFilter`: điều hướng bằng trình duyệt (GET + Accept
 * text/html + không phải XHR + ngoài `/api`) → HTML; còn lại giữ nguyên JSON.
 */
describe('Trang lỗi 404/403/500 (e2e)', () => {
  let app: NestExpressApplication;
  let server: ReturnType<NestExpressApplication['getHttpServer']>;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  }, 60_000);

  afterAll(async () => {
    await app?.close();
  });

  // ── Không cần đăng nhập ────────────────────────────────────────────────────

  it('404: URL không tồn tại → trang 404 HTML', async () => {
    const res = await request(server)
      .get('/khong-ton-tai-dau-nhe')
      .set('Accept', 'text/html');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('không được tìm thấy');
  });

  it('401: mở trang cần đăng nhập → xoá cookie + chuyển về /auth/signin', async () => {
    const res = await request(server)
      .get('/dashboard')
      .set('Accept', 'text/html');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/auth/signin');
    expect(String(res.headers['set-cookie'])).toContain('access_token=;');
  });

  it('trang công khai KHÔNG bị ảnh hưởng', async () => {
    await request(server).get('/').set('Accept', 'text/html').expect(200);
    await request(server)
      .get('/auth/signin')
      .set('Accept', 'text/html')
      .expect(200);
  });

  it('AJAX (XHR) vẫn nhận JSON, không phải trang HTML', async () => {
    const res = await request(server)
      .post('/test/pagination')
      .set('X-Requested-With', 'XMLHttpRequest');

    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.statusCode).toBe(401);
  });

  it('route dưới /api vẫn trả JSON kể cả khi client xin text/html', async () => {
    const res = await request(server)
      .get('/api/v1/khong-co-route-nay')
      .set('Accept', 'text/html');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  // ── Cần đăng nhập (bỏ qua nếu CSDL chưa seed tài khoản mẫu) ────────────────

  describe('khi đã đăng nhập', () => {
    let cookie: string | null = null;

    beforeAll(async () => {
      // gv001 = giảng viên (nhóm quyền 1) trong `seed/exam-sample.ts`.
      cookie = await login(app, 'gv001');
      if (!cookie) {
        console.warn(
          'Bỏ qua nhóm test cần đăng nhập: CSDL chưa có tài khoản mẫu gv001 (chạy seed trước).',
        );
      }
    }, 30_000);

    it('403: giảng viên vào trang chỉ dành cho admin → trang 403 HTML', async () => {
      if (!cookie) return;
      // Quyền `phancong` chỉ seed cho nhóm quyền 3 (admin) — đúng dump gốc.
      const res = await request(server)
        .get('/assignment')
        .set('Accept', 'text/html')
        .set('Cookie', cookie);

      expect(res.status).toBe(403);
      expect(res.headers['content-type']).toMatch(/html/);
      expect(res.text).toContain('không có quyền truy cập trang này');
    });

    it('404: mở đề thi không tồn tại → trang 404 HTML', async () => {
      if (!cookie) return;
      const res = await request(server)
        .get('/test/detail/99999999')
        .set('Accept', 'text/html')
        .set('Cookie', cookie);

      expect(res.status).toBe(404);
      expect(res.text).toContain('không được tìm thấy');
    });

    it('lỗi còn lại (tham số sai) → trang lỗi chung, không phải trang trắng', async () => {
      if (!cookie) return;
      const res = await request(server)
        .get('/module/detail/khong-phai-so')
        .set('Accept', 'text/html')
        .set('Cookie', cookie);

      expect(res.status).toBe(400);
      expect(res.headers['content-type']).toMatch(/html/);
      expect(res.text).toContain('hệ thống đang gặp sự cố');
    });

    it('trang được phép vẫn render bình thường', async () => {
      if (!cookie) return;
      await request(server)
        .get('/test')
        .set('Accept', 'text/html')
        .set('Cookie', cookie)
        .expect(200);
    });
  });
});
