using System;
using PollingAPI.Models;

namespace PollingAPI.Interfaces;

public interface IEncryptionService
{
    public Task<string> HashPassword(string password);
    public Task<bool> VerifyPassword(string password, string hashedPassword);
}
