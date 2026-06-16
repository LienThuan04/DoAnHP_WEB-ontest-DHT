import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  IHocKyRow,
  INamHocPage,
  INamHocResult,
} from '@/academic-years/interfaces/academic-years.types';

/**
 * Nghiệp vụ Năm học & Học kỳ — thay NamHocModel.php của DHT_OneTest.
 *
 * Quy ước port lại từ PHP:
 *  - Thêm năm học sẽ TỰ SINH `sohocky` học kỳ ("Học kỳ 1..n") trong 1 transaction.
 *  - Sửa số học kỳ: nhiều hơn thì thêm, ít hơn thì xoá các kỳ có sohocky > số mới.
 *  - Tên năm học là duy nhất (existsNamHoc) — trả message để JS hiển thị.
 *  - Trả về {success, message?} khớp `res.success`/`res.message` trong namhoc.js
 *    (controller dùng @SkipTransform để không bọc {statusCode,...}).
 */
@Injectable()
export class AcademicYearsService {
  private readonly logger = new Logger(AcademicYearsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Kiểm tra trùng tên năm học (loại trừ chính nó khi sửa) — thay existsNamHoc(). */
  private async existsNamHoc(
    tennamhoc: string,
    excludeId?: number,
  ): Promise<boolean> {
    const found = await this.prisma.namHoc.findFirst({
      where: {
        tennamhoc,
        ...(excludeId ? { manamhoc: { not: excludeId } } : {}),
      },
      select: { manamhoc: true },
    });
    return !!found;
  }

  /**
   * Danh sách năm học + tổng học kỳ, có phân trang + tìm theo tên — thay getNamHoc().
   * Giữ nguyên hành vi PHP: KHÔNG lọc theo trangthai, sắp xếp manamhoc giảm dần.
   */
  async getNamHoc(page = 1, limit = 10, q = ''): Promise<INamHocPage> {
    const where: Prisma.NamHocWhereInput = q
      ? { tennamhoc: { contains: q, mode: 'insensitive' } }
      : {};

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.namHoc.count({ where }),
      this.prisma.namHoc.findMany({
        where,
        orderBy: { manamhoc: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          manamhoc: true,
          tennamhoc: true,
          trangthai: true,
          _count: { select: { hocKy: true } },
        },
      }),
    ]);

    return {
      data: rows.map((r) => ({
        manamhoc: r.manamhoc,
        tennamhoc: r.tennamhoc,
        trangthai: r.trangthai,
        tonghocky: r._count.hocKy,
      })),
      total,
      page,
      limit,
    };
  }

  /** Thêm năm học + tự sinh `sohocky` học kỳ (transaction) — thay addNamHoc(). */
  async addNamHoc(tennamhoc: string, sohocky = 3): Promise<INamHocResult> {
    if (await this.existsNamHoc(tennamhoc)) {
      return { success: false, message: 'Năm học này đã tồn tại!' };
    }
    try {
      await this.prisma.$transaction(async (tx) => {
        const nh = await tx.namHoc.create({
          data: { tennamhoc, trangthai: 1 },
        });
        await tx.hocKy.createMany({
          data: Array.from({ length: sohocky }, (_, i) => ({
            tenhocky: `Học kỳ ${i + 1}`,
            manamhoc: nh.manamhoc,
            sohocky: i + 1,
          })),
        });
      });
      return { success: true };
    } catch (err) {
      this.logger.error('Thêm năm học thất bại', err as Error);
      return { success: false, message: 'Lỗi khi thêm năm học!' };
    }
  }

  /**
   * Cập nhật tên/trạng thái năm học và đồng bộ số học kỳ — thay updateNamHoc().
   * `sohocky` = undefined nghĩa là không đổi số học kỳ (giống $sohocky === null).
   */
  async updateNamHoc(
    manamhoc: number,
    tennamhoc: string,
    trangthai: number,
    sohocky?: number,
  ): Promise<INamHocResult> {
    if (await this.existsNamHoc(tennamhoc, manamhoc)) {
      return { success: false, message: 'Năm học này đã tồn tại!' };
    }
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.namHoc.update({
          where: { manamhoc },
          data: { tennamhoc, trangthai },
        });

        if (sohocky != null) {
          const current = await tx.hocKy.count({ where: { manamhoc } });
          if (sohocky > current) {
            await tx.hocKy.createMany({
              data: Array.from({ length: sohocky - current }, (_, i) => {
                const so = current + i + 1;
                return { tenhocky: `Học kỳ ${so}`, manamhoc, sohocky: so };
              }),
            });
          } else if (sohocky < current) {
            await tx.hocKy.deleteMany({
              where: { manamhoc, sohocky: { gt: sohocky } },
            });
          }
        }
      });
      return { success: true };
    } catch (err) {
      this.logger.error('Cập nhật năm học thất bại', err as Error);
      return { success: false, message: 'Lỗi khi cập nhật năm học!' };
    }
  }

  /** Xoá mềm năm học (trangthai = 0) — thay deleteNamHoc(). */
  async deleteNamHoc(manamhoc: number): Promise<boolean> {
    try {
      await this.prisma.namHoc.update({
        where: { manamhoc },
        data: { trangthai: 0 },
      });
      return true;
    } catch (err) {
      this.logger.error('Xoá năm học thất bại', err as Error);
      return false;
    }
  }

  /** Danh sách học kỳ của 1 năm học, theo thứ tự kỳ — thay getHocKy(). */
  getHocKy(manamhoc: number): Promise<IHocKyRow[]> {
    return this.prisma.hocKy.findMany({
      where: { manamhoc },
      orderBy: { sohocky: 'asc' },
      select: { mahocky: true, tenhocky: true, sohocky: true },
    });
  }
}
