using System;
using Microsoft.IdentityModel.Tokens;
using PollingAPI.Exceptions;
using PollingAPI.Interfaces;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Services;

public class AuthenticationService : IAuthenticationService
{

    private readonly ITokenService _tokenService;
    private readonly IRepository<string, User> _userRepository;
    private readonly ILogger<AuthenticationService> _logger;
    private readonly IEncryptionService _encryptionService;

    public AuthenticationService(ITokenService tokenService,
            IRepository<string, User> userRepository,
            ILogger<AuthenticationService> logger,
            IEncryptionService encryptService)

    {
        _tokenService = tokenService;
        _userRepository = userRepository;
        _logger = logger;
        _encryptionService = encryptService;
    }

    public async Task<UserLoginResponse> Login(UserLoginRequest user)
    {
        var dbUser = await _userRepository.GetAsync(user.Username);
        if (dbUser == null)
        {
            _logger.LogWarning("User not found!!");
            throw new UserNotFoundException("User not found!!");
        }

        bool isPasswordValid = await _encryptionService.VerifyPassword(user.Password, dbUser.Password);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Invalid password!!");
            throw new InvalidPasswordException("Invalid password");
        }
        int expiryMinutes = 10;
        var token = await _tokenService.GenerateToken(dbUser, expiryMinutes);
        return new UserLoginResponse
        {
            Username = user.Username,
            Token = token,
            Role = dbUser.Role,
            Expiry = expiryMinutes,
            ImageUrl = dbUser.ImageUrl
        };
    }

    public async Task<UserRegisterResponse> RegisterUserAsync(UserRegisterRequest registerDto)
    {
        var existingUser = await _userRepository.GetAsync(registerDto.Username);
        if (existingUser != null)
        {
            _logger.LogWarning("User already exists");
            throw new UserExistsException("User already exists");
        }

        var hashedPassword = await _encryptionService.HashPassword(registerDto.Password);
        var user = new User
        {
            Username = registerDto.Username,
            Password = hashedPassword,
            Role = registerDto.Role
        };
        user = await _userRepository.AddAsync(user);
        return new UserRegisterResponse
        {
            Username = user.Username,
            Role = user.Role
        };
    }

    public async Task<bool> CheckUserPassword(string username, string password)
    {
        var dbUser = await _userRepository.GetAsync(username);
        if (dbUser == null)
        {
            _logger.LogWarning("User not found!!");
            throw new UserNotFoundException("User not found!!");
        }

        bool isPasswordValid = await _encryptionService.VerifyPassword(password, dbUser.Password);
       
        return isPasswordValid;
        
    }

   
}
