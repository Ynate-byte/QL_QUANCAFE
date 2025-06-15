using System.Collections.Generic;

namespace DA_QLCafe.API.Models
{
    public class LoaiBanVoiBanDto
    {
        public int MaLoaiBan { get; set; }
        public string TenLoaiBan { get; set; } = string.Empty;
        public List<Ban> DanhSachBan { get; set; } = new List<Ban>();
    }
}
