using PollingAPI.Interfaces;
using PollingAPI.Models;
using PollingAPI.Models.DTOs;

namespace PollingAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IRepository<string, User> _userRepository;

        public UserService(IRepository<string, User> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<ICollection<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _userRepository.GetAsync(id);
        }



        public async Task<bool> DeleteUserAsync(string id)
        {
            var existingUser = await _userRepository.GetAsync(id);
            if (existingUser == null)
                return false;

            await _userRepository.DeleteAsync(id);
            return true;
        }

        public async Task<User?> UpdateUserAsync(string id, UserUpdateRequest updateRequest)
        {
            var existingUser = await _userRepository.GetAsync(id);
            if (existingUser == null)
                return null;
            existingUser.Role = updateRequest.role;
            existingUser.ImageUrl = updateRequest.ImageUrl;

            return await _userRepository.UpdateAsync(id, existingUser);
        }
    }
}
