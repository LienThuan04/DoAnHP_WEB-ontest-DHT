-- CreateTable
CREATE TABLE "doan_van" (
    "madv" SERIAL NOT NULL,
    "noidung" TEXT NOT NULL,
    "tieude" TEXT,
    "mamonhoc" TEXT NOT NULL,
    "machuong" INTEGER,
    "nguoitao" TEXT,
    "trangthai" INTEGER DEFAULT 1,
    "ngaytao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doan_van_pkey" PRIMARY KEY ("madv")
);

-- CreateTable
CREATE TABLE "cauhoi" (
    "macauhoi" SERIAL NOT NULL,
    "noidung" TEXT NOT NULL,
    "dapan_dung" CHAR(1),
    "dokho" INTEGER NOT NULL,
    "mamonhoc" TEXT NOT NULL,
    "machuong" INTEGER NOT NULL,
    "nguoitao" TEXT,
    "trangthai" INTEGER DEFAULT 1,
    "loai" TEXT NOT NULL DEFAULT 'mcq',
    "madv" INTEGER,
    "hinhanh" BYTEA,

    CONSTRAINT "cauhoi_pkey" PRIMARY KEY ("macauhoi")
);

-- CreateTable
CREATE TABLE "cautraloi" (
    "macautl" SERIAL NOT NULL,
    "macauhoi" INTEGER NOT NULL,
    "noidungtl" TEXT NOT NULL,
    "ladapan" SMALLINT NOT NULL,
    "hinhanh" BYTEA,

    CONSTRAINT "cautraloi_pkey" PRIMARY KEY ("macautl")
);

-- AddForeignKey
ALTER TABLE "cautraloi" ADD CONSTRAINT "cautraloi_macauhoi_fkey" FOREIGN KEY ("macauhoi") REFERENCES "cauhoi"("macauhoi") ON DELETE CASCADE ON UPDATE CASCADE;
