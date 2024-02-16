using System.Linq.Expressions;

namespace Common.ImListening.Repositories.MongoDb
{
  public interface IMongoDbRepository<T>
  {
    ValueTask<T?> GetByIdAsync(string id);
    IAsyncEnumerable<T> GetAllAsync();
    IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate);
    IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate, int skip, int take, Expression<Func<T, object>> orderBy, bool ascending = false);
    IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>> include, int skip, int take, Expression<Func<T, object>> orderBy, bool ascending = false);
    Task CreateAsync(T item);
    Task ReplaceOneAsync(Expression<Func<T, bool>> predicate, T item);
    Task AddRangeAsync(IEnumerable<T> items);
    Task UpdateAsync(T item, string id);
    Task DeleteAsync(T item, string id);
    Task DeleteRangeAsync(IEnumerable<T> items);

    void Create(string id, T value, TimeSpan? expiry = null);
    void Update(string id, T value, TimeSpan? expiry = null);
    void Delete(string id);
  }
}
