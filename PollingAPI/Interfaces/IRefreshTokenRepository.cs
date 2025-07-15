using System;
using PollingAPI.Models;
using PollingAPI.Repositories;

namespace PollingAPI.Interfaces;

public interface IRefreshTokenRepository : IRepository<string,RefreshToken>
{

}
