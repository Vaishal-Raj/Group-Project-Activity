using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PollingAPI.Interfaces;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IRepository<string, User> _userRepository;
        private readonly ITokenService _tokenService;

        public AuthenticationController(IAuthenticationService authService, IRefreshTokenService refreshTokenService,
                IRepository<string, User> userRepository,
                ITokenService tokenService)
        {
            _authenticationService = authService;
            _refreshTokenService = refreshTokenService;
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserLoginResponse>> Login([FromBody] UserLoginRequest userLoginRequest)
        {
            try
            {
                var result = await _authenticationService.Login(userLoginRequest);
                var refreshToken = await _refreshTokenService.GenerateRefreshToken(userLoginRequest.Username);
                result.RefreshToken = refreshToken?.Token;
                return Ok(result);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserRegisterResponse>> Register([FromBody] UserRegisterRequest request)
        {
            try
            {
                var result = await _authenticationService.RegisterUserAsync(request);
                System.Console.WriteLine("try block");
                return Ok(result);
            }
            catch (Exception ex)
            {
                System.Console.WriteLine("catch block");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("get-refresh-token")]
        [Authorize]
        public async Task<ActionResult> GetRefreshToken()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var refreshToken = await _refreshTokenService.GenerateRefreshToken(userId);

            return Ok(new
            {
                RefreshToken = refreshToken.Token
            });

        }
        [HttpPost("new-refresh-token")]
        public async Task<ActionResult<TokenResponse>> RefreshToken([FromBody] RefreshRequest request)
        {
            int expiryMinutes = 10;
            if (string.IsNullOrEmpty(request.RefreshToken))
                return BadRequest("Refresh token is required");
            var (user, newRefreshToken) = await _refreshTokenService.ValidateAndRotateRefreshToken(request.RefreshToken);
            if (user == null || newRefreshToken == null)
                return Unauthorized("Invalid or expired refresh token");
            var newAccesstoken = await _tokenService.GenerateToken(user, expiryMinutes);

            return Ok(new TokenResponse
            {
                AccessToken = newAccesstoken,
                RefreshToken = newRefreshToken.Token,
                expiry = expiryMinutes
            });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User identity not found.");

            var user = await _userRepository.GetAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            if (user.RefreshTokens != null && user.RefreshTokens.Any())
            {
                foreach (var token in user.RefreshTokens.ToList())
                {
                    await _refreshTokenService.DeleteRefreshToken(token.Token);
                }
            }
            return Ok("Refresh Token is successfully cleared, can't re-authenticate again. JWT Access token becomes useless after its short expiration.");
        }

        [Authorize]
        [HttpPost("confirm-password")]
        public async Task<ActionResult> ConfirmPassword([FromBody] PasswordRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User identity not found.");
            var isCorrectPassword = await this._authenticationService.CheckUserPassword(userId, request.Password);
            return Ok(isCorrectPassword);
        }
    }
}
