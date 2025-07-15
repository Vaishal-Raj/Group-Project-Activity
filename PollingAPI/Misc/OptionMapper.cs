using System;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Misc;

public static class OptionMapper
{

    public static OptionDto ToDto(Option option)
    {
        return new OptionDto
        {
            Id = option.Id,
            Text = option.Text,
            VoteCount=option.Votes?.Count ?? option.VoteCount
        };
    }
}
