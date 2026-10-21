using HotelManagement.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser>(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<Room>().Property(x => x.PricePerNight).HasPrecision(12, 2);
        builder.Entity<Reservation>().Property(x => x.TotalPrice).HasPrecision(12, 2);
        builder.Entity<Reservation>()
            .HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Reservation>()
            .HasOne(x => x.Room).WithMany().HasForeignKey(x => x.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Room>().HasIndex(x => x.RoomNumber).IsUnique();
    }
}
