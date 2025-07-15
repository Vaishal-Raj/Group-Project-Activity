using System;
using Microsoft.EntityFrameworkCore;
using PollingAPI.Contexts;
using PollingAPI.Interfaces;
using PollingAPI.Models;

namespace PollingAPI.Repositories;

public class PollRepository : Repository<int, Poll>,IPollRepository
{
    private readonly PollContext _pollContext;
    public PollRepository(PollContext context) : base(context)
    {
        _pollContext = context;
    }

    public override async Task<ICollection<Poll>> GetAllAsync()
    {
        return await _pollContext.Polls
                        .Include(p => p.Options)
                        .ThenInclude(o => o.Votes)
                        .ToListAsync();
    }
    public async Task<ICollection<Poll>> GetPaginatedAsync(int pageIndex, int pageSize,string creator)
    {
        return await _pollContext.Polls
                        .Where(p=>p.CreatedByUsername==creator)
                        .Include(p => p.Options)
                        .ThenInclude(o => o.Votes)
                        .Skip((pageIndex - 1) * pageSize)
                        .Take(pageSize)
                        .ToListAsync();
    }
    public override async Task<Poll?> GetAsync(int id)
    {
        var poll = await _pollContext.Polls
                        .Include(p => p.Options)
                        .SingleOrDefaultAsync(p => p.Id == id);
        if (poll == null)
            return null;
        var allVotes = await _pollContext.Votes.ToListAsync();
        foreach (var option in poll.Options)
        {
            option.VoteCount = allVotes.Count(v => v.OptionId == option.Id);
        }
        return poll;            
    }
}
