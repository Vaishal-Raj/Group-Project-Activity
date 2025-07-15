using System;
using System.ComponentModel.DataAnnotations;

namespace PollingAPI.Models;

public class RefreshToken
{
    [Key]
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }

    public User? User { get; set; }
}
