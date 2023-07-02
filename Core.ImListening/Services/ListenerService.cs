using Common.ImListening.Repositories.InMemoryDb;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Core.ImListening.Services
{
    public class ListenerService : IListenerService
    {
        private readonly IRepository<History> _repository;
        private readonly IHubContext<ChatHub> _chatHub;
        private readonly ILogger<ListenerService> _logger;

        public ListenerService(IHubContext<ChatHub> chatHub, IRepository<History> repository, ILogger<Services.ListenerService> logger)
        {
            _chatHub = chatHub;
            _repository = repository;
            _logger = logger;
        }

        public async Task ProcessRequest(Webhook webhook, ControllerContext controllerContext)
        {
            try
            {

                var history = new History()
                {
                    WebhookId = webhook.Id,
                    UserId = webhook.UserId,
                };
                history.RequestInfos = await GetRequestInfo(controllerContext, history);

                var msg = new
                {
                    history.Id,
                    history.WebhookId,
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
                await _repository.CreateAsync(history);
            }
            catch (Exception ex)
            {
                _logger.LogError("Exception while proccessing request.",ex);
            }
        }

        private async Task<List<RequestInfo>> GetRequestInfo(ControllerContext controllerContext, History history)
        {
            var requestInfo = new List<RequestInfo>();

            var request = controllerContext.HttpContext.Request;

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
            var routeData = controllerContext.RouteData;
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

    }
}
