using System;
using PollingAPI.Models;

namespace PollingAPI.Interfaces;

public interface IVoteRepository : IRepository<int, Vote>
{
    public Task<Vote?> GetVoteByPollAndUser(int pollId, string userId);
    public Task<Vote?> DeleteVoteByPollAndUser(int pollId, string userId);
    public Task<ICollection<Vote>> GetAllVotesByUser(string username);
    public Task<ICollection<Vote>> GetAllVotesByPoll(int pollId);
}
