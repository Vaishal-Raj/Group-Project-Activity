using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Interfaces
{
    public interface IUserService
    {
        Task<ICollection<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(string id);
        Task<User?> UpdateUserAsync(string id, UserUpdateRequest updateRequest);
        Task<bool> DeleteUserAsync(string id);
    }
}
