using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using ImListening.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using YamlDotNet.Core.Tokens;

namespace ImListening.Controllers
{
    [Route("listen")]
    [ApiController]
    public class ListenController : ControllerBase
    {
        private readonly IWebhookService _webhookService;
        private readonly IHubContext<ChatHub> _chatHub;

        public ListenController(IHubContext<ChatHub> chatHub, IWebhookService webhookService)
        {
            _webhookService = webhookService;
            _chatHub = chatHub;
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
            _ = SendToUI("listen/" + path, webhook, HttpContext);
            return Ok();

        }

        private async Task SendToUI(string path, Webhook webhook, HttpContext httpContext)
        {
            var history = new History()
            {
                WebhookPath = path,
                UserId = webhook.UserId,
            };
            history.RequestInfos = await GetRequestInfo(httpContext, history);

            var msg = new
            {
                history.Id,
                history.WebhookPath,
                webhook.UserId,
                history.CreateAtUtc,
                RequestInfos = history.RequestInfos.Select(a =>
                (new
                {
                    a.Key,
                    a.Value,
                    a.Type,
                    a.Resource
                }))
            };
            await _chatHub.Clients.All.SendAsync(webhook.UserId ?? "BroadcastReceived", msg);
        }

        private async Task<List<RequestInfo>> GetRequestInfo(HttpContext httpContext, History history)
        {
            var requestInfo = new List<RequestInfo>();

            var request = httpContext.Request;

            // Add general request information
            requestInfo.Add(new RequestInfo(history.Id, history, "Method", request.Method));
            requestInfo.Add(new RequestInfo(history.Id, history, "Protocol", request.Protocol));
            requestInfo.Add(new RequestInfo(history.Id, history, "Scheme", request.Scheme));
            requestInfo.Add(new RequestInfo(history.Id, history, "Host", request.Host.ToString()));
            requestInfo.Add(new RequestInfo(history.Id, history, "Path", request.Path));
            requestInfo.Add(new RequestInfo(history.Id, history, "QueryString", request.QueryString.ToString()));

            // Add headers
            foreach (var (key, value) in request.Headers)
            {
                requestInfo.Add(new RequestInfo(history.Id, history, key, value.ToString(), "Header"));
            }

            // Add form data
            if (request.HasFormContentType)
            {
                var form = request.Form;
                foreach (var (key, value) in form)
                {
                    requestInfo.Add(new RequestInfo(history.Id, history, key, value.ToString(), "Form"));
                }
            }

            // Add query string parameters
            var query = request.Query;
            foreach (var (key, value) in query)
            {
                requestInfo.Add(new RequestInfo(history.Id, history, key, value.ToString(), "Query"));
            }

            // Add cookies
            foreach (var (key, value) in request.Cookies)
            {
                requestInfo.Add(new RequestInfo(history.Id, history, key, value.ToString(), "Cookies"));
            }

            // Read and add request body
            var requestBody = await ReadRequestBodyAsync(request);
            requestInfo.Add(new RequestInfo(history.Id, history, "RequestBody", requestBody, "Body"));

            // Add route data
            var routeData = ControllerContext.RouteData;
            foreach (var (key, value) in routeData.Values)
            {
                requestInfo.Add(new RequestInfo(history.Id, history, key, value?.ToString(), "RouteData"));
            }
            return requestInfo;
        }

        private static async Task<string> ReadRequestBodyAsync(HttpRequest request)
        {
            using var reader = new StreamReader(request.Body);
            return await reader.ReadToEndAsync();
        }

        [HttpPost("oauth/{path}")]
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

        [HttpPost("basic-auth/{path}")]
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
