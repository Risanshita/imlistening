using Common.ImListening.Repositories;
using Core.ImListening.ApiModels;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;

namespace Core.ImListening.Services
{
    public class UserService : IUserService
    {
        private readonly IMongoDbRepository<User> _repository;

        public UserService(IMongoDbRepository<User> genericRepository)
        {
            _repository = genericRepository;
        }

        public async Task<User?> Authenticate(string username, string password)
        {
            return await _repository.FindAsync(a => a.Id.Equals(username) && a.Password.Equals(password))
                .Select(a => new User { Id = a.Id })
                .FirstOrDefaultAsync();
        }

        public Task CreateUserAsync(UserRequest request, string role = "User")
        {
            return _repository.CreateAsync(new User
            {
                Description = request.Description,
                Id = request.Username,
                Password = request.Password,
                Role = role
            });
        }

        public Task DeleteUserAsync(User user)
        {
            return _repository.DeleteAsync(user,user.Id);
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public IAsyncEnumerable<User> GetUsersAsync(string? keyword = null)
        {
            return string.IsNullOrWhiteSpace(keyword)
                ? _repository.GetAllAsync()
                : _repository.FindAsync(a => (a.Id != null && a.Id.Contains(keyword, StringComparison.CurrentCultureIgnoreCase)) || (a.Description != null && a.Description.Contains(keyword, StringComparison.CurrentCultureIgnoreCase)));
        }

        public Task UpdateUserAsync(User user, UserRequest request)
        {
            user.Password = request.Password;
            user.Description = request.Description;

            return _repository.UpdateAsync(user, user.Id);
        }
    }
}
