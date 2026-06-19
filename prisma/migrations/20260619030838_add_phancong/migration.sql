-- CreateTable
CREATE TABLE "phancong" (
    "mamonhoc" TEXT NOT NULL,
    "manguoidung" TEXT NOT NULL,
    "namhoc" INTEGER NOT NULL,
    "hocky" INTEGER NOT NULL,
    "trangthai" SMALLINT NOT NULL DEFAULT 1,
    "ngaytao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phancong_pkey" PRIMARY KEY ("mamonhoc","manguoidung","namhoc","hocky")
);
