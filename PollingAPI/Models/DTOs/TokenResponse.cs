using System;

namespace PollingAPI.Models.DTOs;

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;

    public int? expiry { get; set; }
}

