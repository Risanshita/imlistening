using Common.ImListening.Repositories.InMemoryDb;
using Common.ImListening.Repositories.MongoDb;
using Core.ImListening.DbModels;
using Core.ImListening.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.InMemory.Query.Internal;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Collections;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text;

namespace Core.ImListening.Services
{
    public class ListenerService : IListenerService
    {
        private readonly IMongoDbRepository<History> _repository;
        private readonly IHubContext<ChatHub> _chatHub;
        private readonly ILogger<ListenerService> _logger;

        public ListenerService(IHubContext<ChatHub> chatHub, IMongoDbRepository<History> repository, ILogger<Services.ListenerService> logger)
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
                _ = ForwardMessage(webhook, history);
            }
            catch (Exception ex)
            {
                _logger.LogError("Exception while processing request.", ex);
            }
        }

        private async Task ForwardMessage(Webhook webhook, History history)
        {
            if (!string.IsNullOrWhiteSpace(webhook.ForwardTo))
            {
                try
                {
                    // Replace the JSON data with your request payload
                    string jsonData = JsonConvert.SerializeObject(new
                    {
                        RequestInfo = history,
                        WebhookUrl = webhook.Id
                    });

                    // Set up the HttpClient
                    using HttpClient httpClient = new() { Timeout = TimeSpan.FromSeconds(5) };
                    // Prepare the request content with JSON data
                    StringContent content = new(jsonData, Encoding.UTF8, "application/json");

                    // Send the POST request and get the response
                    HttpResponseMessage response = await httpClient.PostAsync(webhook.ForwardTo, content);

                    // Check if the response was successful (status code 2xx)
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning($"Failed to send url hit info webhookId: {webhook.Id} to: {webhook.ForwardTo}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Exception while sending url hit info webhookId: {webhook.Id} to: {webhook.ForwardTo}", ex);
                }
            }
        }

        private static async Task<List<RequestInfo>> GetRequestInfo(ControllerContext controllerContext, History history)
        {
            var requestInfo = new List<RequestInfo>();

            var request = controllerContext.HttpContext.Request;
            var clientInfo = GetIPAddress(request.Headers, request.HttpContext.Connection.RemoteIpAddress);

            // Add general request information
            requestInfo.Add(new RequestInfo(history.Id, "Method", request.Method));
            requestInfo.Add(new RequestInfo(history.Id, "Protocol", request.Protocol));
            requestInfo.Add(new RequestInfo(history.Id, "Scheme", request.Scheme));
            requestInfo.Add(new RequestInfo(history.Id, "Host", request.Host.ToString()));
            requestInfo.Add(new RequestInfo(history.Id, "Path", request.Path));
            requestInfo.Add(new RequestInfo(history.Id, "QueryString", request.QueryString.ToString()));

            // Ip info

            requestInfo.Add(new RequestInfo(history.Id, "HostName", clientInfo.hostName, "IpAddress"));
            requestInfo.Add(new RequestInfo(history.Id, "Aliases", clientInfo.aliases, "IpAddress"));
            for (int i = 1; i <= clientInfo.ips.Count; i++)
            {
                requestInfo.Add(new RequestInfo(history.Id, "IpAddress" + i, clientInfo.ips[i - 1], "IpAddress"));
            }
            // Add headers
            foreach (var (key, value) in request.Headers)
            {
                requestInfo.Add(new RequestInfo(history.Id, key, value.ToString(), "Header"));
            }

            // Add form data
            if (request.HasFormContentType)
            {
                var form = request.Form;
                foreach (var (key, value) in form)
                {
                    requestInfo.Add(new RequestInfo(history.Id, key, value.ToString(), "Form"));
                }
            }

            // Add query string parameters
            var query = request.Query;
            foreach (var (key, value) in query)
            {
                requestInfo.Add(new RequestInfo(history.Id, key, value.ToString(), "Query"));
            }

            // Add cookies
            foreach (var (key, value) in request.Cookies)
            {
                requestInfo.Add(new RequestInfo(history.Id, key, value.ToString(), "Cookies"));
            }

            // Read and add request body
            var requestBody = await ReadRequestBodyAsync(request);
            requestInfo.Add(new RequestInfo(history.Id, "RequestBody", requestBody, "Body"));

            // Add route data
            var routeData = controllerContext.RouteData;
            foreach (var (key, value) in routeData.Values)
            {
                requestInfo.Add(new RequestInfo(history.Id, key, value?.ToString(), "RouteData"));
            }

            try
            {
                var token = request.Headers["Authorization"].ToString();
                if (!string.IsNullOrWhiteSpace(token))
                {
                    if (token.Contains(' '))
                    {
                        token = token.Split(' ')[1];
                    }
                    var handler = new JwtSecurityTokenHandler();
                    var jsonToken = handler.ReadToken(token);
                    if (jsonToken is JwtSecurityToken tokenS)
                    {
                        foreach (var item in tokenS.Header)
                        {
                            requestInfo.Add(new RequestInfo(history.Id, item.Key, item.Value?.ToString(), "Authorization_Header"));
                        }
                        foreach (var item in tokenS.Claims)
                        {
                            requestInfo.Add(new RequestInfo(history.Id, item.Type, item.Value?.ToString(), "Authorization_Claims"));
                        }
                        requestInfo.Add(new RequestInfo(history.Id, "Issuer", tokenS.Issuer?.ToString(), "Authorization"));
                        requestInfo.Add(new RequestInfo(history.Id, "ValidFrom", tokenS.ValidFrom.ToString("yyyy-MM-ddTHH-mm-ss.fffZ"), "Authorization"));
                        requestInfo.Add(new RequestInfo(history.Id, "ValidTo", tokenS.ValidTo.ToString("yyyy-MM-ddTHH-mm-ss.fffZ"), "Authorization"));
                        requestInfo.Add(new RequestInfo(history.Id, "Subject", tokenS.Subject, "Authorization"));
                    }
                }
            }
            catch
            { }
            return requestInfo;
        }

        private static async Task<string> ReadRequestBodyAsync(HttpRequest request)
        {
            using var reader = new StreamReader(request.Body);
            return await reader.ReadToEndAsync();
        }
        private static (List<string> ips, string hostName, string aliases) GetIPAddress(IHeaderDictionary headers, IPAddress remoteIpAddress)
        {
            List<string> ips = new();
            string hostName = string.Empty;
            string aliases = string.Empty;


            if (headers.ContainsKey("HTTP_X_FORWARDED_FOR"))
            {
                // when running behind a load balancer you can expect this header
                var header = headers["HTTP_X_FORWARDED_FOR"].ToString();
                bool bVal = IPAddress.TryParse(header, out IPAddress? ipa);
                if (bVal && ipa != null)
                {
                    ips.Add(ipa.ToString());
                }
            }
            if (headers.ContainsKey("X-Forwarded-For"))
            {
                // when running behind a load balancer you can expect this header
                var header = headers["X-Forwarded-For"].ToString();

                bool bVal = IPAddress.TryParse(header, out IPAddress? ipa);
                if (bVal && ipa != null)
                {
                    ips.Add(ipa.ToString());
                }
            }
            else
            {
                // this will always have a value (running locally in development won't have the header)
                if (remoteIpAddress != null)
                {
                    // If we got an IPV6 address, then we need to ask the network for the IPV4 address
                    // This usually only happens when the browser is on the same machine as the server.
                    if (remoteIpAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
                    {
                        var entry = Dns.GetHostEntry(remoteIpAddress);
                        hostName = entry.HostName;
                        aliases = string.Join(", ", entry.Aliases);
                        foreach (IPAddress ip in entry.AddressList)
                        {
                            ips.Add(ip.ToString());
                        }

                    }
                    else
                    {
                        ips.Add(remoteIpAddress.ToString());
                    }
                }
            }
            return (ips, hostName, aliases);
        }

        public async Task SendLoadTestResultAsync(string userId, List<object> data)
        {
            await _chatHub.Clients.All.SendAsync(userId + "|load-test-result", data);
        }

        //public async Task<List<string>> GetAllActiveUser()
        //{
        //    var users = new List<string>();
        //    var clients = _chatHub.Clients.;
        //    var user = await clients..ToListAsync();
        //    foreach (var item in user)
        //    {
        //        users.Add(item);
        //    }
        //    return users;
        //}
    }
}
