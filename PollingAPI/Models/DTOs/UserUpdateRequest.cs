using System;

namespace PollingAPI.Models.DTOs;

public class UserUpdateRequest
{
    public string Username { get; set; }
    public string role { get; set; }

    public string? ImageUrl { get; set; } = string.Empty;
}
