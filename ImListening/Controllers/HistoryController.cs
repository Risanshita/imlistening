using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;

namespace ImListening.Controllers
{
    [Route("history")]
    [ApiController]
    [Authorize(AuthenticationSchemes = "BasicAuth")]
    public class HistoryController : BaseController
    {
        private readonly IHistoryService _historyService;

        public HistoryController(IHistoryService historyService)
        {
            _historyService = historyService;
        }

        [HttpGet]
        public async IAsyncEnumerable<History> GetHistoryAsync([FromQuery] string? userId = null, [FromQuery] string? webhookPath = null, [FromQuery] int take = 20, [FromQuery] int skip = 0)
        {
            var ls = _historyService.GetHistoryAsync(userId, webhookPath, take, skip);
            await foreach (var item in ls)
            {
                foreach (var a in item.RequestInfos)
                {
                    a.History = null;
                }
                yield return item;
            }
        }
    }
}
