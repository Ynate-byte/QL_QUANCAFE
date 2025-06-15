# Stage 1: Build the application
# Sử dụng SDK image để build ứng dụng
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Sao chép file .csproj của project hiện tại
# File DA_QLCafe.API.csproj nằm ngay trong thư mục gốc của Docker build context (Backend/DA_QLCafe.API)
COPY DA_QLCafe.API.csproj .
RUN dotnet restore

# Sao chép toàn bộ mã nguồn vào thư mục làm việc và publish ứng dụng
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# Stage 2: Create the runtime image
# Sử dụng runtime image, nhỏ gọn hơn, chỉ chứa môi trường cần thiết để chạy ứng dụng
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
# Sao chép các file đã publish từ giai đoạn 'build' vào image cuối cùng
COPY --from=build /app/publish .

# Mở cổng mà ứng dụng ASP.NET Core sẽ lắng nghe (mặc định cho HTTP là 80)
EXPOSE 80

# Định nghĩa lệnh khởi chạy ứng dụng khi container khởi động
ENTRYPOINT ["dotnet", "DA_QLCafe.API.dll"]