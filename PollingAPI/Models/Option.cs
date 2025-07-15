using System;

namespace PollingAPI.Models;

public class Option
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int PollId { get; set; }
    public Poll? Poll { get; set; }
    public int VoteCount { get; set; }
    public ICollection<Vote>? Votes { get; set; }
    

}
