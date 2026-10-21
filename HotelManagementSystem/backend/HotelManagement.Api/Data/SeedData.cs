using HotelManagement.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services, AppDbContext db)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        foreach (var role in new[] { "Customer", "Staff", "Admin" })
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));

        await EnsureUser(userManager, "Admin", "admin@stayease.local", "Admin123!", "StayEase Administrator");
        await EnsureUser(userManager, "Staff", "staff@stayease.local", "Staff123!", "Front Desk Staff");

        if (!await db.Rooms.AnyAsync())
        {
            db.Rooms.AddRange(
                new Room { Name = "Deluxe King Room", RoomNumber = "101", Category = "Deluxe", Capacity = 2, PricePerNight = 18000, Description = "A comfortable deluxe room with a king bed, air conditioning, Wi-Fi and a private bathroom.", ImageUrl = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80" },
                new Room { Name = "Ocean View Suite", RoomNumber = "201", Category = "Suite", Capacity = 3, PricePerNight = 32000, Description = "Spacious suite with a lounge area, premium amenities and beautiful ocean-inspired interiors.", ImageUrl = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80" },
                new Room { Name = "Family Comfort Room", RoomNumber = "105", Category = "Family", Capacity = 4, PricePerNight = 26000, Description = "Family-friendly room with flexible sleeping space, air conditioning and complimentary Wi-Fi.", ImageUrl = "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80" },
                new Room { Name = "Classic Twin Room", RoomNumber = "102", Category = "Standard", Capacity = 2, PricePerNight = 14000, Description = "Simple, bright twin room for friends or business travellers, with workspace and Wi-Fi.", ImageUrl = "https://images.unsplash.com/photo-159床?auto=format&fit=crop&w=1200&q=80".Replace("159床", "1598928506311-c55ded91a20c") }
            );
            await db.SaveChangesAsync();
        }
    }

    private static async Task EnsureUser(UserManager<AppUser> manager, string role, string email, string password, string name)
    {
        var user = await manager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new AppUser { UserName = email, Email = email, FullName = name, EmailConfirmed = true };
            var result = await manager.CreateAsync(user, password);
            if (!result.Succeeded) throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));
        }
        if (!await manager.IsInRoleAsync(user, role))
            await manager.AddToRoleAsync(user, role);
    }
}
