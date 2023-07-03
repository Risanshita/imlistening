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
