using Core.ImListening.DbModels;

namespace Core.ImListening.Services.Interfaces
{
    public interface IHistoryService
    {
        Task CreatIndexAsync();
        IAsyncEnumerable<History> GetHistoryAsync(string? userId = null, List<string>? webhookPath = null, int take = 20, int skip = 0);

    }
}
