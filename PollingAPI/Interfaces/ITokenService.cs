using System;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Interfaces;

public interface ITokenService
{
    public Task<string> GenerateToken(User user,int expiryMinutes);
}
