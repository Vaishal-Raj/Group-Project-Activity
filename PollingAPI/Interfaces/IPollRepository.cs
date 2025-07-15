using System;
using PollingAPI.Models;

namespace PollingAPI.Interfaces;

public interface IPollRepository : IRepository<int,Poll>
{
    public Task<ICollection<Poll>> GetPaginatedAsync(int pageIndex, int pageSize,string userId);
}
