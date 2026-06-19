import { INestApplication, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const setupAppConfig: (app: INestApplication) => { globalPrefix: string; version: string } = (app: INestApplication) => {
    const configService: ConfigService = app.get(ConfigService);
    const globalPrefix: string = configService.get<string>('GLOBAL_PREFIX') || 'api';
      const version: string = configService.get<string>('VERSION') || '1';
      // Route SSR (hệ thi) phục vụ HTML ở path gốc, KHÔNG mang prefix /api.
      // Các controller SSR đặt @Controller({ version: VERSION_NEUTRAL }) để bỏ /v1.
      app.setGlobalPrefix(globalPrefix, {
        exclude: [
          '/', 'auth/signin', 'auth/login', 'auth/logout', 'dashboard',
          // Phân quyền (roles.php) — trang + AJAX ở path gốc, không mang /api.
          'roles', 'roles/getAllSl', 'roles/getAll', 'roles/getDetail',
          'roles/getUsers', 'roles/add', 'roles/edit', 'roles/delete',
          // Bản đồ quyền cho permission.js (ẩn/hiện nút theo RBAC).
          'account/getRole',
          // Quản lý người dùng (user.php) — trang + AJAX ở path gốc.
          'user', 'user/getTotalPages', 'user/pagination', 'user/checkUser',
          'user/getDetail', 'user/add', 'user/update', 'user/deleteData',
          'user/setStatus',
          // Năm học & Học kỳ (namhoc.php) — trang + AJAX ở path gốc.
          'namhoc', 'namhoc/getNamHoc', 'namhoc/getHocKy', 'namhoc/addNamHoc',
          'namhoc/updateNamHoc', 'namhoc/deleteNamHoc',
          // Môn học & Chương (subject.php) — trang + AJAX ở path gốc.
          'subject', 'subject/getTotalPages', 'subject/pagination',
          'subject/search', 'subject/checkSubject', 'subject/getDetail',
          'subject/add', 'subject/update', 'subject/delete',
          'subject/getAllChapter', 'subject/addChapter',
          'subject/updateChapter', 'subject/chapterDelete',
          'subject/getSubjectAssignment',
          // Ngân hàng câu hỏi (question.php) — trang SSR + AJAX ở path gốc.
          'question', 'question/getTotalPages', 'question/pagination',
          'question/getQuestionBySubject', 'question/getTotalPageQuestionBySubject',
          'question/getQuestionById', 'question/getAnswerById', 'question/delete',
          'question/addQues', 'question/editQuesion',
        ],
      });
      app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: `${version}`,
      }); 
      return { globalPrefix, version };
}