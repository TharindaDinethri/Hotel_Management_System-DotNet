using HotelManagement.Api.DTOs;
using HotelManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(UserManager<AppUser> users, SignInManager<AppUser> signIn) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || request.Password.Length < 8)
            return BadRequest(new { message = "Enter your name, a valid email and a password of at least 8 characters." });

        var user = new AppUser { UserName = request.Email.Trim(), Email = request.Email.Trim(), FullName = request.FullName.Trim() };
        var result = await users.CreateAsync(user, request.Password);
        if (!result.Succeeded) return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });
        await users.AddToRoleAsync(user, "Customer");
        await signIn.SignInAsync(user, isPersistent: true);
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email!, "Customer"));
    }

    [HttpPost("customer-login")]
    [AllowAnonymous]
    public Task<IActionResult> CustomerLogin(LoginRequest request) => LoginForRole(request, "Customer");

    [HttpPost("staff-login")]
    [AllowAnonymous]
    public Task<IActionResult> StaffLogin(LoginRequest request) => LoginForRole(request, null);

    private async Task<IActionResult> LoginForRole(LoginRequest request, string? requiredRole)
    {
        var user = await users.FindByEmailAsync(request.Email);
        if (user == null || !await users.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new { message = "Email or password is incorrect." });
        var roles = await users.GetRolesAsync(user);
        if (requiredRole == "Customer" && !roles.Contains("Customer"))
            return Forbid();
        if (requiredRole == null && !roles.Any(r => r is "Staff" or "Admin"))
            return Forbid();
        await signIn.SignInAsync(user, isPersistent: true);
        var role = roles.Contains("Admin") ? "Admin" : roles.FirstOrDefault() ?? "Customer";
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email!, role));
    }

    [HttpGet("me"), Authorize]
    public async Task<IActionResult> Me()
    {
        var user = await users.GetUserAsync(User);
        if (user == null) return Unauthorized();
        var roles = await users.GetRolesAsync(user);
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email!, roles.Contains("Admin") ? "Admin" : roles.FirstOrDefault() ?? "Customer"));
    }

    [HttpPost("logout"), Authorize]
    public async Task<IActionResult> Logout()
    {
        await signIn.SignOutAsync();
        return Ok(new { message = "Logged out." });
    }
}
