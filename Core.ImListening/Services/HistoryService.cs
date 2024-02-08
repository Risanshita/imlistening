using Common.ImListening.Repositories.InMemoryDb;
using Common.ImListening.Repositories.MongoDb;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace Core.ImListening.Services
{
  public class HistoryService : IHistoryService
    {
        private readonly IMongoDbRepository<History> _repository;

        public HistoryService(IMongoDbRepository<History> repository)
        {
            _repository = repository;
        }

        public IAsyncEnumerable<History> GetHistoryAsync(string? userId = null, string? webhookPath = null, int take = 20, int skip = 0)
        {
            if (userId != null && webhookPath != null)
            {
                return _repository.FindAsync((a) => a.UserId == userId && a.WebhookId == webhookPath, a => a.RequestInfos, skip, take, a => a.CreateAtUtc, false);
            }
            else if (userId != null)
            {
                return _repository.FindAsync((a) => a.UserId == userId, a => a.RequestInfos, skip, take, a => a.CreateAtUtc, false);
            }
            else if (webhookPath != null)
            {
                return _repository.FindAsync((a) => a.WebhookId == webhookPath, a => a.RequestInfos, skip, take, a => a.CreateAtUtc, false);
            }
            else
            {
                return _repository.FindAsync((a) => true, a => a.RequestInfos, skip, take, a => a.CreateAtUtc, false);
            }
        }
    }
}
