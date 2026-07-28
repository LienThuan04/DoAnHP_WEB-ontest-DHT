import ExcelJS from 'exceljs';

/**
 * Tiện ích Excel dùng chung cho các route xuất/nhập file (thay PHPExcel của bản PHP).
 *
 * Bản PHP ghi workbook ra `php://output` rồi `base64_encode` và trả về JSON
 * `{status:true, file:"data:...;base64,..."}`. JS gốc tạo thẻ `<a href=response.file
 * download="...">` rồi click → PHẢI giữ nguyên shape này (xem `class_detail.js`
 * `#exportStudents`/`#exportScores` và `test_detail.js` `#export_excel`).
 */

/** MIME của .xlsx (Excel2007 trong PHPExcel). */
export const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Kết quả trả về cho JS gốc: `{status, file, filename}`. */
export interface IExcelDownload {
  status: boolean;
  file: string;
  filename: string;
}

/** Màu nền/chữ của header bảng (giữ đúng mã màu bản PHP). */
export interface IHeaderStyle {
  /** Mã màu nền dạng RRGGBB (PHPExcel dùng chuỗi 6 ký tự). */
  fill: string;
  /** Mã màu chữ dạng RRGGBB. Mặc định trắng. */
  font?: string;
}

/**
 * Ghi workbook ra buffer rồi bọc thành data-URI base64 — thay
 * `ob_start()/save('php://output')/base64_encode` của PHP.
 */
export async function workbookToDataUri(
  workbook: ExcelJS.Workbook,
  filename: string,
  mime: string = XLSX_MIME,
): Promise<IExcelDownload> {
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return { status: true, file: `data:${mime};base64,${base64}`, filename };
}

/** Tạo workbook mới kèm 1 sheet. Tên sheet bị Excel giới hạn 31 ký tự. */
export function createWorkbook(sheetTitle: string): {
  workbook: ExcelJS.Workbook;
  sheet: ExcelJS.Worksheet;
} {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sanitizeSheetName(sheetTitle));
  return { workbook, sheet };
}

/**
 * Chuẩn hoá tên sheet: Excel cấm `: \ / ? * [ ]` và giới hạn 31 ký tự.
 * PHP chỉ `substr(...,0,31)` nên KHÁC PHP ở chỗ lọc ký tự cấm (an toàn hơn).
 */
export function sanitizeSheetName(name: string): string {
  const cleaned = (name || 'Sheet1').replace(/[:\\/?*[\]]/g, '_').trim();
  return (cleaned || 'Sheet1').slice(0, 31);
}

/** Đặt độ rộng cột theo thứ tự (thay `getColumnDimension('A')->setWidth(..)`). */
export function setColumnWidths(
  sheet: ExcelJS.Worksheet,
  widths: number[],
): void {
  widths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });
}

/**
 * Ghi 1 dòng header có tô nền + in đậm + căn giữa (thay `applyFromArray` PHP).
 * Trả về đối tượng dòng để tuỳ biến thêm (chiều cao…).
 */
export function writeHeaderRow(
  sheet: ExcelJS.Worksheet,
  rowIndex: number,
  headers: string[],
  style: IHeaderStyle,
): ExcelJS.Row {
  const row = sheet.getRow(rowIndex);
  headers.forEach((text, i) => {
    const cell = row.getCell(i + 1);
    cell.value = text;
    cell.font = { bold: true, color: { argb: `FF${style.font ?? 'FFFFFF'}` } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${style.fill}` },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  return row;
}

/** Căn giữa một dải ô trong 1 dòng (cột `from`..`to`, 1-based). */
export function centerCells(
  sheet: ExcelJS.Worksheet,
  rowIndex: number,
  from: number,
  to: number,
): void {
  const row = sheet.getRow(rowIndex);
  for (let c = from; c <= to; c++) {
    row.getCell(c).alignment = { horizontal: 'center' };
  }
}

/** Kẻ viền mảnh cho vùng bảng (thay `borders.allborders` PHP). */
export function applyThinBorders(
  sheet: ExcelJS.Worksheet,
  fromRow: number,
  toRow: number,
  colCount: number,
): void {
  const thin: ExcelJS.Border = { style: 'thin', color: { argb: 'FF000000' } };
  for (let r = fromRow; r <= toRow; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= colCount; c++) {
      row.getCell(c).border = {
        top: thin,
        left: thin,
        bottom: thin,
        right: thin,
      };
    }
  }
}

/**
 * Đọc giá trị ô về chuỗi. ExcelJS trả về nhiều kiểu (rich text, formula, date,
 * hyperlink) — gom hết về text thuần như `->getValue()` của PHPExcel.
 */
export function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    const v = value as unknown as Record<string, unknown>;
    if (typeof v.text === 'string') return v.text.trim();
    if (typeof v.result === 'string' || typeof v.result === 'number') {
      return String(v.result).trim();
    }
    if (Array.isArray(v.richText)) {
      return (v.richText as { text: string }[])
        .map((p) => p.text)
        .join('')
        .trim();
    }
    if (v.hyperlink && typeof v.hyperlink === 'string') {
      return String(v.text ?? v.hyperlink).trim();
    }
  }
  return String(value).trim();
}
