using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Api.Models;

public class Room
{
    public int Id { get; set; }
    [Required, MaxLength(80)] public string Name { get; set; } = "";
    [Required, MaxLength(30)] public string RoomNumber { get; set; } = "";
    [Required, MaxLength(50)] public string Category { get; set; } = "Standard";
    [Range(1, 10)] public int Capacity { get; set; } = 2;
    [Range(0, 10000000)] public decimal PricePerNight { get; set; }
    [MaxLength(1000)] public string Description { get; set; } = "";
    [MaxLength(1000)] public string ImageUrl { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public string Status { get; set; } = "Available";
}
