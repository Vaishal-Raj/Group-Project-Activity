using System;
using Microsoft.EntityFrameworkCore;
using PollingAPI.Contexts;
using PollingAPI.Exceptions;
using PollingAPI.Interfaces;
using PollingAPI.Models;

namespace PollingAPI.Repositories;

public class VoteRepository : Repository<int, Vote>, IVoteRepository
{
    private readonly PollContext _pollContext;
    public VoteRepository(PollContext context) : base(context)
    {
        _pollContext = context;
    }

    public override async Task<ICollection<Vote>> GetAllAsync()
    {
        return await _pollContext.Votes
                .Include(v => v.Option)
                .Include(v => v.Poll)
                .ToListAsync();
    }

    public override async Task<Vote?> GetAsync(int id)
    {
        return await _pollContext.Votes
                                .Include(v => v.Option)
                                .Include(v => v.Poll)
                                .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<ICollection<Vote>> GetAllVotesByUser(string username)
    {
        return await _pollContext.Votes.Where(v => v.UserId == username).ToListAsync();
                            
    }
    public async Task<Vote?> GetVoteByPollAndUser(int pollId, string userId)
    {
        return await _pollContext.Votes
                                .Include(v => v.Option)
                                .Include(v => v.Poll)
                                .FirstOrDefaultAsync(v => v.PollId == pollId && v.UserId == userId);

    }

    public async Task<ICollection<Vote>> GetAllVotesByPoll(int pollId)
    {
        return await _pollContext.Votes.Where(v => v.PollId == pollId).ToListAsync();
                                
    }
    public async Task<Vote?> DeleteVoteByPollAndUser(int pollId, string userId)
    {
        var vote = await this.GetVoteByPollAndUser(pollId, userId);
        if (vote == null)
        {
            throw new ItemNotFoundException();
        }
        _pollContext.Votes.Remove(vote);
        await _pollContext.SaveChangesAsync();
        return vote;
    }
}
