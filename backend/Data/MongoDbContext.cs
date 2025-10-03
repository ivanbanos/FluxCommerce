using MongoDB.Driver;
using Microsoft.Extensions.Configuration;

namespace FluxCommerce.Api.Data
{
    public class MongoDbContext
    {
        public IMongoDatabase Database { get; }
        public IMongoCollection<FluxCommerce.Models.Customer> Customers { get; }

        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration["MongoDb:ConnectionString"];
            var databaseName = configuration["MongoDb:Database"];
            var client = new MongoClient(connectionString);
            Database = client.GetDatabase(databaseName);
            Customers = Database.GetCollection<FluxCommerce.Models.Customer>("Customers");
        }
    }
}
