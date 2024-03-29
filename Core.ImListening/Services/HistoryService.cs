﻿using Common.ImListening.Repositories.MongoDb;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using MongoDB.Driver;

namespace Core.ImListening.Services
{
    public class HistoryService : IHistoryService
    {
        private readonly IMongoDbRepository<History> _repository;

        public HistoryService(IMongoDbRepository<History> repository)
        {
            _repository = repository;
        }
        public async Task CreatIndexAsync()
        {
            var indexModel = new CreateIndexModel<History>(
                                keys: Builders<History>.IndexKeys.Ascending(a => a.ExpireOnUtc),
                                options: new CreateIndexOptions
                                {
                                    ExpireAfter = TimeSpan.FromSeconds(0),
                                    Name = "ExpireAtIndex"
                                });
            await _repository.CreatIndexAsync(indexModel);
            indexModel = new CreateIndexModel<History>(
                                keys: Builders<History>.IndexKeys.Ascending(a => a.UserId).Ascending(a => a.WebhookId));

            await _repository.CreatIndexAsync(indexModel);
        }

        public IAsyncEnumerable<History> GetHistoryAsync(string? userId = null, List<string>? webhookPath = null, int take = 20, int skip = 0)
        {
            if (userId != null && webhookPath != null && webhookPath.Any())
            {
                return _repository.FindAsync((a) => a.UserId == userId && webhookPath.Contains(a.WebhookId), a => a.RequestInfos, skip, take, a => a.CreateAtUtc, false);
            }
            else if (userId != null)
            {
                return _repository.FindAsync((a) => a.UserId == userId, a => a.RequestInfos, skip, take, a => a.CreateAtUtc, false);
            }
            else if (webhookPath != null && webhookPath.Any())
            {
                return _repository.FindAsync((a) => webhookPath.Contains(a.WebhookId), a => a.RequestInfos, skip, take, a => a.CreateAtUtc, false);
            }
            else
            {
                return _repository.FindAsync((a) => true, a => a.RequestInfos, skip, take, a => a.CreateAtUtc, false);
            }
        }



    }
}
