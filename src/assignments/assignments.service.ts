import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  IAddAssignmentResult,
  IAssignmentPaginationArgs,
  IAssignmentRow,
  IGiangVienRow,
} from '@/assignments/interfaces/assignment.types';

/**
 * Nghiệp vụ Phân công giảng dạy — thay PhanCongModel.php.
 * Bảng `phancong` (PK ghép mamonhoc+manguoidung+namhoc+hocky); xoá mềm trangthai=0.
 * Đây là mảnh MỞ KHOÁ dữ liệu thật: trang câu hỏi + tạo nhóm lọc môn/năm/kỳ qua đây.
 */
@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /assignment/getGiangVien — giảng viên đủ điều kiện phân công.
   * Thay getGiangVien: nguoidung có vai trò chứa quyền giảng dạy (cauhoi/monhoc/
   * hocphan/chuong) và manhomquyen != 3 (không phải admin quản trị phân công).
   */
  getGiangVien(): Promise<IGiangVienRow[]> {
    return this.prisma.$queryRaw<IGiangVienRow[]>(Prisma.sql`
      SELECT ng.id, ng.manhomquyen, ng.hoten
      FROM nguoidung ng
      WHERE EXISTS (
        SELECT 1 FROM chitietquyen ctq
        WHERE ctq.manhomquyen = ng.manhomquyen
          AND ctq.chucnang IN ('cauhoi', 'monhoc', 'hocphan', 'chuong')
      )
      AND ng.manhomquyen != 3
      GROUP BY ng.id, ng.manhomquyen, ng.hoten
    `);
  }

  /** GET /assignment/getMonHoc — tất cả môn học (thay getMonHoc SELECT *). */
  getMonHoc() {
    return this.prisma.monHoc.findMany();
  }

  /** GET /assignment/getNamHoc — năm học (mới nhất trước). */
  getNamHoc() {
    return this.prisma.namHoc.findMany({
      select: { manamhoc: true, tennamhoc: true },
      orderBy: { tennamhoc: 'desc' },
    });
  }

  /** POST /assignment/getHocKy — học kỳ của 1 năm học. */
  getHocKy(manamhoc: number) {
    return this.prisma.hocKy.findMany({
      where: { manamhoc },
      select: { mahocky: true, tenhocky: true },
    });
  }

  /** Kiểm tra phân công đã tồn tại (trangthai=1). Thay isAssignmentExist. */
  private async isAssignmentExist(
    giangvien: string,
    mamonhoc: string,
    namhoc: number,
    hocky: number,
  ): Promise<boolean> {
    const count = await this.prisma.phanCong.count({
      where: { manguoidung: giangvien, mamonhoc, namhoc, hocky, trangthai: 1 },
    });
    return count > 0;
  }

  /** POST /assignment/checkDuplicate — trả danh sách môn bị trùng phân công. */
  async checkDuplicate(
    giangvien: string,
    listSubject: string[],
    namhoc: number,
    hocky: number,
  ): Promise<{ duplicates: string[] }> {
    const duplicates: string[] = [];
    for (const mh of listSubject) {
      if (await this.isAssignmentExist(giangvien, mh, namhoc, hocky)) {
        duplicates.push(mh);
      }
    }
    return { duplicates };
  }

  /** POST /assignment/checkDuplicateForUpdate — kiểm 1 môn khi đổi giảng viên. */
  async checkDuplicateForUpdate(
    giangvien: string,
    oldMamonhoc: string,
    namhoc: number,
    hocky: number,
  ): Promise<{ duplicates: string[] }> {
    const duplicates: string[] = [];
    if (await this.isAssignmentExist(giangvien, oldMamonhoc, namhoc, hocky)) {
      duplicates.push(oldMamonhoc);
    }
    return { duplicates };
  }

  /**
   * POST /assignment/addAssignment — phân công nhiều môn cho 1 GV.
   * Thay addAssignment: bỏ qua môn đã trùng (ghi vào errors), insert phần còn lại.
   */
  async addAssignment(
    giangvien: string,
    listSubject: string[],
    namhoc: number,
    hocky: number,
  ): Promise<IAddAssignmentResult> {
    let success = true;
    const added: string[] = [];
    const errors: Record<string, string> = {};

    for (const mamonhoc of listSubject) {
      if (await this.isAssignmentExist(giangvien, mamonhoc, namhoc, hocky)) {
        errors[mamonhoc] = 'Đã tồn tại phân công';
        continue;
      }
      try {
        await this.prisma.phanCong.create({
          data: { mamonhoc, manguoidung: giangvien, namhoc, hocky },
        });
        added.push(mamonhoc);
      } catch (e) {
        errors[mamonhoc] = 'Execute failed: ' + (e as Error).message;
        success = false;
      }
    }

    return {
      success: success && added.length > 0,
      added,
      message:
        added.length > 0
          ? `Thêm thành công ${added.length} môn!`
          : 'Không có môn nào được thêm!',
      errors,
    };
  }

  /**
   * POST /assignment/update — đổi giảng viên của 1 phân công.
   * Đã kiểm trùng ở controller trước khi gọi. updateMany theo PK ghép cũ.
   */
  async update(
    oldMamonhoc: string,
    oldManguoidung: string,
    oldNamhoc: number,
    oldHocky: number,
    newManguoidung: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.prisma.phanCong.updateMany({
        where: {
          mamonhoc: oldMamonhoc,
          manguoidung: oldManguoidung,
          namhoc: oldNamhoc,
          hocky: oldHocky,
        },
        data: { manguoidung: newManguoidung },
      });
      if (res.count === 0) {
        return {
          success: false,
          message: 'Học phần này đã được phân công cho giảng viên này!!',
        };
      }
      return { success: true, message: 'Cập nhật phân công thành công!' };
    } catch {
      return {
        success: false,
        message: 'Học phần này đã được phân công cho giảng viên này!!',
      };
    }
  }

  /**
   * POST /assignment/delete — xoá mềm phân công (trangthai=0). Thay delete.
   * namhoc/hocky optional để thu hẹp đúng 1 bản ghi (như PHP bind động).
   */
  async delete(
    mamon: string,
    id: string,
    namhoc?: number,
    hocky?: number,
  ): Promise<boolean> {
    try {
      await this.prisma.phanCong.updateMany({
        where: {
          mamonhoc: mamon,
          manguoidung: id,
          ...(namhoc != null ? { namhoc } : {}),
          ...(hocky != null ? { hocky } : {}),
        },
        data: { trangthai: 0 },
      });
      return true;
    } catch {
      return false;
    }
  }

  // ── Phân trang (pagination.js, model=PhanCongModel) ─────────────────────────

  /** WHERE cho danh sách phân công chính (thay getQuery nhánh mặc định). */
  private buildAssignmentWhere(args: IAssignmentPaginationArgs): Prisma.Sql {
    const input = (args.input ?? args.content ?? '').trim();
    const conds: Prisma.Sql[] = [Prisma.sql`1 = 1`];
    if (args.filter?.namhoc) {
      conds.push(Prisma.sql`pc.namhoc = ${Number(args.filter.namhoc)}`);
    }
    if (args.filter?.hocky) {
      conds.push(Prisma.sql`pc.hocky = ${Number(args.filter.hocky)}`);
    }
    if (input) {
      const like = `%${input}%`;
      conds.push(
        Prisma.sql`(mh.tenmonhoc ILIKE ${like} OR ng.hoten ILIKE ${like})`,
      );
    }
    // KHÁC PHP: PHP getQuery thiếu WHERE (nối "AND" trực tiếp → lỗi khi có filter);
    // ở đây dùng WHERE 1=1 để filter/search hoạt động đúng như ý đồ.
    return Prisma.sql`WHERE ${Prisma.join(conds, ' AND ')}`;
  }

  /** POST /assignment/getTotalPages (nhánh mặc định) — tổng số trang phân công. */
  async countAssignmentPages(
    args: IAssignmentPaginationArgs,
  ): Promise<{ totalPages: number }> {
    const limit = Number(args.limit) || 10;
    const where = this.buildAssignmentWhere(args);
    const rows = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*)::int AS total FROM (
        SELECT DISTINCT pc.mamonhoc, pc.manguoidung, pc.namhoc, pc.hocky
        FROM phancong pc
        JOIN monhoc mh ON pc.mamonhoc = mh.mamonhoc
        JOIN nguoidung ng ON pc.manguoidung = ng.id
        LEFT JOIN namhoc nh ON pc.namhoc = nh.manamhoc
        LEFT JOIN hocky hk ON pc.hocky = hk.mahocky
        ${where}
      ) t
    `);
    const total = rows[0]?.total ?? 0;
    return { totalPages: Math.ceil(total / limit) || 0 };
  }

  /** POST /assignment/pagination (nhánh mặc định) — 1 trang phân công (mảng). */
  listAssignments(args: IAssignmentPaginationArgs): Promise<IAssignmentRow[]> {
    const limit = Number(args.limit) || 10;
    const page = Number(args.page) || 1;
    const offset = (page - 1) * limit;
    const where = this.buildAssignmentWhere(args);
    return this.prisma.$queryRaw<IAssignmentRow[]>(Prisma.sql`
      SELECT DISTINCT pc.mamonhoc, pc.manguoidung, pc.namhoc, pc.hocky,
             ng.hoten, mh.tenmonhoc, nh.tennamhoc, hk.tenhocky, pc.trangthai
      FROM phancong pc
      JOIN monhoc mh ON pc.mamonhoc = mh.mamonhoc
      JOIN nguoidung ng ON pc.manguoidung = ng.id
      LEFT JOIN namhoc nh ON pc.namhoc = nh.manamhoc
      LEFT JOIN hocky hk ON pc.hocky = hk.mahocky
      ${where}
      ORDER BY pc.namhoc DESC, pc.hocky DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
  }

  /** Điều kiện tìm môn cho modal (thay getQuery nhánh custom.function='monhoc'). */
  private subjectModalWhere(args: IAssignmentPaginationArgs) {
    const input = (args.input ?? args.content ?? '').trim();
    return {
      trangthai: 1,
      ...(input
        ? {
            OR: [
              { tenmonhoc: { contains: input, mode: 'insensitive' as const } },
              { mamonhoc: { contains: input, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
  }

  /** POST /assignment/getTotalPages (custom=monhoc) — tổng số trang môn học. */
  async countSubjectPages(
    args: IAssignmentPaginationArgs,
  ): Promise<{ totalPages: number }> {
    const limit = Number(args.limit) || 10;
    const total = await this.prisma.monHoc.count({
      where: this.subjectModalWhere(args),
    });
    return { totalPages: Math.ceil(total / limit) || 0 };
  }

  /** POST /assignment/pagination (custom=monhoc) — 1 trang môn học (mảng). */
  listSubjectsForModal(args: IAssignmentPaginationArgs) {
    const limit = Number(args.limit) || 10;
    const page = Number(args.page) || 1;
    return this.prisma.monHoc.findMany({
      where: this.subjectModalWhere(args),
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
