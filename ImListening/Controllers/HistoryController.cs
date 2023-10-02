using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        public IAsyncEnumerable<History> GetHistoryAsync([FromQuery] string? webhookPath = null, [FromQuery] int take = 20, [FromQuery] int skip = 0)
        {
            var ls = _historyService.GetHistoryAsync(UserId, webhookPath, take, skip);
            return ls;
        }
    }
}
