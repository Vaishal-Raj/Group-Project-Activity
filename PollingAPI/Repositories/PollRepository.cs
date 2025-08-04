using System;
using Microsoft.EntityFrameworkCore;
using PollingAPI.Contexts;
using PollingAPI.Interfaces;
using PollingAPI.Models;

namespace PollingAPI.Repositories;

public class PollRepository : Repository<int, Poll>,IPollRepository
{
    private readonly PollContext _pollContext;
    private readonly IEmailService _emailService;

    public PollRepository(PollContext context, IEmailService emailService) : base(context)
    {
        _pollContext = context;
        _emailService = emailService;
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

    public async Task<bool> ExtendPollAsync(int pollId, DateTime newEndTime, string username)
    {
        var poll = await _pollContext.Polls.FirstOrDefaultAsync(p => p.Id == pollId);
        if (poll == null) return false;
        if (poll.EndTime == null || DateTime.UtcNow > poll.EndTime.Value) return false;
        if (poll.CreatedByUsername != username) return false;
        if (poll.ExtensionCount >= poll.MaxExtensions) return false;
        if (newEndTime <= poll.EndTime.Value) return false;

        poll.EndTime = newEndTime;
        poll.ExtensionCount += 1;

        _pollContext.Polls.Update(poll);
        await _pollContext.SaveChangesAsync();

        // Notify all users via email
        string link = "http://localhost:4200/my-polls";
        string subject = "⏳ Poll Deadline Extended - You've Got More Time!";
        string message = $"""
        Hey there,

        Good news! The expiration time for the poll **"{poll.Question}"** has been extended by **{username}**.

        If you haven't voted yet, there's still time to share your thoughts!

        👉 [Click here to vote now]({link})

        Don't miss your chance to make a difference.  
        Best,  
        **Pollytics Team**
        """;

        await _emailService.SendMessageToAllUsersAsync(subject, message);
        return true;
    }
}
