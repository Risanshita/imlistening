using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ImListening.Controllers
{
    [Route("/api/history")]
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
        public IAsyncEnumerable<History> GetHistoryAsync([FromQuery] List<string>? webhookPath = null, [FromQuery] int take = 20, [FromQuery] int skip = 0)
        {
            var ls = _historyService.GetHistoryAsync(UserId, webhookPath, take, skip);
            return ls;
        }

        [HttpGet("load-test")]
        public ActionResult GetLoadTestingGroup()
        {
            var paths = ListenController.LoadTestingWebhooks.Where(a => a.Value.Webhook.UserId == UserId).ToList();
            if (paths.Any())
            {
                return Ok(paths.Select(a =>
                {
                    return new { Path = a.Key, a.Value.HitCount, Time = DateTime.UtcNow };
                }).ToList());
            }
            return NotFound();
        }

    }
}
