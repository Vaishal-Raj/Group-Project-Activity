using System;

namespace PollingAPI.Models.DTOs;

public class UserRegisterResponse
{
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Message { get; set; } = "Registration successful";
}
