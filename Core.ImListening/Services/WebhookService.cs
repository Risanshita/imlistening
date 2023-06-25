﻿using Common.ImListening.Repositories.InMemoryDb;
using Core.ImListening.ApiModels;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;

namespace Core.ImListening.Services
{
    public class WebhookService : IWebhookService
    {
        private readonly IRepository<Webhook> _repository;

        public WebhookService(IRepository<Webhook> genericRepository)
        {
            _repository = genericRepository;
        }

        public Task CreateWebhookAsync(WebhookRequest request, string userId)
        {
            return _repository.CreateAsync(new Webhook
            {
                ContentType = request.ContentType,
                ExpireOnUtc = DateTime.UtcNow.AddMinutes(request.ExpireAfterMin),
                Id = string.IsNullOrWhiteSpace(request.Path) ? Guid.NewGuid().ToString() : request.Path,
                Response = request.Response,
                StatusCode = request.StatusCode,
                Timeout = request.Timeout,
                UserId = userId,
            });
        }

        public Task DeleteWebhookAsync(Webhook webhook)
        {
            return _repository.DeleteAsync(webhook);
        }

        public async Task<Webhook?> GetWebhookByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public IAsyncEnumerable<Webhook> GetWebhooksAsync(string? path = null)
        {
            return string.IsNullOrWhiteSpace(path)
                ? _repository.GetAllAsync()
                : _repository.FindAsync(a => a.Id.Contains(path, StringComparison.CurrentCultureIgnoreCase));
        }

        public Task UpdateWebhookAsync(Webhook webhook, WebhookRequest request)
        {
            webhook.ContentType = request.ContentType;
            webhook.ExpireOnUtc = DateTime.UtcNow.AddMinutes(request.ExpireAfterMin);
            webhook.Response = request.Response;
            webhook.StatusCode = request.StatusCode;
            webhook.Timeout = request.Timeout;

            return _repository.UpdateAsync(webhook);
        }
    }
}
