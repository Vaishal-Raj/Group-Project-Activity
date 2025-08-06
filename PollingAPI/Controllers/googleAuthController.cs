using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PollingAPI.Interfaces;
using PollingAPI.Models;

namespace PollingAPI.Controllers
{
    [Route("auth")]
    [ApiController]
    public class OAuthController : ControllerBase
    {
        private readonly IRepository<string, User> _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IRefreshTokenService _refreshTokenService;

        public OAuthController(IRepository<string, User> userRepo, ITokenService tokenService
            , IRefreshTokenService refreshTokenService
        )
        {
            _userRepository = userRepo;
            _tokenService = tokenService;
            _refreshTokenService = refreshTokenService;
        }

        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var redirectUrl = Url.Action("GoogleResponse", "OAuth");
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            return Challenge(properties, "Google");
        }

        [HttpGet("google-response")]
        public async Task<IActionResult> GoogleResponse()
        {
            // ✅ Authenticate using Cookie scheme (not "Google")
            var authenticateResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (!authenticateResult.Succeeded)
                return BadRequest("OAuth login failed");

            var email = authenticateResult.Principal?.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null)
                return BadRequest("Email not found in claims");

            var user = await _userRepository.GetAsync(email);
            if (user == null)
            {
                var picUrl = authenticateResult.Principal?.FindFirst("urn:google:picture")?.Value;
                user = await _userRepository.AddAsync(new User
                {
                    Username = email,
                    Role = "Voter",
                    ImageUrl=picUrl
                });
            }
            
            var pictureUrl = user.ImageUrl;

            int expiryMinutes = 2;
            var jwtToken = await _tokenService.GenerateToken(user, expiryMinutes);
            var refreshToken = await _refreshTokenService.GenerateRefreshToken(user.Username);

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            // return Ok(new
            // {
            //     Username = email,
            //     AccessToken = jwtToken,
            //     RefreshToken = refreshToken?.Token
            // });
            return Redirect($"http://localhost:4200/oauth-callback?username={user.Username}&accessToken={jwtToken}&refreshToken={refreshToken?.Token}&picture={Uri.EscapeDataString(pictureUrl)}&expiry={expiryMinutes}");
        }
       

    }
    
    
}
