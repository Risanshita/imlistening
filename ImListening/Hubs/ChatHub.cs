using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ImListening.Hubs
{
    [AllowAnonymous]
    public class ChatHub : Hub
    {
        public async Task NewMessage(long username, string message) =>
            await Clients.All.SendAsync("messageReceived", username, message);
    }
}
