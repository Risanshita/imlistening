using Common.ImListening.Extensions;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Common.ImListening.Repositories.InMemoryDb
{
    public class InMemoryDbRepository<T> : IRepository<T> where T : class
    {
        private readonly DbContext _context;
        private readonly DbSet<T> _dbSet;

        public InMemoryDbRepository(DbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<T>();
        }

        public ValueTask<T?> GetByIdAsync(string id)
        {
            return _dbSet.FindAsync(id);
        }

        public IAsyncEnumerable<T> GetAllAsync()
        {
            return _dbSet.AsAsyncEnumerable();
        }

        public IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return _dbSet.Where(predicate).AsAsyncEnumerable();
        }

        public IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate, int skip, int take, Expression<Func<T, object>> orderBy, bool ascending = false)
        {
            var dbSet = _dbSet.Where(predicate);
            if (orderBy != null)
                dbSet = ascending ? dbSet.OrderBy(orderBy) : dbSet.OrderByDescending(orderBy);

            return dbSet.Skip(skip).Take(take).AsAsyncEnumerable();
        }

        public async Task CreateAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            _context.Entry(entity).State = EntityState.Added;
            await _context.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
            await _context.SaveChangesAsync();
        }

        public Task UpdateAsync(T entity)
        {
            _dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
            return _context.SaveChangesAsync();
        }

        public Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            _context.Entry(entity).State = EntityState.Deleted;
            return _context.SaveChangesAsync();
        }

        public void Delete(string key)
        {
            var entity = GetByIdAsync(key).Result;
            if (entity != null)
                DeleteAsync(entity);
        }

        public Task DeleteRangeAsync(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
            return _context.SaveChangesAsync();
        }

        public T? Get(string key)
        {
            return GetByIdAsync(key).Result;
        }

        public void Create(string key, T value, TimeSpan? expiry = null)
        {
            SetKeyAndExpiry(key, value, expiry);
            CreateAsync(value).Wait();
        }

        public void Update(string key, T value, TimeSpan? expiry = null)
        {
            SetKeyAndExpiry(key, value, expiry);
            UpdateAsync(value);
        }

        private void SetKeyAndExpiry(string key, T value, TimeSpan? expiry = null)
        {
            value.SetPropertyIfExists("Id", key);
            value.SetPropertyIfExists<T, DateTime?>("ExpireOnUtc", expiry == null ? null : DateTime.UtcNow.Add((TimeSpan)expiry));
        }

        public IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>> include, int skip, int take, Expression<Func<T, object>> orderBy, bool ascending = false)
        {
            var dbSet = _dbSet.Include(include); 
            var q = dbSet.Where(predicate);
            if (orderBy != null)
                q = ascending ? q.OrderBy(orderBy) : q.OrderByDescending(orderBy);

            return q.Skip(skip).Take(take).AsAsyncEnumerable();
        }
    }
}
