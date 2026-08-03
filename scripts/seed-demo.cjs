// Script một lần: seed DỮ LIỆU MẪU NGHIỆP VỤ của hệ thi (năm học → môn học/chương →
// phân công → nhóm học phần → câu hỏi → đề thi + bài làm mẫu).
//
// Chạy:  node scripts/seed-demo.cjs            (bỏ qua nếu DB đã có dữ liệu nghiệp vụ)
//        node scripts/seed-demo.cjs --clear    (xoá dữ liệu nghiệp vụ cũ rồi seed lại)
//        node scripts/seed-demo.cjs --force    (seed đè, KHÔNG xoá — dễ trùng dữ liệu)
//        node scripts/seed-demo.cjs --clear-only  (chỉ xoá, không seed)
//
// YÊU CẦU: chạy `pnpm run build` trước (script nạp bản build trong `dist/`), và người
// dùng mẫu phải có sẵn (SEED_DB=true lúc boot, hoặc `node scripts/seed-exam.cjs`).
// Logic này trùng với SeedDbService khi SEED_DEMO_DATA=true.
require('dotenv/config');
const { createPrisma } = require('./prisma-client.cjs');
const {
  seedExamDemo,
  clearExamDemo,
} = require('../dist/src/seed-db/seed/exam-demo.seeder.js');

(async () => {
  const args = process.argv.slice(2);
  const doClear = args.includes('--clear') || args.includes('--clear-only');
  const clearOnly = args.includes('--clear-only');
  const force = args.includes('--force') || doClear;

  const prisma = createPrisma();
  try {
    if (doClear) await clearExamDemo(prisma);
    if (clearOnly) {
      console.log('✅ Đã xoá dữ liệu mẫu nghiệp vụ.');
      return;
    }

    const r = await seedExamDemo(prisma, { force });
    if (r.skipped) {
      console.log('⏭️  Bỏ qua (DB đã có dữ liệu nghiệp vụ). Dùng --clear để seed lại.');
      return;
    }
    console.log(
      `✅ Seed dữ liệu mẫu xong: ${r.monhoc} môn học, ${r.chuong} chương, ${r.cauhoi} câu hỏi, ` +
        `${r.nhom} nhóm học phần, ${r.dethi} đề thi, ${r.ketqua} bài làm mẫu.`,
    );
  } catch (e) {
    console.error('❌ Seed lỗi:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
