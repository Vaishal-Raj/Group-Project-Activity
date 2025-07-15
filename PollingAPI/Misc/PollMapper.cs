using System;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Misc;

public static class PollMapper
{
    public static PollResponseDto ToDto(Poll poll)
    {
        return new PollResponseDto
        {
            Id = poll.Id,
            Question = poll.Question,
            CreatedByUsername = poll.CreatedByUsername,
            CreatedAt = poll.CreatedAt,
            Options = poll.Options?.Select(OptionMapper.ToDto).ToList(),
            startTime = poll.StartTime,
            endTime= poll.EndTime
        };
    }

    public static Poll ToModel(CreatePollDto dto, string CreatedBy)
    {
        return new Poll
        {
            Question = dto.Question,
            CreatedByUsername = CreatedBy,
            CreatedAt = DateTime.UtcNow,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Options = dto.Options?.Select(o => new Option { Text = o }).ToList()
        };
    }

}
