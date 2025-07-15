using System;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Interfaces;

public interface IVoteService
{
    public Task<bool> CastVoteAsync(VoteDto voteDto, string userId);
    public Task<bool> RemoveVoteAsync(int pollId, string username);
    public Task<Vote?> GetUserVoteAsync(int pollId, string userId);
    public Task<ICollection<Vote>> GetAllVotes();
    public Task<ICollection<Vote>> GetAllVotesByUser(string username);
    public Task<ICollection<Vote>> GetAllVotesByPolls(int pollId);
}

