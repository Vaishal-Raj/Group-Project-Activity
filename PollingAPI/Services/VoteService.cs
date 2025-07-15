using System;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.SignalR;
using PollingAPI.Hubs;
using PollingAPI.Interfaces;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;
using Serilog;

namespace PollingAPI.Services;

public class VoteService : IVoteService
{
    private readonly IVoteRepository _voteRepository;
    private readonly IRepository<int, Poll> _pollRepository;
    private readonly IRepository<int, Option> _optionRepository;

    private readonly IHubContext<PollingHub> _hubContext;
    private readonly ILogger<VoteService> _logger;
    public VoteService(
        IVoteRepository voteRepo,
        IRepository<int, Poll> pollRepo,
        IRepository<int, Option> optionRepo,
        IHubContext<PollingHub> hubContext,
        ILogger<VoteService> logger)
    {
        _voteRepository = voteRepo;
        _pollRepository = pollRepo;
        _optionRepository = optionRepo;
        _hubContext = hubContext;
        _logger = logger;
    }
    public async Task<bool> CastVoteAsync(VoteDto voteDto, string userId)
    {
        var poll = await _pollRepository.GetAsync(voteDto.PollId);
        if (poll == null || poll.Options == null || !poll.Options.Any(o => o.Id == voteDto.OptionId))
        {
            _logger.LogWarning($"Invalid vote attempt: Poll not found or Option {voteDto.OptionId} not valid in Poll {voteDto.PollId}");
            return false;
        }

        var existingVotes = await _voteRepository.GetVoteByPollAndUser(voteDto.PollId, userId);
        if (existingVotes != null)
        {
            _logger.LogWarning($"Duplicate vote attempt by User {userId} for Poll {voteDto.PollId}");
            return false;
        }

        var vote = new Vote
        {
            PollId = voteDto.PollId,
            OptionId = voteDto.OptionId,
            UserId = userId
        };

        var result = await _voteRepository.AddAsync(vote);
        _logger.LogWarning($"Vote added for User {userId} to Option {voteDto.OptionId} in Poll {voteDto.PollId}");

        var option = await _optionRepository.GetAsync(voteDto.OptionId);
        if (option == null)
        {
            _logger.LogWarning($"Option with ID {voteDto.OptionId} not found after vote added");
            return false;
        }

        var allVotes = await _voteRepository.GetAllAsync();
        option.VoteCount = allVotes.Count(v => v.OptionId == option.Id);
        await _optionRepository.UpdateAsync(option.Id, option);
        _logger.LogWarning($"Vote count updated to {option.VoteCount} for Option {option.Id}");

        var pollGroup = $"Poll-{voteDto.PollId}";
        _logger.LogWarning($"Sending vote update to SignalR group {pollGroup}");

        await Task.Delay(1000);

        if (_hubContext != null)
        {
            await _hubContext.Clients.Group(voteDto.PollId.ToString()).SendAsync("ReceiveVoteUpdate", new
            {
                PollId = voteDto.PollId,
                OptionId = voteDto.OptionId,
                UpdatedVoteCount = option.VoteCount,
                action = true
            });

            _logger.LogWarning($"Broadcasted vote update for Option {voteDto.OptionId} in Poll {voteDto.PollId}");
        }

        return true;
    }





    // public async Task<bool> CastVoteAsync(VoteDto voteDto, string userId)
    //     {

    //         Console.WriteLine($"Inside cast vote function {voteDto.PollId} , {voteDto.OptionId}");

    //         if (_hubContext != null)
    //         {
    //             await _hubContext.Clients.Group(voteDto.PollId.ToString()).SendAsync("ReceiveVoteUpdate", new
    //             {
    //                 PollId = voteDto.PollId,
    //                 OptionId = voteDto.OptionId
    //                 // UpdatedVoteCount = option.VoteCount
    //             });

    //             _logger.LogWarning($"Broadcasted vote update for Option {voteDto.OptionId} in Poll {voteDto.PollId}");
    //         }

    //         return true;
    //     }

    public async Task<bool> RemoveVoteAsync(int pollId, string username)
    {
        var existingVote = await _voteRepository.GetVoteByPollAndUser(pollId, username);
        if (existingVote == null)
            return false;

        var removed = await _voteRepository.DeleteAsync(existingVote.Id);
        if (removed == null)
            return false;
        var option = await _optionRepository.GetAsync(existingVote.OptionId);
        if (option == null)
        {
            return false;
        }
        var UpdatedVoteCount = option.Votes?.Count ?? 0;

        await _hubContext.Clients
                .Group(pollId.ToString())
                .SendAsync("ReceiveVoteUpdate", new
                {
                    PollId = pollId,
                    OptionId = existingVote.OptionId,
                    UpdatedVoteCount = UpdatedVoteCount,
                    action = false
                });
        _logger.LogWarning($"Broadcasted vote update for Option {option.Id} in Poll {pollId}");
        return true;
    }
    public async Task<Vote?> GetUserVoteAsync(int pollId, string userId)
    {
        return await _voteRepository.GetVoteByPollAndUser(pollId, userId);
    }

    public async Task<ICollection<Vote>> GetAllVotes()
    {
        return await _voteRepository.GetAllAsync();
    }

    public async Task<ICollection<Vote>> GetAllVotesByUser(string username)
    {
        return await _voteRepository.GetAllVotesByUser(username);
    }

    public async Task<ICollection<Vote>> GetAllVotesByPolls(int pollId)
    {
        return await _voteRepository.GetAllVotesByPoll(pollId);
    }
}
