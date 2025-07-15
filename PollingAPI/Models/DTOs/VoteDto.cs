using System;

namespace PollingAPI.Models.DTOs;

public class VoteDto
{
    public int PollId { get; set; }
    public int OptionId { get; set; }
}
