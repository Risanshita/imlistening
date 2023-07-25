using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ImListening.Controllers
{
    [Route("listen")]
    [ApiController]
    public class ListenController : ControllerBase
    {
        private readonly IWebhookService _webhookService;
        private readonly IListenerService _listenerService;

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
        public Task<IActionResult> Listen([FromRoute] string path)
        {
            return GetResponse(path);
        }

        private async Task<IActionResult> GetResponse(string path)
        {
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
        [Authorize]

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
