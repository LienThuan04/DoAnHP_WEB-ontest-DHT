-- CreateTable
CREATE TABLE "monhoc" (
    "mamonhoc" TEXT NOT NULL,
    "tenmonhoc" TEXT NOT NULL,
    "sotinchi" INTEGER,
    "sotietlythuyet" INTEGER,
    "sotietthuchanh" INTEGER,
    "trangthai" INTEGER,

    CONSTRAINT "monhoc_pkey" PRIMARY KEY ("mamonhoc")
);

-- CreateTable
CREATE TABLE "chuong" (
    "machuong" SERIAL NOT NULL,
    "tenchuong" TEXT NOT NULL,
    "mamonhoc" TEXT NOT NULL,
    "trangthai" INTEGER,

    CONSTRAINT "chuong_pkey" PRIMARY KEY ("machuong")
);

-- AddForeignKey
ALTER TABLE "chuong" ADD CONSTRAINT "chuong_mamonhoc_fkey" FOREIGN KEY ("mamonhoc") REFERENCES "monhoc"("mamonhoc") ON DELETE CASCADE ON UPDATE CASCADE;
