using Core.ImListening.DbModels;

namespace Core.ImListening.Services.Interfaces
{
    public interface IHistoryService
    {
        IAsyncEnumerable<History> GetHistoryAsync(string? userId = null, string? webhookPath = null, int take = 20, int skip = 0);
    }
}
