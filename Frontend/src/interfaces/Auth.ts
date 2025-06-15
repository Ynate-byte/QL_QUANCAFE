export interface LoginRequest {
    email: string;
    matKhau: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
    maNhanVien?: number;
    hoTen?: string;
    vaiTro?: string;
}