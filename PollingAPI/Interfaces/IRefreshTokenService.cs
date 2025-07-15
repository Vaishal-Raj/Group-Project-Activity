using System;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Interfaces;

public interface IRefreshTokenService
{
    Task<RefreshToken?> GenerateRefreshToken(string username);
    Task<bool> ValidateRefreshToken(string username, string refreshToken);
    Task<(User?, RefreshToken?)> ValidateAndRotateRefreshToken(string oldRefreshToken);

    Task DeleteRefreshToken(string token);

}
