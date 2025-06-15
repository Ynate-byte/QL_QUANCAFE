using Dapper;
using DA_QLCafe.API.Data;
using DA_QLCafe.API.Models;
using System.Data;
using System.Text.Json;
using System.Threading.Tasks;

namespace DA_QLCafe.API.Services
{
    /// <summary>
    /// Dịch vụ xử lý logic liên quan đến công thức pha chế sản phẩm.
    /// </summary>
    public class CongThucService : ICongThucService
    {
        #region Fields
        private readonly DbContext _context;
        #endregion

        #region Constructor
        /// <summary>
        /// Khởi tạo một phiên bản mới của lớp <see cref="CongThucService"/>.
        /// </summary>
        /// <param name="context">Đối tượng DbContext để truy cập cơ sở dữ liệu.</param>
        public CongThucService(DbContext context) { _context = context; }
        #endregion

        #region Public Methods
        /// <summary>
        /// Lấy công thức pha chế và chi tiết của nó dựa trên mã sản phẩm.
        /// </summary>
        /// <param name="maSanPham">Mã sản phẩm.</param>
        /// <returns>Đối tượng ẩn danh chứa thông tin công thức và chi tiết, hoặc null nếu không tìm thấy.</returns>
        public async Task<object?> GetCongThucBySanPham(int maSanPham)
        {
            var queryCongThuc = "SELECT * FROM CONGTHUCPHACHE WHERE MaSanPham = @MaSanPham";
            using (var connection = _context.CreateConnection())
            {
                var congThuc = await connection.QuerySingleOrDefaultAsync<CongThucPhaChe>(queryCongThuc, new { maSanPham });
                if (congThuc == null)
                {
                    return null;
                }
                var queryChiTiet = "SELECT * FROM CHITIETCONGTHUC WHERE MaCongThuc = @MaCongThuc";
                var chiTiet = await connection.QueryAsync<ChiTietCongThuc>(queryChiTiet, new { MaCongThuc = congThuc.Ma });

                return new { CongThuc = congThuc, ChiTiet = chiTiet };
            }
        }

        /// <summary>
        /// Lưu (thêm mới hoặc cập nhật) một công thức pha chế cùng với các chi tiết của nó.
        /// </summary>
        /// <param name="congThucDto">Đối tượng DTO chứa thông tin công thức và chi tiết.</param>
        /// <returns>Mã của công thức pha chế mới được tạo hoặc cập nhật.</returns>
        public async Task<int> LuuCongThuc(TaoCongThucDto congThucDto)
        {
            var procedureName = "AddOrUpdateCongThucWithDetails";
            var jsonChiTiet = JsonSerializer.Serialize(congThucDto.ChiTietCongThuc);

            var parameters = new DynamicParameters();
            parameters.Add("MaSanPham", congThucDto.MaSanPham, DbType.Int32);
            parameters.Add("TenCongThuc", congThucDto.TenCongThuc, DbType.String);
            parameters.Add("MoTaCongThuc", congThucDto.MoTaCongThuc, DbType.String);
            parameters.Add("JsonChiTietCongThuc", jsonChiTiet, DbType.String);

            using (var connection = _context.CreateConnection())
            {
                var newId = await connection.QuerySingleAsync<int>(procedureName, parameters, commandType: CommandType.StoredProcedure);
                return newId;
            }
        }
        #endregion
    }
}