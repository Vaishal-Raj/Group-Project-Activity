using System;

namespace PollingAPI.Models.DTOs;

public class UserLoginResponse
{
    public string Username { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public string? Role { get; set; } = string.Empty;
    public string? ImageUrl { get; set; } = string.Empty;
    public int? Expiry { get; set; }
}
