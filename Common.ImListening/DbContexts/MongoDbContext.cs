
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Core.Events;

namespace Common.ImListening.DbContexts
{
    public class MongoDbContext<T>
    {
        private IMongoDatabase Database { get; }
        public IMongoCollection<T> Collection { get; }

        public MongoDbContext(MongoDbConfigs mongoDbConfigs)
        {
            MongoClientSettings clientSettings = MongoClientSettings.FromConnectionString(mongoDbConfigs.ConnectionString);

            if (mongoDbConfigs.EnableCommandTracing)
            {
                //var logger = Serilog.Log.Logger;
                clientSettings.ClusterConfigurator = builder =>
                {
                    builder.Subscribe<CommandStartedEvent>(_ =>
                    {
                        Console.WriteLine($"Mongo Command started: {_.Command}");
                        //logger.Debug($"Mongo Command started: {_.Command}");
                    });
                };
            }

            var client = new MongoClient(clientSettings);
            Database = client.GetDatabase(mongoDbConfigs.DatabaseName);

            Collection = Database.GetCollection<T>(GetCollectionName());
        }

        public string GetCollectionName()
        {
            Type type = typeof(T);
            return type.Name;
        }
    }
}
