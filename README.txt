Hệ thống Quản lý Quán cà phê
Hướng dẫn cài đặt và chạy dự án
Để thiết lập và chạy dự án trên máy cục bộ của bạn, hãy làm theo các bước dưới đây:

1. Yêu cầu (Prerequisites)
NET SDK 6.0 trở lên: Cần thiết cho phần backend.
Node.js 18.x trở lên: Cần thiết cho phần frontend.
SQL Server: Để chạy cơ sở dữ liệu. Bạn có thể sử dụng SQL Server Express (miễn phí) hoặc phiên bản đầy đủ.
SQL Server Management Studio (SSMS) hoặc công cụ quản lý cơ sở dữ liệu tương tự.
2. Thiết lập Cơ sở dữ liệu
Clone repository:
Bash

git clone [địa chỉ_repo_của_bạn]
cd [tên_thư_mục_dự_án]
Tạo cơ sở dữ liệu:
Mở SSMS và tạo một cơ sở dữ liệu mới (ví dụ: QLCafeDB).
Chạy các script SQL cần thiết mà bạn có trong dự án (thường nằm trong thư mục Database hoặc SQL_Scripts của backend). Đảm bảo chạy đúng thứ tự nếu có phụ thuộc.
Cập nhật chuỗi kết nối (Connection String):
Mở file appsettings.json (và appsettings.Development.json) trong thư mục gốc của dự án backend (DA_QLCafe.API).
Cập nhật ConnectionStrings:DefaultConnection để trỏ tới cơ sở dữ liệu SQL Server của bạn. Ví dụ:
JSON

"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=QLCafeDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
}
Lưu ý: Thay localhost\\SQLEXPRESS bằng tên server SQL của bạn nếu khác.
3. Chạy Backend (API)
Di chuyển vào thư mục backend:
Bash

cd DA_QLCafe.API
Cài đặt các gói NuGet:
Bash

dotnet restore
Chạy ứng dụng backend:
Bash

dotnet run
API sẽ chạy mặc định trên https://localhost:7080 (hoặc một cổng khác hiển thị trên console).
4. Chạy Frontend (React App)
Mở một cửa sổ Terminal/Command Prompt mới.
Di chuyển vào thư mục frontend:
Bash

cd Frontend
Cài đặt các gói npm:
Bash

npm install
Chạy ứng dụng frontend:
Bash

npm run dev
Ứng dụng sẽ chạy mặc định trên http://localhost:5173.
5. Sử dụng ứng dụng
Tru cập ứng dụng: Mở trình duyệt và truy cập http://localhost:5173.
Đăng nhập: Sử dụng tài khoản mẫu hoặc tài khoản bạn đã tạo trong cơ sở dữ liệu để đăng nhập (ví dụ: một tài khoản quản lý hoặc thu ngân).
Tài khoản mẫu:
Email: an.nv@cafe.com
Mật khẩu: 123
Khám phá: Bắt đầu sử dụng các chức năng quản lý bán hàng, kho, nhân sự và xem báo cáo.
Giới thiệu
Đây là một hệ thống quản lý quán cà phê toàn diện, được thiết kế để tối ưu hóa và số hóa các nghiệp vụ hàng ngày của một quán cà phê, từ quy trình bán hàng, quản lý kho, đến nhân sự và các báo cáo tài chính. Hệ thống giúp nâng cao hiệu quả hoạt động, giảm thiểu sai sót và cung cấp cái nhìn tổng quan về tình hình kinh doanh.

Các chức năng chính
Hệ thống cung cấp một loạt các tính năng mạnh mẽ để đáp ứng mọi nhu cầu quản lý:

1. Quản lý bán hàng (POS)
Giao diện trực quan: Dễ dàng chọn bàn, thêm/bớt sản phẩm, cập nhật số lượng.
Quản lý đơn hàng linh hoạt: Tạo, chỉnh sửa trạng thái đơn hàng (đang pha chế, hoàn thành), gán khách hàng, thêm ghi chú.
Kiểm tra tồn kho tức thời: Cảnh báo khi sản phẩm không đủ nguyên liệu.
Gộp/Tách đơn hàng: Hỗ trợ các nghiệp vụ gộp/tách đơn hàng phức tạp.
Thanh toán đa dạng: Hỗ trợ nhiều phương thức thanh toán, áp dụng khuyến mãi và sử dụng điểm thành viên.
In hóa đơn: Xuất hóa đơn chi tiết ngay sau khi thanh toán.
2. Quản lý kho & Nguyên vật liệu
Quản lý nhà cung cấp: Thêm, sửa, xóa thông tin nhà cung cấp.
Quản lý nguyên liệu: Theo dõi số lượng tồn kho, giá nhập, và mức tồn kho tối thiểu.
Cảnh báo tồn kho thấp: Tự động thông báo khi nguyên liệu cần được nhập thêm.
Quản lý phiếu nhập: Ghi nhận và theo dõi lịch sử nhập hàng chi tiết.
Quản lý công thức pha chế: Định nghĩa nguyên liệu và định lượng cần thiết cho mỗi sản phẩm.
3. Quản lý khách hàng
Thông tin khách hàng: Thêm, sửa, xóa thông tin cá nhân khách hàng.
Chương trình thành viên: Tích lũy và sử dụng điểm thưởng.
Tìm kiếm & Tra cứu: Dễ dàng tìm kiếm và tra cứu điểm thành viên.
Thông báo sinh nhật: Ghi nhận và nhắc nhở sinh nhật khách hàng.
4. Quản lý nhân sự
Thông tin nhân viên: Quản lý hồ sơ, vai trò, lương theo giờ làm.
Phân quyền truy cập: Đảm bảo mỗi nhân viên chỉ có quyền truy cập vào các chức năng phù hợp với vai trò của họ.
Quản lý ca làm: Định nghĩa các ca làm việc.
Lịch làm việc: Sắp xếp và theo dõi lịch làm việc của từng nhân viên.
5. Báo cáo & Thống kê
Doanh thu & Lợi nhuận: Báo cáo chi tiết về tổng doanh thu, giá vốn, chi phí lương và lợi nhuận gộp theo thời gian.
Lịch sử đơn hàng: Xem lại chi tiết tất cả các đơn hàng đã giao dịch.
Hiệu quả khuyến mãi: Đánh giá mức độ đóng góp của từng chương trình khuyến mãi.
Lợi nhuận sản phẩm: Phân tích lợi nhuận từ mỗi loại sản phẩm.
Bảng lương nhân viên: Báo cáo lương ước tính dựa trên giờ làm việc.
Hiệu suất sản phẩm: Thống kê sản lượng bán và doanh thu theo sản phẩm.
6. Dashboard (Bảng điều khiển)
Tổng quan nhanh: Hiển thị các chỉ số kinh doanh quan trọng nhất trong ngày và tuần.
Biểu đồ trực quan: Biểu đồ doanh thu và tỷ lệ bán theo danh mục giúp dễ dàng nắm bắt xu hướng.
Cảnh báo tức thời: Thông báo về tồn kho thấp và sinh nhật khách hàng.
Công nghệ sử dụng
Dự án được xây dựng với các công nghệ hiện đại cho cả frontend và backend, cùng với hệ quản trị cơ sở dữ liệu mạnh mẽ:

Frontend
React: Xây dựng giao diện người dùng động và tương tác.
TypeScript: Tăng cường an toàn kiểu dữ liệu và khả năng bảo trì.
Vite: Công cụ phát triển nhanh, tối ưu hóa trải nghiệm lập trình.
React Router DOM: Quản lý định tuyến trong ứng dụng Single-Page Application (SPA).
Recharts: Thư viện biểu đồ mạnh mẽ để trực quan hóa dữ liệu.
CSS: Tùy chỉnh giao diện người dùng.
Backend
NET Core (ASP.NET Core API): Framework hiệu suất cao để xây dựng các API RESTful.
C#: Ngôn ngữ lập trình chính cho logic nghiệp vụ.
Dapper: Micro-ORM giúp truy vấn cơ sở dữ liệu nhanh chóng và hiệu quả.
JWT (JSON Web Tokens): Cơ chế xác thực an toàn cho API.
BCrypt.Net: Để băm mật khẩu người dùng, tăng cường bảo mật.
Cơ sở dữ liệu
SQL Server: Hệ quản trị cơ sở dữ liệu quan hệ chính, lưu trữ và quản lý dữ liệu.
Stored Procedures: Được sử dụng rộng rãi để thực hiện các nghiệp vụ phức tạp và tối ưu hóa hiệu suất truy vấn.
Đóng góp
Mọi đóng góp để cải thiện dự án đều được hoan nghênh! Vui lòng fork repository và tạo pull request.

Giấy phép (License)
[Ghi thông tin giấy phép của dự án tại đây, ví dụ: MIT License]