using Core.ImListening.DbModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Core.ImListening.Services.Interfaces
{
    public interface IListenerService
    {
        Task ProcessRequest(Webhook webhook, ControllerContext controllerContext);
    }
}
