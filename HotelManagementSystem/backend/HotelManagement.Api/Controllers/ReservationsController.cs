using System.Security.Claims;
using HotelManagement.Api.Data;
using HotelManagement.Api.DTOs;
using HotelManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Controllers;

[ApiController, Route("api/reservations"), Authorize]
public class ReservationsController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create(CreateReservationRequest request)
    {
        var checkIn = request.CheckIn.Date;
        var checkOut = request.CheckOut.Date;
        if (checkIn < DateTime.Today || checkOut <= checkIn || request.Guests < 1)
            return BadRequest(new { message = "Choose valid dates and guest numbers." });

        var room = await db.Rooms.FirstOrDefaultAsync(r => r.Id == request.RoomId && r.IsActive && r.Capacity >= request.Guests);
        if (room == null) return NotFound(new { message = "Room not found or guest capacity exceeded." });

        var conflict = await db.Reservations.AnyAsync(b => b.RoomId == room.Id &&
            (b.Status == "Confirmed" || b.Status == "Pending") &&
            b.CheckIn < checkOut && b.CheckOut > checkIn);
        if (conflict) return Conflict(new { message = "This room is no longer available for those dates. Please search again." });

        var nights = (checkOut - checkIn).Days;
        var booking = new Reservation {
            CustomerId = UserId, RoomId = room.Id, CheckIn = checkIn, CheckOut = checkOut,
            Guests = request.Guests, TotalPrice = room.PricePerNight * nights, Status = "Pending"
        };
        db.Reservations.Add(booking);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMine), new { id = booking.Id }, new {
            booking.Id, RoomName = room.Name, booking.CheckIn, booking.CheckOut,
            booking.Guests, booking.TotalPrice, booking.Status
        });
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMine()
    {
        var items = await db.Reservations.Include(b => b.Room)
            .Where(b => b.CustomerId == UserId).OrderByDescending(b => b.CreatedAtUtc)
            .Select(b => new { b.Id, RoomName = b.Room!.Name, RoomCategory = b.Room!.Category,
                b.CheckIn, b.CheckOut, b.Guests, b.TotalPrice, b.Status, b.CreatedAtUtc })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("{id:int}/cancel")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Cancel(int id)
    {
        var booking = await db.Reservations.FirstOrDefaultAsync(b => b.Id == id && b.CustomerId == UserId);
        if (booking == null) return NotFound();
        if (booking.Status is "Cancelled" or "Completed") return BadRequest(new { message = "This reservation cannot be cancelled." });
        booking.Status = "Cancelled";
        await db.SaveChangesAsync();
        return Ok(new { message = "Reservation cancelled." });
    }
}
