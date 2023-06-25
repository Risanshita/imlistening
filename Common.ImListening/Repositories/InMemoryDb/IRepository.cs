using System.Linq.Expressions;

namespace Common.ImListening.Repositories.InMemoryDb
{
    public interface IRepository<T> : IGenericRepository<T> where T : class
    {
        ValueTask<T?> GetByIdAsync(string id);
        IAsyncEnumerable<T> GetAllAsync();
        IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate);
        Task CreateAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task DeleteRangeAsync(IEnumerable<T> entities);
    }
}
