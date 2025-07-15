using System;
using Microsoft.EntityFrameworkCore;
using PollingAPI.Contexts;
using PollingAPI.Models;

namespace PollingAPI.Repositories;

public class OptionRepository : Repository<int, Option>
{
    private readonly PollContext _pollContext;
    public OptionRepository(PollContext context) : base(context)
    {
        _pollContext = context;
    }

    public override async Task<ICollection<Option>> GetAllAsync()
    {
        return await _pollContext.Options
                .Include(o=>o.Votes).ToListAsync();
    }

    public override async Task<Option?> GetAsync(int id)
    {
        return await _pollContext.Options
            .Include(o => o.Votes)
            .FirstOrDefaultAsync(o => o.Id == id);
    }
}
