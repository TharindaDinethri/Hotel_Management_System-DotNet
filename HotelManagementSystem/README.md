# StayEase — Hotel Management & Online Reservation System

A full-stack starter application with a customer booking website and a separate staff portal.

## Technology
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: ASP.NET Core Web API (.NET 10), Entity Framework Core
- Database: SQL Server
- Authentication: ASP.NET Core Identity + role-based authorization

## Included features
- Customer and staff login pages are separate.
- Customer registration and login.
- Hotel room browsing and date-based availability search.
- Customer booking creation and booking history.
- Staff dashboard, room listing, reservation management and status updates.
- Seeded demo staff/admin accounts.
- SQL Server database setup through EF Core migrations at startup.
- Responsive interface and API error messages.

## Requirements
1. .NET 10 SDK
2. Node.js 20.19+ or 22.12+
3. SQL Server Express, SQL Server Developer, or a compatible SQL Server instance
4. Git (optional)

## 1. Configure database
Edit `backend/HotelManagement.Api/appsettings.json` and set `ConnectionStrings:DefaultConnection` for your SQL Server.

Default example:
`Server=localhost;Database=StayEaseHotelDb;Trusted_Connection=True;TrustServerCertificate=True;`

If using SQL Server Express, try:
`Server=localhost\\SQLEXPRESS;Database=StayEaseHotelDb;Trusted_Connection=True;TrustServerCertificate=True;`

## 2. Run backend
Open a terminal in `backend/HotelManagement.Api`:

```bash
dotnet restore
dotnet run
```

The API runs at `http://localhost:5080` and Swagger is at `http://localhost:5080/swagger`.
The app attempts to create/update the database on startup and seeds sample rooms and demo staff accounts.

Demo accounts (change these before any real deployment):
- Admin: `admin@stayease.local` / `Admin123!`
- Staff: `staff@stayease.local` / `Staff123!`

## 3. Run frontend
Open a second terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`.

Customer portal: use **Customer login** or register a new account.
Staff portal: use **Staff login** and the demo staff/admin account above.

## Important production notes
This is a functional starter/MVP, not a fully audited production booking platform. Before going live:
- Replace demo passwords and use secrets/environment variables.
- Configure HTTPS, secure cookie/token handling, rate limiting, email verification and password reset.
- Integrate a real payment provider and verify signed webhooks server-side. This starter deliberately does not collect or store card details.
- Add stronger concurrent inventory protection, cancellation/refund policies, audit logs, backups and monitoring.
- Review privacy, tax, consumer-protection and payment requirements for your country.
