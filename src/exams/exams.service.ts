import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  ICreatedTestRow,
  ICreateTestResult,
  IDeleteExamResult,
  IExamDetail,
  IExamPaginationArgs,
  IGroupOption,
  ISoCauLevels,
  ISoCauMap,
  ISubjectOption,
} from '@/exams/interfaces/exams.types';
import type { CreateTestDto, UpdateTestDto } from '@/exams/dto/exam.dto';

const PAGE_SIZE = 10;

/**
 * Nghiệp vụ Đề thi — thay DeThiModel.php (phần GV quản lý đề).
 *
 * Quy ước port lại (xem [[conversion-approach]]):
 *  - Danh sách đề (getQuery "getAllCreatedTest"): dùng $queryRaw vì cần
 *    STRING_AGG (GROUP_CONCAT) + GROUP BY. Lọc theo trạng thái thời gian /
 *    môn / nhóm / từ khoá. userId lấy từ JWT, KHÔNG tin args.id (an toàn hơn PHP).
 *  - KHÁC PHP: namhoc/hocky JOIN dạng LEFT (PHP dùng INNER) để đề có nhóm gắn
 *    namhoc/hocky không hợp lệ vẫn hiện — đúng tinh thần fallback "Chưa xác định"
 *    của test.js. giaodethi/nhom/monhoc vẫn INNER (đề phải có nhóm & môn mới hiện).
 *  - Xoá đề: chặn nếu đã có thí sinh làm; dọn thông báo liên quan rồi xoá đề
 *    (cascade lo chitietdethi/dethitudong/giaodethi). Bọc $transaction.
 */
@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Điều kiện lọc theo trạng thái thời gian (filter "0"|"1"|"2"). */
  private buildStateCond(filter: unknown): Prisma.Sql {
    switch (String(filter)) {
      case '0': // Chưa mở
        return Prisma.sql`AND CURRENT_TIMESTAMP < DT.thoigianbatdau`;
      case '1': // Đang mở
        return Prisma.sql`AND CURRENT_TIMESTAMP BETWEEN DT.thoigianbatdau AND DT.thoigianketthuc`;
      case '2': // Đã đóng
        return Prisma.sql`AND CURRENT_TIMESTAMP > DT.thoigianketthuc`;
      default:
        return Prisma.empty;
    }
  }

  /** Các điều kiện lọc chung (môn / nhóm / từ khoá) cho list & count. */
  private buildFilters(args: IExamPaginationArgs): Prisma.Sql {
    const conds: Prisma.Sql[] = [];
    const input = (args.input ?? args.content ?? '').trim();
    if (input) {
      const like = `%${input}%`;
      conds.push(
        Prisma.sql`AND (DT.tende ILIKE ${like} OR MH.tenmonhoc ILIKE ${like})`,
      );
    }
    if (args.subject != null && args.subject !== '') {
      conds.push(Prisma.sql`AND DT.monthi = ${String(args.subject)}`);
    }
    if (args.group != null && args.group !== '') {
      conds.push(Prisma.sql`AND GDT.manhom = ${Number(args.group)}`);
    }
    return conds.length ? Prisma.join(conds, ' ') : Prisma.empty;
  }

  /**
   * POST /test/pagination — 1 trang danh sách đề thi GV đã tạo.
   * Thay DeThiModel::getQuery("getAllCreatedTest") + base pagination.
   */
  listCreatedTests(
    userId: string,
    args: IExamPaginationArgs,
  ): Promise<ICreatedTestRow[]> {
    const limit = Number(args.limit) || PAGE_SIZE;
    const page = Math.max(Number(args.page) || 1, 1);
    const offset = (page - 1) * limit;
    const state = this.buildStateCond(args.filter);
    const filters = this.buildFilters(args);
    return this.prisma.$queryRaw<ICreatedTestRow[]>(Prisma.sql`
      SELECT DT.made, DT.tende, MH.tenmonhoc,
             DT.thoigianbatdau, DT.thoigianketthuc,
             STRING_AGG(DISTINCT N.tennhom, ', ') AS nhom,
             NH.tennamhoc, HK.tenhocky
      FROM dethi DT
      JOIN giaodethi GDT ON DT.made = GDT.made
      JOIN nhom N ON N.manhom = GDT.manhom
      JOIN monhoc MH ON DT.monthi = MH.mamonhoc
      LEFT JOIN namhoc NH ON N.namhoc = NH.manamhoc
      LEFT JOIN hocky HK ON N.hocky = HK.mahocky
      WHERE DT.nguoitao = ${userId} AND DT.trangthai = 1
      ${state} ${filters}
      GROUP BY DT.made, MH.tenmonhoc, NH.tennamhoc, HK.tenhocky
      ORDER BY DT.made DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
  }

  /** POST /test/getTotalPages — tổng số trang danh sách đề thi. */
  async countCreatedTestPages(
    userId: string,
    args: IExamPaginationArgs,
  ): Promise<{ totalPages: number }> {
    const limit = Number(args.limit) || PAGE_SIZE;
    const state = this.buildStateCond(args.filter);
    const filters = this.buildFilters(args);
    const rows = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*)::int AS total FROM (
        SELECT DT.made
        FROM dethi DT
        JOIN giaodethi GDT ON DT.made = GDT.made
        JOIN nhom N ON N.manhom = GDT.manhom
        JOIN monhoc MH ON DT.monthi = MH.mamonhoc
        WHERE DT.nguoitao = ${userId} AND DT.trangthai = 1
        ${state} ${filters}
        GROUP BY DT.made
      ) AS counted
    `);
    const total = rows[0]?.total ?? 0;
    return { totalPages: Math.ceil(total / limit) };
  }

  /** GET /test/get_subjects — môn được phân công cho GV (dropdown lọc). */
  getAllSubjects(userId: string): Promise<ISubjectOption[]> {
    return this.prisma.$queryRaw<ISubjectOption[]>(Prisma.sql`
      SELECT DISTINCT MH.mamonhoc, MH.tenmonhoc
      FROM monhoc MH
      JOIN phancong PC ON PC.mamonhoc = MH.mamonhoc
      WHERE PC.manguoidung = ${userId} AND PC.trangthai = 1
      ORDER BY MH.tenmonhoc ASC
    `);
  }

  /** GET /test/get_groups — tất cả nhóm còn hiệu lực (dropdown lọc). */
  async getAllGroups(): Promise<IGroupOption[]> {
    const rows = await this.prisma.nhom.findMany({
      where: { NOT: { trangthai: 0 } },
      select: { manhom: true, tennhom: true },
      orderBy: { tennhom: 'asc' },
    });
    return rows;
  }

  /**
   * POST /test/getDetail (và dùng nội bộ cho trang sửa) — chi tiết 1 đề thi
   * kèm danh sách chương (đề tự động) + nhóm được giao. Thay getById().
   */
  async getById(made: number): Promise<IExamDetail | null> {
    const rows = await this.prisma.$queryRaw<
      (Omit<IExamDetail, 'chuong' | 'nhom'> & Record<string, unknown>)[]
    >(Prisma.sql`
      SELECT DT.*, MH.tenmonhoc
      FROM dethi DT
      JOIN monhoc MH ON DT.monthi = MH.mamonhoc
      WHERE DT.made = ${made}
      LIMIT 1
    `);
    const dethi = rows[0];
    if (!dethi) return null;

    const chuongRows = await this.prisma.deThiTuDong.findMany({
      where: { made },
      select: { machuong: true },
    });
    const nhomRows = await this.prisma.giaoDeThi.findMany({
      where: { made },
      select: { manhom: true },
    });

    return {
      ...(dethi as unknown as Omit<IExamDetail, 'chuong' | 'nhom'>),
      chuong: chuongRows.map((r) => r.machuong),
      nhom: nhomRows.map((r) => r.manhom),
    };
  }

  /**
   * POST /test/delete — xoá đề thi. Thay DeThiModel::delete().
   * - Chặn nếu đã có kết quả (thí sinh đã làm).
   * - Dọn thông báo liên quan: như PHP gốc, xoá theo manhom được giao đề
   *   (LƯU Ý: xoá MỌI thông báo gắn các nhóm đó, không chỉ thông báo của đề này
   *   — quirk có sẵn của bản PHP, giữ nguyên hành vi).
   * - Xoá đề; cascade tự xoá chitietdethi/dethitudong/giaodethi.
   */
  async delete(made: number): Promise<IDeleteExamResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const soKetQua = await tx.ketQua.count({ where: { made } });
        if (soKetQua > 0) {
          return {
            success: false,
            message: `Không thể xóa đề thi vì đã có ${soKetQua} thí sinh hoàn thành bài thi.`,
          };
        }

        const nhomRows = await tx.giaoDeThi.findMany({
          where: { made },
          select: { manhom: true },
        });
        const manhomList = [...new Set(nhomRows.map((r) => r.manhom))];

        if (manhomList.length > 0) {
          const tbRows = await tx.chiTietThongBao.findMany({
            where: { manhom: { in: manhomList } },
            select: { matb: true },
          });
          const matbList = [...new Set(tbRows.map((r) => r.matb))];
          if (matbList.length > 0) {
            await tx.trangThaiThongBao.deleteMany({
              where: { matb: { in: matbList } },
            });
          }
          await tx.chiTietThongBao.deleteMany({
            where: { manhom: { in: manhomList } },
          });
          // Xoá thông báo không còn nhóm nào liên kết (cô lập).
          await tx.$executeRaw(Prisma.sql`
            DELETE FROM thongbao
            WHERE matb NOT IN (SELECT matb FROM chitietthongbao)
          `);
        }

        const deleted = await tx.deThi.deleteMany({ where: { made } });
        if (deleted.count === 0) {
          throw new Error('Không tìm thấy đề thi hoặc không thể xóa.');
        }
        return { success: true, message: 'Xóa đề thi thành công!' };
      });
    } catch (e) {
      this.logger.error(`delete(${made}) lỗi: ${(e as Error).message}`);
      return { success: false, message: (e as Error).message };
    }
  }

  // ===================== TẠO / SỬA ĐỀ (slice 2) =====================

  /** Ép về số nguyên (mô phỏng (int) của PHP). */
  private toInt(v: unknown, def = 0): number {
    const n = parseInt(String(v ?? ''), 10);
    return isNaN(n) ? def : n;
  }

  /** Decimal/giá trị bất kỳ → number (Prisma.Decimal an toàn qua toString). */
  private decToNum(v: unknown): number {
    if (v == null) return 0;
    return Number((v as { toString(): string }).toString());
  }

  /** "Y-m-d H:i" (flatpickr) → Date theo giờ máy chủ; rỗng/không hợp lệ → null. */
  private parseDate(s?: string): Date | null {
    const v = (s ?? '').trim();
    if (!v) return null;
    const d = new Date(v.replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }

  /** Parse JSON socau `{ [loai]: {de,tb,kho} }`; rỗng→{}; sai cú pháp→throw. */
  private parseSoCau(raw?: string): ISoCauMap {
    if (!raw) return {};
    try {
      const o = JSON.parse(raw) as unknown;
      return o && typeof o === 'object' && !Array.isArray(o)
        ? (o as ISoCauMap)
        : {};
    } catch {
      throw new Error('Dữ liệu số câu không hợp lệ');
    }
  }

  /** Xáo trộn tại chỗ (Fisher-Yates) — thay shuffle() của PHP. */
  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Đếm câu dùng được theo loại/mức độ — thay CauHoiModel::getsoluongcauhoi. */
  private async countAvailable(
    tx: Prisma.TransactionClient,
    chuong: number[],
    monhoc: string,
    dokho: number,
    type: string,
  ): Promise<number> {
    const chuongCond = chuong.length
      ? Prisma.sql`AND machuong IN (${Prisma.join(chuong)})`
      : Prisma.empty;
    const rows = await tx.$queryRaw<{ cnt: number }[]>(Prisma.sql`
      SELECT COUNT(*)::int AS cnt FROM cauhoi
      WHERE dokho = ${dokho} AND mamonhoc = ${monhoc}
        AND loai = ${type} AND trangthai = 1 ${chuongCond}
    `);
    return rows[0]?.cnt ?? 0;
  }

  /** Random câu mcq/essay — thay CauHoiModel::getQuestions (ORDER BY RANDOM). */
  private async getQuestions(
    tx: Prisma.TransactionClient,
    chuong: number[],
    monhoc: string,
    dokho: number,
    types: string[],
    qty: number,
  ): Promise<number[]> {
    if (!chuong.length || !types.length || qty <= 0) return [];
    const rows = await tx.$queryRaw<{ macauhoi: number }[]>(Prisma.sql`
      SELECT macauhoi FROM cauhoi
      WHERE mamonhoc = ${monhoc} AND dokho = ${dokho}
        AND loai IN (${Prisma.join(types)})
        AND machuong IN (${Prisma.join(chuong)}) AND trangthai = 1
      ORDER BY RANDOM() LIMIT ${qty}
    `);
    return rows.map((r) => r.macauhoi);
  }

  /**
   * Câu đọc hiểu — thay CauHoiModel::getReadingQuestions. PHP duyệt từng đoạn
   * (madv ASC) lấy đủ qty, mỗi đoạn lấy câu macauhoi ASC → tương đương ORDER BY
   * (madv, macauhoi) rồi LIMIT qty.
   */
  private async getReadingQuestions(
    tx: Prisma.TransactionClient,
    chuong: number[],
    monhoc: string,
    dokho: number,
    qty: number,
  ): Promise<number[]> {
    if (!chuong.length || qty <= 0) return [];
    const rows = await tx.$queryRaw<{ macauhoi: number }[]>(Prisma.sql`
      SELECT macauhoi FROM cauhoi
      WHERE mamonhoc = ${monhoc} AND dokho = ${dokho} AND loai = 'reading'
        AND machuong IN (${Prisma.join(chuong)}) AND trangthai = 1
      ORDER BY madv ASC, macauhoi ASC LIMIT ${qty}
    `);
    return rows.map((r) => r.macauhoi);
  }

  /**
   * Lấy câu theo socau & nạp vào chitietdethi — thay addQuestionsToAutoTest.
   * Trả mảng macauhoi đã thêm (để gọi sắp xếp/đảo thutu sau).
   */
  private async addQuestionsToAutoTest(
    tx: Prisma.TransactionClient,
    made: number,
    socau: ISoCauMap,
    chuong: number[],
    monhoc: string,
  ): Promise<number[]> {
    const levelMap: Record<string, number> = { de: 1, tb: 2, kho: 3 };
    const added: number[] = [];
    for (const [type, levels] of Object.entries(socau)) {
      for (const lvl of ['de', 'tb', 'kho'] as const) {
        const qty = this.toInt((levels as ISoCauLevels)[lvl]);
        if (qty <= 0) continue;
        const ids =
          type === 'reading'
            ? await this.getReadingQuestions(tx, chuong, monhoc, levelMap[lvl], qty)
            : await this.getQuestions(tx, chuong, monhoc, levelMap[lvl], [type], qty);
        added.push(...ids);
      }
    }
    if (added.length) {
      await tx.chiTietDeThi.createMany({
        data: added.map((macauhoi) => ({ made, macauhoi })),
        skipDuplicates: true,
      });
    }
    return added;
  }

  /** Cập nhật lại thutu theo cờ đảo (shuffle) hoặc tăng dần — dùng cho add/update. */
  private async reorderQuestions(
    tx: Prisma.TransactionClient,
    made: number,
    ids: number[],
    daocauhoi: boolean,
  ): Promise<void> {
    if (!ids.length) return;
    const ordered = daocauhoi
      ? this.shuffle([...ids])
      : [...ids].sort((a, b) => a - b);
    for (let i = 0; i < ordered.length; i++) {
      await tx.chiTietDeThi.update({
        where: { made_macauhoi: { made, macauhoi: ordered[i] } },
        data: { thutu: i + 1 },
      });
    }
  }

  /** Chèn nhóm nhận thông báo + trạng thái cho từng SV — dùng khi tạo đề. */
  private async createNotification(
    tx: Prisma.TransactionClient,
    made: number,
    userId: string,
    tende: string,
    mamonhoc: string,
    nhom: number[],
  ): Promise<void> {
    const mon = await tx.monHoc.findUnique({
      where: { mamonhoc },
      select: { tenmonhoc: true },
    });
    const tenmonhoc = mon?.tenmonhoc ?? 'Không rõ';
    const link = `./test/start/${made}`;
    const content =
      `<span style="text-decoration: underline; color: blue; cursor: pointer;" ` +
      `onclick="window.open('${link}', '_blank')">${tende} – Môn ${tenmonhoc}</span>`;

    const tb = await tx.thongBao.create({
      data: {
        noidung: content,
        thoigiantao: new Date(),
        nguoitao: userId,
        is_auto: 1,
      },
    });

    const uniqNhom = [...new Set(nhom)];
    if (!uniqNhom.length) return;
    await tx.chiTietThongBao.createMany({
      data: uniqNhom.map((manhom) => ({ matb: tb.matb, manhom })),
      skipDuplicates: true,
    });
    const members = await tx.chiTietNhom.findMany({
      where: { manhom: { in: uniqNhom } },
      select: { manguoidung: true },
      distinct: ['manguoidung'],
    });
    const userIds = [...new Set(members.map((m) => m.manguoidung))];
    if (userIds.length) {
      await tx.trangThaiThongBao.createMany({
        data: userIds.map((manguoidung) => ({ matb: tb.matb, manguoidung })),
        skipDuplicates: true,
      });
    }
  }

  /** Chèn giaodethi cho các nhóm hợp lệ (tồn tại & trangthai != 0). */
  private async assignGroups(
    tx: Prisma.TransactionClient,
    made: number,
    nhom: number[],
  ): Promise<void> {
    const uniq = [...new Set(nhom)];
    if (!uniq.length) return;
    const valid = await tx.nhom.findMany({
      where: { manhom: { in: uniq }, NOT: { trangthai: 0 } },
      select: { manhom: true },
    });
    const ids = valid.map((n) => n.manhom);
    if (ids.length) {
      await tx.giaoDeThi.createMany({
        data: ids.map((manhom) => ({ made, manhom })),
        skipDuplicates: true,
      });
    }
  }

  /**
   * POST /test/addTest — tạo đề thi. Thay Test::addTest + DeThiModel::create.
   * Gói toàn bộ (đề + chương + nhóm + câu tự động + thông báo) trong 1
   * $transaction (chặt hơn PHP, vốn không bọc transaction).
   */
  async createTest(userId: string, dto: CreateTestDto): Promise<ICreateTestResult> {
    try {
      const mamonhoc = (dto.mamonhoc ?? '').trim();
      const tende = (dto.tende ?? '').trim();
      const thoigianthi = this.toInt(dto.thoigianthi);
      const loaide = this.toInt(dto.loaide);
      const chuong = dto.chuong ?? [];
      const nhom = dto.manhom ?? [];
      const socau = this.parseSoCau(dto.socau);

      if (!mamonhoc) throw new Error('Môn học không hợp lệ.');
      if (!tende) throw new Error('Tên đề không hợp lệ.');
      if (thoigianthi <= 0) throw new Error('Thời gian thi không hợp lệ.');

      const thoigianbatdau = this.parseDate(dto.thoigianbatdau);
      const thoigianketthuc = this.parseDate(dto.thoigianketthuc);

      const xembailam = this.toInt(dto.xembailam);
      const xemdiem = this.toInt(dto.xemdiem);
      const xemdapan = this.toInt(dto.xemdapan);
      const daocauhoi = this.toInt(dto.daocauhoi);
      const daodapan = this.toInt(dto.daodapan);
      const tudongnop = this.toInt(dto.tudongnop);
      const diem_tracnghiem = Number(dto.diem_tracnghiem) || 0;
      const diem_tuluan = Number(dto.diem_tuluan) || 0;
      const diem_dochieu = Number(dto.diem_dochieu) || 0;

      const g = (t: string, l: 'de' | 'tb' | 'kho') => this.toInt(socau[t]?.[l]);

      return await this.prisma.$transaction(async (tx) => {
        // Đủ câu theo loại & mức độ (chỉ đề tự động).
        if (loaide === 1 && Object.keys(socau).length) {
          for (const [type, levels] of Object.entries(socau)) {
            for (const [key, levelNum] of [
              ['de', 1],
              ['tb', 2],
              ['kho', 3],
            ] as const) {
              const qty = this.toInt((levels as ISoCauLevels)[key]);
              if (qty <= 0) continue;
              const available = await this.countAvailable(
                tx,
                chuong,
                mamonhoc,
                levelNum,
                type,
              );
              if (available < qty) {
                throw new Error(
                  `Không đủ câu hỏi loại ${type} mức độ ${key}: Có ${available}, yêu cầu ${qty}.`,
                );
              }
            }
          }
        }

        const created = await tx.deThi.create({
          data: {
            monthi: mamonhoc,
            nguoitao: userId,
            tende,
            thoigianthi,
            thoigianbatdau,
            thoigianketthuc,
            hienthibailam: xembailam,
            xemdiemthi: xemdiem,
            xemdapan,
            troncauhoi: daocauhoi,
            trondapan: daodapan,
            nopbaichuyentab: tudongnop,
            loaide,
            mcq_de: g('mcq', 'de'),
            mcq_tb: g('mcq', 'tb'),
            mcq_kho: g('mcq', 'kho'),
            essay_de: g('essay', 'de'),
            essay_tb: g('essay', 'tb'),
            essay_kho: g('essay', 'kho'),
            reading_de: g('reading', 'de'),
            reading_tb: g('reading', 'tb'),
            reading_kho: g('reading', 'kho'),
            diem_tracnghiem,
            diem_tuluan,
            diem_dochieu,
            trangthai: 1,
          },
        });
        const made = created.made;

        const uniqChuong = [...new Set(chuong)];
        if (uniqChuong.length) {
          await tx.deThiTuDong.createMany({
            data: uniqChuong.map((machuong) => ({ made, machuong })),
            skipDuplicates: true,
          });
        }
        await this.assignGroups(tx, made, nhom);

        if (loaide === 1 && Object.keys(socau).length) {
          const added = await this.addQuestionsToAutoTest(
            tx,
            made,
            socau,
            chuong,
            mamonhoc,
          );
          await this.reorderQuestions(tx, made, added, daocauhoi === 1);
        }

        await this.createNotification(tx, made, userId, tende, mamonhoc, nhom);
        return { success: true, made };
      });
    } catch (e) {
      this.logger.error(`createTest lỗi: ${(e as Error).message}`);
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * POST /test/updateTest — cập nhật đề thi. Thay Test::updateTest +
   * DeThiModel::update. Nếu đã có thí sinh làm → chặn đổi số câu/điểm. Đề tự động
   * chưa ai làm → random lại danh sách câu. Luôn cập nhật lại thutu theo cờ đảo.
   */
  async updateTest(userId: string, dto: UpdateTestDto): Promise<ICreateTestResult> {
    try {
      const made = this.toInt(dto.made);
      if (made <= 0) throw new Error('Mã đề không hợp lệ.');

      const monthi = (dto.mamonhoc ?? '').trim();
      const tende = (dto.tende ?? '').trim();
      const thoigianthi = this.toInt(dto.thoigianthi);
      if (!tende) throw new Error('Tên đề không hợp lệ.');
      if (thoigianthi <= 0) throw new Error('Thời gian thi không hợp lệ.');

      const thoigianbatdau = this.parseDate(dto.thoigianbatdau);
      const thoigianketthuc = this.parseDate(dto.thoigianketthuc);
      const xembailam = this.toInt(dto.xembailam);
      const xemdiem = this.toInt(dto.xemdiem);
      const xemdapan = this.toInt(dto.xemdapan);
      const daocauhoi = this.toInt(dto.daocauhoi);
      const daodapan = this.toInt(dto.daodapan);
      const tudongnop = this.toInt(dto.tudongnop);
      const loaide = this.toInt(dto.loaide);
      const chuong = dto.chuong ?? [];
      const nhom = dto.manhom ?? [];
      const socau = this.parseSoCau(dto.socau);

      const diem_tracnghiem = Number(dto.diem_tracnghiem) || 0;
      const diem_tuluan = Number(dto.diem_tuluan) || 0;
      const diem_dochieu = Number(dto.diem_dochieu) || 0;
      const g = (t: string, l: 'de' | 'tb' | 'kho') => this.toInt(socau[t]?.[l]);

      return await this.prisma.$transaction(async (tx) => {
        const hasResult = (await tx.ketQua.count({ where: { made } })) > 0;
        const old = await tx.deThi.findUnique({
          where: { made },
          select: {
            mcq_de: true,
            mcq_tb: true,
            mcq_kho: true,
            essay_de: true,
            essay_tb: true,
            essay_kho: true,
            reading_de: true,
            reading_tb: true,
            reading_kho: true,
            diem_tracnghiem: true,
            diem_tuluan: true,
            diem_dochieu: true,
          },
        });
        if (!old) throw new Error('Không tìm thấy đề thi.');

        if (hasResult) {
          const sameCounts =
            g('mcq', 'de') === (old.mcq_de ?? 0) &&
            g('mcq', 'tb') === (old.mcq_tb ?? 0) &&
            g('mcq', 'kho') === (old.mcq_kho ?? 0) &&
            g('essay', 'de') === (old.essay_de ?? 0) &&
            g('essay', 'tb') === (old.essay_tb ?? 0) &&
            g('essay', 'kho') === (old.essay_kho ?? 0) &&
            g('reading', 'de') === (old.reading_de ?? 0) &&
            g('reading', 'tb') === (old.reading_tb ?? 0) &&
            g('reading', 'kho') === (old.reading_kho ?? 0);
          if (!sameCounts) {
            return {
              success: false,
              error: 'Đề đã có thí sinh làm, không được thay đổi số lượng câu hỏi!',
            };
          }
          const sameScore =
            diem_tracnghiem === this.decToNum(old.diem_tracnghiem) &&
            diem_tuluan === this.decToNum(old.diem_tuluan) &&
            diem_dochieu === this.decToNum(old.diem_dochieu);
          if (!sameScore) {
            return {
              success: false,
              error: 'Đề đã có thí sinh làm, không được thay đổi điểm!',
            };
          }
        }

        await tx.deThi.update({
          where: { made },
          data: {
            monthi,
            nguoitao: userId,
            tende,
            thoigianthi,
            thoigianbatdau,
            thoigianketthuc,
            hienthibailam: xembailam,
            xemdiemthi: xemdiem,
            xemdapan,
            troncauhoi: daocauhoi,
            trondapan: daodapan,
            nopbaichuyentab: tudongnop,
            loaide,
            mcq_de: g('mcq', 'de'),
            mcq_tb: g('mcq', 'tb'),
            mcq_kho: g('mcq', 'kho'),
            essay_de: g('essay', 'de'),
            essay_tb: g('essay', 'tb'),
            essay_kho: g('essay', 'kho'),
            reading_de: g('reading', 'de'),
            reading_tb: g('reading', 'tb'),
            reading_kho: g('reading', 'kho'),
            diem_tracnghiem,
            diem_tuluan,
            diem_dochieu,
          },
        });

        // Cập nhật chương (đề tự động) + nhóm được giao.
        await tx.deThiTuDong.deleteMany({ where: { made } });
        const uniqChuong = [...new Set(chuong)];
        if (uniqChuong.length) {
          await tx.deThiTuDong.createMany({
            data: uniqChuong.map((machuong) => ({ made, machuong })),
            skipDuplicates: true,
          });
        }
        await tx.giaoDeThi.deleteMany({ where: { made } });
        await this.assignGroups(tx, made, nhom);

        // Đề tự động & chưa ai làm → tạo lại danh sách câu hỏi.
        if (loaide === 1 && !hasResult) {
          await tx.chiTietDeThi.deleteMany({ where: { made } });
          await this.addQuestionsToAutoTest(tx, made, socau, chuong, monthi);
        }

        // Sắp xếp lại thutu theo cờ đảo trên danh sách câu hiện tại.
        const qs = await tx.chiTietDeThi.findMany({
          where: { made },
          orderBy: { thutu: 'asc' },
          select: { macauhoi: true },
        });
        await this.reorderQuestions(
          tx,
          made,
          qs.map((q) => q.macauhoi),
          daocauhoi === 1,
        );

        return { success: true, made };
      });
    } catch (e) {
      this.logger.error(`updateTest lỗi: ${(e as Error).message}`);
      return { success: false, error: (e as Error).message };
    }
  }
}
