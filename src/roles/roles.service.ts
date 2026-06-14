import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { IRolePermissionInput } from '@/roles/interfaces/roles.types';
import type {
  IRoleDetail,
  IRoleListItem,
  IRoleUser,
} from '@/roles/interfaces/roles.types';

/**
 * Nghiệp vụ phân quyền hệ thi — thay NhomQuyenModel của PHP (mvc/models).
 * Trả boolean cho create/update/delete để khớp JS gốc (`if (response) ...`),
 * thay vì bọc {statusCode,...} — controller dùng @SkipTransform. Xem docs/09.
 */
@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách nhóm quyền + số người dùng — thay getAllSl(). */
  async getAllSl(): Promise<IRoleListItem[]> {
    const rows = await this.prisma.nhomQuyen.findMany({
      where: { trangthai: true },
      orderBy: { manhomquyen: 'asc' },
      select: {
        manhomquyen: true,
        tennhomquyen: true,
        _count: { select: { nguoiDung: true } },
      },
    });
    return rows.map((r) => ({
      manhomquyen: r.manhomquyen,
      tennhomquyen: r.tennhomquyen,
      soluong: r._count.nguoiDung,
    }));
  }

  /** Danh sách nhóm quyền (dùng cho dropdown bên user) — thay getAll(). */
  getAll() {
    return this.prisma.nhomQuyen.findMany({
      where: { trangthai: true },
      orderBy: { manhomquyen: 'asc' },
      select: { manhomquyen: true, tennhomquyen: true, trangthai: true },
    });
  }

  /** Chi tiết 1 nhóm quyền (tên + các quyền) — thay getById(). */
  async getById(manhomquyen: number): Promise<IRoleDetail> {
    const role = await this.prisma.nhomQuyen.findUnique({
      where: { manhomquyen },
      select: {
        tennhomquyen: true,
        chiTietQuyen: { select: { chucnang: true, hanhdong: true } },
      },
    });
    if (!role) return { name: null, detail: [] };
    return { name: role.tennhomquyen, detail: role.chiTietQuyen };
  }

  /** Người dùng thuộc nhóm quyền — thay NguoiDungModel::getByRole(). */
  getUsers(manhomquyen: number): Promise<IRoleUser[]> {
    return this.prisma.nguoiDung.findMany({
      where: { manhomquyen },
      orderBy: { id: 'asc' },
      select: { id: true, hoten: true, email: true, trangthai: true },
    });
  }

  /** Tạo nhóm quyền + chi tiết quyền (transaction) — thay create(). */
  async create(
    tennhomquyen: string,
    permissions: IRolePermissionInput[],
  ): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const role = await tx.nhomQuyen.create({ data: { tennhomquyen } });
        await tx.chiTietQuyen.createMany({
          data: permissions.map((p) => ({
            manhomquyen: role.manhomquyen,
            chucnang: p.name,
            hanhdong: p.action,
          })),
          skipDuplicates: true,
        });
      });
      return true;
    } catch (err) {
      this.logger.error('Tạo nhóm quyền thất bại', err as Error);
      return false;
    }
  }

  /** Sửa tên + thay toàn bộ chi tiết quyền (xoá rồi tạo lại) — thay update(). */
  async update(
    manhomquyen: number,
    tennhomquyen: string,
    permissions: IRolePermissionInput[],
  ): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.nhomQuyen.update({
          where: { manhomquyen },
          data: { tennhomquyen },
        });
        await tx.chiTietQuyen.deleteMany({ where: { manhomquyen } });
        await tx.chiTietQuyen.createMany({
          data: permissions.map((p) => ({
            manhomquyen,
            chucnang: p.name,
            hanhdong: p.action,
          })),
          skipDuplicates: true,
        });
      });
      return true;
    } catch (err) {
      this.logger.error('Cập nhật nhóm quyền thất bại', err as Error);
      return false;
    }
  }

  /** Xoá mềm (trangthai = false) — thay delete(). */
  async delete(manhomquyen: number): Promise<boolean> {
    try {
      await this.prisma.nhomQuyen.update({
        where: { manhomquyen },
        data: { trangthai: false },
      });
      return true;
    } catch (err) {
      this.logger.error('Xoá nhóm quyền thất bại', err as Error);
      return false;
    }
  }
}
