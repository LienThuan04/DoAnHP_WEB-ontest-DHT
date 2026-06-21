-- CreateTable
CREATE TABLE "dethi" (
    "made" SERIAL NOT NULL,
    "monthi" TEXT,
    "nguoitao" TEXT,
    "tende" TEXT,
    "thoigiantao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thoigianthi" INTEGER,
    "thoigianbatdau" TIMESTAMP(3),
    "thoigianketthuc" TIMESTAMP(3),
    "hienthibailam" INTEGER,
    "xemdiemthi" INTEGER,
    "xemdapan" INTEGER,
    "troncauhoi" INTEGER,
    "trondapan" INTEGER,
    "nopbaichuyentab" INTEGER,
    "loaide" INTEGER,
    "mcq_de" INTEGER,
    "mcq_tb" INTEGER,
    "mcq_kho" INTEGER,
    "trangthai" INTEGER DEFAULT 1,
    "essay_de" INTEGER DEFAULT 0,
    "essay_tb" INTEGER DEFAULT 0,
    "essay_kho" INTEGER DEFAULT 0,
    "reading_de" INTEGER DEFAULT 0,
    "reading_tb" INTEGER DEFAULT 0,
    "reading_kho" INTEGER DEFAULT 0,
    "diem_tracnghiem" DECIMAL(5,2) DEFAULT 0,
    "diem_tuluan" DECIMAL(5,2) DEFAULT 0,
    "diem_dochieu" DECIMAL(5,2) DEFAULT 0,

    CONSTRAINT "dethi_pkey" PRIMARY KEY ("made")
);

-- CreateTable
CREATE TABLE "chitietdethi" (
    "made" INTEGER NOT NULL,
    "macauhoi" INTEGER NOT NULL,
    "thutu" INTEGER,

    CONSTRAINT "chitietdethi_pkey" PRIMARY KEY ("made","macauhoi")
);

-- CreateTable
CREATE TABLE "dethitudong" (
    "made" INTEGER NOT NULL,
    "machuong" INTEGER NOT NULL,

    CONSTRAINT "dethitudong_pkey" PRIMARY KEY ("made","machuong")
);

-- CreateTable
CREATE TABLE "giaodethi" (
    "made" INTEGER NOT NULL,
    "manhom" INTEGER NOT NULL,

    CONSTRAINT "giaodethi_pkey" PRIMARY KEY ("made","manhom")
);

-- CreateTable
CREATE TABLE "ketqua" (
    "makq" SERIAL NOT NULL,
    "made" INTEGER NOT NULL,
    "manguoidung" TEXT NOT NULL DEFAULT '',
    "diemthi" DOUBLE PRECISION,
    "diem_dochieu" DOUBLE PRECISION DEFAULT 0,
    "thoigianvaothi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thoigianlambai" INTEGER,
    "socaudung" INTEGER,
    "solanchuyentab" INTEGER DEFAULT 0,
    "diem_tuluan" DOUBLE PRECISION DEFAULT 0,
    "trangthai_tuluan" TEXT DEFAULT 'Chưa chấm',
    "trangthai" TEXT DEFAULT 'Chưa nộp',
    "thoigianketthuc" TIMESTAMP(3),

    CONSTRAINT "ketqua_pkey" PRIMARY KEY ("makq")
);

-- CreateTable
CREATE TABLE "chitietketqua" (
    "makq" INTEGER NOT NULL,
    "macauhoi" INTEGER NOT NULL,
    "thutu" INTEGER DEFAULT 0,
    "dapanchon" INTEGER,

    CONSTRAINT "chitietketqua_pkey" PRIMARY KEY ("makq","macauhoi")
);

-- CreateTable
CREATE TABLE "traloi_tuluan" (
    "id" SERIAL NOT NULL,
    "makq" INTEGER NOT NULL,
    "macauhoi" INTEGER NOT NULL,
    "noidung" TEXT,
    "thoigianlam" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traloi_tuluan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hinhanh_traloi_tuluan" (
    "id" SERIAL NOT NULL,
    "traloi_id" INTEGER NOT NULL,
    "hinhanh" BYTEA,
    "thoigian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hinhanh_traloi_tuluan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cham_tuluan" (
    "id" SERIAL NOT NULL,
    "makq" INTEGER NOT NULL,
    "macauhoi" INTEGER NOT NULL,
    "diem" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "cham_tuluan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ketqua_made_manguoidung_key" ON "ketqua"("made", "manguoidung");

-- AddForeignKey
ALTER TABLE "chitietdethi" ADD CONSTRAINT "chitietdethi_made_fkey" FOREIGN KEY ("made") REFERENCES "dethi"("made") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dethitudong" ADD CONSTRAINT "dethitudong_made_fkey" FOREIGN KEY ("made") REFERENCES "dethi"("made") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giaodethi" ADD CONSTRAINT "giaodethi_made_fkey" FOREIGN KEY ("made") REFERENCES "dethi"("made") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitietketqua" ADD CONSTRAINT "chitietketqua_makq_fkey" FOREIGN KEY ("makq") REFERENCES "ketqua"("makq") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hinhanh_traloi_tuluan" ADD CONSTRAINT "hinhanh_traloi_tuluan_traloi_id_fkey" FOREIGN KEY ("traloi_id") REFERENCES "traloi_tuluan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
