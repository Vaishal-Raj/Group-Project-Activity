using System;
using Microsoft.EntityFrameworkCore;
using PollingAPI.Contexts;
using PollingAPI.Interfaces;
using PollingAPI.Models;

namespace PollingAPI.Repositories;

public class RefreshTokenRepository : Repository<string, RefreshToken>, IRefreshTokenRepository
{
    private readonly PollContext _pollContext;
    public RefreshTokenRepository(PollContext context) : base(context)
    {
        _pollContext = context;
    }   

    public override async Task<ICollection<RefreshToken>> GetAllAsync()
    {
        return await _pollContext.RefreshTokens.ToListAsync();
    }

    public override async Task<RefreshToken?> GetAsync(string id)
    {
        return await _pollContext.RefreshTokens.FirstOrDefaultAsync(r => r.Token == id);
    }
}
