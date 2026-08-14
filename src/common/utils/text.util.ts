/**
 * Giá trị bất kỳ (body HTTP, ô Excel, cột Decimal…) → **chuỗi có nghĩa**.
 *
 * Chỉ nhận kiểu nguyên thuỷ + `Date`; object/array trả về chuỗi RỖNG thay vì
 * `'[object Object]'` như `String()` — bản PHP nhận `$_POST` luôn là chuỗi nên
 * gặp object là dữ liệu sai, coi như không có.
 */
export function plainText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return '';
}

/**
 * Thông điệp lỗi an toàn từ `catch (err)` — `err` có kiểu `unknown` nên không
 * đọc thẳng `.message` được.
 */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return plainText(err) || 'Unknown error';
}
