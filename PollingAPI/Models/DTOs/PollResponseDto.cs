using System;

namespace PollingAPI.Models.DTOs;

public class PollResponseDto
{
    public int Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string CreatedByUsername { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public ICollection<OptionDto>? Options { get; set; }

    public DateTime? startTime { get; set; }
    public DateTime? endTime { get; set; }
}
