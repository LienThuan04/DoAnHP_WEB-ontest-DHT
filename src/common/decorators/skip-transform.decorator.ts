import { SetMetadata } from '@nestjs/common';

/**
 * Đánh dấu route trả HTML (SSR/@Render) hoặc redirect để TransformInterceptor
 * KHÔNG bọc response thành { statusCode, message, data }.
 * Route @Render đã được tự nhận diện; decorator này cho các trường hợp còn lại
 * (vd res.redirect, res.render thủ công). Xem docs/07.
 */
export const SKIP_TRANSFORM_KEY = 'skipTransform';
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
