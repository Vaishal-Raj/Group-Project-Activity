using System;

namespace PollingAPI.Models.DTOs;

public class CreatePollDto
{
    public string Question { get; set; } = string.Empty;
    public ICollection<string>? Options { get; set; }
    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

}
