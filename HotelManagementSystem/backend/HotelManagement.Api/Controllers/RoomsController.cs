using HotelManagement.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Controllers;

[ApiController, Route("api/rooms")]
public class RoomsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRooms([FromQuery] DateTime? checkIn, [FromQuery] DateTime? checkOut, [FromQuery] int guests = 1)
    {
        var rooms = db.Rooms.Where(r => r.IsActive && r.Capacity >= guests);
        if (checkIn.HasValue && checkOut.HasValue && checkOut > checkIn)
        {
            var start = checkIn.Value.Date;
            var end = checkOut.Value.Date;
            rooms = rooms.Where(r => !db.Reservations.Any(b => b.RoomId == r.Id &&
                (b.Status == "Confirmed" || b.Status == "Pending") &&
                b.CheckIn < end && b.CheckOut > start));
        }
        var result = await rooms.OrderBy(r => r.PricePerNight).Select(r => new
        {
            r.Id, r.Name, r.RoomNumber, r.Category, r.Capacity, r.PricePerNight,
            r.Description, r.ImageUrl, r.Status
        }).ToListAsync();
        return Ok(result);
    }
}
