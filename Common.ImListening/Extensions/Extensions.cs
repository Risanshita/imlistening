using Common.ImListening.Repositories.InMemoryDb;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Common.ImListening.Extensions
{
    public static class Extensions
    {
        public static void SetPropertyIfExists<T, TVal>(this T obj, string propertyName, TVal value)
        {
            var property = obj.GetType().GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance);
            if (property != null && property.CanWrite)
            {
                property.SetValue(obj, value);
            }
        }

        public static IServiceCollection AddRepository(this IServiceCollection services)
        {
            services.AddTransient(typeof(IRepository<>), typeof(InMemoryDbRepository<>));
            return services;
        }
    }
}
