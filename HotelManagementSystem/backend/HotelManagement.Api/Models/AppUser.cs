using Microsoft.AspNetCore.Identity;

namespace HotelManagement.Api.Models;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = "";
}
