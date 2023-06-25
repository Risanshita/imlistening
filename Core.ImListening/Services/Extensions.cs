using Common.ImListening.Extensions;
using Core.ImListening.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Core.ImListening.Services
{
    public static class Extensions
    {
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddRepository();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IWebhookService, WebhookService>();
            return services;
        }
    }
}
