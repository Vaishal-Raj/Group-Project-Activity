using System;
using System.Linq;
using Microsoft.AspNetCore.SignalR;
using PollingAPI.Contexts;
using PollingAPI.Exceptions;
using PollingAPI.Hubs;
using PollingAPI.Interfaces;
using PollingAPI.Misc;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Services;

public class PollService : IPollService
{
    private readonly IPollRepository _pollRepo;
    private readonly PollContext _context;
    private readonly IHubContext<PollingHub> _hubContext;
    private readonly IEmailService _emailService;

    public PollService(IPollRepository pollRepo, PollContext pollContext, IHubContext<PollingHub> hubContext, IEmailService emailService)
    {
        _pollRepo = pollRepo;
        _context = pollContext;
        _hubContext = hubContext;
        _emailService = emailService;
    }
    public async Task<PollResponseDto> CreatePollAsync(CreatePollDto dto, string username)
    {
        if (dto.StartTime != null || dto.EndTime != null)
        {
            if (dto.EndTime <= dto.StartTime)
                throw new ArgumentException("EndTime must be greater than StartTime.");
        }

        var poll = PollMapper.ToModel(dto, username);
        var result = await _pollRepo.AddAsync(poll);
        
        await Task.Delay(1000);
        if (_hubContext != null)
        {
            await _hubContext.Clients
                .All
                .SendAsync("PollCreated", new
                {
                    message = $"{poll.CreatedByUsername} created a poll {poll.Question} on {poll.StartTime.ToString()}",


                });
        }

        // Notify all users via email
        string link = "http://localhost:4200/my-polls";
        string subject = "📊 A New Poll Has Been Created on Pollytics!";
        string message = $"""
        Hi there,

        A new poll titled **"{poll.Question}"** has just been created by **{username}** on the Pollytics Poll App!

        We’d love to hear your opinion. Your voice matters!

        👉 [Click here to participate in the poll]({link})

        Thanks for being part of our polling community.  
        Warm regards,  
        **Pollytics Team**
        """;

        await _emailService.SendMessageToAllUsersAsync(subject, message);
        
        return PollMapper.ToDto(result);
    }

    public async Task<ICollection<PollResponseDto>> GetAllPollsAsync()
    {
        var polls = await _pollRepo.GetAllAsync();
        var dtoList = polls.Select(poll => PollMapper.ToDto(poll)).ToList();
        return dtoList;
    }

    public async Task<PollResponseDto?> GetPollResultsAsync(int pollId)
    {
        var poll = await _pollRepo.GetAsync(pollId);
        if (poll == null)
            return null;
        return PollMapper.ToDto(poll);
    }
    public async Task<PollResponseDto?> GetPollByIdAsync(int pollId)
    {
        var poll = await _pollRepo.GetAsync(pollId);

        return poll == null ? null : PollMapper.ToDto(poll);

    }

    public async Task<ICollection<PollResponseDto>> GetPaginatedPolls(int pageIndex, int pageSize,string username)
    {
        var polls = await _pollRepo.GetPaginatedAsync(pageIndex, pageSize,username);
        var dtoList = polls.Select(poll => PollMapper.ToDto(poll)).ToList();

        return dtoList;

    }

    public async Task<PollResponseDto> UpdatePollAsync(int pollId, CreatePollDto updatedDto,string username)
    {
        var existingPoll = await _pollRepo.GetAsync(pollId);
        if (existingPoll == null)
        {
            throw new ItemNotFoundException();
        }
        System.Console.WriteLine($"{existingPoll.CreatedByUsername} ---- {username}");
        if (existingPoll.CreatedByUsername != username)
            throw new UnauthorizedAccessException("You can't modify this poll.");

        existingPoll.Question = updatedDto.Question;
        existingPoll.StartTime = updatedDto.StartTime;
        existingPoll.EndTime = updatedDto.EndTime;

        existingPoll?.Options?.Clear();
        var optionsToRemove = _context.Options.Where(o => o.PollId == pollId);
        var votesToRemove = _context.Votes.Where(v => v.Option.PollId == pollId);
        _context.Votes.RemoveRange(votesToRemove);
        _context.Options.RemoveRange(optionsToRemove);

        existingPoll.Options = updatedDto.Options.Select(optionText => new Option
        {
            Text = optionText,
            VoteCount = 0
        }).ToList();


        var updatedPoll = await _pollRepo.UpdateAsync(pollId, existingPoll);
        await Task.Delay(1000);
        if (_hubContext != null)
        {
            await _hubContext.Clients
                .All
                .SendAsync("PollUpdated", new
                {
                    message = $"{existingPoll.CreatedByUsername} updated the poll {existingPoll.Question} at {existingPoll.CreatedAt.ToString("f")}",

                });
        }

        // Notify all users via email
        string link = "http://localhost:4200/my-polls";
        string subject = "✏️ A Poll Has Been Updated on Pollytics";
        string message = $"""
        Hello,

        The poll titled **"{existingPoll.Question}"** has been updated by **{username}**.

        Please review the changes and cast your vote or update your response if necessary.

        👉 [View the updated poll here]({link})

        We appreciate your active participation.  
        Cheers,  
        **Pollytics Team**
        """;
        await _emailService.SendMessageToAllUsersAsync(subject, message);

        return PollMapper.ToDto(updatedPoll);
    }

    public async Task<PollResponseDto> DeletePollAsync(int pollId,string username)
    {
        var existingPoll = await _pollRepo.GetAsync(pollId);
        if (existingPoll == null)
        {
            throw new ItemNotFoundException();
        }
        if (existingPoll.CreatedByUsername != username)
            throw new UnauthorizedAccessException("You can't delete this poll.");

        var deletedPoll = await _pollRepo.DeleteAsync(pollId);
        await Task.Delay(1000);
        if (_hubContext != null)
        {
            await _hubContext.Clients
                .All
                .SendAsync("PollDeleted", new
                {
                    message = $"{existingPoll.CreatedByUsername} removed the poll {existingPoll.Question} on {DateTime.UtcNow}",


                });
        }
        return PollMapper.ToDto(deletedPoll);
    }

    public async Task<bool> ExtendPollAsync(int pollId, DateTime newEndTime, string username)
    {
        return await _pollRepo.ExtendPollAsync(pollId, newEndTime, username);
    }
}
