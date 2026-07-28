import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  applyThinBorders,
  centerCells,
  createWorkbook,
  setColumnWidths,
  workbookToDataUri,
  writeHeaderRow,
} from '@/common/utils/excel.util';
import type { IExcelDownload } from '@/common/utils/excel.util';
import type {
  IExamScoreRow,
  IMarkMatrixRow,
  IPrintBlock,
  IPrintPdfInfo,
  IPrintQuestion,
  IResultDetailRow,
} from '@/exams/interfaces/exams.types';

/** Màu chủ đạo của bảng điểm (giữ đúng mã màu bản PHP). */
const BRAND = '1E90C3';

/**
 * Xuất Excel cho module Đề thi — thay `Test::exportExcel` (PHPExcel) và bổ sung
 * `getMarkOfAllTest` mà PHP có model nhưng THIẾU action controller.
 *
 * Tách khỏi `ExamsService` (đã ~2000 dòng) cho dễ đọc; cùng dùng `PrismaService`.
 * Kết quả trả về giữ nguyên shape `{status,file,filename}` mà JS gốc mong đợi
 * (`test_detail.js` `#export_excel`, `class_detail.js` `#exportScores`).
 */
@Injectable()
export class ExamsExportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tên lớp hiển thị trên tiêu đề — thay `KetQuaModel::getTenLopDisplay`.
   *
   * KHÁC PHP: nhánh danh sách lớp tra theo **manhom** (`WHERE manhom IN (...)`).
   * PHP tra `tennhom IN (...)` trong khi `ds` mà `test_detail.js` gửi lên là mảng
   * **mã nhóm** (số) → luôn không khớp và rơi về "Tất cả các lớp". Ở đây tra đúng
   * cột nên tiêu đề hiện tên các lớp thật.
   */
  private async getTenLopDisplay(
    ds: number[],
    manhom: number,
  ): Promise<string> {
    if (manhom > 0) {
      const row = await this.prisma.nhom.findUnique({
        where: { manhom },
        select: { tennhom: true },
      });
      if (row?.tennhom) return row.tennhom;
    }
    if (ds.length > 0) {
      const rows = await this.prisma.nhom.findMany({
        where: { manhom: { in: ds } },
        select: { tennhom: true },
        orderBy: { manhom: 'asc' },
      });
      if (rows.length > 0) return rows.map((r) => r.tennhom).join(' - ');
    }
    return 'Tất cả các lớp';
  }

  /**
   * Tên môn của đề — thay `KetQuaModel::getTenMonHoc` (2 câu truy vấn dự phòng).
   * `dethi.monthi` chính là `mamonhoc` nên tra thẳng bảng monhoc là đủ; giữ
   * fallback "Môn đề {made}" như PHP khi không tìm thấy.
   */
  private async getTenMonHoc(made: number): Promise<string> {
    const rows = await this.prisma.$queryRaw<{ tenmonhoc: string }[]>(
      Prisma.sql`
        SELECT MH.tenmonhoc
        FROM dethi DT
        JOIN monhoc MH ON MH.mamonhoc = DT.monthi
        WHERE DT.made = ${made}
        LIMIT 1
      `,
    );
    const ten = (rows[0]?.tenmonhoc ?? '').trim();
    return ten !== '' ? ten : `Môn đề ${made}`;
  }

  /**
   * Bảng điểm khi lọc theo 1 nhóm — thay `KetQuaModel::getTestScoreGroup`.
   * Lấy MỌI SV của nhóm (LEFT JOIN ketqua) nên SV chưa thi vẫn có dòng.
   */
  private getTestScoreGroup(
    made: number,
    manhom: number,
  ): Promise<IExamScoreRow[]> {
    return this.prisma.$queryRaw<IExamScoreRow[]>(Prisma.sql`
      SELECT
        ds.manguoidung,
        ds.hoten,
        (KQ.diemthi - COALESCE(KQ.diem_dochieu, 0)) AS diemtracnghiem,
        KQ.diem_tuluan  AS diemtuluan,
        KQ.diem_dochieu AS diemdochieu,
        KQ.thoigianvaothi,
        KQ.thoigianlambai,
        KQ.socaudung,
        KQ.solanchuyentab
      FROM (
        SELECT CTN.manguoidung, ND.hoten
        FROM chitietnhom CTN
        JOIN nguoidung ND ON CTN.manguoidung = ND.id
        WHERE CTN.manhom = ${manhom}
      ) ds
      LEFT JOIN (
        SELECT KQ.manguoidung, KQ.diemthi, KQ.diem_tuluan, KQ.diem_dochieu,
               KQ.thoigianvaothi, KQ.thoigianlambai, KQ.socaudung, KQ.solanchuyentab
        FROM ketqua KQ
        JOIN giaodethi GDT ON KQ.made = GDT.made
        WHERE GDT.made = ${made} AND GDT.manhom = ${manhom}
      ) KQ ON ds.manguoidung = KQ.manguoidung
      ORDER BY ds.manguoidung ASC
    `);
  }

  /**
   * Bảng điểm khi lọc "Tất cả nhóm" — thay `KetQuaModel::getTestAll`.
   * UNION: SV thuộc các nhóm mà CHƯA có kết quả + SV đã có kết quả của đề này.
   */
  private getTestAll(made: number, ds: number[]): Promise<IExamScoreRow[]> {
    const list = Prisma.join(ds);
    return this.prisma.$queryRaw<IExamScoreRow[]>(Prisma.sql`
      (
        SELECT CTN.manguoidung, ND.hoten,
          NULL::double precision AS diemtracnghiem,
          NULL::double precision AS diemtuluan,
          NULL::double precision AS diemdochieu,
          NULL::timestamp AS thoigianvaothi,
          NULL::int AS thoigianlambai,
          NULL::int AS socaudung,
          NULL::int AS solanchuyentab
        FROM chitietnhom CTN
        JOIN nguoidung ND ON ND.id = CTN.manguoidung
        LEFT JOIN ketqua KQ ON CTN.manguoidung = KQ.manguoidung AND KQ.made = ${made}
        WHERE KQ.made IS NULL AND CTN.manhom IN (${list})
      )
      UNION
      (
        SELECT DISTINCT KQ.manguoidung, ND.hoten,
          (KQ.diemthi - COALESCE(KQ.diem_dochieu, 0)) AS diemtracnghiem,
          KQ.diem_tuluan  AS diemtuluan,
          KQ.diem_dochieu AS diemdochieu,
          KQ.thoigianvaothi,
          KQ.thoigianlambai,
          KQ.socaudung,
          KQ.solanchuyentab
        FROM ketqua KQ
        JOIN nguoidung ND ON KQ.manguoidung = ND.id
        JOIN chitietnhom CTN ON CTN.manguoidung = ND.id
        WHERE KQ.made = ${made} AND CTN.manhom IN (${list})
      )
      ORDER BY manguoidung ASC
    `);
  }

  /**
   * POST /test/exportExcel — bảng điểm 1 đề ra .xlsx (thay `Test::exportExcel`).
   * Giữ nguyên bố cục PHP: dòng 1 tiêu đề gộp A:J, dòng 2 header xanh, dữ liệu
   * từ dòng 3, freeze pane A3, viền mảnh toàn bảng, SV chưa thi ghi "Chưa làm".
   */
  async exportExamScores(
    made: number,
    manhom: number,
    ds: number[],
  ): Promise<IExcelDownload> {
    const [tenLop, tenMon] = await Promise.all([
      this.getTenLopDisplay(ds, manhom),
      this.getTenMonHoc(made),
    ]);
    const rows =
      manhom === 0
        ? ds.length > 0
          ? await this.getTestAll(made, ds)
          : []
        : await this.getTestScoreGroup(made, manhom);

    const { workbook, sheet } = createWorkbook(
      `De_${made}${manhom ? `_N${manhom}` : ''}`,
    );
    setColumnWidths(sheet, [15, 30, 14, 15, 12, 12, 22, 18, 14, 16]);

    // Dòng 1 — tiêu đề chính (gộp A1:J1).
    sheet.mergeCells('A1:J1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `DANH SÁCH ĐIỂM LỚP: ${tenLop} - MÃ ĐỀ: ${made} - ${tenMon}`;
    titleCell.font = { bold: true, size: 16, color: { argb: `FF${BRAND}` } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 38;

    // Dòng 2 — header cột.
    const headerRow = writeHeaderRow(
      sheet,
      2,
      [
        'MSSV',
        'Họ và tên',
        'ĐIỂM TỔNG',
        'Trắc nghiệm',
        'Tự luận',
        'Đọc hiểu',
        'Thời gian vào thi',
        'Thời gian làm bài',
        'Số câu đúng',
        'Lần chuyển Tab',
      ],
      { fill: BRAND },
    );
    headerRow.height = 28;

    // Dữ liệu từ dòng 3.
    let rowNum = 3;
    if (rows.length > 0) {
      for (const r of rows) {
        const tgLam = Number(r.thoigianlambai ?? 0);
        const diemTN = Number(r.diemtracnghiem ?? 0);
        const diemTL = Number(r.diemtuluan ?? 0);
        const diemDH = Number(r.diemdochieu ?? 0);
        const caudung = Number(r.socaudung ?? 0);
        const chuyentab = Number(r.solanchuyentab ?? 0);
        const vaothi = r.thoigianvaothi ? formatDateTime(r.thoigianvaothi) : '';
        const daLam =
          !!r.thoigianvaothi ||
          diemTN > 0 ||
          diemTL > 0 ||
          diemDH > 0 ||
          caudung > 0 ||
          tgLam > 0;

        const line = sheet.getRow(rowNum);
        // MSSV ghi dạng chuỗi (mã có thể bắt đầu bằng 0) như setCellValueExplicit.
        line.getCell(1).value = String(r.manguoidung ?? '');
        line.getCell(2).value = r.hoten ?? '';
        line.getCell(2).alignment = { wrapText: true };

        if (!daLam) {
          line.getCell(3).value = 'Chưa làm';
          line.getCell(4).value = 'Chưa làm';
          line.getCell(5).value = 'Chưa làm';
          line.getCell(6).value = 'Chưa làm';
          line.getCell(7).value = '';
          line.getCell(8).value = '';
          line.getCell(9).value = 'Chưa làm';
          line.getCell(10).value = 'Chưa làm';
        } else {
          line.getCell(3).value = Math.round((diemTN + diemTL + diemDH) * 100) / 100;
          line.getCell(4).value = diemTN > 0 ? diemTN : 0;
          line.getCell(5).value = diemTL > 0 ? diemTL : 0;
          line.getCell(6).value = diemDH > 0 ? diemDH : 0;
          line.getCell(7).value = vaothi;
          line.getCell(8).value = tgLam > 0 ? formatDuration(tgLam) : '';
          line.getCell(9).value = caudung;
          line.getCell(10).value = chuyentab;
        }
        centerCells(sheet, rowNum, 3, 10);
        rowNum++;
      }
    } else {
      sheet.mergeCells(`A${rowNum}:J${rowNum}`);
      const cell = sheet.getCell(`A${rowNum}`);
      cell.value = 'Không có dữ liệu';
      cell.alignment = { horizontal: 'center' };
      rowNum++;
    }

    applyThinBorders(sheet, 2, rowNum - 1, 10);
    sheet.views = [{ state: 'frozen', ySplit: 2 }];

    const filename = `Ket_qua_de_${made}${manhom ? `_nhom_${manhom}` : ''}.xlsx`;
    return workbookToDataUri(workbook, filename);
  }

  /**
   * POST /test/getMarkOfAllTest — bảng điểm TẤT CẢ đề đã giao cho 1 nhóm.
   *
   * KHÁC PHP: bản gốc chỉ có `KetQuaModel::getMarkOfAllTest` mà THIẾU action ở
   * `test.php` (chỉ gọi trong `check()` để in ra màn hình) → nút "Xuất bảng điểm"
   * ở `class_detail.js` gọi vào route không tồn tại. Ở đây bổ sung route thật:
   * dựng ma trận SV × đề rồi xuất .xlsx cùng shape `{status,file,filename}`.
   *
   * Ma trận cũng được dựng bằng 1 truy vấn (thay vòng lặp N+1 `getMarkOfOneTest`
   * của PHP) và ghép theo cặp (manguoidung, made) — PHP ghép theo **chỉ số mảng**
   * nên lệch dòng khi một SV thiếu bản ghi ở đề nào đó.
   */
  async exportMarkOfAllTest(manhom: number): Promise<IExcelDownload> {
    const [tests, students, marks, group] = await Promise.all([
      this.prisma.$queryRaw<{ made: number; tende: string | null }[]>(
        Prisma.sql`
          SELECT DT.made, DT.tende
          FROM giaodethi GDT
          JOIN dethi DT ON GDT.made = DT.made
          WHERE GDT.manhom = ${manhom}
          ORDER BY DT.made ASC
        `,
      ),
      this.prisma.$queryRaw<{ id: string; hoten: string }[]>(Prisma.sql`
        SELECT ND.id, ND.hoten
        FROM nguoidung ND
        JOIN chitietnhom CTN ON ND.id = CTN.manguoidung
        WHERE CTN.manhom = ${manhom}
        ORDER BY ND.id ASC
      `),
      this.prisma.$queryRaw<IMarkMatrixRow[]>(Prisma.sql`
        SELECT KQ.made, KQ.manguoidung, KQ.diemthi
        FROM ketqua KQ
        JOIN giaodethi GDT ON GDT.made = KQ.made AND GDT.manhom = ${manhom}
        JOIN chitietnhom CTN
          ON CTN.manguoidung = KQ.manguoidung AND CTN.manhom = ${manhom}
      `),
      this.prisma.nhom.findUnique({
        where: { manhom },
        select: { tennhom: true },
      }),
    ]);

    // Tra cứu điểm theo cặp (SV, đề) — thay việc ghép theo chỉ số mảng của PHP.
    const markMap = new Map<string, number | null>();
    for (const m of marks) {
      markMap.set(`${m.manguoidung}|${m.made}`, m.diemthi);
    }

    const { workbook, sheet } = createWorkbook('Bảng điểm');
    setColumnWidths(sheet, [15, 30, ...tests.map(() => 16)]);

    const colCount = 2 + tests.length;
    const tenNhom = group?.tennhom ?? `Nhóm ${manhom}`;
    sheet.mergeCells(1, 1, 1, colCount);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = `BẢNG ĐIỂM TẤT CẢ ĐỀ - LỚP: ${tenNhom}`;
    titleCell.font = { bold: true, size: 16, color: { argb: `FF${BRAND}` } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 38;

    const headerRow = writeHeaderRow(
      sheet,
      2,
      [
        'Mã sinh viên',
        'Tên sinh viên',
        ...tests.map((t) => t.tende ?? `Đề ${t.made}`),
      ],
      { fill: BRAND },
    );
    headerRow.height = 28;

    let rowNum = 3;
    for (const sv of students) {
      const line = sheet.getRow(rowNum);
      line.getCell(1).value = sv.id;
      line.getCell(2).value = sv.hoten;
      line.getCell(2).alignment = { wrapText: true };
      tests.forEach((t, i) => {
        const diem = markMap.get(`${sv.id}|${t.made}`);
        line.getCell(3 + i).value = diem === null || diem === undefined ? '' : diem;
      });
      centerCells(sheet, rowNum, 3, colCount);
      rowNum++;
    }
    if (students.length === 0) {
      sheet.mergeCells(rowNum, 1, rowNum, colCount);
      const cell = sheet.getCell(rowNum, 1);
      cell.value = 'Không có dữ liệu';
      cell.alignment = { horizontal: 'center' };
      rowNum++;
    }

    applyThinBorders(sheet, 2, rowNum - 1, colCount);
    sheet.views = [{ state: 'frozen', ySplit: 2 }];

    return workbookToDataUri(workbook, `Bang_diem_nhom_${manhom}.xlsx`);
  }

  /**
   * Thông tin phiếu kết quả để in — thay `KetQuaModel::getInfoPrintPdf`.
   * `thoigianlambai_giay` tính bằng EXTRACT(EPOCH …) thay TIMESTAMPDIFF của MySQL.
   * Trả null nếu không có kết quả (controller → 404 như PHP).
   */
  async getInfoPrintPdf(makq: number): Promise<IPrintPdfInfo | null> {
    const rows = await this.prisma.$queryRaw<IPrintPdfInfo[]>(Prisma.sql`
      SELECT
        KQ.made, DT.tende, DT.thoigianthi, MH.tenmonhoc,
        KQ.manguoidung, ND.hoten, KQ.socaudung,
        (SELECT COUNT(*)::int FROM chitietdethi WHERE made = KQ.made) AS tongsocauhoi,
        KQ.diemthi, KQ.thoigianvaothi, KQ.thoigianketthuc,
        EXTRACT(EPOCH FROM (
          COALESCE(KQ.thoigianketthuc, NOW()) - KQ.thoigianvaothi
        ))::int AS thoigianlambai_giay
      FROM ketqua KQ
      JOIN dethi DT ON KQ.made = DT.made
      JOIN monhoc MH ON DT.monthi = MH.mamonhoc
      JOIN nguoidung ND ON KQ.manguoidung = ND.id
      WHERE KQ.makq = ${makq}
      LIMIT 1
    `);
    return rows[0] ?? null;
  }

  /**
   * Gom các câu của bài làm thành khối để render phiếu in — thay việc mở/đóng
   * thẻ `<div>` thủ công trong vòng lặp của `Test::exportPdf` (dễ lệch thẻ).
   *
   * Quy tắc giữ nguyên bản PHP: câu đọc hiểu cùng đoạn văn (so sánh sau khi rút
   * gọn khoảng trắng) gom chung 1 thẻ; câu trắc nghiệm rời nằm trong thẻ riêng
   * tiêu đề "Câu hỏi trắc nghiệm"; câu tự luận đứng độc lập. Số thứ tự "Câu N"
   * đếm liên tục qua mọi loại.
   */
  buildPrintBlocks(rows: IResultDetailRow[]): IPrintBlock[] {
    const blocks: IPrintBlock[] = [];
    let stt = 1;
    let lastContext = '';

    for (const row of rows) {
      const question: IPrintQuestion = {
        ...row,
        stt: stt++,
        hinhanh_list: (row.ds_hinhanh ?? '')
          .split('||')
          .map((s) => s.trim())
          .filter((s) => s !== ''),
      };

      if (row.loai === 'essay') {
        blocks.push({
          type: 'essay',
          tieude: null,
          context: null,
          questions: [question],
        });
        lastContext = '';
        continue;
      }

      const normalized = (row.context ?? '').replace(/\s+/g, ' ').trim();
      if (row.loai === 'reading' && normalized) {
        const last = blocks[blocks.length - 1];
        if (last?.type === 'reading' && normalized === lastContext) {
          last.questions.push(question);
        } else {
          blocks.push({
            type: 'reading',
            tieude: row.tieude_context ?? 'Đoạn văn đọc hiểu',
            context: row.context,
            questions: [question],
          });
          lastContext = normalized;
        }
        continue;
      }

      // Trắc nghiệm rời (hoặc câu reading không có đoạn văn) — thẻ riêng.
      blocks.push({
        type: 'mcq',
        tieude: 'Câu hỏi trắc nghiệm',
        context: null,
        questions: [question],
      });
      lastContext = '';
    }
    return blocks;
  }
}

/** `dd/MM/yyyy HH:mm:ss` cho cột thời gian vào thi. */
function formatDateTime(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Số giây → `HH:mm:ss` (thay `gmdate("H:i:s", $s)` của PHP). */
function formatDuration(seconds: number): string {
  const p = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${p(h)}:${p(m)}:${p(s)}`;
}
