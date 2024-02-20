using Core.ImListening.DbModels;

namespace Core.ImListening.Services.Interfaces
{
    public interface IHistoryService
    {
        Task CreatIndexAsync();
        IAsyncEnumerable<History> GetHistoryAsync(string? userId = null, string? webhookPath = null, int take = 20, int skip = 0);
        
        IAsyncEnumerable<History> GetHistory(List<string> webhookPath, int take = 20, int skip = 0);
    
    }
}
