-- CreateTable
CREATE TABLE "nhom" (
    "manhom" SERIAL NOT NULL,
    "tennhom" TEXT NOT NULL,
    "mamoi" TEXT,
    "siso" INTEGER DEFAULT 0,
    "ghichu" TEXT,
    "namhoc" INTEGER,
    "hocky" INTEGER,
    "trangthai" INTEGER DEFAULT 1,
    "hienthi" INTEGER DEFAULT 1,
    "giangvien" TEXT NOT NULL DEFAULT '',
    "mamonhoc" TEXT NOT NULL,

    CONSTRAINT "nhom_pkey" PRIMARY KEY ("manhom")
);

-- CreateTable
CREATE TABLE "chitietnhom" (
    "manhom" INTEGER NOT NULL,
    "manguoidung" TEXT NOT NULL DEFAULT '0',
    "hienthi" INTEGER DEFAULT 1,

    CONSTRAINT "chitietnhom_pkey" PRIMARY KEY ("manhom","manguoidung")
);

-- CreateTable
CREATE TABLE "thongbao" (
    "matb" SERIAL NOT NULL,
    "noidung" TEXT,
    "thoigiantao" TIMESTAMP(3),
    "nguoitao" TEXT NOT NULL DEFAULT '',
    "is_auto" INTEGER DEFAULT 0,

    CONSTRAINT "thongbao_pkey" PRIMARY KEY ("matb")
);

-- CreateTable
CREATE TABLE "chitietthongbao" (
    "matb" INTEGER NOT NULL,
    "manhom" INTEGER NOT NULL,

    CONSTRAINT "chitietthongbao_pkey" PRIMARY KEY ("matb","manhom")
);

-- CreateTable
CREATE TABLE "trangthaithongbao" (
    "matb" INTEGER NOT NULL,
    "manguoidung" TEXT NOT NULL,
    "trangthai" TEXT DEFAULT 'chưa xem',

    CONSTRAINT "trangthaithongbao_pkey" PRIMARY KEY ("matb","manguoidung")
);

-- AddForeignKey
ALTER TABLE "chitietnhom" ADD CONSTRAINT "chitietnhom_manhom_fkey" FOREIGN KEY ("manhom") REFERENCES "nhom"("manhom") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitietthongbao" ADD CONSTRAINT "chitietthongbao_matb_fkey" FOREIGN KEY ("matb") REFERENCES "thongbao"("matb") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trangthaithongbao" ADD CONSTRAINT "trangthaithongbao_matb_fkey" FOREIGN KEY ("matb") REFERENCES "thongbao"("matb") ON DELETE CASCADE ON UPDATE CASCADE;
