import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Hậu tố email placeholder do `class-modules` sinh khi GV thêm SV bằng MSSV
 * (schema Postgres bắt email NOT NULL + UNIQUE nên không để trống được như MySQL
 * gốc). Với luồng onboarding, email dạng này coi như "chưa có email" để modal
 * nhắc cập nhật vẫn hiện — KHÁC PHP (PHP chỉ cần email NULL/rỗng).
 */
const PLACEHOLDER_EMAIL_SUFFIX = '@sinhvien.local';

/**
 * Nghiệp vụ trang tổng quan — thay dashboard.php (3 method email onboarding
 * checkEmail/checkEmailExist/updateEmail của NguoiDungModel).
 */
@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Email hiện tại của user — thay NguoiDungModel::checkEmail().
   * Trả CHUỖI (rỗng = chưa có email) vì dashboard.js so `response == ""` để
   * quyết định bật modal onboarding.
   */
  async getEmail(id: string): Promise<string> {
    const row = await this.prisma.nguoiDung.findUnique({
      where: { id },
      select: { email: true },
    });
    const email = row?.email ?? '';
    return email.endsWith(PLACEHOLDER_EMAIL_SUFFIX) ? '' : email;
  }

  /**
   * Email đã có người dùng chưa — thay NguoiDungModel::checkEmailExist().
   * dashboard.js so `check == 0` nên boolean false/true đều khớp.
   */
  async checkEmailExist(email: string): Promise<boolean> {
    const count = await this.prisma.nguoiDung.count({ where: { email } });
    return count > 0;
  }

  /**
   * Cập nhật email — thay NguoiDungModel::updateEmail(). Trả boolean cho
   * `if (response)` của dashboard.js. Bắt P2002 (email trùng do race giữa
   * checkEmailExist và update) → false thay vì ném 500.
   */
  async updateEmail(id: string, email: string): Promise<boolean> {
    try {
      await this.prisma.nguoiDung.update({
        where: { id },
        data: { email },
      });
      return true;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        (e.code === 'P2002' || e.code === 'P2025')
      ) {
        return false;
      }
      throw e;
    }
  }
}
