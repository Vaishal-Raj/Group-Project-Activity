using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PollingAPI.Interfaces;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoteController : ControllerBase
    {
        private readonly IVoteService _voteService;

        public VoteController(IVoteService voteService)
        {
            _voteService = voteService;
        }

        [HttpPost]
        [Authorize(Roles = "Moderator,Voter")]
        public async Task<ActionResult> CastVote([FromBody] VoteDto voteDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }
            var success = await _voteService.CastVoteAsync(voteDto, userId);

            if (!success)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid vote or poll is closed",
                    data = (object?)null
                });
            }

            return Ok(new
            {
                success = true,
                message = "Vote cast successfully",
            });
        }

        [HttpGet("all-votes")]
        [Authorize]
        public async Task<ActionResult> GetAllVotes()
        {
            return Ok(new
            {
                success = true,
                message = "Fetched all votes",
                data = await _voteService.GetAllVotes()
            });
        }

        [HttpGet("my-votes")]
        [Authorize]
        public async Task<ActionResult> GetAllVotesByUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }
            return Ok(new
            {
                success = true,
                message = "Fetched all votes",
                data = await _voteService.GetAllVotesByUser(userId)
            });
        }
        [HttpDelete]
        [Authorize(Roles = "Moderator,Voter")]
        public async Task<ActionResult> RemoveVote([FromQuery] int pollId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }
            var success = await this._voteService.RemoveVoteAsync(pollId, userId);
            if (!success)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid vote or poll is closed",
                    data = (object?)null
                });
            }
            return Ok(new
            {
                success = true,
                message = "Vote removed successfully",
            });
        }

        [HttpGet("myvote")]
        [Authorize(Roles = "Voter,Moderator")]
        public async Task<IActionResult> GetMyVote([FromQuery] int pollId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var vote = await _voteService.GetUserVoteAsync(pollId, userId);
            if (vote == null)
            {
                return Ok(new
                {
                    success = true,
                    message = "User has not voted",
                    data = (object?)null
                });
            }

            return Ok(new
            {
                success = true,
                message = "User vote fetched successfully",
                data = new
                {
                    pollId = vote.PollId,
                    optionId = vote.OptionId
                }
            });
        }
        [HttpGet("poll-votes")]
        [Authorize(Roles = "Moderator,SuperUser")]
        public async Task<IActionResult> GetVoteByPolls([FromQuery] int pollId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var votes = await _voteService.GetAllVotesByPolls(pollId);
            if (votes == null)
            {
                return Ok(new {
                    success = true,
                    message = "User has not voted",
                    data = (object?)null
                });
            }

            return Ok(new {
                success = true,
                message = "User vote fetched successfully",
                data = votes    
            });
        }


       
    }
}
