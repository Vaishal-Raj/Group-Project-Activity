using System;

namespace PollingAPI.Models;

public class Vote
{
    public int Id { get; set; }
    public int OptionId { get; set; }
    public Option? Option { get; set; }
    public int PollId { get; set; }
    public Poll? Poll { get; set; }

    public string UserId { get; set; } = string.Empty;
    public User? User { get; set; }
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;
    
}
