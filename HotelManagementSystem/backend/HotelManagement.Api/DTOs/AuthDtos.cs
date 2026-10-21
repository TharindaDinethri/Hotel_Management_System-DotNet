namespace HotelManagement.Api.DTOs;

public record RegisterRequest(string FullName, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Id, string FullName, string Email, string Role);
public record CreateReservationRequest(int RoomId, DateTime CheckIn, DateTime CheckOut, int Guests);
public record UpdateReservationStatusRequest(string Status);
public record CreateRoomRequest(string Name, string RoomNumber, string Category, int Capacity,
    decimal PricePerNight, string Description, string ImageUrl);
