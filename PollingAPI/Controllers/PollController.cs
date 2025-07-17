using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PollingAPI.Interfaces;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PollController : ControllerBase
    {
        private readonly IPollService _pollService;
        public PollController(IPollService pollService)
        {
            _pollService = pollService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult> GetAllPolls()
        {
            var polls = await _pollService.GetAllPollsAsync();
            return Ok(new
            {
                success = true,
                message = "Polls fetched",
                data = polls
            });
        }
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult> GetPollById(int id)
        {
            var poll = await _pollService.GetPollByIdAsync(id);
            if (poll == null)
            {
                return NotFound($"Poll with ID {id} not found");
            }
            return Ok(new
            {
                success = true,
                message = "Poll fetched successfully",
                data = poll
            });
        }

        [HttpPost("Create-polls")]
        [Authorize(Roles = "Moderator,SuperUser")]
        public async Task<ActionResult> CreatePoll([FromBody] CreatePollDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;
            if (username == null) return Unauthorized();

            var result = await _pollService.CreatePollAsync(dto, username);
            return Ok(new
            {
                success = true,
                message = "Poll created successfully",
                data = result
            });
        }

        [HttpGet("paged")]
        [Authorize]
        public async Task<IActionResult> GetPagedPolls([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var username = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;
            if (username == null) return Unauthorized();
            var polls = await _pollService.GetPaginatedPolls(pageIndex, pageSize,username);
            return Ok(polls);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdatePoll(int id, [FromBody] CreatePollDto dto)
        {
            var username = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;
            if (username == null) return Unauthorized();
            var updatedPoll = await _pollService.UpdatePollAsync(id, dto,username);
            return Ok(updatedPoll);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePoll(int id)
        {
            var username = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;
            if (username == null) return Unauthorized();
            var deletedPoll = await _pollService.DeletePollAsync(id,username);
            return Ok(deletedPoll);
        }

        [HttpPost("{id}/extend")]
        [Authorize]
        public async Task<IActionResult> ExtendPoll(int id, [FromQuery] DateTime newEndTime)
        {
            var username = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;
            if (username == null) return Unauthorized();

            var result = await _pollService.ExtendPollAsync(id, newEndTime, username);
            if (!result)
                return BadRequest("Poll cannot be extended. Either it does not exist, it's expired, the new end time is invalid, you exceeded the extension limit, or you're not the creator.");

            return Ok(new { success = true, message = "Poll duration extended successfully." });
        }


    }

    
}
