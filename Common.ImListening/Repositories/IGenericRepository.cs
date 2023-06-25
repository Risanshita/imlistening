namespace Common.ImListening.Repositories
{
    public interface IGenericRepository<T>
    {
        T? Get(string key);
        void Create(string key, T value, TimeSpan? expiry = null);
        void Update(string key, T value, TimeSpan? expiry = null);
        void Delete(string key);
    }
}
