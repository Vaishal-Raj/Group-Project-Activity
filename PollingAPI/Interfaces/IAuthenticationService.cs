using System;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Interfaces;

public interface IAuthenticationService
{
    public Task<UserLoginResponse> Login(UserLoginRequest user);
    public Task<UserRegisterResponse> RegisterUserAsync(UserRegisterRequest registerDto);
    public Task<bool> CheckUserPassword(string username, string password);

}
