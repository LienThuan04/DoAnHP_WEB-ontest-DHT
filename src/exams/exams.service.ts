import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  ICreatedTestRow,
  IDeleteExamResult,
  IExamDetail,
  IExamPaginationArgs,
  IGroupOption,
  ISubjectOption,
} from '@/exams/interfaces/exams.types';

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
}
