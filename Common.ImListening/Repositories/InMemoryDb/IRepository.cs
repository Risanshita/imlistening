using System.Linq.Expressions;

namespace Common.ImListening.Repositories.InMemoryDb
{
    public interface IRepository<T> : IGenericRepository<T> where T : class
    {
        ValueTask<T?> GetByIdAsync(string id);
        IAsyncEnumerable<T> GetAllAsync();
        IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate);
        IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate, int skip, int take, Expression<Func<T, object>> orderBy, bool ascending = false);
        IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>> include, int skip, int take, Expression<Func<T, object>> orderBy, bool ascending = false);
        Task CreateAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task DeleteRangeAsync(IEnumerable<T> entities);
    }
}
