import { SetMetadata } from '@nestjs/common';

/**
 * RBAC hệ thi — thay cho AuthCore::checkPermission($chucnang,$hanhdong) của PHP.
 *   resource = danhmucchucnang.chucnang  (vd 'cauhoi', 'dethi', 'monhoc')
 *   action   = chitietquyen.hanhdong     (vd 'view','create','update','delete')
 * Quyền được PermissionsGuard kiểm theo manhomquyen của user (từ JWT). Xem docs/06.
 */
export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  resource: string;
  action: string;
}

export const Permissions = (resource: string, action: string) =>
  SetMetadata<string, RequiredPermission>(PERMISSIONS_KEY, {
    resource,
    action,
  });
