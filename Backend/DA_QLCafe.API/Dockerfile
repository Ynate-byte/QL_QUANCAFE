FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build_env
WORKDIR /src

COPY ["DA_QLCafe.API/DA_QLCafe.API.csproj", "./"] 
RUN dotnet restore "./DA_QLCafe.API.csproj"

COPY . .
WORKDIR /src/DA_QLCafe.API
RUN dotnet build "DA_QLCafe.API.csproj" -c Release -o /app/build
RUN dotnet publish "DA_QLCafe.API.csproj" -c Release -o /app/out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build_env /app/out .
EXPOSE 80  
ENTRYPOINT ["dotnet", "DA_QLCafe.API.dll"]