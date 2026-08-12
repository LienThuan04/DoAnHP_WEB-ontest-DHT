import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  IAssignedSubjectRow,
  IHocKyOption,
  INamHocOption,
  IViewSubjectPaginationArgs,
} from '@/view-subject/interfaces/view-subject.types';

/**
 * Nghiệp vụ "Môn học của tôi" — thay XemMonHocModel.php.
 *
 * Khác module `subjects` (quản trị toàn bộ bảng monhoc): ở đây giảng viên CHỈ
 * thấy môn được phân công cho chính mình (bảng `phancong`, trangthai = 1) theo
 * năm học/học kỳ, kèm quản lý chương của môn đó.
 *
 * Quy ước port lại:
 *  - userId LUÔN lấy từ JWT, KHÔNG tin `args.id` phía client (như các module trước).
 *  - Giữ nguyên bộ lọc gốc: pc.trangthai = 1 AND mh.trangthai = 1.
 *  - Giữ nguyên thứ tự: tennamhoc DESC, tenhocky ASC, mamonhoc ASC.
 *  - Các method chỉ đọc getAll/getById/search/checkSubject của model gốc KHÔNG
 *    port lại: view_subject.js không gọi, và module `subjects` đã có tương đương
 *    ở `/subject/*`.
 */
@Injectable()
export class ViewSubjectService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /view_subject/getNamHoc — năm học có phân công của GV (dropdown lọc).
   * Thay XemMonHocModel::getNamHoc().
   */
  getNamHoc(userId: string): Promise<INamHocOption[]> {
    return this.prisma.$queryRaw<INamHocOption[]>(Prisma.sql`
      SELECT DISTINCT nh.manamhoc, nh.tennamhoc
      FROM phancong pc
      JOIN namhoc nh ON pc.namhoc = nh.manamhoc
      WHERE pc.manguoidung = ${userId} AND pc.trangthai = 1
      ORDER BY nh.tennamhoc DESC
    `);
  }

  /**
   * POST /view_subject/getHocKy — học kỳ có phân công trong 1 năm học.
   * Thay XemMonHocModel::getHocKy().
   */
  getHocKy(userId: string, manamhoc: number): Promise<IHocKyOption[]> {
    return this.prisma.$queryRaw<IHocKyOption[]>(Prisma.sql`
      SELECT DISTINCT hk.mahocky, hk.tenhocky
      FROM phancong pc
      JOIN hocky hk ON pc.hocky = hk.mahocky
      WHERE pc.manguoidung = ${userId}
        AND pc.namhoc = ${manamhoc}
        AND pc.trangthai = 1
      ORDER BY hk.tenhocky ASC
    `);
  }

  // ── Phân trang (pagination.js, controller=view_subject) ─────────────────────

  /**
   * Điều kiện lọc danh sách môn được phân công — thay getQuery().
   *
   * KHÁC PHP: từ khoá tìm kiếm đọc thêm `filter.input`. Nút kính lúp của
   * view_subject.js đặt từ khoá vào `filter.input`, nhưng getQuery gốc chỉ đọc
   * `$input` (do pagination.js gán ở cấp trên) → bấm nút tìm kiếm KHÔNG có tác
   * dụng ở bản PHP. Ở đây nhận cả hai nơi nên nút hoạt động đúng ý đồ.
   */
  private buildWhere(
    userId: string,
    args: IViewSubjectPaginationArgs,
  ): Prisma.Sql {
    const input = (
      args.input ??
      args.content ??
      args.filter?.input ??
      ''
    ).trim();

    const conds: Prisma.Sql[] = [
      Prisma.sql`pc.trangthai = 1`,
      Prisma.sql`mh.trangthai = 1`,
      Prisma.sql`pc.manguoidung = ${userId}`,
    ];

    if (args.filter?.namhoc !== undefined && args.filter.namhoc !== '') {
      conds.push(Prisma.sql`pc.namhoc = ${Number(args.filter.namhoc)}`);
    }
    if (args.filter?.hocky !== undefined && args.filter.hocky !== '') {
      conds.push(Prisma.sql`pc.hocky = ${Number(args.filter.hocky)}`);
    }
    if (input) {
      const like = `%${input}%`;
      conds.push(
        Prisma.sql`(mh.tenmonhoc ILIKE ${like} OR mh.mamonhoc ILIKE ${like})`,
      );
    }

    return Prisma.sql`WHERE ${Prisma.join(conds, ' AND ')}`;
  }

  /** POST /view_subject/getTotalPages — tổng số trang. */
  async countAssignedSubjectPages(
    userId: string,
    args: IViewSubjectPaginationArgs,
  ): Promise<{ totalPages: number }> {
    const limit = Number(args.limit) || 10;
    const where = this.buildWhere(userId, args);
    const rows = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*)::int AS total FROM (
        SELECT DISTINCT pc.mamonhoc, pc.manguoidung, pc.namhoc, pc.hocky
        FROM phancong pc
        JOIN monhoc mh ON pc.mamonhoc = mh.mamonhoc
        LEFT JOIN namhoc nh ON pc.namhoc = nh.manamhoc
        LEFT JOIN hocky hk ON pc.hocky = hk.mahocky
        ${where}
      ) t
    `);
    const total = rows[0]?.total ?? 0;
    return { totalPages: Math.ceil(total / limit) || 0 };
  }

  /** POST /view_subject/pagination — 1 trang danh sách môn (mảng). */
  listAssignedSubjects(
    userId: string,
    args: IViewSubjectPaginationArgs,
  ): Promise<IAssignedSubjectRow[]> {
    const limit = Number(args.limit) || 10;
    const page = Number(args.page) || 1;
    const offset = (page - 1) * limit;
    const where = this.buildWhere(userId, args);
    return this.prisma.$queryRaw<IAssignedSubjectRow[]>(Prisma.sql`
      SELECT DISTINCT pc.mamonhoc, pc.manguoidung, pc.namhoc, pc.hocky,
             mh.tenmonhoc, mh.sotinchi, mh.sotietlythuyet, mh.sotietthuchanh,
             nh.tennamhoc, hk.tenhocky
      FROM phancong pc
      JOIN monhoc mh ON pc.mamonhoc = mh.mamonhoc
      LEFT JOIN namhoc nh ON pc.namhoc = nh.manamhoc
      LEFT JOIN hocky hk ON pc.hocky = hk.mahocky
      ${where}
      -- Postgres đòi cột trong ORDER BY phải có mặt ở select list của SELECT
      -- DISTINCT → sắp theo pc.mamonhoc (bằng mh.mamonhoc do điều kiện JOIN)
      -- thay vì mh.mamonhoc như SQL gốc (MySQL dễ dãi hơn).
      ORDER BY nh.tennamhoc DESC, hk.tenhocky ASC, pc.mamonhoc ASC
      LIMIT ${limit} OFFSET ${offset}
    `);
  }
}
