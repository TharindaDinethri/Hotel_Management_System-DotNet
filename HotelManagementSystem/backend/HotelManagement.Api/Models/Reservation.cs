using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Api.Models;

public class Reservation
{
    public int Id { get; set; }
    [Required] public string CustomerId { get; set; } = "";
    public AppUser? Customer { get; set; }
    public int RoomId { get; set; }
    public Room? Room { get; set; }
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public int Guests { get; set; }
    public decimal TotalPrice { get; set; }
    [MaxLength(30)] public string Status { get; set; } = "Pending";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
