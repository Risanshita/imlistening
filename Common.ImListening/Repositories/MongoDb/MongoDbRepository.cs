using Common.ImListening.DbContexts;
using Common.ImListening.Extensions;
using MongoDB.Driver;
using System.Diagnostics;
using System.Linq.Expressions;

namespace Common.ImListening.Repositories.MongoDb
{
  public class MongoDbRepository<T> : IMongoDbRepository<T>
    {
        private readonly IMongoCollection<T> _collection;

        public MongoDbRepository(MongoDbContext<T> mongoDbContext)

        {
            _collection = mongoDbContext.Collection;

        }
        public Task AddRangeAsync(IEnumerable<T> items)
        {
            throw new NotImplementedException();
        }

        public async void Create(string id, T value, TimeSpan? expiry = null)
        {
            //SetidAndExpiry(id, value, expiry);
            await _collection.InsertOneAsync(value);
        }
        private void SetidAndExpiry(string id, T value, TimeSpan? expiry = null)
        {
            value.SetPropertyIfExists("Id", id);
            value.SetPropertyIfExists<T, DateTime?>("ExpireOnUtc", expiry == null ? null : DateTime.UtcNow.Add((TimeSpan)expiry));
        }
        public async Task CreateAsync(T item)
        {
            await _collection.InsertOneAsync(item);
        }

        public async Task ReplaceOneAsync(Expression<Func<T, bool>> predicate, T item)
        {
          await _collection.ReplaceOneAsync(predicate, item);
        }

        public async void Delete(string id)
        {
            await _collection.DeleteOneAsync(Builders<T>.Filter.Eq("_id", id));
        }

        public async Task DeleteAsync(T item,string id)
        {
        
            await _collection.DeleteOneAsync(Builders<T>.Filter.Eq("_id", id));
            
        }

        public Task DeleteRangeAsync(IEnumerable<T> items)
        {
            throw new NotImplementedException();
        }

        public IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate)
        {
            var res = _collection.Find(predicate).ToCursor();
            return res.ToAsyncEnumerable();
        }

        public IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate, int skip, int take, Expression<Func<T, object>> orderBy, bool ascending = false)
        {
            var res = _collection.Find(predicate);
            res = ascending ? res.SortBy(orderBy) : res.SortByDescending(orderBy);

            res = res.Skip(skip).Limit(take);

            return res.ToCursor().ToAsyncEnumerable();
        }

        public IAsyncEnumerable<T> FindAsync(Expression<Func<T, bool>> predicate, Expression<Func<T, object>> include, int skip, int take, Expression<Func<T, object>> orderBy, bool ascending = false)
        {
            var res = _collection.Find(predicate);
            res = ascending ? res.SortBy(orderBy) : res.SortByDescending(orderBy);

            res = res.Skip(skip).Limit(take);

            return res.ToCursor().ToAsyncEnumerable();
        }

     

        public IAsyncEnumerable<T> GetAllAsync()
        {
            var res = _collection.Find<T>(u => true).ToCursor();
            return res.ToAsyncEnumerable();
        }

        public async ValueTask<T?> GetByIdAsync(string id)
        {

            var res = await _collection.Find(Builders<T>.Filter.Eq("_id", id)).FirstOrDefaultAsync();
            return res;
        }

        public void Update(string id, T value, TimeSpan? expiry = null)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateAsync(T item, string id)
        {
            FilterDefinition<T> filter = Builders<T>.Filter.Eq("_id", id);

            try
            {
                await _collection.ReplaceOneAsync(filter, item);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("While update ",ex);
            }
        }
    }
}
