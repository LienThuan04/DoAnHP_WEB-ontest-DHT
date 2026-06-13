import * as bcrypt from 'bcrypt';

export const generatePasswordHash = async (password: string, saltRounds: number ): Promise<string> => {
    const salt = await bcrypt.genSalt(saltRounds);
    const passAfterHashing = await bcrypt.hash(password, salt);
    return passAfterHashing;
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}
/**
 * Đảm bảo password đã được hash (nếu chưa thì hash, nếu rồi thì giữ nguyên)
 * @param password - Password cần kiểm tra và hash
 * @param saltRounds - Số rounds cho BCrypt (chỉ dùng khi cần hash mới)
 * @returns Password đã được hash
 */
export const ensurePasswordHash = async (password: string, saltRounds: number ): Promise<string> => {
    // Kiểm tra nếu đã là BCrypt hash (bắt đầu bằng $2 và độ dài 60)
    if (password.length === 60 && (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$'))) {
        return password; // Đã là hash, giữ nguyên
    }
    // Chưa được hash, tiến hành hash
    return await generatePasswordHash(password, saltRounds);
}