-- CreateTable
CREATE TABLE "nguoidung" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "googleid" TEXT,
    "hoten" TEXT NOT NULL,
    "gioitinh" BOOLEAN,
    "ngaysinh" DATE,
    "avatar" TEXT DEFAULT 'ANHSV.png',
    "ngaythamgia" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matkhau" TEXT,
    "trangthai" INTEGER NOT NULL DEFAULT 1,
    "sodienthoai" INTEGER,
    "token" TEXT,
    "otp" TEXT,
    "manhomquyen" INTEGER,

    CONSTRAINT "nguoidung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nhomquyen" (
    "manhomquyen" SERIAL NOT NULL,
    "tennhomquyen" TEXT NOT NULL,
    "trangthai" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "nhomquyen_pkey" PRIMARY KEY ("manhomquyen")
);

-- CreateTable
CREATE TABLE "chitietquyen" (
    "manhomquyen" INTEGER NOT NULL,
    "chucnang" TEXT NOT NULL,
    "hanhdong" TEXT NOT NULL,

    CONSTRAINT "chitietquyen_pkey" PRIMARY KEY ("manhomquyen","chucnang","hanhdong")
);

-- CreateTable
CREATE TABLE "danhmucchucnang" (
    "chucnang" TEXT NOT NULL,
    "tenchucnang" TEXT,

    CONSTRAINT "danhmucchucnang_pkey" PRIMARY KEY ("chucnang")
);

-- CreateIndex
CREATE UNIQUE INDEX "nguoidung_email_key" ON "nguoidung"("email");

-- AddForeignKey
ALTER TABLE "nguoidung" ADD CONSTRAINT "nguoidung_manhomquyen_fkey" FOREIGN KEY ("manhomquyen") REFERENCES "nhomquyen"("manhomquyen") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitietquyen" ADD CONSTRAINT "chitietquyen_manhomquyen_fkey" FOREIGN KEY ("manhomquyen") REFERENCES "nhomquyen"("manhomquyen") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitietquyen" ADD CONSTRAINT "chitietquyen_chucnang_fkey" FOREIGN KEY ("chucnang") REFERENCES "danhmucchucnang"("chucnang") ON DELETE RESTRICT ON UPDATE CASCADE;
