using Core.ImListening.ApiModels;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

namespace ImListening.Controllers
{
    [Route("listen")]
    [ApiController]
    public class ListenController : ControllerBase
    {
        private readonly IWebhookService _webhookService;
        private readonly IListenerService _listenerService;
        public static readonly ConcurrentDictionary<string, LoadTestGroup> LoadTestingWebhooks = new(); // path as Key

        public ListenController(IWebhookService webhookService, IListenerService listenerService)
        {
            _webhookService = webhookService;
            _listenerService = listenerService;
        }

        [Route("{path}")]
        [AllowAnonymous]

        [HttpGet]
        [HttpPost]
        [HttpDelete]
        [HttpPut]
        [HttpOptions]
        [HttpPatch]
        [HttpHead]
        [AcceptVerbs("TRACE")]
        [AcceptVerbs("CONNECT")]
        [AcceptVerbs("PROPFIND")]
        [AcceptVerbs("MKCOL")]
        [AcceptVerbs("COPY")]
        [AcceptVerbs("MOVE")]
        [AcceptVerbs("LOCK")]
        [AcceptVerbs("UNLOCK")]
        public async Task<IActionResult> Listen([FromRoute] string path)
        {
            return await GetResponse(path);
        }

        private async Task<IActionResult> GetResponse(string path)
        {
            if (LoadTestingWebhooks.TryGetValue(path, out LoadTestGroup? value))
            {
                value.HitCount++;
                return await GenerateResponse(value.Webhook);
            }
            var webhook = await _webhookService.GetWebhookByIdAsync(path);
            if (webhook == null)
            {
                return NotFound();
            }
            await _listenerService.ProcessRequest(webhook, ControllerContext);
            return await GenerateResponse(webhook);
        }

        private async Task<IActionResult> GenerateResponse(Webhook webhook)
        {
            var response = new ContentResult
            {
                StatusCode = webhook.StatusCode
            };

            if (!string.IsNullOrEmpty(webhook.ContentType))
            {
                response.ContentType = webhook.ContentType;
            }
            if (webhook.Response != null)
            {
                response.Content = webhook.Response;
            }
            if (webhook.Timeout > 0)
            {
                await Task.Delay(webhook.Timeout);
            }
            return response;
        }

        [Route("oauth/{path}")]
        [Authorize(AuthenticationSchemes = "Bearer")]

        [HttpGet]
        [HttpPost]
        [HttpDelete]
        [HttpPut]
        [HttpOptions]
        [HttpPatch]
        [HttpHead]
        [AcceptVerbs("TRACE")]
        [AcceptVerbs("CONNECT")]
        [AcceptVerbs("PROPFIND")]
        [AcceptVerbs("MKCOL")]
        [AcceptVerbs("COPY")]
        [AcceptVerbs("MOVE")]
        [AcceptVerbs("LOCK")]
        [AcceptVerbs("UNLOCK")]
        public Task<IActionResult> ListenOauth([FromRoute] string path)
        {
            return GetResponse(path);
        }

        [Route("basic-auth/{path}")]
        [Authorize(AuthenticationSchemes = "BasicAuth")]

        [HttpGet]
        [HttpPost]
        [HttpDelete]
        [HttpPut]
        [HttpOptions]
        [HttpPatch]
        [HttpHead]
        [AcceptVerbs("TRACE")]
        [AcceptVerbs("CONNECT")]
        [AcceptVerbs("PROPFIND")]
        [AcceptVerbs("MKCOL")]
        [AcceptVerbs("COPY")]
        [AcceptVerbs("MOVE")]
        [AcceptVerbs("LOCK")]
        [AcceptVerbs("UNLOCK")]
        public Task<IActionResult> ListenBasicAuth([FromRoute] string path)
        {
            return GetResponse(path);
        }
    }
}
