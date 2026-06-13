// Script một lần: seed dữ liệu hệ thi OnTest vào DB.
// Dùng cùng adapter (PrismaPg) như PrismaService. Chạy: node scripts/seed-exam.cjs
// Lưu ý: logic này trùng với SeedDbService.seedExam() (chạy tự động khi SEED_DB=true).
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const {
  examRoles,
  examResources,
  examPermissions,
  examUsers,
} = require('../dist/src/seed-db/seed/exam-sample.js');

(async () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter });
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  const defaultPassword = process.env.DEFAULT_PASSWORD || '123456';

  try {
    const r1 = await prisma.danhMucChucNang.createMany({ data: examResources, skipDuplicates: true });
    console.log(`danhmucchucnang: +${r1.count}`);

    const r2 = await prisma.nhomQuyen.createMany({ data: examRoles, skipDuplicates: true });
    console.log(`nhomquyen: +${r2.count}`);

    const r3 = await prisma.chiTietQuyen.createMany({ data: examPermissions, skipDuplicates: true });
    console.log(`chitietquyen: +${r3.count}`);

    const userData = await Promise.all(
      examUsers.map(async (u) => ({
        id: u.id,
        email: u.email,
        hoten: u.hoten,
        manhomquyen: u.manhomquyen,
        matkhau: await bcrypt.hash(defaultPassword, await bcrypt.genSalt(saltRounds)),
        trangthai: 1,
      })),
    );
    const r4 = await prisma.nguoiDung.createMany({ data: userData, skipDuplicates: true });
    console.log(`nguoidung: +${r4.count} (mật khẩu mặc định: "${defaultPassword}")`);

    console.log('✅ Seed hệ thi xong.');
  } catch (e) {
    console.error('❌ Seed lỗi:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
