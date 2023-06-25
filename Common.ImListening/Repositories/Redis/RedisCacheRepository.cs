using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Common.ImListening.Repositories.Redis
{
    public class RedisCacheRepository<T> : IGenericRepository<T>
    {
        private readonly IDatabase _redisDatabase;
        private readonly ILogger<RedisCacheRepository<T>> _logger;

        public RedisCacheRepository(ILogger<RedisCacheRepository<T>> logger)
        {
            var redisConnection = ConnectionMultiplexer.Connect("localhost"); // Replace with your Redis server details
            _redisDatabase = redisConnection.GetDatabase();

            _logger = logger;
        }
        public void Create(string key, T value, TimeSpan? expiry = null)
        {
            try
            {
                var serializedValue = SerializeValue(value);
                _redisDatabase.StringSet(key, serializedValue, expiry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while setting value in Redis cache.");
                throw new RedisException("Error occurred while setting value in Redis cache.", ex);
            }   
        }

        public void Delete(string key)
        {
            try
            {
                _redisDatabase.KeyDelete(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while removing value from Redis cache.");
                throw new RedisException("Error occurred while removing value from Redis cache.", ex);
            }
        }

        public T? Get(string key)
        {
            try
            {
                var redisValue = _redisDatabase.StringGet(key);
                if (redisValue.HasValue)
                {
                    return DeserializeValue(redisValue);
                }
                return default;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting value from Redis cache.");
                throw new RedisException("Error occurred while getting value from Redis cache.", ex);
            }
        }

        public void Update(string key, T value, TimeSpan? expiry = null)
        {
            Create(key, value, expiry);
        }

        private string? SerializeValue(T value)
        {
            // Implement your serialization logic here
            return value?.ToString();
        }

        private T DeserializeValue(string serializedValue)
        {
            // Implement your deserialization logic here
            return (T)Convert.ChangeType(serializedValue, typeof(T));
        }
    }
}
