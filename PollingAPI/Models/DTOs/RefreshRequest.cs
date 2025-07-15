using System;

namespace PollingAPI.Models.DTOs;

public class RefreshRequest
{
    public string Username { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
