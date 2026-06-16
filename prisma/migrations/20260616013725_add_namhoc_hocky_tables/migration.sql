-- CreateTable
CREATE TABLE "namhoc" (
    "manamhoc" SERIAL NOT NULL,
    "tennamhoc" TEXT NOT NULL,
    "trangthai" INTEGER DEFAULT 1,
    "ngaytao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "namhoc_pkey" PRIMARY KEY ("manamhoc")
);

-- CreateTable
CREATE TABLE "hocky" (
    "mahocky" SERIAL NOT NULL,
    "tenhocky" TEXT NOT NULL,
    "manamhoc" INTEGER NOT NULL,
    "ngaytao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sohocky" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "hocky_pkey" PRIMARY KEY ("mahocky")
);

-- AddForeignKey
ALTER TABLE "hocky" ADD CONSTRAINT "hocky_manamhoc_fkey" FOREIGN KEY ("manamhoc") REFERENCES "namhoc"("manamhoc") ON DELETE CASCADE ON UPDATE CASCADE;
