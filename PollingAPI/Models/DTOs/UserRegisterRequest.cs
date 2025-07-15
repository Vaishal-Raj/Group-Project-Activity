using System;

namespace PollingAPI.Models.DTOs;

public class UserRegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Voter"; 
}
