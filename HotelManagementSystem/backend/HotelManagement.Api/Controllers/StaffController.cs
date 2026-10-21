using HotelManagement.Api.Data;
using HotelManagement.Api.DTOs;
using HotelManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Controllers;

[ApiController, Route("api/staff"), Authorize(Roles = "Staff,Admin")]
public class StaffController(AppDbContext db) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var today = DateTime.Today;
        return Ok(new {
            TotalRooms = await db.Rooms.CountAsync(r => r.IsActive),
            ActiveReservations = await db.Reservations.CountAsync(b => b.Status == "Pending" || b.Status == "Confirmed"),
            ArrivalsToday = await db.Reservations.CountAsync(b => b.CheckIn == today && b.Status == "Confirmed"),
            DeparturesToday = await db.Reservations.CountAsync(b => b.CheckOut == today && b.Status == "Confirmed"),
            PendingReservations = await db.Reservations.CountAsync(b => b.Status == "Pending")
        });
    }

    [HttpGet("reservations")]
    public async Task<IActionResult> Reservations()
    {
        var result = await db.Reservations.Include(b => b.Room).Include(b => b.Customer)
            .OrderByDescending(b => b.CreatedAtUtc)
            .Select(b => new { b.Id, CustomerName = b.Customer!.FullName, CustomerEmail = b.Customer!.Email,
                RoomName = b.Room!.Name, b.CheckIn, b.CheckOut, b.Guests, b.TotalPrice, b.Status, b.CreatedAtUtc })
            .ToListAsync();
        return Ok(result);
    }

    [HttpPatch("reservations/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateReservationStatusRequest request)
    {
        var allowed = new[] { "Pending", "Confirmed", "Cancelled", "CheckedIn", "Completed" };
        if (!allowed.Contains(request.Status)) return BadRequest(new { message = "Unsupported status." });
        var booking = await db.Reservations.FindAsync(id);
        if (booking == null) return NotFound();
        booking.Status = request.Status;
        await db.SaveChangesAsync();
        return Ok(new { message = "Reservation status updated." });
    }

    [HttpGet("rooms")]
    public async Task<IActionResult> Rooms() => Ok(await db.Rooms.OrderBy(r => r.RoomNumber).ToListAsync());

    [HttpPost("rooms")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateRoom(CreateRoomRequest request)
    {
        var room = new Room { Name = request.Name, RoomNumber = request.RoomNumber, Category = request.Category,
            Capacity = request.Capacity, PricePerNight = request.PricePerNight, Description = request.Description,
            ImageUrl = request.ImageUrl, IsActive = true, Status = "Available" };
        db.Rooms.Add(room);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException) { return Conflict(new { message = "Room number already exists." }); }
        return CreatedAtAction(nameof(Rooms), new { id = room.Id }, room);
    }
}
