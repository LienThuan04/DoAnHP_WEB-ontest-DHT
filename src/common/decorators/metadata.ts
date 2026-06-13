import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic'; // Define a metadata key to mark public routes to bypass JWT validation for the API.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); // Custom decorator to mark routes as public, allowing access without JWT authentication.

export const IS_ADMIN_ONLY_KEY = 'isAdminOnly';
export const AdminOnly = () => SetMetadata(IS_ADMIN_ONLY_KEY, true);
// Dùng trên method cụ thể để bỏ qua @AdminOnly() ở class level.
// getAllAndOverride ưu tiên handler trước class, nên false ở method sẽ override true ở class.
export const SkipAdminOnly = () => SetMetadata(IS_ADMIN_ONLY_KEY, false);