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
          // Import từ file Word (.docx).
          'question/xulydoanvan', 'question/xulytracnghiem', 'question/xulytuluan',
          'question/updateQuestionJSON', 'question/addQuesFile',
          // Ngân hàng câu hỏi — đếm số câu cho trang tạo đề.
          'question/getsoluongcauhoi',
          // Ngân hàng câu hỏi — đáp án nhiều câu (trang chọn câu cho đề thủ công).
          'question/getAnswersForMultipleQuestions',
          // Đề thi (test.php) — trang SSR + AJAX ở path gốc.
          'test', 'test/get_subjects', 'test/get_groups', 'test/getTotalPages',
          'test/pagination', 'test/getDetail', 'test/delete',
          // Tạo/sửa đề (add_update_test) — SSR + AJAX.
          'test/add', 'test/update/:made', 'test/addTest', 'test/updateTest',
          // Chọn câu hỏi cho đề thủ công (select_question) — SSR + AJAX.
          'test/select/:made', 'test/getQuestionOfTestManual', 'test/addDetail',
          // Luồng làm bài SV (vao_thi/de_thi) — SSR + AJAX.
          'test/start/:made', 'test/taketest/:made', 'test/getQuestion',
          'test/startTest', 'test/getTimeTest', 'test/getTimeEndTest',
          'test/chuyentab', 'test/submit', 'test/getResultDetail',
          // Chi tiết/kết quả đề GV (test_detail) — SSR + AJAX thống kê + chấm tự luận.
          'test/detail/:made', 'test/getStatictical',
          'test/getListEssaySubmissionsAction', 'test/getEssayDetailAction',
          'test/saveEssayScoreAction', 'test/exportPdf/:makq', 'test/exportExcel',
          // Nhóm học phần (module.php) — trang SSR + AJAX quản lý nhóm của GV.
          'module', 'module/loadData', 'module/getNamHoc', 'module/getHocKy',
          'module/checkDuplicate', 'module/add', 'module/update',
          'module/delete', 'module/hide', 'module/getDetail',
          // Chi tiết nhóm (class_detail) — SSR + AJAX danh sách/quản lý thành viên.
          'module/detail/:manhom', 'module/pagination', 'module/getTotalPages',
          'module/getSvList', 'module/getInvitedCode', 'module/updateInvitedCode',
          'module/checkAcc', 'module/addSvGroup', 'module/addSV',
          'module/addStudentsByClassCode', 'module/kickUser',
          'module/getGroupSize', 'module/exportExcelStudentS',
          // Phân công giảng dạy (assignment.php) — trang SSR + AJAX ở path gốc.
          'assignment', 'assignment/getGiangVien', 'assignment/getMonHoc',
          'assignment/getNamHoc', 'assignment/getHocKy', 'assignment/getTotalPages',
          'assignment/pagination', 'assignment/checkDuplicate',
          'assignment/addAssignment', 'assignment/checkDuplicateForUpdate',
          'assignment/update', 'assignment/delete',
          // Phía sinh viên (client.php) — nhóm học phần SV + lịch kiểm tra.
          'client/group', 'client/test', 'client/joinGroup',
          'client/loadDataGroups', 'client/getFriendList', 'client/hide',
          'client/delete', 'client/getTotalPages', 'client/pagination',
          // Đề của 1 nhóm (offcanvas trang nhóm SV) — nằm ở controller test.
          'test/getTestsGroupWithUserResult',
        ],
      });
      app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: `${version}`,
      }); 
      return { globalPrefix, version };
}