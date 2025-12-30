# Bharat Security Backend

This is the .NET 8 Web API backend for the Bharat Security Admin Dashboard.

## Prerequisites
- **.NET 8 SDK** (Required) - [Download Here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server** (or SQL Express / LocalDB)

## Structure
- **API**: The entry point (Controllers, Configurations).
- **Core (Domain)**: Database entities and core logic.
- **Infrastructure**: Database Context (EF Core) and Migrations.
- **Application**: Business logic and DTOs.

## Setup Instructions

1. **Install .NET 8**: Ensure `dotnet --version` returns `8.0.x`.
2. **Database Connection**:
   - Open `src/BharatSecurity.API/appsettings.json`.
   - Update `ConnectionStrings:DefaultConnection` with your SQL Server connection string.

3. **Restore Dependencies**:
   ```bash
   cd backend
   dotnet restore
   ```

4. **Initialize Database**:
   ```bash
   cd src/BharatSecurity.API
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
   *(You may need to install tool: `dotnet tool install --global dotnet-ef`)*

5. **Run the API**:
   ```bash
   dotnet run
   ```
   The API will start at `http://localhost:5000` (or configured port).
   Swagger Documentation available at `/swagger`.

## Authentication
The API uses JWT Authentication.
- Use `POST /api/auth/login` to get a token.
- Pass token in Header: `Authorization: Bearer <token>`.
