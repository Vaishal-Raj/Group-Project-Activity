using System;
using Microsoft.EntityFrameworkCore;
using PollingAPI.Contexts;
using PollingAPI.Interfaces;
using PollingAPI.Models;

namespace PollingAPI.Repositories;

public class UserRepository : Repository<string, User>,IUserRepository
{
    private readonly PollContext _pollContext;
    public UserRepository(PollContext pollContext) : base(pollContext)
    {
        _pollContext = pollContext;
    }
    public override async Task<ICollection<User>> GetAllAsync()
    {
        return await _pollContext.Users.ToListAsync();
    }

    public override async Task<User> GetAsync(string id)
    {
        return await _pollContext.Users.SingleOrDefaultAsync(u => u.Username == id);
    }
}
