using System;

namespace PollingAPI.Models;

public class User
{
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;  // Moderator(admin) or Voter
    public string? Password { get; set; }

    public string? ImageUrl { get; set; } = string.Empty;
    public ICollection<Poll>? PollsCreated { get; set; }

    public ICollection<RefreshToken>? RefreshTokens { get; set; }

    public ICollection<Vote>? Votes { get; set; }

}
