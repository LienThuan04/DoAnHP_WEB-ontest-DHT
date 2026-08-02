// Tạo PrismaClient cho các script seed chạy ngoài Nest, GIỐNG `PrismaService`:
// URL Prisma Accelerate (prisma+postgres:// hoặc prisma://) truyền qua `accelerateUrl`;
// URL postgres:// trực tiếp thì dùng driver adapter PrismaPg.
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Thiếu DATABASE_URL trong .env');
  if (url.startsWith('prisma')) return new PrismaClient({ accelerateUrl: url });
  const adapter = new PrismaPg({
    connectionString: url,
    ssl: { rejectUnauthorized: false }, // chỉ dùng khi phát triển
  });
  return new PrismaClient({ adapter });
}

module.exports = { createPrisma };
