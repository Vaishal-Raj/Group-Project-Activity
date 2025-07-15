using System;

namespace PollingAPI.Models;

public class Poll
{
    
    public int Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string CreatedByUsername { get; set; } = string.Empty;

    public ICollection<Option>? Options { get; set; }
    public User? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}
