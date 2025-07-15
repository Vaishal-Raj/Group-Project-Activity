using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PollingAPI.Interfaces;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(new
            {
                success = true,
                message = "Users fetched successfully",
                data = users
            });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Moderator,SuperUser")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound($"User with ID '{id}' not found.");

            return Ok(new
            {
                success = true,
                message = "User fetched successfully",
                data = user
            });
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> UpdateUser(string id,[FromBody] UserUpdateRequest user)
        {
            var updated = await _userService.UpdateUserAsync(id, user);
            if (updated == null)
                return NotFound($"User with ID '{id}' not found.");

            return Ok(new
            {
                success = true,
                message = "User updated successfully",
                data = updated
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperUser")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var myUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (myUserId == id)
            {
                return Unauthorized("You cannot delete your own account");
            }
            var deleted = await _userService.DeleteUserAsync(id);
            if (!deleted)
                return NotFound($"User with ID '{id}' not found.");

            return Ok(new
            {
                success = true,
                message = $"User '{id}' deleted successfully"
            });
        }
    }
}
