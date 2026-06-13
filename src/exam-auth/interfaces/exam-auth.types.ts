/**
 * JWT payload cho hệ thi — thay $_SESSION của PHP (user_id, user_role...).
 * manhomquyen dùng cho PermissionsGuard tra bảng chitietquyen. Xem docs/06.
 */
export interface IExamJwtPayload {
  id: string; // nguoidung.id
  email: string;
  hoten: string;
  manhomquyen: number; // nhomquyen.manhomquyen
  roleName: string; // nhomquyen.tennhomquyen
}

export interface IExamLoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    hoten: string;
    manhomquyen: number;
    roleName: string;
    avatar: string | null;
  };
}
