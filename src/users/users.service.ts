import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { generatePasswordHash } from '@/lib/bcrypt/bcrypt';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import type {
  IPaginationArgs,
  IUserRow,
} from '@/users/interfaces/users.types';

/**
 * Nghiệp vụ quản lý người dùng hệ thi — thay NguoiDungModel (phần user.php).
 * Phân trang phía server giữ đúng giao thức pagination.js (getTotalPages +
 * pagination). Xem user.php + getQuery() gốc.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Nhóm quyền đang hoạt động — cho dropdown lọc + select2 (getAllRoles). */
  getAllRoles() {
    return this.prisma.nhomQuyen.findMany({
      where: { trangthai: true },
      orderBy: { manhomquyen: 'asc' },
      select: { manhomquyen: true, tennhomquyen: true },
    });
  }

  /** Điều kiện lọc giống getQuery() gốc: bỏ admin (3) + chỉ user còn hoạt động. */
  private buildWhere(args: IPaginationArgs): Prisma.NguoiDungWhereInput {
    const where: Prisma.NguoiDungWhereInput = { trangthai: 1 };
    const role = args.filter?.role ? Number(args.filter.role) : 0;
    if (role) where.manhomquyen = role;
    else where.manhomquyen = { not: 3 };

    const input = (args.input ?? args.content ?? '').trim();
    if (input) {
      where.OR = [
        { hoten: { contains: input, mode: 'insensitive' } },
        { id: { contains: input, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  /** POST /user/getTotalPages — tổng số trang theo filter. */
  async getTotalPages(args: IPaginationArgs): Promise<{ totalPages: number }> {
    const limit = Number(args.limit) || 10;
    const total = await this.prisma.nguoiDung.count({
      where: this.buildWhere(args),
    });
    return { totalPages: Math.ceil(total / limit) || 0 };
  }

  /** POST /user/pagination — 1 trang dữ liệu (đã JOIN tennhomquyen). */
  async paginate(args: IPaginationArgs): Promise<IUserRow[]> {
    const limit = Number(args.limit) || 10;
    const page = Number(args.page) || 1;
    const rows = await this.prisma.nguoiDung.findMany({
      where: this.buildWhere(args),
      orderBy: { id: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { nhomQuyen: { select: { tennhomquyen: true } } },
    });
    const fmt = (d: Date | null) =>
      d ? d.toISOString().slice(0, 10) : '';
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      hoten: u.hoten,
      avatar: u.avatar,
      gioitinh: u.gioitinh ? 1 : 0,
      ngaysinh: fmt(u.ngaysinh),
      ngaythamgia: fmt(u.ngaythamgia),
      trangthai: u.trangthai,
      manhomquyen: u.manhomquyen,
      tennhomquyen: u.nhomQuyen?.tennhomquyen ?? null,
    }));
  }

  /** Kiểm tra trùng id HOẶC email — thay checkUser() (trả mảng bản ghi khớp). */
  checkUser(mssv?: string, email?: string) {
    const or: Prisma.NguoiDungWhereInput[] = [];
    if (mssv) or.push({ id: mssv });
    if (email) or.push({ email });
    if (or.length === 0) return Promise.resolve([]);
    return this.prisma.nguoiDung.findMany({
      where: { OR: or },
      select: { id: true, email: true, hoten: true },
    });
  }

  /** Chi tiết 1 người dùng — thay getById(). */
  getDetail(id: string) {
    return this.prisma.nguoiDung.findUnique({ where: { id } });
  }

  /** Tạo người dùng — thay create(). Như PHP: luôn nhóm 2, trạng thái 1. */
  async create(dto: CreateUserDto): Promise<{ status: string; message: string }> {
    const dupEmail = await this.prisma.nguoiDung.findUnique({
      where: { email: dto.email },
    });
    if (dupEmail) return { status: 'error', message: 'Email đã được sử dụng' };
    const dupId = await this.prisma.nguoiDung.findUnique({
      where: { id: dto.masinhvien },
    });
    if (dupId) return { status: 'error', message: 'Mã sinh viên đã được sử dụng' };

    try {
      const salt = parseInt(
        this.config.get<string>('BCRYPT_SALT_ROUNDS') || '10',
        10,
      );
      await this.prisma.nguoiDung.create({
        data: {
          id: dto.masinhvien,
          email: dto.email,
          hoten: dto.hoten,
          gioitinh: dto.gioitinh != null ? Boolean(dto.gioitinh) : false,
          ngaysinh: new Date(dto.ngaysinh || '2004-01-01'),
          sodienthoai: dto.sodienthoai ? Number(dto.sodienthoai) : null,
          matkhau: await generatePasswordHash(dto.password, salt),
          trangthai: 1,
          manhomquyen: 2,
        },
      });
      return { status: 'success', message: 'Thêm người dùng thành công' };
    } catch (err) {
      this.logger.error('Thêm người dùng thất bại', err as Error);
      return { status: 'error', message: 'Thêm người dùng thất bại' };
    }
  }

  /** Cập nhật người dùng — thay update(). password trống = giữ nguyên. */
  async update(dto: UpdateUserDto): Promise<{ status: string; message: string }> {
    const existing = await this.prisma.nguoiDung.findUnique({
      where: { email: dto.email },
    });
    if (existing && existing.id !== dto.id)
      return { status: 'error', message: 'Email đã được sử dụng' };

    try {
      const data: Prisma.NguoiDungUpdateInput = {
        email: dto.email,
        hoten: dto.hoten,
        gioitinh: dto.gioitinh != null ? Boolean(dto.gioitinh) : false,
        ngaysinh: new Date(dto.ngaysinh || '2004-01-01'),
        sodienthoai: dto.sodienthoai ? Number(dto.sodienthoai) : null,
        trangthai: dto.status != null ? Number(dto.status) : 1,
      };
      if (dto.role != null)
        data.nhomQuyen = { connect: { manhomquyen: Number(dto.role) } };
      if (dto.password) {
        const salt = parseInt(
          this.config.get<string>('BCRYPT_SALT_ROUNDS') || '10',
          10,
        );
        data.matkhau = await generatePasswordHash(dto.password, salt);
      }
      await this.prisma.nguoiDung.update({ where: { id: dto.id }, data });
      return { status: 'success', message: 'Cập nhật người dùng thành công' };
    } catch (err) {
      this.logger.error('Cập nhật người dùng thất bại', err as Error);
      return { status: 'error', message: 'Cập nhật người dùng thất bại' };
    }
  }

  /** Xoá mềm (trangthai=0) — thay delete(). */
  async delete(id: string): Promise<{ status: string; message: string }> {
    try {
      await this.prisma.nguoiDung.update({
        where: { id },
        data: { trangthai: 0 },
      });
      return { status: 'success', message: 'Xóa người dùng thành công' };
    } catch (err) {
      this.logger.error('Xoá người dùng thất bại', err as Error);
      return { status: 'error', message: 'Xóa người dùng thất bại' };
    }
  }

  /** Khoá/mở khoá — thay setStatus(). Dùng bởi modal "Thành viên" trang phân quyền. */
  async setStatus(id: string, status: number): Promise<boolean> {
    try {
      await this.prisma.nguoiDung.update({
        where: { id },
        data: { trangthai: status ? 1 : 0 },
      });
      return true;
    } catch (err) {
      this.logger.error('Đổi trạng thái thất bại', err as Error);
      return false;
    }
  }
}
