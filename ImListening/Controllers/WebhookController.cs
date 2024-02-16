using Core.ImListening.ApiModels;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace ImListening.Controllers
{
    [Route("api/webhooks")]
    [ApiController]
    [Authorize(AuthenticationSchemes = "BasicAuth")]
    public class WebhookController : BaseController
    {
        private readonly IWebhookService _webhookService;

        public WebhookController(IWebhookService webhookService)
        {
            _webhookService = webhookService;
        }

        [HttpGet]
        public IAsyncEnumerable<Webhook> GetWebhooksAsync([FromQuery] string? path = null)
        {
            return _webhookService.GetWebhooksAsync(UserId, path);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Webhook>> GetWebhookById([FromBody] string id)
        {
            var webhook = await _webhookService.GetWebhookByIdAsync(id);
            if (webhook == null)
            {
                return NotFound();
            }
            return Ok(webhook);
        }

        [HttpPost("load-test")]
        public async Task<ActionResult> CreateLoadTestingGroup([FromBody] CreateLoadTestGroupRequest request)
        {
            if (request.Paths != null && request.Paths.Any())
            {
                foreach (var path in request.Paths)
                {
                    var webhook = await _webhookService.GetWebhookByIdAsync(path);
                    if (webhook == null || !webhook.IsLoadTesting)
                    {
                        return BadRequest($"Url not found or not support load test: {path}.");
                    }
                    if (webhook.UserId != UserId)
                    {
                        return Unauthorized();
                    }
                }
                ListenController.LoadTestingUrls.Where(a => a.Value == UserId)
                    .ToList()
                    .ForEach(a => { 
                        ListenController.LoadTestingUrls.TryRemove(a.Key, out _);
                        ListenController.LoadTestingHitCount.TryRemove(a.Key, out _);
                    });

                foreach (var path in request.Paths)
                {
                    ListenController.LoadTestingUrls.TryAdd(path, UserId);
                    ListenController.LoadTestingHitCount.TryAdd(path, 0);
                }
                return new ObjectResult("Load testing group created!") { StatusCode = (int)HttpStatusCode.Created };
            }
            else
            {
                return BadRequest("Paths are required.");
            }
        }

        [HttpDelete("load-test")]
        public ActionResult DeleteLoadTestingGroup()
        {
            ListenController.LoadTestingUrls.Where(a => a.Value == UserId)
                .ToList()
                .ForEach(a => ListenController.LoadTestingUrls.TryRemove(a.Key, out _));
            return Ok();
        }

        [HttpGet("load-test")]
        public ActionResult GetLoadTestingGroup()
        {
            var paths = ListenController.LoadTestingUrls.Where(a => a.Value == UserId).Select(a => a.Key).ToList();
            if (paths.Any())
            {
                return Ok(paths);
            }
            return NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> CreateWebhook([FromBody] WebhookRequest request)
        {

            var webhook = await _webhookService.GetWebhookByIdAsync(request.Path);
            if (webhook == null)
            {
                await _webhookService.CreateWebhookAsync(request, UserId);
                return new ObjectResult(null) { StatusCode = (int)HttpStatusCode.Created };
            }
            return BadRequest("Url already exist.");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWebhook([FromRoute] string id, [FromBody] WebhookRequest request)
        {
            var webhook = await _webhookService.GetWebhookByIdAsync(id);
            if (webhook == null || webhook.UserId != UserId)
            {
                return NotFound();
            }
            await _webhookService.UpdateWebhookAsync(webhook, request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWebhook([FromRoute] string id)
        {
            var webhook = await _webhookService.GetWebhookByIdAsync(id);
            if (webhook == null || webhook.UserId != UserId)
            {
                return NotFound();
            }
            await _webhookService.DeleteWebhookAsync(webhook);
            return Ok();
        }
    }
}
