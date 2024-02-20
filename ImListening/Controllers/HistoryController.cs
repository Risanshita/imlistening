using Amazon.Runtime.Internal.Transform;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NSwag.Generation.Processors;
using System.Collections.Generic;

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
        public IAsyncEnumerable<History> GetHistoryAsync([FromQuery] List<string>? webhookPath = null, [FromQuery] int take = 20, [FromQuery] int skip = 0)
        {
            var ls = _historyService.GetHistoryAsync(UserId, webhookPath, take, skip);
            return ls;
        }

       
        [HttpGet("load-test")]
        public ActionResult GetLoadTestingGroup()
        {
            var paths = ListenController.LoadTestingUrls.Where(a => a.Value == UserId).Select(a => a.Key).ToList();
            if (paths.Any())
            {
                return Ok(paths.Select(a =>
                {
                    var hasCount = ListenController.LoadTestingHitCount.TryGetValue(a, out int count);
                    return new { Path = a, HitCount = hasCount ? count : 0, Time = DateTime.UtcNow };
                }).ToList());
            }
            return NotFound();
        }

    }
}
