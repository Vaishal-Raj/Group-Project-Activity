using System;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Interfaces;

public interface IPollService
{
    public Task<PollResponseDto> CreatePollAsync(CreatePollDto dto, string username);
    public Task<ICollection<PollResponseDto>> GetAllPollsAsync();
    public Task<PollResponseDto?> GetPollResultsAsync(int pollId);
    public Task<PollResponseDto?> GetPollByIdAsync(int pollId);
    public Task<ICollection<PollResponseDto>> GetPaginatedPolls(int pageIndex, int pageSize,string username);

    public Task<PollResponseDto> UpdatePollAsync(int pollId, CreatePollDto updatedDto,string username);
    public Task<PollResponseDto> DeletePollAsync(int pollId,string username);

    Task<bool> ExtendPollAsync(int pollId, DateTime newEndTime, string username);

}
