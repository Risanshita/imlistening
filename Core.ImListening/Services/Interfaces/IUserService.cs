using Core.ImListening.ApiModels;
using Core.ImListening.DbModels;

namespace Core.ImListening.Services.Interfaces
{
    public interface IUserService
    {

        Task CreateUserAsync(UserRequest request, string role = "User");
        Task<User?> Authenticate(string username, string password);
        Task DeleteUserAsync(User user);
        Task<User?> GetUserByIdAsync(string id);
        IAsyncEnumerable<User> GetUsersAsync(string? keyword = null);
        Task UpdateUserAsync(User user, UserRequest request);

    }
}
