namespace DA_QLCafe.API.Models.BaoCao
{
    public class LoiNhuanSanPhamDto
    {
        public int MaSanPham { get; set; }
        public string TenSP { get; set; } = string.Empty;
        public decimal GiaBanHienTai { get; set; }
        public decimal ChiPhiNguyenLieuUocTinh { get; set; }
        public decimal LoiNhuanGopUocTinhPerUnit { get; set; }
    }
}