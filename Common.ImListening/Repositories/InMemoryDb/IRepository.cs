using System.Linq.Expressions;

namespace Common.ImListening.Repositories.InMemoryDb
{
    public interface IRepository<T> : IMongoDbRepository<T> where T : class
    {
    }
}
