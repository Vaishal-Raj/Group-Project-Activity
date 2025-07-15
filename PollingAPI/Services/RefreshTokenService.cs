using System;
using PollingAPI.Interfaces;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Services;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly IRepository<string, User> _userRepository;
    private readonly IRepository<string, RefreshToken> _refreshTokenRepository;

    public RefreshTokenService(IRepository<string, User> userRepo, IRepository<string, RefreshToken> refreshTokenRepo)
    {
        _userRepository = userRepo;
        _refreshTokenRepository = refreshTokenRepo;
    }
    public async Task<RefreshToken?> GenerateRefreshToken(string username)
    {
        var user = await _userRepository.GetAsync(username);
        if (user == null)
            return null;
        var token = new RefreshToken
        {
            Token = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
            Username = username,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };
        await _refreshTokenRepository.AddAsync(token);
        return token;
    }



    public async Task<bool> ValidateRefreshToken(string username, string refreshToken)
    {
        var token = await _refreshTokenRepository.GetAsync(refreshToken);
        if (token == null)
            return false;
        if (token.Username != username)
            return false;
        if (token.ExpiresAt < DateTime.UtcNow)
            return false;
        return true;
    }
    public async Task<(User?, RefreshToken?)> ValidateAndRotateRefreshToken(string oldRefreshToken)
    {
        var existingToken = await _refreshTokenRepository.GetAsync(oldRefreshToken);
        var isValid = await ValidateRefreshToken(existingToken.Username, existingToken.Token);
        if (!isValid)
        {
            return (null, null);
        }
        var user = await _userRepository.GetAsync(existingToken.Username);
        await _refreshTokenRepository.DeleteAsync(oldRefreshToken);
        var newRefreshToken = await GenerateRefreshToken(existingToken.Username);
        return (user, newRefreshToken);

    }

    public async Task DeleteRefreshToken(string token)
    {
       await _refreshTokenRepository.DeleteAsync(token);
    }
}
