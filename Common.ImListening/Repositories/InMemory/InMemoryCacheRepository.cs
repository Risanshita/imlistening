using Common.ImListening.Exceptions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Common.ImListening.Repositories.InMemory
{
    internal class InMemoryCacheRepository<T> : IGenericRepository<T>
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<InMemoryCacheRepository<T>> _logger;

        public InMemoryCacheRepository(IMemoryCache memoryCache, ILogger<InMemoryCacheRepository<T>> logger)
        {
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public void Create(string key, T value, TimeSpan? expiry = null)
        {
            try
            {
                var cacheOptions = new MemoryCacheEntryOptions();

                if (expiry.HasValue)
                {
                    cacheOptions.SetAbsoluteExpiration(expiry.Value);
                }

                _memoryCache.Set(key, value, cacheOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while setting value in in-memory cache.");
                throw new InMemoryCacheException("Error occurred while setting value in in-memory cache.", ex);
            }
        }

        public void Delete(string key)
        {
            try
            {
                _memoryCache.Remove(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while removing value from in-memory cache.");
                throw new InMemoryCacheException("Error occurred while removing value from in-memory cache.", ex);
            }
        }

        public T? Get(string key)
        {
            try
            {
                if (_memoryCache.TryGetValue(key, out T? value))
                {
                    return value;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting value from in-memory cache.");
                throw new InMemoryCacheException("Error occurred while getting value from in-memory cache.", ex);
            }

            return default;
        }

        public void Update(string key, T value, TimeSpan? expiry = null)
        {
            Create(key, value, expiry);
        }
    }
}
