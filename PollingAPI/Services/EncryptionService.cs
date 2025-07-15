using System;
using System.Text;
using BCrypt.Net;
using PollingAPI.Interfaces;
using PollingAPI.Models;

namespace PollingAPI.Services;

public class EncryptionService : IEncryptionService
{
    public Task<string> HashPassword(string password)
    {
        string hashed = BCrypt.Net.BCrypt.HashPassword(password);
        return Task.FromResult(hashed);
    }

    public Task<bool> VerifyPassword(string password, string hashedPassword)
    {
        bool verified = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        return Task.FromResult(verified);
    }
}
