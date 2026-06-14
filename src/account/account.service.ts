import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Nghiệp vụ trang cá nhân — thay account.php (mới chỉ port getRole ở Phase 2).
 * Các chức năng khác (đổi mật khẩu, cập nhật hồ sơ...) bổ sung ở phase sau.
 */
@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bản đồ quyền của 1 nhóm: { chucnang: [hanhdong, ...] } — thay
   * NguoiDungModel::getRole() (PHP lưu vào $_SESSION['user_role']).
   * permission.js dùng map này để ẩn/hiện nút theo data-role/data-action.
   */
  async getRoleMap(manhomquyen: number): Promise<Record<string, string[]>> {
    const rows = await this.prisma.chiTietQuyen.findMany({
      where: { manhomquyen },
      select: { chucnang: true, hanhdong: true },
    });
    const map: Record<string, string[]> = {};
    for (const { chucnang, hanhdong } of rows) {
      (map[chucnang] ??= []).push(hanhdong);
    }
    return map;
  }
}
