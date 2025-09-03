using FluxCommerce.Api.Models;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Data
{
    public class MongoDbService
    {
        private readonly IMongoCollection<Merchant> _merchants;
        public MongoDbService(MongoDbContext context)
        {
            _merchants = context.Database.GetCollection<Merchant>("Merchants");
        }

        public async Task<bool> MerchantEmailExistsAsync(string email)
        {
            return await _merchants.Find(m => m.Email == email).AnyAsync();
        }

        public async Task InsertMerchantAsync(Merchant merchant)
        {
            await _merchants.InsertOneAsync(merchant);
        }
    }
}
