using Core.ImListening.ApiModels;
using Core.ImListening.DbModels;

namespace Core.ImListening.Services.Interfaces
{
    public interface IWebhookService
    {
        Task CreateWebhookAsync(WebhookRequest request, string userId);
        Task DeleteWebhookAsync(Webhook webhook);
        Task<Webhook?> GetWebhookByIdAsync(string id);
        IAsyncEnumerable<Webhook> GetWebhooksAsync(string? path = null);
        Task UpdateWebhookAsync(Webhook webhook, WebhookRequest request);
    }
}
