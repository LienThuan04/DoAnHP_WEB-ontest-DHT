import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type {
  IGroupItem,
  ISubjectGroups,
} from '@/class-modules/interfaces/class-modules.types';

interface IFlatGroupRow {
  mamonhoc: string;
  tenmonhoc: string;
  manamhoc: number;
  tennamhoc: string;
  mahocky: number;
  tenhocky: string;
  sohocky: number;
  manhom: number;
  tennhom: string;
  ghichu: string | null;
  siso: number | null;
  hienthi: number | null;
}

/**
 * Nghiệp vụ Nhóm học phần — thay NhomModel.php (phần đang cần cho tạo/sửa đề).
 * Chỉ port `getBySubject` (cấp dữ liệu dropdown nhóm cho action_test.js). UI quản
 * lý nhóm đầy đủ (assignment/class_detail/client_group) sẽ làm ở Phase 5.
 */
@Injectable()
export class ClassModulesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /module/loadData — nhóm GV đang dạy, gom theo môn + năm học + học kỳ.
   * Thay NhomModel::getBySubject($nguoitao, $hienthi).
   * LƯU Ý: trong PHP biến `$hienthi` được tính nhưng KHÔNG nối vào câu SQL (dead
   * code) → thực tế trả mọi nhóm trangthai=1 bất kể hienthi. Giữ nguyên hành vi:
   * tham số `hienthi` được nhận nhưng không lọc.
   */
  async getBySubject(userId: string): Promise<ISubjectGroups[]> {
    const rows = await this.prisma.$queryRaw<IFlatGroupRow[]>(Prisma.sql`
      SELECT MH.mamonhoc, MH.tenmonhoc,
             NH.manamhoc, NH.tennamhoc,
             HK.mahocky, HK.tenhocky, HK.sohocky,
             N.manhom, N.tennhom, N.ghichu, N.siso, N.hienthi
      FROM nhom N
      JOIN monhoc MH ON N.mamonhoc = MH.mamonhoc
      JOIN hocky HK ON N.hocky = HK.mahocky
      JOIN namhoc NH ON HK.manamhoc = NH.manamhoc
      WHERE N.giangvien = ${userId} AND N.trangthai = 1
    `);

    const grouped: ISubjectGroups[] = [];
    for (const r of rows) {
      const detail: IGroupItem = {
        manhom: r.manhom,
        tennhom: r.tennhom,
        ghichu: r.ghichu,
        siso: r.siso,
        hienthi: r.hienthi,
      };
      const found = grouped.find(
        (g) =>
          g.mamonhoc === r.mamonhoc &&
          g.manamhoc === r.manamhoc &&
          g.mahocky === r.mahocky,
      );
      if (found) {
        found.nhom.push(detail);
      } else {
        grouped.push({
          mamonhoc: r.mamonhoc,
          tenmonhoc: r.tenmonhoc,
          manamhoc: r.manamhoc,
          tennamhoc: r.tennamhoc,
          mahocky: r.mahocky,
          tenhocky: r.tenhocky,
          sohocky: r.sohocky,
          nhom: [detail],
        });
      }
    }
    return grouped;
  }
}
